import React, { useState, useEffect } from 'react';
import { Calendar, X, Check, Award, Trophy, Users, Zap, Plus, Minus, Star, Crown } from 'lucide-react';

export const AddMatchModal = ({ isOpen, onClose, onAddMatch, currentPlayers, activeSeason }) => {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [opponent, setOpponent] = useState('');
  const [competition, setCompetition] = useState('');
  const [ourGoals, setOurGoals] = useState(2);
  const [opponentGoals, setOpponentGoals] = useState(1);
  const [result, setResult] = useState('V'); // 'V' | 'E' | 'D'
  const [manualResultOverride, setManualResultOverride] = useState(false);

  // Map of playerId -> minutesPlayed (if present, player participated)
  const [selectedMinutes, setSelectedMinutes] = useState({});
  const [officialMVP, setOfficialMVP] = useState('');
  const [myMVP, setMyMVP] = useState('');
  const [notes, setNotes] = useState('');

  // Initial setup when modal opens
  useEffect(() => {
    if (isOpen) {
      setDate(new Date().toISOString().split('T')[0]);
      setOpponent('');
      setOurGoals(2);
      setOpponentGoals(1);
      setResult('V');
      setManualResultOverride(false);
      setOfficialMVP('');
      setMyMVP('');
      setNotes('');

      // Default competition
      const defaultComp = activeSeason?.competitions?.[0]?.name || 'LaLiga EA Sports';
      setCompetition(defaultComp);

      // Auto-select starting XI by default if available
      const startingXI = activeSeason?.tacticsOfensive?.startingXI || [];
      const starterNames = new Set(startingXI.map(s => s.playerName).filter(Boolean));
      
      const initialMap = {};
      currentPlayers.forEach(p => {
        if (starterNames.has(p.name)) {
          initialMap[p.id] = 90;
        }
      });
      setSelectedMinutes(initialMap);
    }
  }, [isOpen, activeSeason, currentPlayers]);

  // Auto-calculate Result V / E / D from score unless manually overridden
  useEffect(() => {
    if (!manualResultOverride) {
      const gOur = Number(ourGoals) || 0;
      const gOpp = Number(opponentGoals) || 0;
      if (gOur > gOpp) setResult('V');
      else if (gOur === gOpp) setResult('E');
      else setResult('D');
    }
  }, [ourGoals, opponentGoals, manualResultOverride]);

  if (!isOpen) return null;

  const competitionsList = activeSeason?.competitions?.map(c => c.name) || ['LaLiga EA Sports', 'Copa del Rey', 'UEFA Champions League'];

  const handleTogglePlayer = (playerId) => {
    setSelectedMinutes(prev => {
      const updated = { ...prev };
      if (updated[playerId] !== undefined) {
        delete updated[playerId];
      } else {
        updated[playerId] = 90;
      }
      return updated;
    });
  };

  const handleSetMinutes = (playerId, mins) => {
    const val = Math.max(1, Math.min(120, Number(mins) || 0));
    setSelectedMinutes(prev => ({
      ...prev,
      [playerId]: val
    }));
  };

  const handleLoadStarters = () => {
    const startingXI = activeSeason?.tacticsOfensive?.startingXI || [];
    const starterNames = new Set(startingXI.map(s => s.playerName).filter(Boolean));
    
    const newMap = {};
    currentPlayers.forEach(p => {
      if (starterNames.has(p.name)) {
        newMap[p.id] = 90;
      }
    });

    // If startingXI had no names assigned yet, pick first 11 players
    if (Object.keys(newMap).length === 0) {
      currentPlayers.slice(0, 11).forEach(p => {
        newMap[p.id] = 90;
      });
    }

    setSelectedMinutes(newMap);
  };

  const handleSelectAll = () => {
    const newMap = {};
    currentPlayers.forEach(p => {
      newMap[p.id] = 90;
    });
    setSelectedMinutes(newMap);
  };

  const handleDeselectAll = () => {
    setSelectedMinutes({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!opponent.trim()) {
      alert('Por favor indica el equipo rival.');
      return;
    }

    const scoreString = `${Number(ourGoals) || 0} - ${Number(opponentGoals) || 0}`;

    const playersInvolved = Object.entries(selectedMinutes).map(([playerId, minutes]) => {
      const pObj = currentPlayers.find(p => p.id === playerId);
      return {
        playerId,
        playerName: pObj ? pObj.name : 'Jugador',
        position: pObj ? pObj.position : 'DC',
        minutesPlayed: Number(minutes) || 90
      };
    });

    onAddMatch({
      date,
      opponent: opponent.trim(),
      competition,
      result,
      score: scoreString,
      playersInvolved,
      officialMVP: officialMVP || null,
      myMVP: myMVP || null,
      notes: notes.trim()
    });

    onClose();
  };

  const participatingCount = Object.keys(selectedMinutes).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white font-outfit">Registrar Nuevo Partido</h3>
              <p className="text-[11px] text-slate-400">Suma automáticamente minutos, partidos y MVPs a tu plantilla</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          
          {/* Match Basic Details: Date, Competition, Opponent */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Competición</label>
              <input
                type="text"
                list="comp-list"
                required
                placeholder="LaLiga, Copa, Champions..."
                value={competition}
                onChange={(e) => setCompetition(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
              <datalist id="comp-list">
                {competitionsList.map((c, i) => (
                  <option key={i} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Equipo Rival</label>
              <input
                type="text"
                required
                placeholder="Ej. FC Barcelona, Sevilla..."
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Score & Result Box */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Score Inputs */}
            <div className="flex items-center space-x-3">
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Tu Club</span>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={ourGoals}
                  onChange={(e) => setOurGoals(e.target.value)}
                  className="w-14 h-11 text-center bg-slate-900 border border-slate-700 rounded-xl text-xl font-black text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <span className="text-lg font-black text-slate-500 mt-4">-</span>

              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">Rival</span>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={opponentGoals}
                  onChange={(e) => setOpponentGoals(e.target.value)}
                  className="w-14 h-11 text-center bg-slate-900 border border-slate-700 rounded-xl text-xl font-black text-white focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Result Selector (V / E / D) */}
            <div className="flex flex-col items-center sm:items-end">
              <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">Resultado Final</span>
              <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setResult('V'); setManualResultOverride(true); }}
                  className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all ${
                    result === 'V' ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  V (Victoria)
                </button>
                <button
                  type="button"
                  onClick={() => { setResult('E'); setManualResultOverride(true); }}
                  className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all ${
                    result === 'E' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  E (Empate)
                </button>
                <button
                  type="button"
                  onClick={() => { setResult('D'); setManualResultOverride(true); }}
                  className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all ${
                    result === 'D' ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  D (Derrota)
                </button>
              </div>
            </div>

          </div>

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

          {/* Players Participation & Minutes Selector */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div>
                <h4 className="text-xs font-black text-white uppercase flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Jugadores Participantes ({participatingCount} seleccionados)</span>
                </h4>
                <p className="text-[10px] text-slate-400">Marca quién jugó y asigna sus minutos (sumarán automáticamente a la plantilla)</p>
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
                  <span>⚡ 11 Titular (90')</span>
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

            {/* Players List Grid */}
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-800/40">
              {currentPlayers.length === 0 ? (
                <p className="text-center text-slate-500 py-4 text-xs">No hay jugadores registrados en la plantilla.</p>
              ) : (
                currentPlayers.map(player => {
                  const isSelected = selectedMinutes[player.id] !== undefined;
                  const mins = selectedMinutes[player.id] || 90;

                  return (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-2 rounded-xl transition-all ${
                        isSelected ? 'bg-slate-950 border border-slate-800' : 'hover:bg-slate-800/30 opacity-75'
                      }`}
                    >
                      {/* Checkbox & Player Info */}
                      <label className="flex items-center space-x-2.5 cursor-pointer flex-1 select-none">
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
                        <span className="text-[10px] font-bold text-amber-400">{player.overall} GRL</span>
                      </label>

                      {/* Minutes input & presets when selected */}
                      {isSelected && (
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => handleSetMinutes(player.id, mins - 15)}
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
                              className="w-10 text-center bg-transparent text-white font-bold text-xs focus:outline-none"
                            />
                            <span className="text-[10px] text-slate-500 pr-1">min</span>
                            <button
                              type="button"
                              onClick={() => handleSetMinutes(player.id, mins + 15)}
                              className="px-1.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800"
                              title="Sumar 15 min"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Quick Minute Preset Tags */}
                          <div className="hidden sm:flex items-center space-x-1">
                            {[90, 60, 45, 30].map(m => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => handleSetMinutes(player.id, m)}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors ${
                                  mins === m 
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                                }`}
                              >
                                {m}'
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
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
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl border border-slate-800 hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-1.5"
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
