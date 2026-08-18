import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LayoutGrid, Users, Trophy, ArrowLeftRight, GraduationCap, Mic, Newspaper, Calendar, Edit3, Landmark, Plus, Minus, Percent } from 'lucide-react';
import { TacticsTab } from '../components/Tabs/TacticsTab';
import { SquadStatsTab } from '../components/Tabs/SquadStatsTab';
import { CompetitionsTab } from '../components/Tabs/CompetitionsTab';
import { TransfersTab } from '../components/Tabs/TransfersTab';
import { YouthAcademyTab } from '../components/Tabs/YouthAcademyTab';
import { PressConferenceTab } from '../components/Tabs/PressConferenceTab';
import { PressNewsTab } from '../components/Tabs/PressNewsTab';
import { EditClubModal } from '../components/Modals/EditClubModal';
import { ClubLogo } from '../components/ClubLogo';

export const SeasonDashboardView = () => {
  const { activeClub, activeSeason, updateClub, recordMatchResult, computedWinRate } = useApp();
  const [activeTab, setActiveTab] = useState('tactics');
  const [isEditClubModalOpen, setIsEditClubModalOpen] = useState(false);

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
  const seasonWinRate = seasonTotalMatches > 0 ? ((seasonWins / seasonTotalMatches) * 100).toFixed(1) : "0.0";

  const tabs = [
    { id: 'tactics', label: 'Táctica y 11 de Gala', icon: LayoutGrid },
    { id: 'stats', label: 'Estadísticas de Plantilla', icon: Users },
    { id: 'competitions', label: 'Competiciones y Premios', icon: Trophy },
    { id: 'transfers', label: 'Mercado y Finanzas', icon: ArrowLeftRight },
    { id: 'youth', label: 'Cantera', icon: GraduationCap },
    { id: 'press', label: 'Ruedas de Prensa', icon: Mic },
    { id: 'news', label: 'Prensa y Portadas', icon: Newspaper },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      
      {/* Dashboard Top Season Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        
        {/* Left Club Branding */}
        <div className="flex items-center space-x-4">
          <div 
            className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center p-1.5 shadow-xl border border-white/10 overflow-hidden shrink-0"
            style={{ backgroundColor: `${activeClub.color || '#10B981'}25` }}
          >
            <ClubLogo logo={activeClub.logo} name={activeClub.name} className="w-12 h-12" />
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
              <span className="text-xs text-slate-400 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Temp {activeSeason.year}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white font-outfit mt-1">
              Panel de Control Principal
            </h1>

            <p className="text-xs text-slate-400 flex flex-wrap items-center gap-2 mt-1">
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
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 shadow-xl flex items-center justify-between gap-4">
            
            {/* Wins */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black uppercase text-emerald-400">VICTORIAS</span>
              <span className="text-lg font-black text-white">{seasonWins}</span>
              <div className="flex space-x-1 mt-0.5">
                <button
                  onClick={() => recordMatchResult('win', 1)}
                  className="bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 p-0.5 rounded text-xs font-bold"
                  title="Sumar victoria (+1)"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => recordMatchResult('win', -1)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-400 p-0.5 rounded text-xs"
                  title="Restar victoria (-1)"
                >
                  <Minus className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="w-px h-8 bg-slate-800" />

            {/* Draws */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black uppercase text-amber-400">EMPATES</span>
              <span className="text-lg font-black text-white">{seasonDraws}</span>
              <div className="flex space-x-1 mt-0.5">
                <button
                  onClick={() => recordMatchResult('draw', 1)}
                  className="bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 p-0.5 rounded text-xs font-bold"
                  title="Sumar empate (+1)"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => recordMatchResult('draw', -1)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-400 p-0.5 rounded text-xs"
                  title="Restar empate (-1)"
                >
                  <Minus className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="w-px h-8 bg-slate-800" />

            {/* Losses */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black uppercase text-rose-400">DERROTAS</span>
              <span className="text-lg font-black text-white">{seasonLosses}</span>
              <div className="flex space-x-1 mt-0.5">
                <button
                  onClick={() => recordMatchResult('loss', 1)}
                  className="bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 p-0.5 rounded text-xs font-bold"
                  title="Sumar derrota (+1)"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => recordMatchResult('loss', -1)}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-400 p-0.5 rounded text-xs"
                  title="Restar derrota (-1)"
                >
                  <Minus className="w-3 h-3" />
                </button>
              </div>
            </div>

          </div>

          {/* Win Rate Percentage Card */}
          <div className="bg-slate-950/90 border border-slate-800 px-4 py-3 rounded-2xl text-center flex flex-col justify-center">
            <span className="text-[9px] font-black uppercase text-slate-400 flex items-center justify-center space-x-1">
              <Percent className="w-3 h-3 text-emerald-400" />
              <span>% Victorias (Global)</span>
            </span>
            <span className="text-xl font-black text-emerald-400 font-outfit mt-0.5">
              {computedWinRate}%
            </span>
            <span className="text-[9px] text-slate-500">
              {seasonTotalMatches} Partidos Totales
            </span>
          </div>

        </div>

      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-105'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div className="pt-2">
        {activeTab === 'tactics' && <TacticsTab />}
        {activeTab === 'stats' && <SquadStatsTab />}
        {activeTab === 'competitions' && <CompetitionsTab />}
        {activeTab === 'transfers' && <TransfersTab />}
        {activeTab === 'youth' && <YouthAcademyTab />}
        {activeTab === 'press' && <PressConferenceTab />}
        {activeTab === 'news' && <PressNewsTab />}
      </div>

      <EditClubModal
        isOpen={isEditClubModalOpen}
        onClose={() => setIsEditClubModalOpen(false)}
        club={activeClub}
        onSave={updateClub}
      />

    </div>
  );
};
