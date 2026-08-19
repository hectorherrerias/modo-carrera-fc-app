import React, { useState, useEffect } from 'react';
import { GraduationCap, X, Save } from 'lucide-react';

export const EditYouthModal = ({ isOpen, onClose, youth, onUpdate }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState(16);
  const [position, setPosition] = useState('MCO');
  const [potential, setPotential] = useState('85-94');
  const [initialOverall, setInitialOverall] = useState(64);
  const [currentOverall, setCurrentOverall] = useState(64);

  const positions = ['POR', 'LD', 'DFC', 'LI', 'MCD', 'MC', 'MCO', 'ED', 'EI', 'DC', 'CAD', 'CAI', 'MD', 'MI'];

  useEffect(() => {
    if (youth) {
      setName(youth.name || '');
      setAge(youth.age || 16);
      setPosition(youth.position || 'MCO');
      setPotential(youth.potential || '85-94');
      setInitialOverall(youth.initialOverall || 64);
      setCurrentOverall(youth.currentOverall || youth.initialOverall || 64);
    }
  }, [youth]);

  if (!isOpen || !youth) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onUpdate(youth.id, {
      name,
      age: Number(age) || 16,
      position,
      potential,
      initialOverall: Number(initialOverall) || 64,
      currentOverall: Number(currentOverall) || 64
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">Editar Canterano</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nombre de la Promesa</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Posición</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-bold text-emerald-400 focus:outline-none focus:border-amber-400"
              >
                {positions.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Edad</label>
              <input
                type="number"
                min="14"
                max="24"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-bold text-cyan-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Potencial</label>
              <input
                type="text"
                value={potential}
                onChange={(e) => setPotential(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Media Inicial</label>
              <input
                type="number"
                min="40"
                max="99"
                value={initialOverall}
                onChange={(e) => setInitialOverall(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-emerald-400 mb-1">Media Actual</label>
              <input
                type="number"
                min="40"
                max="99"
                value={currentOverall}
                onChange={(e) => setCurrentOverall(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-emerald-400 font-black text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg border border-slate-800 hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-1"
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
