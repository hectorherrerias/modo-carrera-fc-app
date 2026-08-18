import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy, Sparkles, ArrowRight, Bot, Key, Cloud, Globe, User, ShieldCheck } from 'lucide-react';

export const AuthGateView = () => {
  const { loginWithEmail, loginGuest, isCloudLoading } = useAuth();
  
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [showNameField, setShowNameField] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMsg("Por favor, introduce tu correo electrónico.");
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      await loginWithEmail(emailInput, nameInput);
    } catch (err) {
      setErrorMsg(err.message || "Error al conectar con tu cuenta.");
    }
    setIsSubmitting(false);
  };

  const handleGuestEntry = () => {
    loginGuest();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="py-5 px-6 sm:px-12 flex items-center justify-between z-10 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Trophy className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
              CAREER MODE <span className="text-emerald-400">TRACKER</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">EA FC / FIFA Analytics</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-500/30">
          <Cloud className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Sincronización Cloud Automática</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center z-10 my-auto w-full">
        
        {/* Left Hero Pitch */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gestor de Modo Carrera & Asistente Google Gemini IA</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Accede a tu Modo Carrera <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Desde Cualquier Dispositivo
            </span>
          </h2>

          <p className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
            Introduce tu correo de Gmail o de usuario. Toda tu partida, clubes, alineaciones ofensivas/defensivas, ruedas de prensa con IA y tu clave de Gemini se sincronizan automáticamente en la nube.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-left max-w-lg mx-auto lg:mx-0">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-start space-x-3">
              <Globe className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white">Sincronización Cloud</h4>
                <p className="text-[11px] text-slate-400">Entra con el mismo correo desde PC, iPad o móvil para ver exactamente lo mismo.</p>
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-start space-x-3">
              <Bot className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white">Gemini IA Integrada</h4>
                <p className="text-[11px] text-slate-400">Ruedas de prensa que recuerdan el contexto de tu temporada y fichajes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            
            <div className="text-center space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Iniciar Sesión / Acceder
              </h3>
              <p className="text-xs text-slate-400">
                Introduce tu correo para cargar o crear tu partida
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Quick Email Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                  Correo Electrónico (Gmail / Correo)
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@gmail.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-white text-sm focus:outline-none focus:border-emerald-400 placeholder:text-slate-600 transition-all"
                />
              </div>

              {showNameField && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                    Nombre de Mánager (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Héctor Herrerías"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-white text-sm focus:outline-none focus:border-emerald-400 placeholder:text-slate-600 transition-all"
                  />
                </div>
              )}

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setShowNameField(!showNameField)}
                  className="text-emerald-400 hover:underline font-semibold"
                >
                  {showNameField ? "- Ocultar nombre" : "+ Añadir nombre de mánager"}
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isCloudLoading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{isSubmitting || isCloudLoading ? 'Cargando tu partida...' : 'Entrar a Mi Modo Carrera'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-500">o acceso rápido</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* Guest Quick Entry Button */}
            <button
              type="button"
              onClick={handleGuestEntry}
              className="w-full py-3 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-2xl transition-all flex items-center justify-center space-x-2"
            >
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Entrar como Invitado / Modo Prueba</span>
            </button>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-5 text-center text-xs text-slate-500 z-10">
        <p>© {new Date().getFullYear()} Career Mode Tracker • Sincronización Cloud Automática & Google Gemini IA</p>
      </footer>

    </div>
  );
};
