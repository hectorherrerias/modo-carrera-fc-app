import React, { useState } from 'react';
import { Calendar, X, Check } from 'lucide-react';

export const AddSeasonModal = ({ isOpen, onClose, onAdd }) => {
  const [year, setYear] = useState('2025/26');
  const [budget, setBudget] = useState('20000000');
  const [copySquad, setCopySquad] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!year.trim()) return;
    onAdd({
      year,
      budget,
      copySquad
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-lg text-white">Nueva Temporada</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Año de la Temporada</label>
            <input
              type="text"
              required
              placeholder="Ej. 2025/26"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Presupuesto de la Temporada (€)</label>
            <input
              type="number"
              required
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="copySquad"
              checked={copySquad}
              onChange={(e) => setCopySquad(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-400 bg-slate-950"
            />
            <label htmlFor="copySquad" className="text-xs font-medium text-slate-300 cursor-pointer">
              Copiar plantilla actual de la temporada anterior
            </label>
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
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Iniciar Temporada</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
