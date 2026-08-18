import React, { useState } from 'react';
import { parseTransferVoiceDictation } from '../../utils/transferVoiceParser';
import { ArrowLeftRight, X, Check, Mic, MicOff, Sparkles, Bot } from 'lucide-react';

export const AddTransferModal = ({ isOpen, onClose, onAdd }) => {
  const [playerName, setPlayerName] = useState('');
  const [type, setType] = useState('Fichaje'); // 'Fichaje' | 'Venta' | 'Cesión (Entrada)' | 'Cesión (Salida)'
  const [fee, setFee] = useState('');
  const [fromTo, setFromTo] = useState('');
  const [loanDetails, setLoanDetails] = useState('');

  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState('');

  if (!isOpen) return null;

  const handleToggleVoiceDictation = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;

      setIsListening(true);
      setVoiceNotice('Escuchando... Di por ejemplo: "Cesión entrada de Ansu Fati del Barcelona con opción de compra de 20 millones"');

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const parsed = parseTransferVoiceDictation(transcript);

        if (parsed) {
          if (parsed.playerName) setPlayerName(parsed.playerName);
          if (parsed.type) setType(parsed.type);
          if (parsed.fee) setFee(parsed.fee / 1000000);
          if (parsed.fromTo) setFromTo(parsed.fromTo);
          if (parsed.loanDetails) setLoanDetails(parsed.loanDetails);

          setVoiceNotice(`✨ Formulario rellenado desde voz: "${transcript}"`);
        }
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } else {
      alert("El micrófono no está soportado en este navegador. Por favor introduce los datos en el formulario.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    let finalFee = Number(fee) * 1000000;
    if (isNaN(finalFee)) finalFee = 0;

    let combinedFromTo = fromTo;
    if (type.includes("Cesión") && loanDetails) {
      combinedFromTo = `${fromTo || 'Club Ex'} (${loanDetails})`;
    }

    onAdd({
      playerName,
      type,
      fee: finalFee,
      fromTo: combinedFromTo || 'Club Externo'
    });

    setPlayerName('');
    setFee('');
    setFromTo('');
    setLoanDetails('');
    onClose();
  };

  const isLoan = type.includes('Cesión');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2">
            <ArrowLeftRight className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-white">Registrar Fichaje / Cesión</h3>
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

        {voiceNotice && (
          <div className="mx-6 mt-3 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs font-semibold flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <p>{voiceNotice}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nombre del Jugador</label>
            <input
              type="text"
              required
              placeholder="Ej. Bellingham, Ansu Fati, En-Nesyri..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Tipo de Operación</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-bold text-emerald-400"
              >
                <option value="Fichaje">📥 Fichaje (Entrada)</option>
                <option value="Venta">📤 Venta (Salida)</option>
                <option value="Cesión (Entrada)">🔄 Cesión (Entrada)</option>
                <option value="Cesión (Salida)">🔄 Cesión (Salida)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                {isLoan ? 'Coste / Opción (M €)' : 'Precio / Traspaso (M €)'}
              </label>
              <input
                type="number"
                step="0.5"
                placeholder="Ej. 15"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-bold text-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              {type.includes('Venta') || type.includes('Salida') ? 'Club Destino' : 'Club Origen'}
            </label>
            <input
              type="text"
              placeholder="Ej. Real Madrid, Barcelona, Getafe..."
              value={fromTo}
              onChange={(e) => setFromTo(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
            />
          </div>

          {isLoan && (
            <div>
              <label className="block text-xs font-semibold text-cyan-400 uppercase mb-1">Detalle de la Cláusula de Cesión</label>
              <input
                type="text"
                placeholder="Ej. Opción de compra de 15M / Cesión simple de 1 año"
                value={loanDetails}
                onChange={(e) => setLoanDetails(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-cyan-300 text-xs"
              />
            </div>
          )}

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
              <span>Guardar Operación</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
