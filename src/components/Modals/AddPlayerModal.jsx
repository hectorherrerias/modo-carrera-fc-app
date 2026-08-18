import React, { useState } from 'react';
import { parsePlayerVoiceDictation } from '../../utils/playerVoiceParser';
import { UserPlus, X, Check, Mic, MicOff, Sparkles, Bot } from 'lucide-react';

export const AddPlayerModal = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('DC');
  const [overall, setOverall] = useState('78');
  
  // Stats
  const [matches, setMatches] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [goals, setGoals] = useState(0);
  const [assists, setAssists] = useState(0);
  const [cleanSheets, setCleanSheets] = useState(0);
  const [yellowCards, setYellowCards] = useState(0);
  const [redCards, setRedCards] = useState(0);

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
      setVoiceNotice('Escuchando... Di por ejemplo: "Añade a Mbappé de delantero centro con media 91, 15 partidos y 12 goles"');

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const parsed = parsePlayerVoiceDictation(transcript);

        if (parsed) {
          if (parsed.name) setName(parsed.name);
          if (parsed.position) setPosition(parsed.position);
          if (parsed.overall) setOverall(parsed.overall);
          if (parsed.stats) {
            setMatches(parsed.stats.matches || 0);
            setMinutes(parsed.stats.minutes || 0);
            setGoals(parsed.stats.goals || 0);
            setAssists(parsed.stats.assists || 0);
            setCleanSheets(parsed.stats.cleanSheets || 0);
            setYellowCards(parsed.stats.yellowCards || 0);
            setRedCards(parsed.stats.redCards || 0);
          }
          setVoiceNotice(`✨ Formulario rellenado automáticamente desde dictado: "${transcript}"`);
        }
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } else {
      alert("El micrófono no está soportado en este navegador. Por favor escribe los datos manualmente en el formulario.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      name,
      position,
      overall,
      matches: Number(matches) || 0,
      minutes: Number(minutes) || (Number(matches) * 80),
      goals: Number(goals) || 0,
      assists: Number(assists) || 0,
      cleanSheets: Number(cleanSheets) || 0,
      yellowCards: Number(yellowCards) || 0,
      redCards: Number(redCards) || 0
    });
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-lg text-white">Añadir Jugador a la Plantilla</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Dictation Banner Bar */}
        <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-300 font-semibold">¿Prefieres dictar los datos por voz?</span>
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

        {/* Voice Auto-fill Notice Toast */}
        {voiceNotice && (
          <div className="mx-6 mt-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs font-semibold flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <p>{voiceNotice}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nombre del Jugador</label>
            <input
              type="text"
              required
              placeholder="Ej. Mbappé, Bellingham, Courtois..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Posición Principal</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 font-bold text-emerald-400"
              >
                {positions.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Media (GRL / OVR)</label>
              <input
                type="number"
                min="40"
                max="99"
                required
                value={overall}
                onChange={(e) => setOverall(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-bold text-amber-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Estadísticas de la Temporada</label>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Partidos</label>
                <input
                  type="number"
                  value={matches}
                  onChange={(e) => setMatches(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Goles ⚽</label>
                <input
                  type="number"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-emerald-400 font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Asistencias 👟</label>
                <input
                  type="number"
                  value={assists}
                  onChange={(e) => setAssists(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-cyan-400 font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Porterías Cero 🧤</label>
                <input
                  type="number"
                  value={cleanSheets}
                  onChange={(e) => setCleanSheets(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-blue-400 font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Amarillas 🟨</label>
                <input
                  type="number"
                  value={yellowCards}
                  onChange={(e) => setYellowCards(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-amber-400 font-bold text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Rojas 🟥</label>
                <input
                  type="number"
                  value={redCards}
                  onChange={(e) => setRedCards(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-rose-500 font-bold text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg border border-slate-800 hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Jugador</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
