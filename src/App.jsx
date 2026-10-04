import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthGateView } from './views/AuthGateView';
import { ClubSelectionView } from './views/ClubSelectionView';
import { ClubHubView } from './views/ClubHubView';
import { SeasonDashboardView } from './views/SeasonDashboardView';
import { AIAssistantModal } from './components/AIAssistantModal';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto text-2xl">
              ⚠️
            </div>
            <h2 className="text-xl font-bold font-outfit text-white">Se ha producido un error inesperado</h2>
            <p className="text-xs text-slate-400">
              {this.state.error?.message || "La interfaz encontró un conflicto de datos. Puedes reiniciar la vista sin perder tus datos guardados."}
            </p>
            <div className="pt-2 flex justify-center space-x-3">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
              >
                Recargar Aplicación
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppFlow = () => {
  const { currentUser } = useAuth();
  const { selectClub, setActiveSeasonId } = useApp();
  const [view, setView] = useState('dashboard'); // 'home' | 'hub' | 'dashboard'

  // Mandatory Authentication Gate: if user is not logged in, block access!
  if (!currentUser) {
    return <AuthGateView />;
  }

  const handleSelectClub = (clubId, preferredSeasonId) => {
    selectClub(clubId, preferredSeasonId);
    setView('hub');
  };

  const handleSelectSeason = (seasonId) => {
    setActiveSeasonId(seasonId);
    setView('dashboard');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] flex flex-col justify-between relative transition-colors duration-300">
      
      <div>
        <Navbar currentView={view} setView={setView} />
        
        <main>
          {view === 'home' && (
            <ClubSelectionView onSelectClub={handleSelectClub} />
          )}

          {view === 'hub' && (
            <ClubHubView 
              onSelectSeason={handleSelectSeason} 
              onBackToClubs={() => setView('home')} 
            />
          )}

          {view === 'dashboard' && (
            <SeasonDashboardView />
          )}
        </main>
      </div>

      {/* Omnipresent AI Assistant Widget */}
      <AIAssistantModal />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p>© {new Date().getFullYear()} Career Mode Tracker • EA FC Analytics</p>
          <p className="text-slate-600">Con Asistente Integrado de IA y Gestión Táctica</p>
        </div>
      </footer>

    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <AppProvider>
            <AppFlow />
          </AppProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
