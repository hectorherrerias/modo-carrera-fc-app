import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy, Sparkles, ShieldCheck, ArrowRight, Bot, Lock, Key, Cloud, Globe } from 'lucide-react';

export const AuthGateView = () => {
  const { loginWithGoogle, loginUser, registerUser, isCloudLoading } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [isGoogleCustomModal, setIsGoogleCustomModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleClick = () => {
    setIsGoogleCustomModal(true);
  };

  const handleGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!googleEmailInput.trim()) return;
    setIsSubmitting(true);
    try {
      await loginWithGoogle(googleEmailInput);
    } catch (err) {
      setErrorMsg(err.message || "Error al iniciar con Gmail.");
    }
    setIsSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        await registerUser(name, email, password);
      } else {
        await loginUser(email, password);
      }
    } catch (err) {
      setErrorMsg(err.message || "Error al autenticar.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar Brand */}
      <header className="py-6 px-6 sm:px-12 flex items-center justify-between z-10 border-b border-slate-900 bg-slate-950/60 backdrop-blur-md">
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
          <span>Sincronización en la Nube Multi-Dispositivo</span>
        </div>
      </header>

      {/* Main Hero & Auth Split */}
      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10 my-auto">
        
        {/* Left Hero Pitch */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gestor Profesional Multi-Dispositivo & Google Gemini IA</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight font-outfit leading-tight">
            Tu Modo Carrera <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Sincronizado en Todos tus Dispositivos
            </span>
          </h2>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed">
            Inicia sesión con tu cuenta de Google / Gmail desde tu ordenador, móvil o tablet. Tus clubes, tácticas, plantilla, contexto de temporada y tu API Key de Gemini se sincronizan automáticamente para que juegues donde quieras sin perder nada.
          </p>

          {/* Value Props */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-left max-w-xl">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-start space-x-3">
              <Globe className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-white">Multi-Dispositivo con Gmail</h4>
                <p className="text-xs text-slate-400">Accede desde cualquier dispositivo con tu correo y tus datos estarán listos.</p>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-start space-x-3">
              <Bot className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-white">Gemini IA Permanente</h4>
                <p className="text-xs text-slate-400">Guarda tu API Key una sola vez y se recordará para siempre en tu cuenta.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Auth Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative space-y-6">
            
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-black text-white font-outfit">
                {isSignUp ? 'Crear Tu Cuenta' : 'Acceder al Juego'}
              </h3>
              <p className="text-xs text-slate-400">
                Selecciona cómo deseas identificarte
              </p>
            </div>

            {/* Google / Gmail Fast Auth Button */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleClick}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-3 border border-slate-200"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continuar con Google / Gmail</span>
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-500">o accede con correo</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>
            </div>

            {/* Switch Tab */}
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setErrorMsg(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  !isSignUp ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setErrorMsg(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isSignUp ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                Registrarse
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nombre de Mánager</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Héctor Herrerías"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Correo Electrónico (Gmail / Otro)</label>
                <input
                  type="email"
                  required
                  placeholder="tu.correo@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 mt-2 disabled:opacity-50"
              >
                <span>{isSignUp ? 'Crear Cuenta e Ingresar' : 'Entrar a Mis Clubes'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>

      </main>

      {/* Gmail Input Modal */}
      {isGoogleCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-extrabold text-white text-base">Acceso con Cuenta de Gmail</h4>
              <button onClick={() => setIsGoogleCustomModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-400">
              Introduce tu correo de Gmail. Se conectará a la nube para cargar tus clubes, tu contexto de temporada y tu clave de Gemini en este dispositivo:
            </p>

            <form onSubmit={handleGoogleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Tu Correo de Gmail</label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@gmail.com"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Cargando datos de la nube...' : 'Continuar con Gmail'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 z-10">
        <p>© {new Date().getFullYear()} Career Mode Tracker • Sincronización en la Nube y Asistente Gemini IA</p>
      </footer>

    </div>
  );
};
