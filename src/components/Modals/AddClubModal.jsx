import React, { useState } from 'react';
import { Shield, X, Check, Upload, Image as ImageIcon } from 'lucide-react';
import { ClubLogo } from '../ClubLogo';

export const AddClubModal = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [stadium, setStadium] = useState('');
  const [budget, setBudget] = useState('15000000');
  const [logo, setLogo] = useState('⚽');
  const [color, setColor] = useState('#10B981');

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result); // Base64 Data URL
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      name,
      managerName,
      stadium: stadium || 'Estadio Municipal',
      budget,
      logo,
      color
    });
    setName('');
    setManagerName('');
    setStadium('');
    onClose();
  };

  const sampleLogos = ['⚽', '🛡️', '👑', '🦅', '🦁', '⚡', '🌟', '🔥'];
  const sampleColors = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-lg text-white">Crear Nuevo Club</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nombre del Club</label>
            <input
              type="text"
              required
              placeholder="Ej. CD Leganés, Real Betis..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nombre del Mánager</label>
              <input
                type="text"
                required
                placeholder="Tu Nombre de DT"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Estadio</label>
              <input
                type="text"
                placeholder="Estadio Municipal"
                value={stadium}
                onChange={(e) => setStadium(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Presupuesto Inicial (€)</label>
            <input
              type="number"
              required
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-bold text-emerald-400"
            />
          </div>

          {/* ESCUDO DE IMAGEN DESDE PC & EMOJIS */}
          <div className="space-y-2 pt-1 border-t border-slate-800">
            <label className="block text-xs font-bold text-emerald-400 uppercase">
              Escudo del Club (Subir desde tu PC)
            </label>

            <div className="flex items-center space-x-4 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center p-1">
                <ClubLogo logo={logo} name={name || 'Club'} className="w-10 h-10" />
              </div>

              <label className="flex-1 cursor-pointer flex items-center justify-center space-x-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 hover:border-emerald-400 text-emerald-400 text-xs font-bold rounded-xl transition-all">
                <Upload className="w-4 h-4" />
                <span>Subir Imagen desde PC</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Fallback Emoji Preset Selector */}
            <div>
              <span className="block text-[10px] text-slate-400 mb-1">O selecciona un icono rápido:</span>
              <div className="flex space-x-2">
                {sampleLogos.map((icon) => (
                  <button
                    type="button"
                    key={icon}
                    onClick={() => setLogo(icon)}
                    className={`w-8 h-8 rounded-lg border text-base flex items-center justify-center transition-all ${
                      logo === icon ? 'border-emerald-500 bg-emerald-500/20' : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Color selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Color Principal</label>
            <div className="flex space-x-2">
              {sampleColors.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === c ? 'scale-125 border-white shadow-lg' : 'border-transparent hover:scale-110'
                  }`}
                />
              ))}
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
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Crear Club</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
