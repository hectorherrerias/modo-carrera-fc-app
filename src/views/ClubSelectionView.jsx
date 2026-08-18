import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Plus, Trophy, Percent, User, ArrowRight, Sparkles } from 'lucide-react';
import { AddClubModal } from '../components/Modals/AddClubModal';
import { ClubLogo } from '../components/ClubLogo';

export const ClubSelectionView = ({ onSelectClub }) => {
  const { data, addClub } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClubClick = (clubId) => {
    onSelectClub(clubId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Hero Welcome Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gestor Profesional de Modo Carrera EA FC</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight font-outfit">
          Selecciona tu <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Club de Fútbol</span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg">
          Gestiona plantillas, estadísticas en tiempo real, tácticas en campo visual, finanzas y cantera de tus trayectorias.
        </p>
      </div>

      {/* Grid of Clubs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {data.clubs.map((club) => {
          const clubSeasons = data.seasons.filter(s => s.clubId === club.id);
          
          return (
            <div
              key={club.id}
              onClick={() => handleClubClick(club.id)}
              className="group relative bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:shadow-emerald-950/40 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
            >
              <div 
                className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 transition-opacity group-hover:opacity-40"
                style={{ backgroundColor: club.color || '#10B981' }}
              />

              <div>
                {/* Header emblem & name */}
                <div className="flex items-center space-x-4 mb-5">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center p-1.5 shadow-lg border border-white/10 group-hover:scale-105 transition-transform overflow-hidden"
                    style={{ backgroundColor: `${club.color || '#10B981'}25` }}
                  >
                    <ClubLogo logo={club.logo} name={club.name} className="w-11 h-11" />
                  </div>

                  <div>
                    <h3 className="text-xl font-extrabold text-white group-hover:text-emerald-400 transition-colors font-outfit">
                      {club.name}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                      <User className="w-3 h-3 text-slate-500" />
                      <span>DT: <strong className="text-slate-200">{club.managerName}</strong></span>
                    </p>
                  </div>
                </div>

                {/* Quick Historical Stats */}
                <div className="grid grid-cols-2 gap-3 py-4 border-y border-slate-800/80 my-2">
                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/50">
                    <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1">
                      <Percent className="w-3 h-3 text-emerald-400" />
                      <span>% Victorias</span>
                    </p>
                    <p className="text-lg font-black text-white mt-1">{club.globalWinRate}%</p>
                  </div>

                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/50">
                    <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      <span>Títulos</span>
                    </p>
                    <p className="text-lg font-black text-amber-400 mt-1">{club.totalTrophies}</p>
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="mt-4 pt-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">
                  {clubSeasons.length} {clubSeasons.length === 1 ? 'temporada' : 'temporadas'} registradas
                </span>
                <div className="flex items-center space-x-1 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>Gestionar</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

            </div>
          );
        })}

        {/* Create New Club Button Card */}
        <div
          onClick={() => setIsModalOpen(true)}
          className="group border-2 border-dashed border-slate-800 hover:border-emerald-500/60 bg-slate-900/30 hover:bg-slate-900/60 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[220px]"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform mb-3">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">Crear Nuevo Club</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Inicia un nuevo proyecto técnico para gestionar tu modo carrera desde cero.
          </p>
        </div>

      </div>

      <AddClubModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addClub}
      />

    </div>
  );
};
