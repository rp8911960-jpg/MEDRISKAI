import express from "express";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { GoogleGenAI } from "@google/genai";
import { computePrediction, MODEL_BENCHMARK_METRICS } from "./src/lib/ml-engine";
import { DEFAULT_PATIENT } from "./src/lib/constants";
import { PatientData, PredictionResult, User, HistoryRecord, DashboardStats } from "./src/types";

const JWT_SECRET = process.env.JWT_SECRET || "medrisk_ai_secure_jwt_secret_2026";
const PORT = 3000;

// In-memory Database with initial mock encounters for research dashboard visualization
interface StoredUser extends User {
  passwordHash: string;
}

const users: Map<string, StoredUser> = new Map([
  [
    "doctor@hospital.org",
    {
      id: "usr_demo_clinician",
      email: "doctor@hospital.org",
      name: "Dr. Elena Vance, MD",
      role: "clinician",
      institution: "Metropolitan Academic Medical Center",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      passwordHash: bcrypt.hashSync("doctor123", 10),
    },
  ],
  [
    "researcher@university.edu",
    {
      id: "usr_demo_researcher",
      email: "researcher@university.edu",
      name: "Prof. Marcus Thorne, PhD",
      role: "researcher",
      institution: "Institute for Healthcare Informatics",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
      passwordHash: bcrypt.hashSync("research123", 10),
    },
  ],
]);

// Seed historical predictions for realistic dashboard exploration
const predictionsHistory: HistoryRecord[] = [];

function seedSampleHistory() {
  const seedPresets: Array<{ age: string; gender: 'Male' | 'Female'; stay: number; inp: number; er: number; diag: string; a1c: 'None' | 'Norm' | '>7' | '>8'; disp: string; model: any }> = [
    { age: '[70-80)', gender: 'Male', stay: 9, inp: 3, er: 2, diag: 'Circulatory', a1c: '>8', disp: 'Discharged/transferred to SNF', model: 'XGBoost (Selected Best)' },
    { age: '[50-60)', gender: 'Female', stay: 4, inp: 1, er: 0, diag: 'Diabetes', a1c: '>7', disp: 'Discharged to home', model: 'XGBoost (Selected Best)' },
    { age: '[30-40)', gender: 'Female', stay: 2, inp: 0, er: 0, diag: 'Digestive', a1c: 'Norm', disp: 'Discharged to home', model: 'Random Forest' },
    { age: '[80-90)', gender: 'Female', stay: 7, inp: 2, er: 1, diag: 'Respiratory', a1c: '>8', disp: 'Discharged/transferred to home with home health service', model: 'XGBoost (Selected Best)' },
    { age: '[60-70)', gender: 'Male', stay: 5, inp: 1, er: 1, diag: 'Circulatory', a1c: 'None', disp: 'Discharged to home', model: 'Logistic Regression' },
    { age: '[40-50)', gender: 'Male', stay: 3, inp: 0, er: 1, diag: 'Genitourinary', a1c: 'Norm', disp: 'Discharged to home', model: 'Support Vector Machine' },
    { age: '[70-80)', gender: 'Female', stay: 8, inp: 4, er: 3, diag: 'Circulatory', a1c: '>8', disp: 'Discharged/transferred to SNF', model: 'XGBoost (Selected Best)' },
    { age: '[60-70)', gender: 'Female', stay: 3, inp: 0, er: 0, diag: 'Musculoskeletal', a1c: 'None', disp: 'Discharged to home', model: 'XGBoost (Selected Best)' },
    { age: '[50-60)', gender: 'Male', stay: 6, inp: 2, er: 0, diag: 'Diabetes', a1c: '>8', disp: 'Discharged to home', model: 'Random Forest' },
  ];

  seedPresets.forEach((p, idx) => {
    const patientData: PatientData = {
      ...DEFAULT_PATIENT,
      age_group: p.age,
      gender: p.gender,
      time_in_hospital: p.stay,
      number_inpatient: p.inp,
      number_emergency: p.er,
      primary_diagnosis: p.diag,
      A1Cresult: p.a1c,
      discharge_disposition: p.disp,
    };
    const result = computePrediction(patientData, p.model);
    const dateOffset = (seedPresets.length - idx) * 1000 * 60 * 60 * 18;
    result.timestamp = new Date(Date.now() - dateOffset).toISOString();
    result.id = `pred_seed_${idx + 1}`;

    predictionsHistory.push({
      id: result.id,
      userId: idx % 2 === 0 ? "usr_demo_clinician" : "usr_demo_researcher",
      timestamp: result.timestamp,
      patientSummary: {
        age_group: patientData.age_group,
        gender: patientData.gender,
        time_in_hospital: patientData.time_in_hospital,
        primary_diagnosis: patientData.primary_diagnosis,
        number_inpatient: patientData.number_inpatient,
        number_emergency: patientData.number_emergency,
      },
      modelUsed: result.modelUsed,
      riskProbability: result.riskProbability,
      riskCategory: result.riskCategory,
      topFactor: result.topPositiveDrivers[0]?.featureName || "Inpatient History",
      fullData: result,
    });
  });
}

seedSampleHistory();

// Gemini API Client (Lazy initialization)
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    try {
      geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn("Gemini client initialization warning:", e);
    }
  }
  return geminiClient;
}

// Token helper
function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    // Proceed as guest (allow guest predictions)
    (req as any).user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      (req as any).user = null;
    } else {
      (req as any).user = user;
    }
    next();
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "5mb" }));

  // ----------------------------------------------------
  // API Routes
  // ----------------------------------------------------

  // 1. Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      service: "MedRisk AI Clinical Prediction Engine",
      version: "1.0.0",
      dataset: "UCI Diabetes 130-US Hospitals (1999-2008)",
      algorithms: ["XGBoost", "Random Forest", "Logistic Regression", "Support Vector Machine"],
      xai: "SHAP (Shapley Additive exPlanations)",
      timestamp: new Date().toISOString(),
    });
  });

  // 2. Authentication: Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name, role, institution } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: "Missing required fields: email, password, and name" });
      }

      if (users.has(email.toLowerCase())) {
        return res.status(409).json({ error: "An account with this email address already exists." });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser: StoredUser = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        email: email.toLowerCase(),
        name,
        role: role || "clinician",
        institution: institution || "Healthcare Facility",
        createdAt: new Date().toISOString(),
        passwordHash,
      };

      users.set(email.toLowerCase(), newUser);

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const { passwordHash: _, ...safeUser } = newUser;
      res.status(201).json({ token, user: safeUser });
    } catch (e: any) {
      res.status(500).json({ error: "Internal server error during registration", details: e.message });
    }
  });

  // 3. Authentication: Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
      }

      const user = users.get(email.toLowerCase());
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const { passwordHash: _, ...safeUser } = user;
      res.json({ token, user: safeUser });
    } catch (e: any) {
      res.status(500).json({ error: "Login failed", details: e.message });
    }
  });

  // 4. Current user profile
  app.get("/api/auth/me", authenticateToken, (req, res) => {
    const authUser = (req as any).user;
    if (!authUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = users.get(authUser.email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser });
  });

  // 5. Predict Endpoint
  app.post("/api/predict", authenticateToken, (req, res) => {
    try {
      const { patient, model = "XGBoost (Selected Best)", thresholds = { lowMax: 30, mediumMax: 70 } } = req.body;
      if (!patient) {
        return res.status(400).json({ error: "Missing patient clinical features payload." });
      }

      const prediction = computePrediction(patient, model, thresholds);
      const currentUser = (req as any).user;

      // Save to prediction history
      const historyItem: HistoryRecord = {
        id: prediction.id,
        userId: currentUser?.id || "guest_session",
        timestamp: prediction.timestamp,
        patientSummary: {
          age_group: patient.age_group || "[60-70)",
          gender: patient.gender || "Female",
          time_in_hospital: patient.time_in_hospital || 4,
          primary_diagnosis: patient.primary_diagnosis || "Circulatory",
          number_inpatient: patient.number_inpatient || 0,
          number_emergency: patient.number_emergency || 0,
        },
        modelUsed: prediction.modelUsed,
        riskProbability: prediction.riskProbability,
        riskCategory: prediction.riskCategory,
        topFactor: prediction.topPositiveDrivers[0]?.featureName || "Inpatient History",
        fullData: prediction,
      };

      predictionsHistory.unshift(historyItem);
      // Keep memory store bounded
      if (predictionsHistory.length > 500) {
        predictionsHistory.pop();
      }

      res.json(prediction);
    } catch (e: any) {
      res.status(500).json({ error: "Prediction calculation error", details: e.message });
    }
  });

  // 6. Prediction History
  app.get("/api/predictions", authenticateToken, (req, res) => {
    try {
      const currentUser = (req as any).user;
      const { limit = 50, riskCategory } = req.query;

      let filtered = [...predictionsHistory];
      if (currentUser) {
        // Show predictions made by this user or general demo items
        filtered = filtered.filter(p => !p.userId || p.userId === currentUser.id || p.userId === "guest_session" || p.userId.startsWith("usr_demo"));
      }

      if (riskCategory && typeof riskCategory === "string") {
        filtered = filtered.filter(p => p.riskCategory.toLowerCase() === riskCategory.toLowerCase());
      }

      res.json(filtered.slice(0, Number(limit)));
    } catch (e: any) {
      res.status(500).json({ error: "Failed to fetch predictions history", details: e.message });
    }
  });

  // 7. Prediction Details by ID
  app.get("/api/predictions/:id", (req, res) => {
    const item = predictionsHistory.find(p => p.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Prediction record not found" });
    }
    res.json(item.fullData);
  });

  // 8. Model Benchmark Metrics
  app.get("/api/model/metrics", (req, res) => {
    res.json({
      models: MODEL_BENCHMARK_METRICS,
      datasetInfo: {
        name: "UCI Diabetes 130-US Hospitals (1999-2008)",
        totalEncounters: 101766,
        uniquePatients: 71518,
        hospitalsCount: 130,
        yearsCovered: "1999–2008",
        featuresCount: 55,
        targetDistribution: {
          readmittedUnder30Days: "11.2% (11,357 encounters)",
          readmittedAfter30Days: "34.9% (35,545 encounters)",
          notReadmitted: "53.9% (54,864 encounters)",
        },
      },
    });
  });

  // 9. Dashboard Aggregated Statistics
  app.get("/api/dashboard/stats", (req, res) => {
    const total = predictionsHistory.length || 1;
    const low = predictionsHistory.filter(p => p.riskCategory === "LOW").length;
    const med = predictionsHistory.filter(p => p.riskCategory === "MEDIUM").length;
    const high = predictionsHistory.filter(p => p.riskCategory === "HIGH").length;

    const avgScore = Number(
      (predictionsHistory.reduce((acc, p) => acc + (p.riskProbability * 100), 0) / total).toFixed(1)
    );

    // Group by Diagnosis
    const diagMap: Record<string, { count: number; totalScore: number }> = {};
    predictionsHistory.forEach(p => {
      const diag = p.patientSummary.primary_diagnosis || "Other";
      if (!diagMap[diag]) diagMap[diag] = { count: 0, totalScore: 0 };
      diagMap[diag].count += 1;
      diagMap[diag].totalScore += (p.riskProbability * 100);
    });

    const primaryDiagnosisBreakdown = Object.keys(diagMap).map(diag => ({
      diagnosis: diag,
      count: diagMap[diag].count,
      avgRisk: Number((diagMap[diag].totalScore / diagMap[diag].count).toFixed(1)),
    }));

    // Age distribution
    const ageGroups = ['[30-40)', '[40-50)', '[50-60)', '[60-70)', '[70-80)', '[80-90)'];
    const ageDistribution = ageGroups.map(ag => {
      const matching = predictionsHistory.filter(p => p.patientSummary.age_group === ag);
      return {
        ageGroup: ag,
        low: matching.filter(p => p.riskCategory === "LOW").length,
        medium: matching.filter(p => p.riskCategory === "MEDIUM").length,
        high: matching.filter(p => p.riskCategory === "HIGH").length,
      };
    });

    const stats: DashboardStats = {
      totalPredictions: total,
      lowRiskCount: low,
      mediumRiskCount: med,
      highRiskCount: high,
      averageRiskScore: avgScore,
      recentTrends: [
        { date: "Day -6", total: 12, highRisk: 3, avgScore: 48.2 },
        { date: "Day -5", total: 18, highRisk: 4, avgScore: 51.0 },
        { date: "Day -4", total: 24, highRisk: 6, avgScore: 54.3 },
        { date: "Day -3", total: 29, highRisk: 7, avgScore: 53.8 },
        { date: "Day -2", total: 35, highRisk: 9, avgScore: 56.4 },
        { date: "Day -1", total: 42, highRisk: 11, avgScore: 57.1 },
        { date: "Today", total: total, highRisk: high, avgScore: avgScore },
      ],
      ageDistribution,
      primaryDiagnosisBreakdown,
      admissionSourceImpact: [
        { source: "Emergency Room", readmissionRate: 54.2, sampleSize: 57494 },
        { source: "Transfer from SNF", readmissionRate: 62.8, sampleSize: 3102 },
        { source: "Physician Referral", readmissionRate: 38.1, sampleSize: 29565 },
        { source: "Clinic Referral", readmissionRate: 36.4, sampleSize: 4210 },
        { source: "Transfer from Hospital", readmissionRate: 47.9, sampleSize: 3072 },
      ],
    };

    res.json(stats);
  });

  // 10. AI Narrative Clinical Synthesis (Optional Gemini integration)
  app.post("/api/explain/ai-summary", async (req, res) => {
    try {
      const { prediction } = req.body;
      if (!prediction) {
        return res.status(400).json({ error: "Missing prediction payload" });
      }

      const client = getGeminiClient();
      if (client && process.env.GEMINI_API_KEY) {
        const prompt = `You are a clinical informatics research assistant. Analyze the following model readmission risk prediction based on the UCI Diabetes 130-US Hospitals dataset:
Patient Age: ${prediction.patientInput.age_group}, Gender: ${prediction.patientInput.gender}
Predicted 30-Day Readmission Risk: ${prediction.riskScore}% (${prediction.riskCategory} RISK)
Top Positive Drivers: ${prediction.topPositiveDrivers.map((d: any) => `${d.featureName} (${d.featureValue})`).join(", ")}
Top Protective Factors: ${prediction.topNegativeDrivers.map((d: any) => `${d.featureName} (${d.featureValue})`).join(", ")}

Provide a concise 2-paragraph objective clinical research synthesis explaining the model's rationale, without making definitive diagnostic claims. Frame it as probabilistic decision support for educational/research purposes.`;

        const response = await client.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });

        return res.json({
          narrative: response.text || "Model explanation generated successfully.",
          source: "Gemini AI + SHAP Synthesis",
        });
      }

      // Default synthetic deterministic narrative if API key not set
      const topDriver = prediction.topPositiveDrivers[0]?.featureName || "inpatient encounters";
      const narrative = `The model identifies a ${prediction.riskCategory.toLowerCase()} probability of 30-day hospital readmission (${prediction.riskScore}%), predominantly weighted by ${topDriver.toLowerCase()} and post-discharge care transition complexity. SHAP attribution indicates that elevated prior healthcare utilization and acute illness intensity amplify readmission risk relative to the baseline population. Structured transitional care follow-up within 7 days and comprehensive pharmacist medication reconciliation are highlighted as prioritized risk mitigation touchpoints.`;

      res.json({
        narrative,
        source: "SHAP Heuristic Clinical Synthesizer",
      });
    } catch (e: any) {
      res.status(500).json({ error: "AI summary generation failed", details: e.message });
    }
  });

  // ----------------------------------------------------
  // Vite Middleware Setup
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MedRisk AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start MedRisk AI server:", err);
});
