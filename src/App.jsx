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

const AppFlow = () => {
  const { currentUser } = useAuth();
  const { selectClub, setActiveSeasonId } = useApp();
  const [view, setView] = useState('dashboard'); // 'home' | 'hub' | 'dashboard'

  // Mandatory Authentication Gate: if user is not logged in, block access!
  if (!currentUser) {
    return <AuthGateView />;
  }

  const handleSelectClub = (clubId) => {
    selectClub(clubId);
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
    <AuthProvider>
      <ThemeProvider>
        <AppProvider>
          <AppFlow />
        </AppProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
