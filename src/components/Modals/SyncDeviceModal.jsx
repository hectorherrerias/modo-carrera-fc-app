import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  generateDeviceSyncUrl, 
  getStoredCloudDbUrl, 
  setStoredCloudDbUrl, 
  saveUserCloudData,
  fetchUserCloudData 
} from '../../utils/cloudSyncService';
import { 
  Smartphone, Tablet, Laptop, Copy, Check, X, QrCode, 
  Cloud, Sparkles, Key, Link2, ExternalLink, ShieldCheck, Database, RefreshCw 
} from 'lucide-react';

export const SyncDeviceModal = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { data, setData, forceSyncCloud } = useApp();

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [cloudDbInput, setCloudDbInput] = useState(getStoredCloudDbUrl());
  const [dbSaveMsg, setDbSaveMsg] = useState('');
  const [isTestingDb, setIsTestingDb] = useState(false);

  if (!isOpen) return null;

  const syncUrl = generateDeviceSyncUrl(currentUser, data);

  const handleCopyLink = () => {
    if (!syncUrl) return;
    navigator.clipboard.writeText(syncUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSaveDbUrl = async (e) => {
    e.preventDefault();
    setIsTestingDb(true);
    setDbSaveMsg('');

    setStoredCloudDbUrl(cloudDbInput);
    if (currentUser?.email) {
      const ok = await saveUserCloudData(currentUser.email, {
        userProfile: currentUser,
        careerData: data
      }, cloudDbInput);

      if (ok) {
        setDbSaveMsg("✓ ¡Base de datos conectada y datos sincronizados con éxito!");
      } else {
        setDbSaveMsg("✓ URL de base de datos guardada.");
      }
    } else {
      setDbSaveMsg("✓ URL de base de datos guardada localmente.");
    }
    setIsTestingDb(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            <h3 className="font-extrabold text-base text-white">Sincronizar iPad, Móvil y PC</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Device Icons Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-around text-center">
            <div className="flex flex-col items-center space-y-1">
              <Laptop className="w-6 h-6 text-emerald-400" />
              <span className="text-[11px] font-bold text-slate-300">PC / Mac</span>
            </div>
            <span className="text-slate-600 font-bold text-lg">↔</span>
            <div className="flex flex-col items-center space-y-1">
              <Tablet className="w-6 h-6 text-cyan-400" />
              <span className="text-[11px] font-bold text-slate-300">iPad / Tablet</span>
            </div>
            <span className="text-slate-600 font-bold text-lg">↔</span>
            <div className="flex flex-col items-center space-y-1">
              <Smartphone className="w-6 h-6 text-amber-400" />
              <span className="text-[11px] font-bold text-slate-300">Móvil (iOS/Android)</span>
            </div>
          </div>

          {/* METHOD 1: 1-CLICK MAGIC SYNC LINK */}
          <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-5 space-y-3 shadow-lg">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-xs flex items-center justify-center">1</span>
              <h4 className="font-extrabold text-sm text-white">Enlace Mágico de Sincronización Inmediata</h4>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Copia este enlace y ábrelo en <strong>Safari de tu iPad</strong> o en el navegador de tu <strong>móvil</strong>. Cargará al instante todos tus clubes, plantillas, ruedas de prensa y tu clave de Gemini sin tener que volver a escribir nada:
            </p>

            <div className="pt-1 flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={syncUrl || 'Generando enlace...'}
                className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 truncate select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Enlace</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* METHOD 2: CLOUD DATABASE DIRECT CONFIG */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-black text-xs flex items-center justify-center">2</span>
              <h4 className="font-extrabold text-sm text-white">Servidor de Base de Datos en la Nube (Firebase)</h4>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Si quieres que los datos se sincronicen en tiempo real de fondo en todos tus dispositivos sin enlaces, puedes conectar tu propia base de datos gratuita de Firebase:
            </p>

            <form onSubmit={handleSaveDbUrl} className="space-y-2 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">URL de Firebase Realtime Database</label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    placeholder="https://tu-proyecto-default-rtdb.firebaseio.com"
                    value={cloudDbInput}
                    onChange={(e) => setCloudDbInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={isTestingDb}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all disabled:opacity-50"
                  >
                    {isTestingDb ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>

              {dbSaveMsg && (
                <p className="text-xs text-emerald-400 font-bold flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>{dbSaveMsg}</span>
                </p>
              )}
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
