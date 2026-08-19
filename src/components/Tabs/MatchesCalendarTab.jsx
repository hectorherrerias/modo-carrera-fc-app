import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AddMatchModal } from '../Modals/AddMatchModal';
import { 
  Calendar, Plus, Trophy, Crown, Star, Users, Trash2, 
  ChevronDown, ChevronUp, Search, Filter, Percent, ShieldCheck, Flame
} from 'lucide-react';
import { ClubLogo } from '../ClubLogo';

export const MatchesCalendarTab = () => {
  const { activeClub, activeSeason, currentPlayers, currentMatches, addMatch, deleteMatch } = useApp();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [compFilter, setCompFilter] = useState('ALL');
  const [resultFilter, setResultFilter] = useState('ALL');
  const [expandedMatchId, setExpandedMatchId] = useState(null);

  // All competitions registered in active season + any logged in matches
  const allCompetitionsList = useMemo(() => {
    const fromSeason = (activeSeason?.competitions || []).map(c => c.name).filter(Boolean);
    const fromMatches = (currentMatches || []).map(m => m.competition).filter(Boolean);
    const unique = Array.from(new Set([...fromSeason, ...fromMatches]));
    return unique.length > 0 ? unique : ['LaLiga EA Sports', 'Copa del Rey', 'UEFA Champions League'];
  }, [activeSeason, currentMatches]);

  // Compute aggregate statistics from matches (scoped to selected competition if filtered)
  const stats = useMemo(() => {
    let totalWins = 0;
    let totalDraws = 0;
    let totalLosses = 0;
    let totalGoalsFor = 0;
    let totalGoalsAgainst = 0;

    const matchesToCount = compFilter === 'ALL'
      ? currentMatches
      : currentMatches.filter(m => m.competition === compFilter);

    matchesToCount.forEach(m => {
      if (m.result === 'V') totalWins++;
      else if (m.result === 'E') totalDraws++;
      else if (m.result === 'D') totalLosses++;

      if (m.score && m.score.includes('-')) {
        const parts = m.score.split('-').map(s => Number(s.trim()) || 0);
        if (parts.length === 2) {
          totalGoalsFor += parts[0];
          totalGoalsAgainst += parts[1];
        }
      }
    });

    const total = matchesToCount.length;
    const winRate = total > 0 ? Number(((totalWins / total) * 100).toFixed(1)) : 0;

    return {
      total,
      totalWins,
      totalDraws,
      totalLosses,
      totalGoalsFor,
      totalGoalsAgainst,
      winRate
    };
  }, [currentMatches, compFilter]);

  // Form Streak: last 5 matches
  const last5Matches = useMemo(() => {
    return currentMatches.slice(0, 5);
  }, [currentMatches]);

  // Filtered matches
  const filteredMatches = useMemo(() => {
    return currentMatches.filter(m => {
      const matchSearch = (m.opponent || '').toLowerCase().includes(search.toLowerCase()) ||
                          (m.competition || '').toLowerCase().includes(search.toLowerCase());
      const matchComp = compFilter === 'ALL' || m.competition === compFilter;
      const matchRes = resultFilter === 'ALL' || m.result === resultFilter;
      return matchSearch && matchComp && matchRes;
    });
  }, [currentMatches, search, compFilter, resultFilter]);

  const uniqueCompetitions = allCompetitionsList;

  const handleDelete = (matchId, opponent) => {
    if (window.confirm(`¿Seguro que deseas eliminar el registro del partido contra ${opponent}?`)) {
      deleteMatch(matchId);
    }
  };

  const toggleExpand = (id) => {
    setExpandedMatchId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Add */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Calendar className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-2xl font-black text-white font-outfit">Calendario y Registro de Partidos</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Registra los resultados de tus encuentros, minutos de los jugadores y destacados (MVPs).
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full md:w-auto flex items-center justify-center space-x-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/20 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Partido</span>
        </button>

      </div>

      {/* Competitions Quick Selector Filter Pills (Chips) */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setCompFilter('ALL')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            compFilter === 'ALL'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-105'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Todas las Competiciones ({currentMatches.length})</span>
        </button>

        {allCompetitionsList.map(comp => {
          const count = currentMatches.filter(m => m.competition === comp).length;
          const isActive = compFilter === comp;
          return (
            <button
              key={comp}
              onClick={() => setCompFilter(comp)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-105'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>🏆 {comp}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                isActive ? 'bg-slate-950 text-emerald-400' : 'bg-slate-950 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Season Matches Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Total Matches */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase text-slate-400">Partidos Jugados</span>
          <span className="text-xl font-black text-white font-outfit mt-0.5">{stats.total}</span>
        </div>

        {/* Wins */}
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-3.5 flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase text-emerald-400">Victorias (V)</span>
          <span className="text-xl font-black text-emerald-400 font-outfit mt-0.5">{stats.totalWins}</span>
        </div>

        {/* Draws */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-3.5 flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase text-amber-400">Empates (E)</span>
          <span className="text-xl font-black text-amber-400 font-outfit mt-0.5">{stats.totalDraws}</span>
        </div>

        {/* Losses */}
        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-3.5 flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase text-rose-400">Derrotas (D)</span>
          <span className="text-xl font-black text-rose-400 font-outfit mt-0.5">{stats.totalLosses}</span>
        </div>

        {/* Goals (For / Against) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase text-slate-400">Goles (Favor / Contra)</span>
          <span className="text-sm font-black text-white font-outfit mt-1">
            <strong className="text-emerald-400">{stats.totalGoalsFor}</strong> / <strong className="text-rose-400">{stats.totalGoalsAgainst}</strong>
          </span>
        </div>

        {/* Win Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 flex flex-col justify-center">
          <span className="text-[10px] font-bold uppercase text-cyan-400 flex items-center space-x-1">
            <Percent className="w-3 h-3" />
            <span>% Victorias</span>
          </span>
          <span className="text-xl font-black text-cyan-400 font-outfit mt-0.5">{stats.winRate}%</span>
        </div>

      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
        
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar rival o torneo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Competition Filter */}
          <select
            value={compFilter}
            onChange={(e) => setCompFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Todas las competiciones</option>
            {uniqueCompetitions.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Result Filter */}
          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Todos los resultados (V/E/D)</option>
            <option value="V">Victorias (V)</option>
            <option value="E">Empates (E)</option>
            <option value="D">Derrotas (D)</option>
          </select>
        </div>

        {/* Counter of matches shown */}
        <span className="text-[11px] font-bold text-slate-400 self-end sm:self-center">
          {filteredMatches.length} {filteredMatches.length === 1 ? 'partido encontrado' : 'partidos encontrados'}
        </span>

      </div>

      {/* Matches List */}
      <div className="space-y-4">
        {filteredMatches.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs space-y-3">
            <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="font-bold text-slate-300 text-sm">No hay partidos registrados con los filtros actuales.</p>
            <p>Pulsa en **Registrar Nuevo Partido** para añadir el resultado y sumar los minutos a tu plantilla.</p>
          </div>
        ) : (
          filteredMatches.map(match => {
            const isExpanded = expandedMatchId === match.id;
            const officialMVPObj = currentPlayers.find(p => p.id === match.officialMVP);
            const myMVPObj = currentPlayers.find(p => p.id === match.myMVP);
            const participants = match.playersInvolved || [];

            return (
              <div
                key={match.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl transition-all hover:border-slate-700"
              >
                {/* Match Header Strip: Date, Competition, Venue, Result Badge & Actions */}
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                      📅 {match.date}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-500/30">
                      🏆 {match.competition}
                    </span>
                    <span className={`text-xs font-extrabold px-2.5 py-1 rounded-xl border ${
                      match.venue === 'visitante' 
                        ? 'bg-cyan-950/60 text-cyan-400 border-cyan-500/30' 
                        : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}>
                      {match.venue === 'visitante' ? '✈️ Visitante' : '🏠 Local'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Result Badge */}
                    <span className={`px-3 py-1 rounded-xl text-xs font-black tracking-wider border shadow-md ${
                      match.result === 'V' 
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-emerald-500/20' 
                        : (match.result === 'E' 
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20' 
                            : 'bg-rose-500 text-white border-rose-400 shadow-rose-500/20')
                    }`}>
                      {match.result === 'V' ? 'VICTORIA' : (match.result === 'E' ? 'EMPATE' : 'DERROTA')}
                    </span>

                    <button
                      onClick={() => handleDelete(match.id, match.opponent)}
                      title="Eliminar registro del partido"
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-950 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Scoreboard Display */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                  
                  {/* Left: Our Club */}
                  <div className="flex items-center space-x-3 w-full sm:w-2/5 justify-start">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center p-1 border border-white/10 shrink-0"
                      style={{ backgroundColor: `${activeClub?.color || '#10B981'}25` }}
                    >
                      <ClubLogo logo={activeClub?.logo} name={activeClub?.name} className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-black text-white font-outfit">{activeClub?.name || 'Tu Club'}</h4>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {match.venue === 'visitante' ? 'Visitante' : 'Local'}
                      </span>
                    </div>
                  </div>

                  {/* Center: Match Score */}
                  <div className="flex flex-col items-center">
                    <div className="px-5 py-2 bg-slate-950 border border-slate-800 rounded-2xl shadow-inner text-2xl sm:text-3xl font-black text-white font-outfit tracking-widest">
                      {match.score}
                    </div>
                  </div>

                  {/* Right: Opponent Club */}
                  <div className="flex items-center space-x-3 w-full sm:w-2/5 justify-end text-right">
                    <div>
                      <h4 className="text-base sm:text-lg font-black text-white font-outfit">{match.opponent}</h4>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {match.venue === 'visitante' ? 'Local' : 'Visitante'}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl shrink-0">
                      ⚽
                    </div>
                  </div>

                </div>

                {/* Match Key Events: Scorers, Assists & Cards */}
                {(() => {
                  const scorers = participants.filter(p => (p.goals || 0) > 0);
                  const assisters = participants.filter(p => (p.assists || 0) > 0);
                  const yellowCarded = participants.filter(p => (p.yellowCards || 0) > 0);
                  const redCarded = participants.filter(p => (p.redCards || 0) > 0);

                  if (scorers.length === 0 && assisters.length === 0 && yellowCarded.length === 0 && redCarded.length === 0) {
                    return null;
                  }

                  return (
                    <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap items-center gap-3 text-xs">
                      {scorers.length > 0 && (
                        <div className="flex items-center space-x-1 text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
                          <span>⚽</span>
                          <span>{scorers.map(p => `${p.playerName}${p.goals > 1 ? ` (${p.goals})` : ''}`).join(', ')}</span>
                        </div>
                      )}

                      {assisters.length > 0 && (
                        <div className="flex items-center space-x-1 text-cyan-400 font-bold bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-1 rounded-xl">
                          <span>👟</span>
                          <span>{assisters.map(p => `${p.playerName}${p.assists > 1 ? ` (${p.assists})` : ''}`).join(', ')}</span>
                        </div>
                      )}

                      {yellowCarded.length > 0 && (
                        <div className="flex items-center space-x-1 text-amber-400 font-bold bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-xl">
                          <span>🟨</span>
                          <span>{yellowCarded.map(p => `${p.playerName}${p.yellowCards > 1 ? ` (${p.yellowCards})` : ''}`).join(', ')}</span>
                        </div>
                      )}

                      {redCarded.length > 0 && (
                        <div className="flex items-center space-x-1 text-rose-400 font-bold bg-rose-950/40 border border-rose-500/30 px-2.5 py-1 rounded-xl">
                          <span>🟥</span>
                          <span>{redCarded.map(p => p.playerName).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* MVPs Strip */}
                {(officialMVPObj || myMVPObj || match.notes) && (
                  <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      {officialMVPObj && (
                        <div className="flex items-center space-x-1.5 px-3 py-1 bg-amber-950/60 border border-amber-500/40 rounded-xl text-amber-300 font-bold">
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                          <span>MVP Oficial: <strong className="text-white">{officialMVPObj.name}</strong> ({officialMVPObj.position})</span>
                        </div>
                      )}

                      {myMVPObj && (
                        <div className="flex items-center space-x-1.5 px-3 py-1 bg-cyan-950/60 border border-cyan-500/40 rounded-xl text-cyan-300 font-bold">
                          <Star className="w-3.5 h-3.5 text-cyan-400" />
                          <span>MVP Mánager: <strong className="text-white">{myMVPObj.name}</strong> ({myMVPObj.position})</span>
                        </div>
                      )}
                    </div>

                    {match.notes && (
                      <span className="text-[11px] text-slate-400 italic">"{match.notes}"</span>
                    )}
                  </div>
                )}

                {/* Toggle Participants Section */}
                <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{participants.length} jugadores participaron</span>
                  </span>

                  <button
                    onClick={() => toggleExpand(match.id)}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    <span>{isExpanded ? 'Ocultar alineación' : 'Ver alineación y estadísticas'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Collapsible Participating Players List with Full Events */}
                {isExpanded && (
                  <div className="mt-3 p-3 bg-slate-950 rounded-2xl border border-slate-800/80 animate-fade-in">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {participants.map(p => (
                        <div key={p.playerId} className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800 text-[11px]">
                          <div className="flex items-center space-x-1.5 truncate">
                            <span className="text-[10px] font-black text-emerald-400">{p.position}</span>
                            <span className="font-bold text-slate-200 truncate">{p.playerName}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-1 shrink-0">
                            {p.goals > 0 && <span className="text-[10px] font-bold text-emerald-400">⚽{p.goals > 1 ? p.goals : ''}</span>}
                            {p.assists > 0 && <span className="text-[10px] font-bold text-cyan-400">👟{p.assists > 1 ? p.assists : ''}</span>}
                            {p.yellowCards > 0 && <span className="text-[10px] font-bold text-amber-400">🟨{p.yellowCards > 1 ? p.yellowCards : ''}</span>}
                            {p.redCards > 0 && <span className="text-[10px] font-bold text-rose-500">🟥</span>}
                            <span className="font-mono font-bold text-slate-400">{p.minutesPlayed}'</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Add Match Modal */}
      <AddMatchModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddMatch={addMatch}
        currentPlayers={currentPlayers}
        activeSeason={activeSeason}
      />

    </div>
  );
};
