import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Trophy, Calendar, Plus, Shield, ArrowRight, DollarSign, 
  Activity, Award, Edit3, Landmark, Sparkles, Crown, Star 
} from 'lucide-react';
import { AddSeasonModal } from '../components/Modals/AddSeasonModal';
import { EditClubModal } from '../components/Modals/EditClubModal';
import { EditSeasonModal } from '../components/Modals/EditSeasonModal';
import { ClubLogo } from '../components/ClubLogo';

export const ClubHubView = ({ onSelectSeason, onBackToClubs }) => {
  const { activeClub, clubSeasons, addSeason, updateSeason, deleteSeason, updateClub, setActiveSeasonId } = useApp();
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
  const [isEditClubModalOpen, setIsEditClubModalOpen] = useState(false);
  const [editingSeason, setEditingSeason] = useState(null);

  if (!activeClub) return null;

  const handleSeasonClick = (seasonId) => {
    setActiveSeasonId(seasonId);
    onSelectSeason(seasonId);
  };

  // Collect all champion trophies across all seasons of this club
  const wonTrophies = useMemo(() => {
    const list = [];
    (clubSeasons || []).forEach(season => {
      (season.competitions || []).forEach(comp => {
        const res = (comp.result || '').toLowerCase();
        const status = (comp.status || '').toLowerCase();
        // Check if winner/champion
        if (
          res.includes('campe') || 
          res.includes('1º') || 
          status.includes('campe') || 
          status === 'campeon' || 
          status === 'campeón'
        ) {
          list.push({
            id: `${season.id}_${comp.id || comp.name}`,
            competitionName: comp.name || 'Competición',
            seasonYear: season.year,
            type: comp.type || 'league',
            result: comp.result
          });
        }
      });
    });
    return list;
  }, [clubSeasons]);

  // Group trophies by competition name so multiple trophies of the same tournament line up
  const groupedTrophies = useMemo(() => {
    const map = {};
    wonTrophies.forEach(t => {
      if (!map[t.competitionName]) {
        map[t.competitionName] = [];
      }
      map[t.competitionName].push(t);
    });
    return map;
  }, [wonTrophies]);

  const totalTrophiesCount = Math.max(activeClub.totalTrophies || 0, wonTrophies.length);
  const hasWonTrophies = wonTrophies.length > 0;
  const legacyTrophiesCount = (!hasWonTrophies && (activeClub.totalTrophies || 0) > 0) ? activeClub.totalTrophies : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
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
                  className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-emerald-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800 cursor-pointer"
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
              <p className="text-xl font-black text-amber-400 mt-0.5">{totalTrophiesCount}</p>
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

      {/* SUB-SECCIÓN VISUAL: VITRINA DE TROFEOS (TROPHY CABINET) */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-amber-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/30 flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-2xl font-black text-white font-outfit">Vitrina de Trofeos</h2>
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                </div>
                <p className="text-xs text-slate-400">
                  Palmarés oficial y títulos conquistados con el club a lo largo de las temporadas
                </p>
              </div>
            </div>

            <div className="self-start sm:self-auto flex items-center space-x-2 bg-slate-950/90 border border-amber-500/30 px-3.5 py-1.5 rounded-2xl shadow-inner">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black text-amber-300">
                {totalTrophiesCount} {totalTrophiesCount === 1 ? 'Trofeo Conquistado' : 'Trofeos Conquistados'}
              </span>
            </div>
          </div>

          {/* Trophy Cabinet Content */}
          {hasWonTrophies ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(groupedTrophies).map(([competitionName, trophies]) => (
                <div 
                  key={competitionName}
                  className="bg-slate-950/70 border border-amber-500/25 rounded-3xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between"
                >
                  {/* Subtle top light effect */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

                  {/* Competition Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase text-amber-400/80 tracking-wider">Competición</span>
                      <h4 className="text-base font-extrabold text-white font-outfit">{competitionName}</h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black">
                      {trophies.length}x 🏆
                    </span>
                  </div>

                  {/* Cups Shelf Display */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 pt-6 flex flex-wrap items-end justify-center gap-5 sm:gap-6 shadow-inner min-h-[140px]">
                    {trophies.map((t, idx) => (
                      <div 
                        key={t.id || idx}
                        className="group/cup flex flex-col items-center cursor-default transition-all duration-300 hover:-translate-y-2"
                      >
                        {/* Golden Trophy Cup with Glow */}
                        <div className="relative flex items-center justify-center">
                          {/* Radial Glow on hover */}
                          <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-md group-hover/cup:bg-amber-400/50 group-hover/cup:blur-xl transition-all" />
                          
                          {/* 3D Gold Cup */}
                          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/30 border border-amber-200/80 flex items-center justify-center text-slate-950 group-hover/cup:scale-110 transition-transform">
                            <div className="w-full h-full rounded-[14px] bg-gradient-to-b from-amber-300/40 via-amber-500/20 to-amber-950/80 flex items-center justify-center">
                              <Trophy className="w-7 h-7 text-amber-200 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)] fill-amber-400" />
                            </div>
                            <Sparkles className="w-3.5 h-3.5 text-amber-100 absolute -top-1.5 -right-1.5 animate-pulse" />
                          </div>
                        </div>

                        {/* Polished Glass/Gold Pedestal Base */}
                        <div className="w-16 h-2 bg-gradient-to-r from-amber-700 via-amber-300 to-amber-700 rounded-sm mt-2 shadow-sm border-t border-amber-200" />
                        <div className="w-20 h-2 bg-slate-950 rounded-b-md border-x border-b border-amber-500/40 shadow-inner" />

                        {/* Season Tag Badge */}
                        <span className="mt-2 text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-950 border border-amber-500/40 text-amber-300 shadow-sm group-hover/cup:border-amber-400 group-hover/cup:text-white transition-colors">
                          {t.seasonYear}
                        </span>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          ) : legacyTrophiesCount > 0 ? (
            /* Legacy Trophies Display */
            <div className="bg-slate-950/70 border border-amber-500/25 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400/80 tracking-wider">Palmarés Histórico</span>
                  <h4 className="text-base font-extrabold text-white font-outfit">Trofeos Oficiales del Club</h4>
                </div>
                <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black">
                  {legacyTrophiesCount}x 🏆
                </span>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-wrap items-end justify-center gap-6 shadow-inner">
                {Array.from({ length: Math.min(legacyTrophiesCount, 12) }).map((_, idx) => (
                  <div 
                    key={idx}
                    className="group/cup flex flex-col items-center cursor-default transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-md group-hover/cup:bg-amber-400/50 transition-all" />
                      <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/30 border border-amber-200/80 flex items-center justify-center text-slate-950 group-hover/cup:scale-110 transition-transform">
                        <div className="w-full h-full rounded-[14px] bg-gradient-to-b from-amber-300/40 via-amber-500/20 to-amber-950/80 flex items-center justify-center">
                          <Trophy className="w-7 h-7 text-amber-200 drop-shadow-[0_0_10px_rgba(251,191,36,0.9)] fill-amber-400" />
                        </div>
                        <Sparkles className="w-3.5 h-3.5 text-amber-100 absolute -top-1.5 -right-1.5 animate-pulse" />
                      </div>
                    </div>

                    <div className="w-16 h-2 bg-gradient-to-r from-amber-700 via-amber-300 to-amber-700 rounded-sm mt-2 shadow-sm border-t border-amber-200" />
                    <div className="w-20 h-2 bg-slate-950 rounded-b-md border-x border-b border-amber-500/40 shadow-inner" />

                    <span className="mt-2 text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-slate-950 border border-amber-500/40 text-amber-300 shadow-sm">
                      Título #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Empty Showcase Placeholder */
            <div className="bg-slate-950/50 border border-dashed border-slate-800 rounded-3xl p-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mx-auto">
                <Trophy className="w-8 h-8 opacity-40" />
              </div>
              <h4 className="text-base font-extrabold text-slate-300 font-outfit">Vitrina preparada para la gloria</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Lleva a tu club a lo más alto ganando Ligas o Copas en tus temporadas. Cuando finalices un torneo en 1º puesto o Campeón, su trofeo brillante aparecerá expuesto aquí.
              </p>
            </div>
          )}

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
          className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
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

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSeason(season);
                    }}
                    title="Editar temporada"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-950 border border-slate-800 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-950 border border-slate-800 text-amber-400">
                    {season.tacticsOfensive?.formation || season.tactics?.formation || "4-2-3-1"}
                  </span>
                </div>
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

      <EditSeasonModal
        isOpen={!!editingSeason}
        onClose={() => setEditingSeason(null)}
        season={editingSeason}
        onSave={updateSeason}
        onDelete={deleteSeason}
        canDelete={clubSeasons.length > 1}
      />

    </div>
  );
};
