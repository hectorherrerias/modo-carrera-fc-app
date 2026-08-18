import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trophy, Calendar, Plus, Shield, ArrowRight, DollarSign, Activity, Award, Edit3, Landmark } from 'lucide-react';
import { AddSeasonModal } from '../components/Modals/AddSeasonModal';
import { EditClubModal } from '../components/Modals/EditClubModal';
import { ClubLogo } from '../components/ClubLogo';

export const ClubHubView = ({ onSelectSeason, onBackToClubs }) => {
  const { activeClub, clubSeasons, addSeason, updateClub, setActiveSeasonId } = useApp();
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
  const [isEditClubModalOpen, setIsEditClubModalOpen] = useState(false);

  if (!activeClub) return null;

  const handleSeasonClick = (seasonId) => {
    setActiveSeasonId(seasonId);
    onSelectSeason(seasonId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Club Profile Header Banner */}
      <div className="relative bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        <div 
          className="absolute top-0 right-0 w-72 h-72 blur-3xl opacity-20"
          style={{ backgroundColor: activeClub.color || '#10B981' }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Club Info Left */}
          <div className="flex items-center space-x-5">
            <div 
              className="w-20 h-20 rounded-3xl flex items-center justify-center p-2 shadow-xl border border-white/10 overflow-hidden"
              style={{ backgroundColor: `${activeClub.color || '#10B981'}30` }}
            >
              <ClubLogo logo={activeClub.logo} name={activeClub.name} className="w-16 h-16" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Hub de Proyecto</span>
                <button
                  onClick={() => setIsEditClubModalOpen(true)}
                  className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-emerald-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Editar Club</span>
                </button>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white font-outfit mt-1">
                {activeClub.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center space-x-1">
                  <Landmark className="w-3.5 h-3.5 text-amber-400" />
                  <span>Estadio: <strong className="text-slate-200">{activeClub.stadium || 'Estadio Municipal'}</strong></span>
                </span>
                <span className="text-slate-600">•</span>
                <span>DT: <strong className="text-white">{activeClub.managerName}</strong></span>
              </div>
            </div>
          </div>

          {/* Historical Stats Summary Pill Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl px-4 py-3 text-center">
              <p className="text-[10px] font-bold uppercase text-slate-400 flex items-center justify-center space-x-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Títulos Totales</span>
              </p>
              <p className="text-xl font-black text-amber-400 mt-0.5">{activeClub.totalTrophies}</p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl px-4 py-3 text-center">
              <p className="text-[10px] font-bold uppercase text-slate-400 flex items-center justify-center space-x-1">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>% Victorias</span>
              </p>
              <p className="text-xl font-black text-emerald-400 mt-0.5">{activeClub.globalWinRate}%</p>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-slate-950/80 border border-slate-800/80 rounded-2xl px-4 py-3 text-center">
              <p className="text-[10px] font-bold uppercase text-slate-400 flex items-center justify-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Temporadas</span>
              </p>
              <p className="text-xl font-black text-white mt-0.5">{clubSeasons.length}</p>
            </div>
          </div>

        </div>

      </div>

      {/* Season Selection Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white font-outfit">Temporadas del Club</h2>
          <p className="text-xs text-slate-400">Selecciona una temporada para ver su alineación, estadísticas y finanzas</p>
        </div>

        <button
          onClick={() => setIsSeasonModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Iniciar Nueva Temporada</span>
        </button>
      </div>

      {/* Seasons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clubSeasons.map((season) => (
          <div
            key={season.id}
            onClick={() => handleSeasonClick(season.id)}
            className="group relative bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-3xl p-6 shadow-xl hover:shadow-cyan-950/30 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                      Temporada {season.year}
                    </h3>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-950 border border-slate-800 text-amber-400">
                  {season.tactics?.formation || "4-2-3-1"}
                </span>
              </div>

              <div className="space-y-2 py-3 border-y border-slate-800/80 my-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center space-x-1 text-slate-400">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Presupuesto:</span>
                  </span>
                  <span className="font-bold text-emerald-400">€{season.budget?.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center space-x-1 text-slate-400">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>MVP:</span>
                  </span>
                  <span className="font-semibold text-slate-200">{season.awards?.mvp || "Pendiente"}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 flex items-center justify-end text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform space-x-1">
              <span>Abrir Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </div>

          </div>
        ))}
      </div>

      <AddSeasonModal
        isOpen={isSeasonModalOpen}
        onClose={() => setIsSeasonModalOpen(false)}
        onAdd={addSeason}
      />

      <EditClubModal
        isOpen={isEditClubModalOpen}
        onClose={() => setIsEditClubModalOpen(false)}
        club={activeClub}
        onSave={updateClub}
      />

    </div>
  );
};
