import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, UserPlus, Search, ArrowUpDown, ArrowUp, ArrowDown, 
  Edit3, Trash2, Trophy, Crown, Star, Plus, Minus, HeartPulse, 
  Flame, Award, ShieldCheck, Calendar, Zap, Sparkles 
} from 'lucide-react';
import { AddPlayerModal } from '../Modals/AddPlayerModal';
import { UpdateStatsModal } from '../Modals/UpdateStatsModal';
import { getPlayerInjuryStatus, formatDateSpanish } from '../../utils/injuryHelper';
import { calculateSquadStatsByCompetition, getCompetitionLeaders, getPositionRank } from '../../utils/statsHelper';

export const SquadStatsTab = () => {
  const { 
    currentPlayers, 
    activeSeason, 
    currentMatches, 
    latestMatchDate, 
    addPlayer, 
    updatePlayerStats, 
    deletePlayer,
    manuallyDischargePlayer 
  } = useApp();

  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [selectedComp, setSelectedComp] = useState('ALL'); // 'ALL' | 'LaLiga EA Sports' | ...
  const [sortField, setSortField] = useState('position');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);

  // All unique competitions from season and match logs
  const availableCompetitions = useMemo(() => {
    const fromSeason = (activeSeason?.competitions || []).map(c => c.name).filter(Boolean);
    const fromMatches = (currentMatches || []).map(m => m.competition).filter(Boolean);
    const unique = Array.from(new Set([...fromSeason, ...fromMatches]));
    return unique.length > 0 ? unique : ['LaLiga EA Sports', 'Copa del Rey', 'UEFA Champions League'];
  }, [activeSeason, currentMatches]);

  // Squad stats computed specifically for the selected competition
  const squadStatsScoped = useMemo(() => {
    return calculateSquadStatsByCompetition(currentPlayers, currentMatches, selectedComp);
  }, [currentPlayers, currentMatches, selectedComp]);

  // Competition Leaders
  const leaders = useMemo(() => {
    return getCompetitionLeaders(squadStatsScoped);
  }, [squadStatsScoped]);

  const handleQuickOvrChange = (playerId, delta) => {
    const player = currentPlayers.find(p => p.id === playerId);
    if (!player) return;
    const currentOvr = Number(player.overall) || 75;
    const nextOvr = Math.max(40, Math.min(99, currentOvr + delta));
    updatePlayerStats(playerId, { overall: nextOvr });
  };

  const handleDirectOvrChange = (playerId, val) => {
    const num = Number(val);
    if (!isNaN(num) && num >= 40 && num <= 99) {
      updatePlayerStats(playerId, { overall: num });
    }
  };

  // Column sort toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'position' || field === 'name' || field === 'status' ? 'asc' : 'desc');
    }
  };

  // Filter & sort player list
  const filteredPlayers = useMemo(() => {
    return squadStatsScoped
      .filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesPos = positionFilter === 'ALL' || p.position === positionFilter;
        return matchesSearch && matchesPos;
      })
      .sort((a, b) => {
        // Special sorting by tactical position hierarchy
        if (sortField === 'position') {
          const rankA = getPositionRank(a.position);
          const rankB = getPositionRank(b.position);
          if (rankA !== rankB) {
            return sortOrder === 'asc' ? (rankA - rankB) : (rankB - rankA);
          }
          return (b.overall || 0) - (a.overall || 0);
        }

        let aVal = a[sortField];
        let bVal = b[sortField];

        if (sortField === 'contractYears') {
          aVal = a.contractYears !== undefined ? a.contractYears : 3;
          bVal = b.contractYears !== undefined ? b.contractYears : 3;
        } else if (sortField === 'officialMVPs') {
          aVal = a.computedOfficialMVPs || 0;
          bVal = b.computedOfficialMVPs || 0;
        } else if (sortField === 'myMVPs') {
          aVal = a.computedMyMVPs || 0;
          bVal = b.computedMyMVPs || 0;
        } else if (sortField === 'status') {
          aVal = a.status || 'Disponible';
          bVal = b.status || 'Disponible';
        }

        // Stats columns
        if (['minutes', 'matches', 'goals', 'assists', 'cleanSheets', 'yellowCards', 'redCards'].includes(sortField)) {
          aVal = a.computedStats ? a.computedStats[sortField] || 0 : 0;
          bVal = b.computedStats ? b.computedStats[sortField] || 0 : 0;
        }

        if (typeof aVal === 'string') {
          return sortOrder === 'asc' 
            ? aVal.localeCompare(bVal) 
            : bVal.localeCompare(aVal);
        }

        return sortOrder === 'asc' ? (aVal - bVal) : (bVal - aVal);
      });
  }, [squadStatsScoped, search, positionFilter, sortField, sortOrder]);

  const uniquePositions = useMemo(() => {
    const set = new Set(currentPlayers.map(p => p.position).filter(Boolean));
    return Array.from(set).sort((a, b) => getPositionRank(a) - getPositionRank(b));
  }, [currentPlayers]);

  const handleDelete = (id, name) => {
    if (window.confirm(`¿Seguro que deseas eliminar a ${name} de la plantilla?`)) {
      deletePlayer(id);
    }
  };

  // Injured players count
  const injuredPlayersCount = useMemo(() => {
    return currentPlayers.filter(p => {
      const statusInfo = getPlayerInjuryStatus(p, latestMatchDate);
      return statusInfo.isInjured;
    }).length;
  }, [currentPlayers, latestMatchDate]);

  return (
    <div className="space-y-6">
      
      {/* Competitions Selector Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedComp('ALL')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            selectedComp === 'ALL'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-105'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Todas las Competiciones (General)</span>
        </button>

        {availableCompetitions.map(comp => {
          const matchCount = currentMatches.filter(m => m.competition === comp).length;
          const isSelected = selectedComp === comp;

          return (
            <button
              key={comp}
              onClick={() => setSelectedComp(comp)}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 scale-105 font-black'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>{comp}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                {matchCount} PJ
              </span>
            </button>
          );
        })}
      </div>

      {/* Top Leaders Widgets for Selected Competition */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Pichichi / Top Scorer */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-3 sm:p-4 shadow-xl flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <span className="text-lg">⚽</span>
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400 block truncate">
              {selectedComp === 'ALL' ? 'PICHICHI GLOBAL' : `PICHICHI ${selectedComp.substring(0, 10)}`}
            </span>
            <p className="text-xs sm:text-sm font-black text-white truncate">
              {leaders.topScorer ? leaders.topScorer.name : 'Sin goles'}
            </p>
            <p className="text-[10px] text-slate-400 font-semibold">
              {leaders.topScorer ? `${leaders.topScorer.computedStats?.goals || 0} goles` : '0 goles anotados'}
            </p>
          </div>
        </div>

        {/* Top Assister */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-3 sm:p-4 shadow-xl flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <span className="text-lg">👟</span>
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-black tracking-wider text-cyan-400 block truncate">
              MÁXIMO ASISTENTE
            </span>
            <p className="text-xs sm:text-sm font-black text-white truncate">
              {leaders.topAssister ? leaders.topAssister.name : 'Sin asistencias'}
            </p>
            <p className="text-[10px] text-slate-400 font-semibold">
              {leaders.topAssister ? `${leaders.topAssister.computedStats?.assists || 0} asist.` : '0 asistencias'}
            </p>
          </div>
        </div>

        {/* Top MVP */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-3 sm:p-4 shadow-xl flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Crown className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 block truncate">
              REY DE MVPS
            </span>
            <p className="text-xs sm:text-sm font-black text-white truncate">
              {leaders.topMVP ? leaders.topMVP.name : 'Sin MVPs'}
            </p>
            <p className="text-[10px] text-slate-400 font-semibold">
              {leaders.topMVP ? `👑 ${leaders.topMVP.computedOfficialMVPs || 0} | ⭐ ${leaders.topMVP.computedMyMVPs || 0}` : '0 MVPs'}
            </p>
          </div>
        </div>

        {/* Trofeo Zamora / Porterías a Cero */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-3 sm:p-4 shadow-xl flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] uppercase font-black tracking-wider text-blue-400 block truncate">
              TROFEO ZAMORA
            </span>
            <p className="text-xs sm:text-sm font-black text-white truncate">
              {leaders.topZamora ? leaders.topZamora.name : 'Sin porterías a 0'}
            </p>
            <p className="text-[10px] text-slate-400 font-semibold">
              {leaders.topZamora ? `${leaders.topZamora.computedStats?.cleanSheets || 0} vallas invictas` : '0 porterías a 0'}
            </p>
          </div>
        </div>

      </div>

      {/* Injury Alert Banner (if there are injured players) */}
      {injuredPlayersCount > 0 && (
        <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2.5 text-rose-300 text-xs">
            <HeartPulse className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
            <p>
              <strong>Parte Médico Activo:</strong> Hay <strong>{injuredPlayersCount} {injuredPlayersCount === 1 ? 'jugador lesionado' : 'jugadores lesionados'}</strong> en la plantilla con cuenta regresiva activa según la fecha del calendario de partidos (Último partido: <strong>{formatDateSpanish(latestMatchDate)}</strong>).
            </p>
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        
        {/* Search & Position Filter */}
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
          
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar jugador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Todas las posiciones ({currentPlayers.length})</option>
              {uniquePositions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Selected View Mode Indicator & Action Button */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          {selectedComp !== 'ALL' && (
            <span className="hidden sm:inline-flex items-center text-xs font-bold text-amber-400 bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-500/30">
              🏆 Estadísticas: {selectedComp}
            </span>
          )}

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full md:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Añadir Jugador</span>
          </button>
        </div>

      </div>

      {/* Stats Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-extrabold uppercase text-slate-400 select-none">
                
                <th onClick={() => handleSort('name')} className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors">
                  <div className="flex items-center space-x-1">
                    <span>Nombre</span>
                    {sortField === 'name' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-400" /> : <ArrowDown className="w-3 h-3 text-emerald-400" />)}
                  </div>
                </th>

                <th onClick={() => handleSort('position')} className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors">
                  <div className="flex items-center space-x-1">
                    <span>Posición</span>
                    {sortField === 'position' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-400" /> : <ArrowDown className="w-3 h-3 text-emerald-400" />)}
                  </div>
                </th>

                <th onClick={() => handleSort('overall')} className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <span>GRL</span>
                    {sortField === 'overall' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>

                <th onClick={() => handleSort('status')} className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors">
                  <div className="flex items-center space-x-1">
                    <span>Estado / Lesión</span>
                    {sortField === 'status' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-400" /> : <ArrowDown className="w-3 h-3 text-emerald-400" />)}
                  </div>
                </th>

                <th onClick={() => handleSort('contractYears')} className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <span>Contrato</span>
                    {sortField === 'contractYears' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />)}
                  </div>
                </th>

                <th onClick={() => handleSort('officialMVPs')} className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-center" title="MVPs Oficiales">
                  <div className="flex items-center justify-center space-x-1">
                    <span>👑 Oficial</span>
                    {sortField === 'officialMVPs' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>

                <th onClick={() => handleSort('myMVPs')} className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-center" title="MVPs del Mánager">
                  <div className="flex items-center justify-center space-x-1">
                    <span>⭐ Mánager</span>
                    {sortField === 'myMVPs' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />)}
                  </div>
                </th>

                <th onClick={() => handleSort('matches')} className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <span>Partidos</span>
                    {sortField === 'matches' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-slate-300" /> : <ArrowDown className="w-3 h-3 text-slate-300" />)}
                  </div>
                </th>

                <th onClick={() => handleSort('minutes')} className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <span>Minutos</span>
                    {sortField === 'minutes' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-slate-300" /> : <ArrowDown className="w-3 h-3 text-slate-300" />)}
                  </div>
                </th>

                <th onClick={() => handleSort('goals')} className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <span>Goles ⚽</span>
                    {sortField === 'goals' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-400" /> : <ArrowDown className="w-3 h-3 text-emerald-400" />)}
                  </div>
                </th>

                <th onClick={() => handleSort('assists')} className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <span>Asist. 👟</span>
                    {sortField === 'assists' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-cyan-400" /> : <ArrowDown className="w-3 h-3 text-cyan-400" />)}
                  </div>
                </th>

                <th onClick={() => handleSort('cleanSheets')} className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <span>P. Cero 🧤</span>
                    {sortField === 'cleanSheets' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-400" /> : <ArrowDown className="w-3 h-3 text-blue-400" />)}
                  </div>
                </th>

                <th onClick={() => handleSort('yellowCards')} className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <span>Amarillas 🟨</span>
                    {sortField === 'yellowCards' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-amber-400" /> : <ArrowDown className="w-3 h-3 text-amber-400" />)}
                  </div>
                </th>

                <th onClick={() => handleSort('redCards')} className="py-3.5 px-3 cursor-pointer hover:text-white transition-colors text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <span>Rojas 🟥</span>
                    {sortField === 'redCards' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-rose-400" /> : <ArrowDown className="w-3 h-3 text-rose-400" />)}
                  </div>
                </th>

                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800/60 text-xs font-semibold text-slate-200">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan="15" className="py-8 text-center text-slate-500 text-sm">
                    No se encontraron jugadores registrados en esta temporada o competición.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player) => {
                  const injuryInfo = getPlayerInjuryStatus(player, latestMatchDate);
                  const isInjured = injuryInfo.isInjured;
                  const isSuspended = (player.status || '').toLowerCase().includes('sancionad');
                  const isAvailable = !isInjured && !isSuspended;

                  return (
                    <tr key={player.id} className="hover:bg-slate-800/40 transition-colors">
                      
                      <td className="py-3.5 px-4 font-extrabold text-white">
                        {player.name}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-[11px] font-black text-emerald-400">
                          {player.position}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        {(() => {
                          const initOvr = player.initialOvr !== undefined ? Number(player.initialOvr) : (Number(player.overall) || 75);
                          const currOvr = Number(player.overall) || 75;
                          const diff = currOvr - initOvr;

                          return (
                            <div className="inline-flex items-center justify-center space-x-1.5">
                              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-1 py-0.5 shadow-inner">
                                <button
                                  type="button"
                                  onClick={() => handleQuickOvrChange(player.id, -1)}
                                  title="Reducir media (-1)"
                                  className="text-slate-500 hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                                >
                                  <Minus className="w-2.5 h-2.5" />
                                </button>

                                <input
                                  type="number"
                                  min="40"
                                  max="99"
                                  value={currOvr}
                                  onChange={(e) => handleDirectOvrChange(player.id, e.target.value)}
                                  className="w-7 text-center bg-transparent font-black text-amber-400 text-xs focus:outline-none focus:text-white"
                                />

                                <button
                                  type="button"
                                  onClick={() => handleQuickOvrChange(player.id, 1)}
                                  title="Aumentar media (+1)"
                                  className="text-slate-500 hover:text-emerald-400 p-0.5 transition-colors cursor-pointer"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                </button>
                              </div>

                              {/* OVR Growth Indicator Badge */}
                              {diff !== 0 && (
                                <span
                                  title={`Media Inicial: ${initOvr} | Evolución: ${diff > 0 ? `+${diff}` : diff}`}
                                  className={`px-1.5 py-0.5 rounded-lg text-[10px] font-black border shadow-sm ${
                                    diff > 0 
                                      ? 'bg-emerald-950/90 text-emerald-400 border-emerald-500/40 shadow-emerald-500/10' 
                                      : 'bg-rose-950/90 text-rose-400 border-rose-500/40 shadow-rose-500/10'
                                  }`}
                                >
                                  {diff > 0 ? `+${diff}` : diff}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Status / Injury Countdown Badge */}
                      <td className="py-3.5 px-3">
                        {isInjured ? (
                          <div className="inline-flex items-center space-x-1.5">
                            <span 
                              title={`Diagnóstico: ${injuryInfo.injury?.injuryType || 'Lesión'} | Fecha prevista de alta: ${injuryInfo.formattedReturnDate} | Días restantes: ${injuryInfo.daysLeft}`}
                              className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-500/40 shadow-sm"
                            >
                              <span className="w-1.5 h-1.5 rounded-full mr-1 bg-rose-400 animate-pulse" />
                              <HeartPulse className="w-3 h-3 mr-1 text-rose-400 shrink-0" />
                              <span>{injuryInfo.badgeText}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => manuallyDischargePlayer(player.id)}
                              title="Dar alta médica manual ahora"
                              className="text-[9px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded hover:bg-emerald-900 transition-all cursor-pointer"
                            >
                              Alta
                            </button>
                          </div>
                        ) : isSuspended ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-500/40">
                            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-amber-400" />
                            {player.status}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-emerald-400" />
                            Disponible
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className={`text-[11px] font-bold ${
                          (player.contractYears ?? 3) <= 1 ? 'text-rose-400 font-extrabold' : 'text-cyan-400'
                        }`}>
                          {player.contractYears !== undefined ? `${player.contractYears} ${player.contractYears === 1 ? 'año' : 'años'}` : '3 años'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className={`font-extrabold text-xs ${(player.computedOfficialMVPs || 0) > 0 ? 'text-amber-400' : 'text-slate-600'}`}>
                          {(player.computedOfficialMVPs || 0) > 0 ? `👑 ${player.computedOfficialMVPs}` : '-'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className={`font-extrabold text-xs ${(player.computedMyMVPs || 0) > 0 ? 'text-cyan-400' : 'text-slate-600'}`}>
                          {(player.computedMyMVPs || 0) > 0 ? `⭐ ${player.computedMyMVPs}` : '-'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center text-slate-300">
                        {player.computedStats?.matches || 0}
                      </td>

                      <td className="py-3.5 px-3 text-center text-slate-400 font-mono">
                        {player.computedStats?.minutes || 0}'
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className={`font-extrabold ${player.computedStats?.goals > 0 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                          {player.computedStats?.goals || 0}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className={`font-extrabold ${player.computedStats?.assists > 0 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
                          {player.computedStats?.assists || 0}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center text-slate-400">
                        {player.computedStats?.cleanSheets || 0}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className={player.computedStats?.yellowCards > 0 ? 'text-amber-400 font-bold' : 'text-slate-600'}>
                          {player.computedStats?.yellowCards || 0}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className={player.computedStats?.redCards > 0 ? 'text-rose-500 font-bold' : 'text-slate-600'}>
                          {player.computedStats?.redCards || 0}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => setEditingPlayer(player)}
                          title="Actualizar Estadísticas o Lesión"
                          className="p-1.5 rounded-lg border border-slate-800 hover:border-amber-500/50 text-slate-400 hover:text-amber-400 bg-slate-950 transition-all cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(player.id, player.name)}
                          title="Eliminar Jugador"
                          className="p-1.5 rounded-lg border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 bg-slate-950 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* Modals */}
      <AddPlayerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addPlayer}
      />

      <UpdateStatsModal
        isOpen={!!editingPlayer}
        onClose={() => setEditingPlayer(null)}
        player={editingPlayer}
        onUpdate={updatePlayerStats}
      />

    </div>
  );
};
