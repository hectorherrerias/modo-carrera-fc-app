import React, { useState } from 'react';
import { parseYouthVoiceDictation } from '../../utils/youthVoiceParser';
import { GraduationCap, X, Check, Mic, MicOff, Sparkles, Bot } from 'lucide-react';

export const AddYouthModal = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('MCO');
  const [potential, setPotential] = useState('85-94');
  const [initialOverall, setInitialOverall] = useState('64');
  const [currentOverall, setCurrentOverall] = useState('64');

  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState('');

  if (!isOpen) return null;

  const positions = ['POR', 'LD', 'DFC', 'LI', 'MCD', 'MC', 'MCO', 'ED', 'EI', 'DC', 'CAD', 'CAI', 'MD', 'MI'];

  const handleToggleVoiceDictation = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;

      setIsListening(true);
      setVoiceNotice('Escuchando... Di por ejemplo: "Añade a Mateo Fernández de MCO con potencial 85-94, empezó con 62 de media y ha subido 7 puntos"');

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const parsed = parseYouthVoiceDictation(transcript);

        if (parsed) {
          if (parsed.name) setName(parsed.name);
          if (parsed.position) setPosition(parsed.position);
          if (parsed.potential) setPotential(parsed.potential);
          if (parsed.initialOverall) setInitialOverall(parsed.initialOverall);
          if (parsed.currentOverall) setCurrentOverall(parsed.currentOverall);

          setVoiceNotice(`✨ Formulario rellenado desde voz: "${transcript}"`);
        }
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } else {
      alert("El micrófono no está soportado en este navegador. Por favor introduce los datos manualmente.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      name,
      position,
      potential,
      initialOverall: Number(initialOverall) || 64,
      currentOverall: Number(currentOverall) || Number(initialOverall) || 64
    });
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-white">Reclutar Canterano</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Bar */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-300 font-semibold">¿Dictar datos por voz?</span>
          </div>

          <button
            type="button"
            onClick={handleToggleVoiceDictation}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
            }`}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            <span>{isListening ? 'Escuchando...' : 'Dictar por Voz'}</span>
          </button>
        </div>

        {/* Voice Notice Toast */}
        {voiceNotice && (
          <div className="mx-6 mt-3 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs font-semibold flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <p>{voiceNotice}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nombre de la Promesa</label>
            <input
              type="text"
              required
              placeholder="Ej. Mateo Fernández, Lucas Silva..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Posición</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-bold text-emerald-400"
              >
                {positions.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Rango de Potencial</label>
              <input
                type="text"
                placeholder="85-94"
                value={potential}
                onChange={(e) => setPotential(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-bold text-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Media Inicial (Al entrar)</label>
              <input
                type="number"
                min="40"
                max="90"
                value={initialOverall}
                onChange={(e) => {
                  setInitialOverall(e.target.value);
                  if (Number(currentOverall) < Number(e.target.value)) {
                    setCurrentOverall(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Media Actual (Tras entrenar)</label>
              <input
                type="number"
                min="40"
                max="99"
                value={currentOverall}
                onChange={(e) => setCurrentOverall(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-emerald-400 font-black text-xs"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-1"
            >
              <Check className="w-4 h-4" />
              <span>Añadir a la Cantera</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
