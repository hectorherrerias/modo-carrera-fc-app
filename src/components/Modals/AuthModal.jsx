import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, X, LogIn, UserPlus, Key, Mail, Lock, Sparkles, Check } from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { currentUser, loginUser, registerUser, logoutUser, updateGeminiApiKey } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [geminiKeyInput, setGeminiKeyInput] = useState(currentUser?.geminiApiKey || '');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        registerUser(name, email, password);
        setSuccessMsg("¡Cuenta creada e iniciada con éxito!");
      } else {
        loginUser(email, password);
        setSuccessMsg("¡Sesión iniciada con éxito!");
      }
    } catch (err) {
      setErrorMsg(err.message || "Error al autenticar.");
    }
  };

  const handleSaveGeminiKey = (e) => {
    e.preventDefault();
    updateGeminiApiKey(geminiKeyInput);
    setSuccessMsg("¡API Key de Google Gemini guardada en tu cuenta!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-white">Cuenta de Usuario & Gemini AI</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Currently Logged In Section */}
          {currentUser ? (
            <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950 border border-emerald-500/30 px-2 py-0.5 rounded">
                    Sesión Activa
                  </span>
                  <h4 className="text-lg font-black text-white mt-1">{currentUser.name}</h4>
                  <p className="text-xs text-slate-400">{currentUser.email}</p>
                </div>

                <button
                  onClick={logoutUser}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition-all"
                >
                  Cerrar Sesión
                </button>
              </div>

              {/* Gemini API Key Config */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center space-x-1">
                    <Key className="w-3.5 h-3.5" />
                    <span>Google Gemini AI Key</span>
                  </span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-cyan-400 hover:underline font-semibold"
                  >
                    Obtener Key Gratis ↗
                  </a>
                </div>

                <form onSubmit={handleSaveGeminiKey} className="flex space-x-2">
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={geminiKeyInput}
                    onChange={(e) => setGeminiKeyInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow"
                  >
                    Guardar
                  </button>
                </form>
                <p className="text-[10px] text-slate-400">
                  {currentUser.geminiApiKey ? '✓ Tu cuenta de Google Gemini está conectada.' : 'Conecta tu API Key de Gemini para activar tus solicitudes por voz e IA directa.'}
                </p>
              </div>
            </div>
          ) : (
            /* Login / Sign-Up Form */
            <div className="space-y-4">
              <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsSignUp(false); setErrorMsg(''); setSuccessMsg(''); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    !isSignUp ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => { setIsSignUp(true); setErrorMsg(''); setSuccessMsg(''); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSignUp ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Crear Cuenta
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-200 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs font-semibold flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nombre Completo / Mánager</label>
                    <input
                      type="text"
                      required
                      placeholder="Tu Nombre"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
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
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all mt-2"
                >
                  {isSignUp ? 'Registrar Mi Cuenta' : 'Acceder al Juego'}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
