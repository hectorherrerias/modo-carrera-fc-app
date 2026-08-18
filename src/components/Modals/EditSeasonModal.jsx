import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Calendar, X, Check, DollarSign, Trophy, Trash2, Activity } from 'lucide-react';

export const EditSeasonModal = ({ isOpen, onClose, season, onSave, onDelete, canDelete = false }) => {
  const [year, setYear] = useState('');
  const [budget, setBudget] = useState('15000000');
  const [wins, setWins] = useState(0);
  const [draws, setDraws] = useState(0);
  const [losses, setLosses] = useState(0);
  const [narrativeContext, setNarrativeContext] = useState('');

  useEffect(() => {
    if (season) {
      setYear(season.year || '2024/25');
      setBudget(season.budget?.toString() || '15000000');
      setWins(season.matchResults?.wins || 0);
      setDraws(season.matchResults?.draws || 0);
      setLosses(season.matchResults?.losses || 0);
      setNarrativeContext(season.narrativeContext || '');
    }
  }, [season]);

  if (!isOpen || !season) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!year.trim()) return;

    onSave(season.id, {
      year: year.trim(),
      budget: Number(budget) || 0,
      matchResults: {
        wins: Math.max(0, Number(wins) || 0),
        draws: Math.max(0, Number(draws) || 0),
        losses: Math.max(0, Number(losses) || 0)
      },
      narrativeContext: narrativeContext.trim()
    });

    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`¿Seguro que deseas eliminar la Temporada ${season.year}? Se borrarán los jugadores, fichajes y estadísticas asociadas a esta temporada.`)) {
      onDelete(season.id);
      onClose();
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative my-auto w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-lg text-white">Editar Temporada {season.year}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Año / Nombre de la Temporada
            </label>
            <input
              type="text"
              required
              placeholder="Ej. 2024/25 o 2025/26"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 font-bold"
            />
            <p className="text-[10px] text-slate-400 mt-0.5">Puedes corregir el año si te equivocaste al crear la temporada.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Presupuesto Disponible (€)
            </label>
            <div className="relative">
              <input
                type="number"
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-emerald-400 text-sm font-bold focus:outline-none focus:border-cyan-500"
              />
              <DollarSign className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
            </div>
          </div>

          {/* W-D-L Edit Counters */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Balance de Partidos (W - D - L)</span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-emerald-400 uppercase mb-0.5">Victorias</label>
                <input
                  type="number"
                  min="0"
                  value={wins}
                  onChange={(e) => setWins(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-amber-400 uppercase mb-0.5">Empates</label>
                <input
                  type="number"
                  min="0"
                  value={draws}
                  onChange={(e) => setDraws(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-bold text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-rose-400 uppercase mb-0.5">Derrotas</label>
                <input
                  type="number"
                  min="0"
                  value={losses}
                  onChange={(e) => setLosses(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-bold text-center"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Contexto Narrativo de la Temporada
            </label>
            <textarea
              rows="3"
              placeholder="Situación de la temporada para las ruedas de prensa..."
              value={narrativeContext}
              onChange={(e) => setNarrativeContext(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-3 flex justify-between items-center border-t border-slate-800">
            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center space-x-1 text-xs text-rose-400 hover:text-rose-300 font-bold px-3 py-2 rounded-xl bg-rose-950/40 border border-rose-500/30 hover:bg-rose-950/80 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </button>
            )}

            <div className="flex space-x-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-5 py-2 text-xs font-black text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
