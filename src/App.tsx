import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './pages/HomePage';
import { PredictPage } from './pages/PredictPage';
import { ResultPage } from './pages/ResultPage';
import { HistoryPage } from './pages/HistoryPage';
import { DashboardPage } from './pages/DashboardPage';
import { ResearchPage } from './pages/ResearchPage';
import { AboutPage } from './pages/AboutPage';
import { ApiDocsPage } from './pages/ApiDocsPage';
import { PatientData, PredictionResult, User } from './types';
import { DEFAULT_PATIENT } from './lib/constants';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [activePatient, setActivePatient] = useState<PatientData>(DEFAULT_PATIENT);
  const [activePrediction, setActivePrediction] = useState<PredictionResult | null>(null);
  
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Check saved session in localStorage
    const savedToken = localStorage.getItem('medrisk_token');
    const savedUser = localStorage.getItem('medrisk_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('medrisk_token');
        localStorage.removeItem('medrisk_user');
      }
    }
  }, []);

  const handleLoginSuccess = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('medrisk_token', newToken);
    localStorage.setItem('medrisk_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('medrisk_token');
    localStorage.removeItem('medrisk_user');
  };

  const handleSelectPreset = (patient: PatientData) => {
    setActivePatient(patient);
    setCurrentPage('predict');
  };

  const handlePredictionComplete = (result: PredictionResult) => {
    setActivePrediction(result);
    setCurrentPage('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectFromHistory = (result: PredictionResult) => {
    setActivePrediction(result);
    setActivePatient(result.patientInput);
    setCurrentPage('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleModifyInputs = () => {
    if (activePrediction) {
      setActivePatient(activePrediction.patientInput);
    }
    setCurrentPage('predict');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        user={user}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        hasActivePrediction={activePrediction !== null}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectPreset={handleSelectPreset}
          />
        )}

        {currentPage === 'predict' && (
          <PredictPage
            initialPatient={activePatient}
            onPredictionComplete={handlePredictionComplete}
            token={token}
          />
        )}

        {currentPage === 'result' && activePrediction && (
          <ResultPage
            prediction={activePrediction}
            onModifyInputs={handleModifyInputs}
            onNavigate={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentPage === 'history' && (
          <HistoryPage
            onSelectPrediction={handleSelectFromHistory}
            token={token}
          />
        )}

        {currentPage === 'dashboard' && <DashboardPage />}

        {currentPage === 'research' && <ResearchPage />}

        {currentPage === 'about' && <AboutPage />}

        {currentPage === 'api' && <ApiDocsPage />}
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Global Footer */}
      <Footer
        onNavigate={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
