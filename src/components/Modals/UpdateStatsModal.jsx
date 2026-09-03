import React, { useState, useEffect } from 'react';
import { Edit3, X, Check, Save, HeartPulse, Calendar, AlertTriangle, ShieldCheck } from 'lucide-react';
import { 
  INJURY_TYPE_PRESETS, 
  INJURY_DURATION_PRESETS, 
  buildInjuryObject, 
  formatToISODate, 
  formatDateSpanish, 
  addDaysToDate,
  parseDurationDaysFromString
} from '../../utils/injuryHelper';
import { useApp } from '../../context/AppContext';

export const UpdateStatsModal = ({ isOpen, onClose, player, onUpdate }) => {
  const { latestMatchDate } = useApp();

  const [stats, setStats] = useState({
    minutes: 0,
    matches: 0,
    goals: 0,
    assists: 0,
    cleanSheets: 0,
    yellowCards: 0,
    redCards: 0
  });

  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [overall, setOverall] = useState(75);
  const [initialOvr, setInitialOvr] = useState(75);
  const [contractYears, setContractYears] = useState(3);
  const [status, setStatus] = useState('Disponible');
  const [officialMVPs, setOfficialMVPs] = useState(0);
  const [myMVPs, setMyMVPs] = useState(0);

  // Injury specific state
  const [isInjured, setIsInjured] = useState(false);
  const [injuryDurationDays, setInjuryDurationDays] = useState(60);
  const [isCustomDays, setIsCustomDays] = useState(false);
  const [injuryType, setInjuryType] = useState('Rotura de fibras / Desgarro muscular');
  const [injuryStartDate, setInjuryStartDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (player) {
      setName(player.name || '');
      setPosition(player.position || 'DC');
      setOverall(player.overall || 75);
      setInitialOvr(player.initialOvr !== undefined ? player.initialOvr : (player.overall || 75));
      setContractYears(player.contractYears !== undefined ? player.contractYears : 3);
      const currentStatus = player.status || 'Disponible';
      setStatus(currentStatus);
      setOfficialMVPs(player.officialMVPs || 0);
      setMyMVPs(player.myMVPs || 0);
      setStats({
        minutes: player.stats?.minutes || 0,
        matches: player.stats?.matches || 0,
        goals: player.stats?.goals || 0,
        assists: player.stats?.assists || 0,
        cleanSheets: player.stats?.cleanSheets || 0,
        yellowCards: player.stats?.yellowCards || 0,
        redCards: player.stats?.redCards || 0
      });

      const hasInjury = currentStatus.toLowerCase().includes('lesionad') || Boolean(player.injury && !player.injury.recovered);
      setIsInjured(hasInjury);

      if (hasInjury) {
        const days = player.injury?.durationDays || parseDurationDaysFromString(currentStatus);
        setInjuryDurationDays(days);
        setInjuryType(player.injury?.injuryType || 'Rotura de fibras / Desgarro muscular');
        setInjuryStartDate(player.injury?.startDate || latestMatchDate || new Date().toISOString().split('T')[0]);
      } else {
        setInjuryStartDate(latestMatchDate || new Date().toISOString().split('T')[0]);
        setInjuryDurationDays(60);
      }
    }
  }, [player, latestMatchDate]);

  if (!isOpen || !player) return null;

  const handleChange = (field, val) => {
    setStats(prev => ({
      ...prev,
      [field]: Math.max(0, Number(val) || 0)
    }));
  };

  const calculatedReturnDate = addDaysToDate(injuryStartDate, injuryDurationDays);

  const handleSubmit = (e) => {
    e.preventDefault();

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

    onUpdate(player.id, {
      name,
      position,
      overall: Number(overall) || 75,
      initialOvr: Number(initialOvr) || (Number(overall) || 75),
      contractYears: Number(contractYears) >= 0 ? Number(contractYears) : 3,
      status: finalStatus,
      injury: injuryData,
      officialMVPs: Number(officialMVPs) || 0,
      myMVPs: Number(myMVPs) || 0,
      stats
    });
    onClose();
  };

  const positions = ['POR', 'LD', 'DFC', 'LI', 'MCD', 'MC', 'MCO', 'ED', 'EI', 'DC', 'CAD', 'CAI', 'MD', 'MI'];
  const generalStatusOptions = ['Disponible', 'Lesionado', 'Sancionado (1 partido)', 'Sancionado (2 partidos)', 'Sancionado (3 partidos)', 'En duda', 'Descanso'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-lg text-white font-outfit">
              Editar Estadísticas y Ficha: <span className="text-emerald-400">{player.name}</span>
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* General Player Info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-3 border-b border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-xs focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Posición</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-bold text-emerald-400 focus:outline-none"
              >
                {positions.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">GRL Actual</label>
              <input
                type="number"
                min="40"
                max="99"
                value={overall}
                onChange={(e) => setOverall(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-black text-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">GRL Inicial</label>
              <input
                type="number"
                min="40"
                max="99"
                value={initialOvr}
                onChange={(e) => setInitialOvr(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-300 text-xs font-semibold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Contrato (Años)</label>
              <input
                type="number"
                min="0"
                max="8"
                value={contractYears}
                onChange={(e) => setContractYears(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-cyan-400 font-bold text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Estado Físico</label>
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
                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-bold text-amber-400 focus:outline-none"
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
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-rose-400">
                  <HeartPulse className="w-4 h-4 animate-pulse" />
                  <h4 className="font-extrabold uppercase text-xs">Gestión Médica de Lesión y Cuenta Regresiva</h4>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsInjured(false);
                    setStatus('Disponible');
                  }}
                  className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/40 cursor-pointer"
                >
                  Dar Alta Médica Inmediata
                </button>
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
                    Fecha prevista de regreso: <strong>{formatDateSpanish(calculatedReturnDate)}</strong> ({injuryDurationDays} días de baja)
                  </span>
                </div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-500/30">
                  ⏳ Cuenta regresiva activa
                </span>
              </div>
            </div>
          )}

          {/* MVPs */}
          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">👑 MVPs Oficiales</label>
              <input
                type="number"
                min="0"
                value={officialMVPs}
                onChange={(e) => setOfficialMVPs(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-amber-400 font-bold text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">⭐ MVPs del Mánager</label>
              <input
                type="number"
                min="0"
                value={myMVPs}
                onChange={(e) => setMyMVPs(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-cyan-400 font-bold text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Cumulative Stats Inputs */}
          <div>
            <span className="block text-[11px] font-bold text-slate-400 uppercase mb-2">Estadísticas Acumuladas Globales</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Partidos</label>
                <input
                  type="number"
                  value={stats.matches}
                  onChange={(e) => handleChange('matches', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Minutos</label>
                <input
                  type="number"
                  value={stats.minutes}
                  onChange={(e) => handleChange('minutes', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Goles ⚽</label>
                <input
                  type="number"
                  value={stats.goals}
                  onChange={(e) => handleChange('goals', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Asistencias 👟</label>
                <input
                  type="number"
                  value={stats.assists}
                  onChange={(e) => handleChange('assists', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Portería a Cero 🧤</label>
                <input
                  type="number"
                  value={stats.cleanSheets}
                  onChange={(e) => handleChange('cleanSheets', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Amarillas 🟨</label>
                <input
                  type="number"
                  value={stats.yellowCards}
                  onChange={(e) => handleChange('yellowCards', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Rojas 🟥</label>
                <input
                  type="number"
                  value={stats.redCards}
                  onChange={(e) => handleChange('redCards', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-rose-500"
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
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
