import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutGrid, Users, Trophy, ArrowLeftRight, GraduationCap, Mic, 
  Newspaper, Calendar, Edit3, Landmark, Plus, Minus, Percent, Flame, 
  ChevronLeft, ChevronRight 
} from 'lucide-react';
import { TacticsTab } from '../components/Tabs/TacticsTab';
import { SquadStatsTab } from '../components/Tabs/SquadStatsTab';
import { MatchesCalendarTab } from '../components/Tabs/MatchesCalendarTab';
import { CompetitionsTab } from '../components/Tabs/CompetitionsTab';
import { TransfersTab } from '../components/Tabs/TransfersTab';
import { YouthAcademyTab } from '../components/Tabs/YouthAcademyTab';
import { PressConferenceTab } from '../components/Tabs/PressConferenceTab';
import { PressNewsTab } from '../components/Tabs/PressNewsTab';
import { EditClubModal } from '../components/Modals/EditClubModal';
import { EditSeasonModal } from '../components/Modals/EditSeasonModal';
import { ClubLogo } from '../components/ClubLogo';
import { MobileBottomNav } from '../components/MobileBottomNav';

export const SeasonDashboardView = () => {
  const { activeClub, activeSeason, updateClub, updateSeason, deleteSeason, clubSeasons, recordMatchResult, computedWinRate, currentMatches } = useApp();
  const [activeTab, setActiveTab] = useState('tactics');
  const [isEditClubModalOpen, setIsEditClubModalOpen] = useState(false);
  const [isEditSeasonModalOpen, setIsEditSeasonModalOpen] = useState(false);
  const tabsContainerRef = useRef(null);

  const scrollTabs = (direction) => {
    if (tabsContainerRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      tabsContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!activeClub || !activeSeason) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">
        No se ha seleccionado ninguna temporada activa.
      </div>
    );
  }

  const matchResults = activeSeason.matchResults || { wins: 0, draws: 0, losses: 0 };
  const seasonWins = matchResults.wins || 0;
  const seasonDraws = matchResults.draws || 0;
  const seasonLosses = matchResults.losses || 0;
  const seasonTotalMatches = seasonWins + seasonDraws + seasonLosses;

  const tabs = [
    { id: 'tactics', label: 'Táctica (11 de Gala)', icon: LayoutGrid },
    { id: 'stats', label: 'Plantilla y Estadísticas', icon: Users },
    { id: 'matches', label: 'Partidos y Calendario', icon: Calendar },
    { id: 'competitions', label: 'Competiciones y Premios', icon: Trophy },
    { id: 'transfers', label: 'Mercado y Finanzas', icon: ArrowLeftRight },
    { id: 'youth', label: 'Cantera', icon: GraduationCap },
    { id: 'press', label: 'Ruedas de Prensa (IA)', icon: Mic },
    { id: 'news', label: 'Prensa y Portadas', icon: Newspaper },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 pb-20 sm:pb-8">
      
      {/* Dashboard Top Season Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 sm:gap-6">
        
        {/* Left Club Branding */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div 
            className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center p-1.5 shadow-xl border border-white/10 overflow-hidden shrink-0"
            style={{ backgroundColor: `${activeClub.color || '#10B981'}25` }}
          >
            <ClubLogo logo={activeClub.logo} name={activeClub.name} className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold uppercase text-emerald-400">{activeClub.name}</span>
              <button
                onClick={() => setIsEditClubModalOpen(true)}
                title="Editar información del club"
                className="text-slate-400 hover:text-emerald-400 transition-colors p-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <button
                onClick={() => setIsEditSeasonModalOpen(true)}
                title="Editar temporada activa (año, presupuesto, balance)"
                className="text-xs text-slate-300 hover:text-cyan-400 flex items-center space-x-1.5 bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold">Temp {activeSeason.year}</span>
                <Edit3 className="w-3 h-3 text-slate-400 hover:text-cyan-400" />
              </button>
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-white font-outfit mt-0.5 sm:mt-1">
              Panel de Control Principal
            </h1>

            <p className="text-[11px] sm:text-xs text-slate-400 flex flex-wrap items-center gap-2 mt-0.5 sm:mt-1">
              <span className="flex items-center space-x-1">
                <Landmark className="w-3.5 h-3.5 text-amber-400" />
                <span>Estadio: <strong className="text-slate-200">{activeClub.stadium || 'Estadio Municipal'}</strong></span>
              </span>
              <span className="text-slate-600">•</span>
              <span>DT: <strong className="text-slate-200">{activeClub.managerName}</strong></span>
            </p>
          </div>
        </div>

        {/* Right W-D-L Match Counter Widgets & Calculated Win Rate */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
          
          {/* W-D-L Counters Box */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 shadow-xl flex items-center justify-between gap-3 sm:gap-4">
            
            {/* Wins */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black uppercase text-emerald-400">VICTORIAS</span>
              <span className="text-base sm:text-lg font-black text-white">{seasonWins}</span>
              <div className="flex space-x-1 mt-0.5">
                <button
                  onClick={() => recordMatchResult('win', 1)}
                  className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 p-1 sm:p-0.5 rounded text-xs font-bold"
                  title="Sumar victoria (+1)"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                </button>
                <button
                  onClick={() => recordMatchResult('win', -1)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-400 p-1 sm:p-0.5 rounded text-xs"
                  title="Restar victoria (-1)"
                >
                  <Minus className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                </button>
              </div>
            </div>

            <div className="w-px h-8 bg-slate-800" />

            {/* Draws */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black uppercase text-amber-400">EMPATES</span>
              <span className="text-base sm:text-lg font-black text-white">{seasonDraws}</span>
              <div className="flex space-x-1 mt-0.5">
                <button
                  onClick={() => recordMatchResult('draw', 1)}
                  className="bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 p-1 sm:p-0.5 rounded text-xs font-bold"
                  title="Sumar empate (+1)"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                </button>
                <button
                  onClick={() => recordMatchResult('draw', -1)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-400 p-1 sm:p-0.5 rounded text-xs"
                  title="Restar empate (-1)"
                >
                  <Minus className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                </button>
              </div>
            </div>

            <div className="w-px h-8 bg-slate-800" />

            {/* Losses */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black uppercase text-rose-400">DERROTAS</span>
              <span className="text-base sm:text-lg font-black text-white">{seasonLosses}</span>
              <div className="flex space-x-1 mt-0.5">
                <button
                  onClick={() => recordMatchResult('loss', 1)}
                  className="bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 p-1 sm:p-0.5 rounded text-xs font-bold"
                  title="Sumar derrota (+1)"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                </button>
                <button
                  onClick={() => recordMatchResult('loss', -1)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-400 p-1 sm:p-0.5 rounded text-xs"
                  title="Restar derrota (-1)"
                >
                  <Minus className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                </button>
              </div>
            </div>

          </div>

          {/* Form Streak (Last 5 matches) Indicator */}
          <div className="bg-slate-950/90 border border-slate-800 px-3.5 py-2.5 rounded-2xl flex flex-col justify-center items-center shadow-xl">
            <span className="text-[9px] font-black uppercase text-slate-400 flex items-center space-x-1 mb-1.5">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Estado de Forma</span>
            </span>
            
            <div className="flex items-center space-x-1.5">
              {(() => {
                // Show last 5 matches (most recent on the right)
                const recent5 = (currentMatches || []).slice(0, 5).reverse();
                if (recent5.length === 0) {
                  return <span className="text-[10px] text-slate-500 font-bold px-2 py-0.5">Sin partidos</span>;
                }

                return recent5.map((m, idx) => {
                  const res = m.result;
                  let badgeColor = 'bg-slate-800 text-slate-400 border-slate-700';
                  if (res === 'V') badgeColor = 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm shadow-emerald-500/30';
                  else if (res === 'E') badgeColor = 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm shadow-amber-500/30';
                  else if (res === 'D') badgeColor = 'bg-rose-500 text-white border-rose-400 shadow-sm shadow-rose-500/30';

                  return (
                    <div
                      key={m.id || idx}
                      title={`${m.result === 'V' ? 'Victoria' : m.result === 'E' ? 'Empate' : 'Derrota'} vs ${m.opponent} (${m.score})`}
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] border ${badgeColor} transition-transform hover:scale-110 cursor-help`}
                    >
                      {res}
                    </div>
                  );
                });
              })()}
            </div>
            <span className="text-[8px] text-slate-500 font-extrabold uppercase mt-1 tracking-wider">Últimos 5 Partidos</span>
          </div>

          {/* Win Rate Percentage Card */}
          <div className="bg-slate-950/90 border border-slate-800 px-4 py-2.5 rounded-2xl text-center flex flex-col justify-center">
            <span className="text-[9px] font-black uppercase text-slate-400 flex items-center justify-center space-x-1">
              <Percent className="w-3 h-3 text-emerald-400" />
              <span>% Victorias (Global)</span>
            </span>
            <span className="text-lg sm:text-xl font-black text-emerald-400 font-outfit mt-0.5">
              {computedWinRate}%
            </span>
            <span className="text-[9px] text-slate-500">
              {seasonTotalMatches} Partidos Totales
            </span>
          </div>

        </div>

      </div>

      {/* Tabs Navigation Bar (Scrollable on all devices with Navigation Controls) */}
      <div className="relative flex items-center bg-slate-900/90 border border-slate-800 rounded-2xl p-1.5 shadow-xl backdrop-blur-md">
        
        {/* Scroll Left Button */}
        <button
          type="button"
          onClick={() => scrollTabs('left')}
          title="Desplazar pestañas hacia la izquierda"
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 shrink-0 transition-colors shadow-sm cursor-pointer z-10 mr-1"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Tabs List */}
        <div 
          ref={tabsContainerRef}
          className="flex-1 flex items-center space-x-1.5 overflow-x-auto scroll-smooth py-1 px-1 scrollbar-none"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-[1.02]'
                    : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        <button
          type="button"
          onClick={() => scrollTabs('right')}
          title="Desplazar pestañas hacia la derecha"
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 shrink-0 transition-colors shadow-sm cursor-pointer z-10 ml-1"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>

      {/* Tab Content Display */}
      <div className="pt-1 sm:pt-2">
        {activeTab === 'tactics' && <TacticsTab />}
        {activeTab === 'stats' && <SquadStatsTab />}
        {activeTab === 'matches' && <MatchesCalendarTab />}
        {activeTab === 'competitions' && <CompetitionsTab />}
        {activeTab === 'transfers' && <TransfersTab />}
        {activeTab === 'youth' && <YouthAcademyTab />}
        {activeTab === 'press' && <PressConferenceTab />}
        {activeTab === 'news' && <PressNewsTab />}
      </div>

      {/* Sticky Bottom Nav Bar for Mobile Smartphones */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <EditClubModal
        isOpen={isEditClubModalOpen}
        onClose={() => setIsEditClubModalOpen(false)}
        club={activeClub}
        onSave={updateClub}
      />

      <EditSeasonModal
        isOpen={isEditSeasonModalOpen}
        onClose={() => setIsEditSeasonModalOpen(false)}
        season={activeSeason}
        onSave={updateSeason}
        onDelete={deleteSeason}
        canDelete={clubSeasons.length > 1}
      />

    </div>
  );
};
