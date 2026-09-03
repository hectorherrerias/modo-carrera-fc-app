import React, { useState } from 'react';
import { parsePlayerVoiceDictation } from '../../utils/playerVoiceParser';
import { UserPlus, X, Check, Mic, MicOff, Sparkles, Bot, HeartPulse, Calendar } from 'lucide-react';
import { 
  INJURY_TYPE_PRESETS, 
  INJURY_DURATION_PRESETS, 
  buildInjuryObject, 
  formatDateSpanish, 
  addDaysToDate 
} from '../../utils/injuryHelper';
import { useApp } from '../../context/AppContext';

export const AddPlayerModal = ({ isOpen, onClose, onAdd }) => {
  const { latestMatchDate } = useApp();

  const [name, setName] = useState('');
  const [position, setPosition] = useState('DC');
  const [overall, setOverall] = useState('78');
  const [contractYears, setContractYears] = useState(3);
  const [status, setStatus] = useState('Disponible');
  const [officialMVPs, setOfficialMVPs] = useState(0);
  const [myMVPs, setMyMVPs] = useState(0);

  // Injury controls
  const [isInjured, setIsInjured] = useState(false);
  const [injuryDurationDays, setInjuryDurationDays] = useState(60);
  const [isCustomDays, setIsCustomDays] = useState(false);
  const [injuryType, setInjuryType] = useState('Rotura de fibras / Desgarro muscular');
  const [injuryStartDate, setInjuryStartDate] = useState(() => latestMatchDate || new Date().toISOString().split('T')[0]);

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
  const generalStatusOptions = ['Disponible', 'Lesionado', 'Sancionado (1 partido)', 'Sancionado (2 partidos)', 'Sancionado (3 partidos)', 'En duda', 'Descanso'];

  const calculatedReturnDate = addDaysToDate(injuryStartDate, injuryDurationDays);

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

    let finalStatus = status;
    let injuryData = null;

    if (isInjured) {
      const days = Number(injuryDurationDays) || 14;
      let label = '';
      if (days >= 30 && days % 30 === 0) {
        label = `${days / 30} ${days / 30 === 1 ? 'mes' : 'meses'}`;
      } else if (days >= 7 && days % 7 === 0) {
        label = `${days / 7} ${days / 7 === 1 ? 'semana' : 'semanas'}`;
      } else {
        label = `${days} días`;
      }

      finalStatus = `Lesionado (${label})`;
      injuryData = buildInjuryObject({
        durationDays: days,
        durationLabel: label,
        startDate: injuryStartDate,
        injuryType: injuryType || 'Lesión muscular',
        recovered: false
      });
    } else {
      finalStatus = status.toLowerCase().includes('lesionad') ? 'Disponible' : status;
      injuryData = null;
    }

    onAdd({
      name: name.trim(),
      position,
      overall,
      contractYears: Number(contractYears) >= 0 ? Number(contractYears) : 3,
      status: finalStatus,
      injury: injuryData,
      officialMVPs: Number(officialMVPs) || 0,
      myMVPs: Number(myMVPs) || 0,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-lg text-white font-outfit">Añadir Jugador a la Plantilla</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Dictation Banner Bar */}
        <div className="bg-slate-950 px-6 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-300 font-semibold">¿Prefieres dictar los datos por voz?</span>
          </div>

          <button
            type="button"
            onClick={handleToggleVoiceDictation}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
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
          <div className="mx-6 mt-3 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs font-semibold flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <p>{voiceNotice}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nombre del Jugador</label>
            <input
              type="text"
              required
              placeholder="Ej. Mbappé, Bellingham, Courtois..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Posición</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500 font-bold text-emerald-400"
              >
                {positions.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Media (GRL)</label>
              <input
                type="number"
                min="40"
                max="99"
                required
                value={overall}
                onChange={(e) => setOverall(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-black text-amber-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Contrato (Años)</label>
              <input
                type="number"
                min="0"
                max="8"
                value={contractYears}
                onChange={(e) => setContractYears(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-bold text-cyan-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Estado</label>
              <select
                value={isInjured ? 'Lesionado' : status}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'Lesionado') {
                    setIsInjured(true);
                  } else {
                    setIsInjured(false);
                    setStatus(val);
                  }
                }}
                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-bold text-amber-400 focus:outline-none focus:border-emerald-500"
              >
                {generalStatusOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* INJURY CONFIGURATION PANEL (If Player is Injured) */}
          {isInjured && (
            <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-4 space-y-3 animate-fade-in shadow-inner">
              <div className="flex items-center space-x-2 text-rose-400">
                <HeartPulse className="w-4 h-4 animate-pulse" />
                <h4 className="font-extrabold uppercase text-xs">Configurar Lesión y Cuenta Regresiva</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Duration Preset Selector */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Duración Estimada</label>
                  <select
                    value={isCustomDays ? '_custom_' : injuryDurationDays}
                    onChange={(e) => {
                      if (e.target.value === '_custom_') {
                        setIsCustomDays(true);
                      } else {
                        setIsCustomDays(false);
                        setInjuryDurationDays(Number(e.target.value));
                      }
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-rose-500/40 rounded-xl text-white font-bold text-xs focus:outline-none"
                  >
                    {INJURY_DURATION_PRESETS.map(p => (
                      <option key={p.days} value={p.days}>{p.label}</option>
                    ))}
                    <option value="_custom_">Personalizado (días exactos)</option>
                  </select>

                  {isCustomDays && (
                    <input
                      type="number"
                      min="1"
                      max="365"
                      placeholder="Días de baja"
                      value={injuryDurationDays}
                      onChange={(e) => setInjuryDurationDays(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full mt-1.5 px-2.5 py-1 bg-slate-950 border border-rose-500 rounded-lg text-white font-bold text-xs"
                    />
                  )}
                </div>

                {/* Injury Start Date */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Fecha de la Lesión</label>
                  <input
                    type="date"
                    value={injuryStartDate}
                    onChange={(e) => setInjuryStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Injury Type */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">Tipo de Lesión</label>
                  <select
                    value={injuryType}
                    onChange={(e) => setInjuryType(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs font-medium focus:outline-none"
                  >
                    {INJURY_TYPE_PRESETS.map((t, idx) => (
                      <option key={idx} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="bg-slate-950/80 border border-rose-500/30 rounded-xl p-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-rose-300">
                  <Calendar className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>
                    Fecha prevista de regreso: <strong>{formatDateSpanish(calculatedReturnDate)}</strong> ({injuryDurationDays} días)
                  </span>
                </div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30">
                  ⏳ Cuenta regresiva
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">👑 MVPs Oficiales</label>
              <input
                type="number"
                min="0"
                value={officialMVPs}
                onChange={(e) => setOfficialMVPs(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-amber-400 font-bold text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">⭐ MVPs del Mánager</label>
              <input
                type="number"
                min="0"
                value={myMVPs}
                onChange={(e) => setMyMVPs(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-cyan-400 font-bold text-xs"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Estadísticas Iniciales (Opcional)</label>
            
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

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl border border-slate-800 hover:bg-slate-800 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
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
