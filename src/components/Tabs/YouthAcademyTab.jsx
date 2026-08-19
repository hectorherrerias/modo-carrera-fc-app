import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AddYouthModal } from '../Modals/AddYouthModal';
import { EditYouthModal } from '../Modals/EditYouthModal';
import { GraduationCap, Plus, Sparkles, TrendingUp, ChevronUp, ChevronDown, UserCheck, Trash2, Edit3 } from 'lucide-react';

export const YouthAcademyTab = () => {
  const { currentYouth, addYouthProspect, updateYouthProspect, deleteYouthProspect, promoteYouthProspect } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingYouth, setEditingYouth] = useState(null);

  const handleAdjustOverall = (youthId, currentVal, delta) => {
    const newVal = Math.max(40, Math.min(99, Number(currentVal) + delta));
    updateYouthProspect(youthId, { currentOverall: newVal });
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`¿Seguro que deseas eliminar a ${name} de la cantera?`)) {
      deleteYouthProspect(id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white font-outfit">Academia de Cantera</h3>
            <p className="text-xs text-slate-400 mt-1">
              Desarrolla jóvenes promesas, monitorea su edad, incremento de media (+GRL subida) y promuévelos al primer equipo
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Reclutar Canterano (Voz / Manual)</span>
        </button>
      </div>

      {/* Prospects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentYouth.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs space-y-2">
            <GraduationCap className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="font-bold text-slate-300">No hay canteranos reclutados aún en esta temporada.</p>
            <p>Pulsa en **Reclutar Canterano** para dictar por voz o añadir una joven promesa con su edad y subida de media.</p>
          </div>
        ) : (
          currentYouth.map((youth) => {
            const initialOvr = youth.initialOverall || 64;
            const currentOvr = youth.currentOverall || initialOvr;
            const growth = currentOvr - initialOvr;
            const playerAge = youth.age || 16;

            return (
              <div
                key={youth.id}
                className={`bg-slate-900 border rounded-3xl p-6 shadow-xl relative flex flex-col justify-between space-y-4 transition-all ${
                  youth.promoted 
                    ? 'border-slate-800 opacity-60' 
                    : 'border-slate-800 hover:border-emerald-500/40'
                }`}
              >
                {/* Top Badge Strip */}
                <div className="flex justify-between items-start">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="bg-slate-950 text-emerald-400 font-extrabold text-xs px-2.5 py-1 rounded-xl border border-slate-800">
                      {youth.position}
                    </span>
                    <span className="text-[11px] font-bold text-cyan-400 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
                      {playerAge} años
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
                      Potencial: <strong className="text-amber-400">{youth.potential}</strong>
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setEditingYouth(youth)}
                      title="Editar canterano"
                      className="p-1 text-slate-500 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(youth.id, youth.name)}
                      title="Eliminar de la cantera"
                      className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Name & Media Subida Highlight */}
                <div>
                  <h4 className="text-xl font-black text-white font-outfit">{youth.name}</h4>

                  {/* Growth Badge Tracker */}
                  <div className="mt-3 bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-bold uppercase text-slate-500 block">Progresión de Media</span>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="text-xs text-slate-400 font-bold">{initialOvr}</span>
                        <span className="text-slate-600 text-xs font-bold">➔</span>
                        <span className="text-base font-black text-emerald-400">{currentOvr}</span>
                      </div>
                    </div>

                    {/* Growth Badge */}
                    <div className="flex items-center space-x-2">
                      <div className={`px-2 py-1 rounded-xl font-black text-xs flex items-center space-x-1 border ${
                        growth > 0
                          ? 'bg-emerald-950 border-emerald-500/40 text-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>+{growth} GRL</span>
                      </div>

                      {/* Quick Adjust Buttons (+1 / -1 GRL) */}
                      {!youth.promoted && (
                        <div className="flex flex-col space-y-0.5">
                          <button
                            onClick={() => handleAdjustOverall(youth.id, currentOvr, 1)}
                            title="Aumentar media (+1)"
                            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 p-0.5 rounded hover:scale-105"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleAdjustOverall(youth.id, currentOvr, -1)}
                            title="Disminuir media (-1)"
                            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 p-0.5 rounded hover:scale-105"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Footer Promotion Button */}
                <div className="pt-2">
                  {youth.promoted ? (
                    <div className="w-full py-2 bg-slate-950 text-slate-500 text-center text-xs font-bold rounded-xl border border-slate-800">
                      ✓ Promovido al Primer Equipo
                    </div>
                  ) : (
                    <button
                      onClick={() => promoteYouthProspect(youth.id)}
                      className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Promover al Primer Equipo ({currentOvr} GRL)</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      <AddYouthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addYouthProspect}
      />

      <EditYouthModal
        isOpen={!!editingYouth}
        onClose={() => setEditingYouth(null)}
        youth={editingYouth}
        onUpdate={updateYouthProspect}
      />

    </div>
  );
};

