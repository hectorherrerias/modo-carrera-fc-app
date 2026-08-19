import React, { useState } from 'react';
import { BookmarkPlus, X, Check, DollarSign, Shield, User, Building, Sparkles } from 'lucide-react';

export const AddShortlistModal = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('DC');
  const [age, setAge] = useState(23);
  const [currentClub, setCurrentClub] = useState('');
  const [estimatedValue, setEstimatedValue] = useState(15000000);
  const [contractExpiring, setContractExpiring] = useState(false);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const positions = ['POR', 'LD', 'DFC', 'LI', 'MCD', 'MC', 'MCO', 'ED', 'EI', 'DC', 'CAD', 'CAI', 'MD', 'MI'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      position,
      age: Number(age) || 23,
      currentClub: currentClub.trim() || 'Agente Libre',
      estimatedValue: Number(estimatedValue) || 0,
      contractExpiring: Boolean(contractExpiring),
      notes: notes.trim()
    });

    setName('');
    setCurrentClub('');
    setEstimatedValue(15000000);
    setContractExpiring(false);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <BookmarkPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white font-outfit">Añadir a Lista de Seguimiento</h3>
              <p className="text-[11px] text-slate-400">Registra objetivos de mercado y posibles fichajes libres</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Nombre del Jugador</label>
            <input
              type="text"
              required
              placeholder="Ej. Florian Wirtz, Alphonso Davies, Nico Williams..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-cyan-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Posición Principal</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
              >
                {positions.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Edad</label>
              <input
                type="number"
                min="15"
                max="45"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-amber-400 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Club Actual</label>
              <input
                type="text"
                placeholder="Ej. Bayer Leverkusen, Bayern..."
                value={currentClub}
                onChange={(e) => setCurrentClub(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Valor Estimado (€)</label>
              <input
                type="number"
                min="0"
                step="500000"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-emerald-400 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Contract Expiring Checkbox */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl">
            <label className="flex items-center space-x-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={contractExpiring}
                onChange={(e) => setContractExpiring(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-900 cursor-pointer"
              />
              <div>
                <span className="font-bold text-white text-xs block">
                  Termina contrato al final de temporada (Fichaje Libre) 🆓
                </span>
                <span className="text-[10px] text-slate-400">
                  Podrás negociar su incorporación gratis en el periodo de traspasos
                </span>
              </div>
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Notas del Ojeador (Opcional)</label>
            <input
              type="text"
              placeholder="Ej. Cláusula de rescisión baja, gran velocidad, zurdo..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Footer Buttons */}
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
              className="px-5 py-2 text-xs font-black text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Guardar en Shortlist</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
