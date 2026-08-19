import React, { useState, useEffect } from 'react';
import { Edit3, X, Check, Save } from 'lucide-react';

export const UpdateStatsModal = ({ isOpen, onClose, player, onUpdate }) => {
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
  const [contractYears, setContractYears] = useState(3);
  const [status, setStatus] = useState('Disponible');
  const [officialMVPs, setOfficialMVPs] = useState(0);
  const [myMVPs, setMyMVPs] = useState(0);

  useEffect(() => {
    if (player) {
      setName(player.name || '');
      setPosition(player.position || 'DC');
      setOverall(player.overall || 75);
      setContractYears(player.contractYears !== undefined ? player.contractYears : 3);
      setStatus(player.status || 'Disponible');
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
    }
  }, [player]);

  if (!isOpen || !player) return null;

  const handleChange = (field, val) => {
    setStats(prev => ({
      ...prev,
      [field]: Math.max(0, Number(val) || 0)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(player.id, {
      name,
      position,
      overall: Number(overall) || 75,
      contractYears: Number(contractYears) >= 0 ? Number(contractYears) : 3,
      status: status || 'Disponible',
      officialMVPs: Number(officialMVPs) || 0,
      myMVPs: Number(myMVPs) || 0,
      stats
    });
    onClose();
  };

  const positions = ['POR', 'LD', 'DFC', 'LI', 'MCD', 'MC', 'MCO', 'ED', 'EI', 'DC', 'CAD', 'CAI', 'MD', 'MI'];
  const statusOptions = ['Disponible', 'Lesionado (1 semana)', 'Lesionado (2 semanas)', 'Lesionado (3 semanas)', 'Lesionado (1 mes)', 'Lesionado (2 meses)', 'Lesionado (3 meses)', 'Sancionado (1 partido)', 'Sancionado (2 partidos)', 'Sancionado (3 partidos)', 'En duda', 'Descanso'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-lg text-white">Editar Estadísticas: <span className="text-emerald-400">{player.name}</span></h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pb-3 border-b border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Posición</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-bold text-emerald-400"
              >
                {positions.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">GRL (Overall)</label>
              <input
                type="number"
                min="40"
                max="99"
                value={overall}
                onChange={(e) => setOverall(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-bold text-amber-400"
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
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-cyan-400 font-bold text-xs"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Estado de Disponibilidad</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs font-semibold"
              >
                {statusOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800">
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">👑 MVPs Oficiales</label>
              <input
                type="number"
                min="0"
                value={officialMVPs}
                onChange={(e) => setOfficialMVPs(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-amber-400 font-bold text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">⭐ MVPs del Mánager</label>
              <input
                type="number"
                min="0"
                value={myMVPs}
                onChange={(e) => setMyMVPs(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-cyan-400 font-bold text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Partidos</label>
              <input
                type="number"
                value={stats.matches}
                onChange={(e) => handleChange('matches', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Minutos</label>
              <input
                type="number"
                value={stats.minutes}
                onChange={(e) => handleChange('minutes', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Goles ⚽</label>
              <input
                type="number"
                value={stats.goals}
                onChange={(e) => handleChange('goals', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Asistencias 👟</label>
              <input
                type="number"
                value={stats.assists}
                onChange={(e) => handleChange('assists', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Portería a Cero 🧤</label>
              <input
                type="number"
                value={stats.cleanSheets}
                onChange={(e) => handleChange('cleanSheets', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Amarillas 🟨</label>
              <input
                type="number"
                value={stats.yellowCards}
                onChange={(e) => handleChange('yellowCards', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Rojas 🟥</label>
              <input
                type="number"
                value={stats.redCards}
                onChange={(e) => handleChange('redCards', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-rose-500"
              />
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
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-lg shadow-amber-500/20 transition-all"
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
