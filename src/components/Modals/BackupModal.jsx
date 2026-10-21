import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Download, Upload, ShieldCheck, AlertTriangle, CheckCircle2, Loader2, Trash2, History } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  readBackupFile, downloadCareer, summarizeCareer, summarizeCounts, isDemoCareer, careerScore,
  fetchServerVersions, fetchServerVersion
} from '../../utils/backupService';

const formatDate = (ts) =>
  new Date(ts).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export const BackupModal = ({ isOpen, onClose, onAfterReset }) => {
  const { data, importCareerData, resetToDefaultData } = useApp();
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);

  const [preview, setPreview] = useState(null);   // { career, fileName }
  const [status, setStatus] = useState(null);     // { type: 'ok' | 'error' | 'busy', text }
  const [resetConfirm, setResetConfirm] = useState('');
  const [versions, setVersions] = useState(null); // null = loading

  useEffect(() => {
    if (!isOpen || !currentUser?.email) return;
    let alive = true;
    setVersions(null);
    fetchServerVersions(currentUser.email)
      .then(v => alive && setVersions(v))
      .catch(() => alive && setVersions([]));
    return () => { alive = false; };
  }, [isOpen, currentUser?.email]);

  // The preview sits above the versions list: bring it into view when it appears
  const previewRef = useRef(null);
  useEffect(() => {
    if (preview) previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [preview]);

  if (!isOpen) return null;

  const handleVersion = async (version) => {
    setStatus({ type: 'busy', text: 'Descargando esa versión…' });
    try {
      const career = await fetchServerVersion(currentUser.email, version.id);
      setPreview({ career, fileName: `Versión del ${formatDate(version.savedAt)}` });
      setStatus(null);
    } catch (err) {
      setStatus({ type: 'error', text: err.message });
    }
  };

  const close = () => {
    setPreview(null);
    setStatus(null);
    setResetConfirm('');
    onClose();
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow choosing the same file again
    if (!file) return;
    setStatus({ type: 'busy', text: 'Leyendo la copia…' });
    try {
      const career = await readBackupFile(file);
      setPreview({ career, fileName: file.name });
      setStatus(null);
    } catch (err) {
      setPreview(null);
      setStatus({ type: 'error', text: err.message });
    }
  };

  const handleRestore = async () => {
    if (!preview) return;
    setStatus({ type: 'busy', text: 'Restaurando y guardando en el servidor…' });
    const uploaded = await importCareerData(preview.career);
    setPreview(null);
    setStatus(uploaded
      ? { type: 'ok', text: '¡Carrera restaurada! Ya está guardada en este dispositivo y en el servidor.' }
      : { type: 'error', text: 'Restaurada en este dispositivo, pero no se pudo guardar en el servidor. Pulsa el icono de la nube para reintentarlo.' });
  };

  const handleReset = () => {
    resetToDefaultData();
    close();
    onAfterReset?.();
  };

  const currentIsDemo = isDemoCareer(data);
  const previewSmaller = preview && careerScore(preview.career) < careerScore(data);

  const content = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      onClick={close}
    >
      <div
        className="relative my-auto w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950 shrink-0">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-white">Copias de seguridad</h2>
          </div>
          <button onClick={close} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Current data */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Tu carrera ahora</span>
            <p className="text-sm text-white font-semibold mt-1">{summarizeCareer(data)}</p>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{(data?.clubs || []).map(c => c.name).join(', ')}</p>
            {currentIsDemo && (
              <p className="text-xs text-amber-400 mt-2">Son los datos de ejemplo. Si tienes una copia, restáurala abajo.</p>
            )}
            {currentUser && <p className="text-[11px] text-slate-500 mt-2">Usuario: {currentUser.email}</p>}
          </div>

          {/* Restore */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Restaurar desde un archivo</h3>
            <p className="text-xs text-slate-400">
              Acepta las copias descargadas desde esta app (JSON) y otros formatos de respaldo de Modo Carrera.
              Lo que tengas ahora se guarda antes en el historial del servidor.
            </p>
            {/* No "accept" filter: on iPhone/iPad it can grey out .json files */}
            <input ref={fileInputRef} type="file" onChange={handleFile} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-sm font-black transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Elegir archivo de copia…</span>
            </button>

            {preview && (
              <div ref={previewRef} className="border border-amber-500/40 bg-amber-500/5 rounded-2xl p-4 space-y-3">
                <div>
                  <p className="text-xs text-slate-400 truncate">{preview.fileName}</p>
                  <p className="text-sm text-white font-semibold mt-1">{summarizeCareer(preview.career)}</p>
                  <p className="text-xs text-slate-300 mt-0.5">{preview.career.clubs.map(c => c.name).join(', ')}</p>
                </div>
                {isDemoCareer(preview.career) && (
                  <p className="text-xs text-amber-400 flex items-start space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>Este archivo solo contiene los datos de ejemplo.</span>
                  </p>
                )}
                {previewSmaller && (
                  <p className="text-xs text-amber-400 flex items-start space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>Esta copia tiene menos datos que tu carrera actual.</span>
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleRestore}
                    className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-sm font-black"
                  >
                    Restaurar esta copia
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreview(null)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-bold"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {status && (
              <div className={`flex items-start space-x-2 text-sm rounded-xl p-3 border ${
                status.type === 'ok' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : status.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300'
              }`}>
                {status.type === 'ok' && <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />}
                {status.type === 'error' && <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />}
                {status.type === 'busy' && <Loader2 className="w-4 h-4 mt-0.5 shrink-0 animate-spin" />}
                <span>{status.text}</span>
              </div>
            )}
          </div>

          {/* Server versions */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Versiones guardadas en el servidor</span>
            </h3>
            <p className="text-xs text-slate-400">El servidor guarda una versión de tu carrera cada 10 minutos de uso y una por día durante 60 días.</p>
            {versions === null && (
              <p className="text-xs text-slate-500 flex items-center space-x-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Cargando…</span></p>
            )}
            {versions && versions.length === 0 && (
              <p className="text-xs text-slate-500">Todavía no hay versiones anteriores.</p>
            )}
            {versions && versions.length > 0 && (
              <ul className="max-h-48 overflow-y-auto divide-y divide-slate-800 border border-slate-800 rounded-2xl">
                {versions.map(v => (
                  <li key={v.id} className="flex items-center justify-between gap-3 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-200">{formatDate(v.savedAt)}</p>
                      <p className="text-[11px] text-slate-400 truncate">{summarizeCounts(v.counts)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleVersion(v)}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 text-xs font-bold"
                    >
                      Ver
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Export */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white">Descargar una copia</h3>
            <button
              type="button"
              onClick={() => downloadCareer(data, currentUser?.email)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl text-sm font-bold"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Descargar copia JSON</span>
            </button>
          </div>

          {/* Danger zone */}
          <details className="border border-rose-900/50 rounded-2xl p-4">
            <summary className="text-sm font-bold text-rose-400 cursor-pointer">Reiniciar a los datos de ejemplo</summary>
            <div className="mt-3 space-y-2">
              <p className="text-xs text-slate-400">
                Borra tu carrera en este dispositivo y la sustituye por los datos de ejemplo. Descarga antes una copia.
                Escribe <b className="text-rose-300">BORRAR</b> para confirmar.
              </p>
              <input
                value={resetConfirm}
                onChange={(e) => setResetConfirm(e.target.value)}
                placeholder="BORRAR"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
              />
              <button
                type="button"
                disabled={resetConfirm.trim().toUpperCase() !== 'BORRAR'}
                onClick={handleReset}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-rose-600 text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reiniciar datos</span>
              </button>
            </div>
          </details>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
};
