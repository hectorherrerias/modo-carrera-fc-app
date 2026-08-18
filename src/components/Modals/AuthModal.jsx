import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { validateGeminiApiKey } from '../../utils/geminiService';
import { exportDataToJson } from '../../utils/cloudSyncService';
import { SyncDeviceModal } from './SyncDeviceModal';
import { 
  UserCheck, X, LogIn, UserPlus, Key, Mail, Lock, Sparkles, 
  Check, Cloud, RefreshCw, Download, Upload, ShieldCheck, AlertCircle, Loader2, Smartphone, LogOut 
} from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { currentUser, loginUser, registerUser, logoutUser, updateGeminiApiKey } = useAuth();
  const { data, setData, syncStatus, lastSyncedAt, forceSyncCloud } = useApp();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [geminiKeyInput, setGeminiKeyInput] = useState(currentUser?.geminiApiKey || '');
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyValidationResult, setKeyValidationResult] = useState(null);

  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        await registerUser(name, email, password);
        setSuccessMsg("¡Cuenta creada e iniciada con éxito!");
      } else {
        await loginUser(email, password);
        setSuccessMsg("¡Sesión iniciada con éxito!");
      }
    } catch (err) {
      setErrorMsg(err.message || "Error en la autenticación.");
    }
  };

  const handleSaveAndValidateGeminiKey = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setKeyValidationResult(null);

    const cleanKey = geminiKeyInput.trim();
    if (!cleanKey) {
      await updateGeminiApiKey('');
      setSuccessMsg("Clave de Gemini eliminada.");
      return;
    }

    setIsValidatingKey(true);
    const result = await validateGeminiApiKey(cleanKey);
    setIsValidatingKey(false);
    setKeyValidationResult(result);

    if (result.valid) {
      await updateGeminiApiKey(cleanKey);
      setSuccessMsg("¡Clave de Google Gemini validada y guardada permanentemente en tu cuenta!");
      forceSyncCloud();
    } else {
      setErrorMsg(result.message || "La API Key de Gemini introducida no es válida.");
    }
  };

  const handleForceSync = async () => {
    setIsManualSyncing(true);
    await forceSyncCloud();
    setTimeout(() => {
      setIsManualSyncing(false);
      setSuccessMsg("¡Sincronización en la nube completada!");
    }, 800);
  };

  const handleExportBackup = () => {
    exportDataToJson(data, `modo_carrera_${currentUser ? currentUser.email : 'backup'}_${new Date().toISOString().split('T')[0]}.json`);
    setSuccessMsg("Copia de seguridad descargada en tu dispositivo.");
  };

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.clubs && imported.seasons) {
          setData(imported);
          forceSyncCloud();
          setSuccessMsg("¡Copia de seguridad restaurada y sincronizada!");
        } else {
          setErrorMsg("El archivo JSON no tiene la estructura de Modo Carrera.");
        }
      } catch (err) {
        setErrorMsg("Error al leer el archivo JSON.");
      }
    };
    reader.readAsText(file);
  };

  const handleLogout = () => {
    logoutUser();
    onClose();
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative my-auto w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center space-x-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base text-white">Mi Cuenta, Nube & Gemini IA</h3>
          </div>

          <div className="flex items-center space-x-2">
            {currentUser && (
              <button
                type="button"
                onClick={handleLogout}
                title="Cerrar sesión"
                className="flex items-center space-x-1 px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            )}

            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Notifications */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/80 border border-rose-500/50 rounded-2xl text-rose-200 text-xs font-semibold flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs font-semibold flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Currently Logged In Section */}
          {currentUser ? (
            <div className="space-y-5">
              
              {/* Account Info Box */}
              <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-4 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-black text-emerald-400 bg-emerald-950 border border-emerald-500/30 px-2 py-0.5 rounded">
                      Sesión Activa
                    </span>
                    <h4 className="text-lg font-black text-white mt-1">{currentUser.name}</h4>
                    <p className="text-xs text-slate-400 font-medium">{currentUser.email}</p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center space-x-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>

                {/* Cloud Sync Status Bar */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <Cloud className={`w-4 h-4 ${syncStatus === 'synced' ? 'text-emerald-400' : (syncStatus === 'syncing' ? 'text-amber-400 animate-spin' : 'text-slate-500')}`} />
                    <div>
                      <span className="font-bold text-slate-300">
                        {syncStatus === 'synced' && "Sincronizado en la Nube"}
                        {syncStatus === 'syncing' && "Sincronizando con tu cuenta..."}
                        {syncStatus === 'offline' && "Guardado Localmente"}
                        {syncStatus === 'error' && "Error de Conexión"}
                      </span>
                      <p className="text-[10px] text-slate-500">
                        Última sync: {new Date(lastSyncedAt).toLocaleTimeString('es-ES')}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleForceSync}
                    disabled={isManualSyncing}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isManualSyncing ? 'animate-spin text-emerald-400' : ''}`} />
                    <span>Sincronizar Ahora</span>
                  </button>
                </div>
              </div>

              {/* Gemini API Key Config & Permanent Cloud Storage */}
              <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                    <Key className="w-4 h-4 text-amber-400" />
                    <span>Google Gemini API Key (Permanente)</span>
                  </span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-cyan-400 hover:underline font-semibold"
                  >
                    Obtener Key Gratis de Google ↗
                  </a>
                </div>

                <p className="text-xs text-slate-400">
                  Introduce tu clave de Google Gemini <strong>una sola vez</strong>. Se guardará para siempre vinculada a tu cuenta de Gmail y estará disponible en cualquier dispositivo desde el que entres.
                </p>

                <form onSubmit={handleSaveAndValidateGeminiKey} className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="password"
                      placeholder="AIzaSy..."
                      value={geminiKeyInput}
                      onChange={(e) => setGeminiKeyInput(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl text-xs text-white"
                    />
                    <button
                      type="submit"
                      disabled={isValidatingKey}
                      className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all flex items-center space-x-1 disabled:opacity-50"
                    >
                      {isValidatingKey ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Validando...</span>
                        </>
                      ) : (
                        <span>Validar y Guardar</span>
                      )}
                    </button>
                  </div>

                  {keyValidationResult && keyValidationResult.valid && (
                    <p className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{keyValidationResult.message}</span>
                    </p>
                  )}
                </form>
              </div>

              {/* Sync iPad / Mobile / PC Shortcut */}
              <button
                type="button"
                onClick={() => setIsSyncModalOpen(true)}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Sincronizar con iPad, Móvil o PC (1 Clic)</span>
              </button>

              {/* Data Backup & Restore */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-slate-400 block">Copia de Seguridad y Archivo Local</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Descargar Backup JSON</span>
                  </button>

                  <label className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Restaurar JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Logout Button Bottom */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-black text-xs rounded-2xl flex items-center justify-center space-x-2 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión de {currentUser.email}</span>
                </button>
              </div>

            </div>
          ) : (
            /* Login / Sign-Up Form */
            <div className="space-y-4">
              <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsSignUp(false); setErrorMsg(''); setSuccessMsg(''); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    !isSignUp ? 'bg-emerald-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => { setIsSignUp(true); setErrorMsg(''); setSuccessMsg(''); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isSignUp ? 'bg-emerald-500 text-slate-950 shadow-md font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Crear Cuenta
                </button>
              </div>

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
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Correo Electrónico (Gmail / Otro)</label>
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
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
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all mt-2"
                >
                  {isSignUp ? 'Registrar Mi Cuenta en la Nube' : 'Acceder al Juego'}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

      <SyncDeviceModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
