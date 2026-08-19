import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, X, Check, Award, Trophy, Users, Zap, Plus, Minus, 
  Star, Crown, Shield, AlertTriangle, Info, Home, Plane 
} from 'lucide-react';

export const AddMatchModal = ({ isOpen, onClose, onAddMatch, currentPlayers, activeSeason }) => {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [opponent, setOpponent] = useState('');
  const [competition, setCompetition] = useState('');
  const [isCustomComp, setIsCustomComp] = useState(false);
  const [customComp, setCustomComp] = useState('');
  const [venue, setVenue] = useState('local'); // 'local' | 'visitante'
  const [ourGoals, setOurGoals] = useState(2);
  const [opponentGoals, setOpponentGoals] = useState(1);
  const [result, setResult] = useState('V'); // 'V' | 'E' | 'D'
  const [manualResultOverride, setManualResultOverride] = useState(false);

  // Map of playerId -> { minutes: 90, goals: 0, assists: 0, yellowCards: 0, redCards: 0 }
  const [playerMatchStats, setPlayerMatchStats] = useState({});
  const [officialMVP, setOfficialMVP] = useState('');
  const [myMVP, setMyMVP] = useState('');
  const [notes, setNotes] = useState('');

  // Initial setup when modal opens
  useEffect(() => {
    if (isOpen) {
      setDate(new Date().toISOString().split('T')[0]);
      setOpponent('');
      setVenue('local');
      setOurGoals(2);
      setOpponentGoals(1);
      setResult('V');
      setManualResultOverride(false);
      setOfficialMVP('');
      setMyMVP('');
      setNotes('');
      setIsCustomComp(false);
      setCustomComp('');

      // Default competition from active season
      const seasonComps = (activeSeason?.competitions || []).map(c => c.name).filter(Boolean);
      const defaultComp = seasonComps[0] || 'LaLiga EA Sports';
      setCompetition(defaultComp);

      // Auto-select starting XI by default if available
      const startingXI = activeSeason?.tacticsOfensive?.startingXI || [];
      const starterNames = new Set(startingXI.map(s => s.playerName).filter(Boolean));
      
      const initialMap = {};
      currentPlayers.forEach(p => {
        if (starterNames.has(p.name)) {
          initialMap[p.id] = { minutes: 90, goals: 0, assists: 0, yellowCards: 0, redCards: 0 };
        }
      });
      setPlayerMatchStats(initialMap);
    }
  }, [isOpen, activeSeason, currentPlayers]);

  // Dynamic automatic result calculation (V / E / D) based on goals
  useEffect(() => {
    if (!manualResultOverride) {
      const gOur = Number(ourGoals) || 0;
      const gOpp = Number(opponentGoals) || 0;
      if (gOur > gOpp) setResult('V');
      else if (gOur === gOpp) setResult('E');
      else setResult('D');
    }
  }, [ourGoals, opponentGoals, manualResultOverride]);

  // Total goals assigned to players
  const totalAssignedGoals = useMemo(() => {
    return Object.values(playerMatchStats).reduce((acc, p) => acc + (Number(p.goals) || 0), 0);
  }, [playerMatchStats]);

  const teamGoals = Number(ourGoals) || 0;
  const isCleanSheet = (Number(opponentGoals) || 0) === 0;

  if (!isOpen) return null;

  const competitionsList = activeSeason?.competitions?.map(c => c.name) || ['LaLiga EA Sports', 'Copa del Rey', 'UEFA Champions League'];

  const handleTogglePlayer = (playerId) => {
    setPlayerMatchStats(prev => {
      const updated = { ...prev };
      if (updated[playerId]) {
        delete updated[playerId];
      } else {
        updated[playerId] = { minutes: 90, goals: 0, assists: 0, yellowCards: 0, redCards: 0 };
      }
      return updated;
    });
  };

  const handleUpdatePlayerField = (playerId, field, delta) => {
    setPlayerMatchStats(prev => {
      const current = prev[playerId] || { minutes: 90, goals: 0, assists: 0, yellowCards: 0, redCards: 0 };
      let newVal = Math.max(0, (Number(current[field]) || 0) + delta);
      if (field === 'minutes') {
        newVal = Math.max(1, Math.min(120, newVal));
      } else if (field === 'yellowCards') {
        newVal = Math.min(2, newVal);
      } else if (field === 'redCards') {
        newVal = Math.min(1, newVal);
      }

      return {
        ...prev,
        [playerId]: {
          ...current,
          [field]: newVal
        }
      };
    });
  };

  const handleSetMinutes = (playerId, mins) => {
    const val = Math.max(1, Math.min(120, Number(mins) || 0));
    setPlayerMatchStats(prev => {
      const current = prev[playerId] || { minutes: 90, goals: 0, assists: 0, yellowCards: 0, redCards: 0 };
      return {
        ...prev,
        [playerId]: {
          ...current,
          minutes: val
        }
      };
    });
  };

  const handleLoadStarters = () => {
    const startingXI = activeSeason?.tacticsOfensive?.startingXI || [];
    const starterNames = new Set(startingXI.map(s => s.playerName).filter(Boolean));
    
    const newMap = {};
    currentPlayers.forEach(p => {
      if (starterNames.has(p.name)) {
        newMap[p.id] = { minutes: 90, goals: 0, assists: 0, yellowCards: 0, redCards: 0 };
      }
    });

    // If startingXI had no names assigned yet, pick first 11 players
    if (Object.keys(newMap).length === 0) {
      currentPlayers.slice(0, 11).forEach(p => {
        newMap[p.id] = { minutes: 90, goals: 0, assists: 0, yellowCards: 0, redCards: 0 };
      });
    }

    setPlayerMatchStats(newMap);
  };

  const handleSelectAll = () => {
    const newMap = {};
    currentPlayers.forEach(p => {
      newMap[p.id] = { minutes: 90, goals: 0, assists: 0, yellowCards: 0, redCards: 0 };
    });
    setPlayerMatchStats(newMap);
  };

  const handleDeselectAll = () => {
    setPlayerMatchStats({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!opponent.trim()) {
      alert('Por favor indica el equipo rival.');
      return;
    }

    const scoreString = `${Number(ourGoals) || 0} - ${Number(opponentGoals) || 0}`;

    const playersInvolved = Object.entries(playerMatchStats).map(([playerId, pStats]) => {
      const pObj = currentPlayers.find(p => p.id === playerId);
      return {
        playerId,
        playerName: pObj ? pObj.name : 'Jugador',
        position: pObj ? pObj.position : 'DC',
        minutesPlayed: Number(pStats.minutes) || 90,
        goals: Number(pStats.goals) || 0,
        assists: Number(pStats.assists) || 0,
        yellowCards: Number(pStats.yellowCards) || 0,
        redCards: Number(pStats.redCards) || 0
      };
    });

    onAddMatch({
      date,
      opponent: opponent.trim(),
      competition,
      venue,
      result,
      score: scoreString,
      ourGoals: Number(ourGoals) || 0,
      opponentGoals: Number(opponentGoals) || 0,
      playersInvolved,
      officialMVP: officialMVP || null,
      myMVP: myMVP || null,
      notes: notes.trim()
    });

    onClose();
  };

  const participatingCount = Object.keys(playerMatchStats).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white font-outfit">Registrar Nuevo Partido</h3>
              <p className="text-[11px] text-slate-400">Automatiza minutos, goles, asistencias, tarjetas y porterías a cero</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          
          {/* Match Basic Details: Date, Competition, Opponent, Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Fecha</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Condición</label>
              <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setVenue('local')}
                  className={`flex items-center justify-center space-x-1 py-1.5 rounded-lg font-bold text-xs transition-all ${
                    venue === 'local' 
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Local</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVenue('visitante')}
                  className={`flex items-center justify-center space-x-1 py-1.5 rounded-lg font-bold text-xs transition-all ${
                    venue === 'visitante' 
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Plane className="w-3.5 h-3.5" />
                  <span>Visita</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Competición</label>
              <select
                value={isCustomComp ? '_custom_' : competition}
                onChange={(e) => {
                  if (e.target.value === '_custom_') {
                    setIsCustomComp(true);
                    setCompetition(customComp || '');
                  } else {
                    setIsCustomComp(false);
                    setCompetition(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
              >
                {competitionsList.map((c, i) => (
                  <option key={i} value={c}>🏆 {c}</option>
                ))}
                <option value="_custom_">➕ Otra Competición (Personalizada)</option>
              </select>

              {isCustomComp && (
                <input
                  type="text"
                  required
                  placeholder="Escribe el nombre del torneo..."
                  value={customComp}
                  onChange={(e) => {
                    setCustomComp(e.target.value);
                    setCompetition(e.target.value);
                  }}
                  className="w-full mt-1.5 px-3 py-1.5 bg-slate-950 border border-emerald-500/50 rounded-xl text-white font-bold text-xs focus:outline-none"
                />
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Equipo Rival</label>
              <input
                type="text"
                required
                placeholder="Ej. FC Barcelona..."
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Score & Result Box */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Score Inputs with Home/Away label orientation */}
            <div className="flex items-center space-x-3">
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                  Tu Club {venue === 'local' ? '(Local)' : '(Visitante)'}
                </span>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={ourGoals}
                  onChange={(e) => {
                    setOurGoals(e.target.value);
                    setManualResultOverride(false);
                  }}
                  className="w-14 h-11 text-center bg-slate-900 border border-slate-700 rounded-xl text-xl font-black text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <span className="text-lg font-black text-slate-500 mt-4">-</span>

              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">
                  Rival {venue === 'local' ? '(Visitante)' : '(Local)'}
                </span>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={opponentGoals}
                  onChange={(e) => {
                    setOpponentGoals(e.target.value);
                    setManualResultOverride(false);
                  }}
                  className="w-14 h-11 text-center bg-slate-900 border border-slate-700 rounded-xl text-xl font-black text-white focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Auto-selected Result Selector (V / E / D) */}
            <div className="flex flex-col items-center sm:items-end">
              <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Resultado (Auto)</span>
              <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setResult('V'); setManualResultOverride(true); }}
                  className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all ${
                    result === 'V' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-105' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  V (Victoria)
                </button>
                <button
                  type="button"
                  onClick={() => { setResult('E'); setManualResultOverride(true); }}
                  className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all ${
                    result === 'E' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  E (Empate)
                </button>
                <button
                  type="button"
                  onClick={() => { setResult('D'); setManualResultOverride(true); }}
                  className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all ${
                    result === 'D' ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 scale-105' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  D (Derrota)
                </button>
              </div>
            </div>

          </div>

          {/* Clean Sheet Automation Notice (if rival scored 0) */}
          {isCleanSheet && (
            <div className="p-3 bg-cyan-950/70 border border-cyan-500/40 rounded-2xl flex items-center space-x-2.5 text-cyan-200 text-xs">
              <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
              <p>
                <strong>🛡️ Portería a Cero detectada:</strong> Se sumará automáticamente <strong>+1 Portería a Cero</strong> a los porteros (POR) y defensas (DFC, LD, LI, CAD, CAI) que jueguen <strong>60 minutos o más</strong>.
              </p>
            </div>
          )}

          {/* MVPs Section */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
            <h4 className="text-[11px] font-extrabold uppercase text-slate-400 mb-3 flex items-center space-x-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Elección de Jugadores Destacados (MVPs)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-amber-400 mb-1 flex items-center space-x-1">
                  <Crown className="w-3.5 h-3.5" />
                  <span>MVP Oficial del Partido</span>
                </label>
                <select
                  value={officialMVP}
                  onChange={(e) => setOfficialMVP(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
                >
                  <option value="">-- Sin MVP Oficial --</option>
                  {currentPlayers.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.position}, {p.overall} GRL)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-cyan-400 mb-1 flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5" />
                  <span>MVP del Mánager (Destacado)</span>
                </label>
                <select
                  value={myMVP}
                  onChange={(e) => setMyMVP(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
                >
                  <option value="">-- Sin MVP del Mánager --</option>
                  {currentPlayers.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.position}, {p.overall} GRL)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Players Participation & Individual Match Stats (Minutos, Goles, Asistencias, Tarjetas) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div>
                <h4 className="text-xs font-black text-white uppercase flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Jugadores Participantes ({participatingCount} seleccionados)</span>
                </h4>
                <p className="text-[10px] text-slate-400">Marca los participantes y registra sus minutos, goles, asistencias y tarjetas</p>
              </div>

              {/* Quick Select Buttons */}
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={handleLoadStarters}
                  className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] rounded-lg transition-all"
                  title="Seleccionar los 11 titulares de la táctica con 90 minutos"
                >
                  <Zap className="w-3 h-3" />
                  <span>⚡ 11 Titular</span>
                </button>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold rounded-lg"
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-semibold rounded-lg"
                >
                  Limpiar
                </button>
              </div>
            </div>

            {/* Visual Goals Validator Banner */}
            <div className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
              totalAssignedGoals === teamGoals
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : totalAssignedGoals > teamGoals
                  ? 'bg-rose-950/80 border-rose-500/50 text-rose-300 animate-pulse'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
            }`}>
              <div className="flex items-center space-x-2">
                {totalAssignedGoals === teamGoals ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : totalAssignedGoals > teamGoals ? (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span className="font-extrabold text-[11px]">
                  Goles asignados a jugadores: {totalAssignedGoals} de {teamGoals} ⚽
                </span>
              </div>

              <span className="text-[10px] font-bold">
                {totalAssignedGoals === teamGoals && '✅ Cuadre exacto'}
                {totalAssignedGoals > teamGoals && `⚠️ Exceso de ${totalAssignedGoals - teamGoals} gol(es)`}
                {totalAssignedGoals < teamGoals && `ℹ️ ${teamGoals - totalAssignedGoals} gol(es) restante(s) o autogol`}
              </span>
            </div>

            {/* Players List Grid with Individual Counters */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-800/40">
              {currentPlayers.length === 0 ? (
                <p className="text-center text-slate-500 py-4 text-xs">No hay jugadores registrados en la plantilla.</p>
              ) : (
                currentPlayers.map(player => {
                  const pData = playerMatchStats[player.id];
                  const isSelected = pData !== undefined;
                  const mins = pData?.minutes || 90;
                  const goals = pData?.goals || 0;
                  const assists = pData?.assists || 0;
                  const yellowCards = pData?.yellowCards || 0;
                  const redCards = pData?.redCards || 0;

                  return (
                    <div
                      key={player.id}
                      className={`pt-2 p-2.5 rounded-2xl transition-all ${
                        isSelected 
                          ? 'bg-slate-950 border border-slate-800/90 shadow-md' 
                          : 'hover:bg-slate-800/30 opacity-75'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                        
                        {/* Checkbox & Player Info */}
                        <label className="flex items-center space-x-2.5 cursor-pointer select-none min-w-[180px]">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleTogglePlayer(player.id)}
                            className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-900 cursor-pointer"
                          />
                          <span className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] font-black text-emerald-400">
                            {player.position}
                          </span>
                          <span className="font-extrabold text-white text-xs">{player.name}</span>
                          <span className="text-[10px] font-bold text-amber-400">{player.overall}</span>
                        </label>

                        {/* Interactive Stats Counters for this Player */}
                        {isSelected && (
                          <div className="flex flex-wrap items-center gap-2">
                            
                            {/* Minutes Counter */}
                            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
                              <button
                                type="button"
                                onClick={() => handleUpdatePlayerField(player.id, 'minutes', -15)}
                                className="px-1.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800"
                                title="Restar 15 min"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <input
                                type="number"
                                min="1"
                                max="120"
                                value={mins}
                                onChange={(e) => handleSetMinutes(player.id, e.target.value)}
                                className="w-9 text-center bg-transparent text-white font-bold text-xs focus:outline-none"
                              />
                              <span className="text-[9px] text-slate-500 pr-1">min</span>
                              <button
                                type="button"
                                onClick={() => handleUpdatePlayerField(player.id, 'minutes', 15)}
                                className="px-1.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800"
                                title="Sumar 15 min"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Goals Counter ⚽ */}
                            <div className={`flex items-center border rounded-xl overflow-hidden transition-colors ${
                              goals > 0 ? 'bg-emerald-950/80 border-emerald-500/50' : 'bg-slate-900 border-slate-700'
                            }`}>
                              <button
                                type="button"
                                onClick={() => handleUpdatePlayerField(player.id, 'goals', -1)}
                                className="px-1.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className={`px-1 font-black text-xs flex items-center space-x-0.5 ${goals > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                <span>⚽</span>
                                <span>{goals}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdatePlayerField(player.id, 'goals', 1)}
                                className="px-1.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>

                            {/* Assists Counter 👟 */}
                            <div className={`flex items-center border rounded-xl overflow-hidden transition-colors ${
                              assists > 0 ? 'bg-cyan-950/80 border-cyan-500/50' : 'bg-slate-900 border-slate-700'
                            }`}>
                              <button
                                type="button"
                                onClick={() => handleUpdatePlayerField(player.id, 'assists', -1)}
                                className="px-1.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className={`px-1 font-black text-xs flex items-center space-x-0.5 ${assists > 0 ? 'text-cyan-400' : 'text-slate-400'}`}>
                                <span>👟</span>
                                <span>{assists}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdatePlayerField(player.id, 'assists', 1)}
                                className="px-1.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>

                            {/* Yellow Cards Counter 🟨 */}
                            <div className={`flex items-center border rounded-xl overflow-hidden transition-colors ${
                              yellowCards > 0 ? 'bg-amber-950/80 border-amber-500/50' : 'bg-slate-900 border-slate-700'
                            }`}>
                              <button
                                type="button"
                                onClick={() => handleUpdatePlayerField(player.id, 'yellowCards', -1)}
                                className="px-1.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className={`px-1 font-black text-xs flex items-center space-x-0.5 ${yellowCards > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                                <span>🟨</span>
                                <span>{yellowCards}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdatePlayerField(player.id, 'yellowCards', 1)}
                                className="px-1.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>

                            {/* Red Cards Counter 🟥 */}
                            <div className={`flex items-center border rounded-xl overflow-hidden transition-colors ${
                              redCards > 0 ? 'bg-rose-950/80 border-rose-500/50' : 'bg-slate-900 border-slate-700'
                            }`}>
                              <button
                                type="button"
                                onClick={() => handleUpdatePlayerField(player.id, 'redCards', -1)}
                                className="px-1.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className={`px-1 font-black text-xs flex items-center space-x-0.5 ${redCards > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                                <span>🟥</span>
                                <span>{redCards}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdatePlayerField(player.id, 'redCards', 1)}
                                className="px-1.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>

                          </div>
                        )}

                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl border border-slate-800 hover:bg-slate-800 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Partido y Actualizar Plantilla</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
