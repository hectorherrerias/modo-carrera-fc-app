import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Trophy, Shield, Calendar, RefreshCw, ArrowLeft, Palette, User, Key, Cloud, Sparkles, Smartphone } from 'lucide-react';
import { ClubLogo } from './ClubLogo';
import { AuthModal } from './Modals/AuthModal';
import { SyncDeviceModal } from './Modals/SyncDeviceModal';

export const Navbar = ({ currentView, setView }) => {
  const { activeClub, activeSeason, resetToDefaultData, syncStatus, forceSyncCloud } = useApp();
  const { currentTheme, changeTheme, themes } = useTheme();
  const { currentUser } = useAuth();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const handleReset = () => {
    if (window.confirm("¿Seguro que deseas reiniciar los datos a la configuración inicial por defecto?")) {
      resetToDefaultData();
      setView('home');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView('home')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
              CAREER MODE <span className="text-emerald-400">TRACKER</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">EA FC / FIFA Analytics</p>
          </div>
        </div>

        {/* Navigation Breadcrumbs & Active Club Indicator */}
        <div className="hidden md:flex items-center space-x-3 bg-slate-950/80 px-3 py-1.5 rounded-full border border-slate-800">
          <button 
            onClick={() => setView('home')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              currentView === 'home' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            {activeClub ? (
              <ClubLogo logo={activeClub.logo} name={activeClub.name} className="w-4 h-4" />
            ) : (
              <Shield className="w-3.5 h-3.5" />
            )}
            <span>{activeClub ? activeClub.name : 'Seleccionar Club'}</span>
          </button>

          {activeClub && (
            <>
              <span className="text-slate-600 text-xs">/</span>
              <button 
                onClick={() => setView('hub')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  currentView === 'hub' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{activeSeason ? `Temp ${activeSeason.year}` : 'Temporadas'}</span>
              </button>
            </>
          )}

          {activeSeason && (
            <>
              <span className="text-slate-600 text-xs">/</span>
              <button 
                onClick={() => setView('dashboard')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  currentView === 'dashboard' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dashboard
              </button>
            </>
          )}
        </div>

        {/* Right Actions: Sync Devices, Cloud Sync Status, Theme, User Auth Profile & Controls */}
        <div className="flex items-center space-x-2">
          
          {/* Sync Devices Button (iPad, Mobile, PC) */}
          <button
            onClick={() => setIsSyncModalOpen(true)}
            title="Sincronizar entre iPad, Móvil y PC"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/60 hover:bg-cyan-950 text-cyan-400 text-xs font-bold transition-all shadow-md"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dispositivos</span>
          </button>

          {/* Cloud Sync Status Indicator */}
          {currentUser && (
            <button
              onClick={() => forceSyncCloud()}
              title={`Sincronización activa con ${currentUser.email}. Pulsa para forzar sincronización.`}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                syncStatus === 'synced' 
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/80' 
                  : (syncStatus === 'syncing' 
                      ? 'bg-amber-950/40 border-amber-500/40 text-amber-400' 
                      : 'bg-slate-950 border-slate-800 text-slate-400')
              }`}
            >
              <Cloud className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden xl:inline text-[11px]">
                {syncStatus === 'synced' && 'Nube'}
                {syncStatus === 'syncing' && 'Guardando...'}
                {syncStatus === 'offline' && 'Local'}
                {syncStatus === 'error' && 'Sin red'}
              </span>
            </button>
          )}

          {/* Theme Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              title="Cambiar tema de color"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900 text-amber-400 text-xs font-bold transition-all"
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Tema</span>
            </button>

            {isThemeMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                <span className="block text-[10px] uppercase font-bold text-slate-400 px-2 py-1">Seleccionar Tema</span>
                {themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { changeTheme(t.id); setIsThemeMenuOpen(false); }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      currentTheme === t.id ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-300 hover:bg-slate-950'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span>{t.icon}</span>
                      <span>{t.name}</span>
                    </span>
                    {currentTheme === t.id && <span className="text-[10px]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Account / Auth Profile Button */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/60 hover:bg-emerald-950 text-emerald-400 text-xs font-bold transition-all shadow-md"
          >
            <User className="w-3.5 h-3.5" />
            <span className="max-w-[90px] truncate">{currentUser ? currentUser.name.split(' ')[0] : 'Cuenta'}</span>
            {currentUser?.geminiApiKey && (
              <span title="Gemini AI Conectada">
                <Key className="w-3 h-3 text-amber-400 fill-amber-400" />
              </span>
            )}
          </button>

          {currentView !== 'home' && (
            <button
              onClick={() => setView(currentView === 'dashboard' ? 'hub' : 'home')}
              className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Volver</span>
            </button>
          )}

          <button
            onClick={handleReset}
            title="Reiniciar datos de prueba"
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-rose-400 px-2.5 py-1.5 rounded-xl border border-slate-800 hover:border-rose-900/50 bg-slate-900/60 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <SyncDeviceModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </header>
  );
};
