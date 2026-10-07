import React from 'react';
import { User } from '../types';
import { Activity, Brain, History, LayoutDashboard, FileSpreadsheet, BookOpen, Terminal, LogIn, LogOut, User as UserIcon, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  hasActivePrediction: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  user,
  onOpenAuth,
  onLogout,
  hasActivePrediction,
}) => {
  const navLinks = [
    { id: 'home', label: 'Overview', icon: Brain },
    { id: 'predict', label: 'Risk Prediction', icon: Activity, badge: 'ML Form' },
    ...(hasActivePrediction ? [{ id: 'result', label: 'XAI Result', icon: Activity, highlight: true }] : []),
    { id: 'history', label: 'History', icon: History },
    { id: 'dashboard', label: 'Analytics', icon: LayoutDashboard },
    { id: 'research', label: 'Research Lab', icon: FileSpreadsheet },
    { id: 'about', label: 'About', icon: BookOpen },
    { id: 'api', label: 'API Docs', icon: Terminal },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                  MedRisk<span className="text-cyan-400">AI</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  XAI Platform
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium block">
                Hospital Readmission Risk Decision Support
              </span>
            </div>
          </div>

          {/* Nav Links Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/90 text-white shadow-sm shadow-indigo-600/30'
                      : link.highlight
                      ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900/60'
                      : 'text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1 py-0.2 rounded font-mono">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Auth Controls */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-200">{user.name}</span>
                  <span className="text-[10px] text-indigo-400 capitalize">{user.role} &bull; {user.institution || 'Medical Center'}</span>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-indigo-600/20 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Clinician Login</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="lg:hidden flex items-center gap-1 px-4 py-2 bg-slate-900/90 border-t border-slate-800/60 overflow-x-auto text-xs scrollbar-none">
        {navLinks.map((link) => {
          const isActive = currentPage === link.id;
          return (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`px-3 py-1 rounded-md font-medium whitespace-nowrap shrink-0 ${
                isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
