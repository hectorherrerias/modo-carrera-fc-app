import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { parseCompVoiceDictation } from '../../utils/compVoiceParser';
import { Trophy, Award, Crown, Plus, Edit2, Check, X, Mic, MicOff, Sparkles, Bot, Trash2, Star, Medal, Flame, Activity } from 'lucide-react';
import { calculateSquadStatsByCompetition, getCompetitionLeaders, getCompetitionTeamSummary } from '../../utils/statsHelper';

export const CompetitionsTab = () => {
  const { 
    activeSeason, 
    currentPlayers, 
    currentMatches, 
    addCompetition, 
    updateCompetitionEntry, 
    deleteCompetitionEntry, 
    updateAwards 
  } = useApp();

  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [editingComp, setEditingComp] = useState(null);

  // Form State
  const [compName, setCompName] = useState('LaLiga EA Sports');
  const [compType, setCompType] = useState('league'); // 'league' | 'cup'
  const [compStatus, setCompStatus] = useState('en_curso'); // 'en_curso' | 'finalizada'
  const [leaguePlacement, setLeaguePlacement] = useState(1);
  const [cupRound, setCupRound] = useState('Octavos de Final');
  const [cupEliminatedRound, setCupEliminatedRound] = useState('1º Campeones 🏆');

  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState('');

  const [isEditingAwards, setIsEditingAwards] = useState(false);
  const [awardsForm, setAwardsForm] = useState({
    mvp: activeSeason?.awards?.mvp || '',
    topScorer: activeSeason?.awards?.topScorer || '',
    topAssister: activeSeason?.awards?.topAssister || ''
  });

  React.useEffect(() => {
    if (activeSeason?.awards) {
      setAwardsForm({
        mvp: activeSeason.awards.mvp || '',
        topScorer: activeSeason.awards.topScorer || '',
        topAssister: activeSeason.awards.topAssister || ''
      });
    }
  }, [activeSeason]);

  // Top 3 Official MVPs and Top 3 Manager MVPs across season
  const topOfficialMVPs = useMemo(() => {
    return [...(currentPlayers || [])]
      .filter(p => (p.officialMVPs || 0) > 0)
      .sort((a, b) => (b.officialMVPs || 0) - (a.officialMVPs || 0))
      .slice(0, 3);
  }, [currentPlayers]);

  const topMyMVPs = useMemo(() => {
    return [...(currentPlayers || [])]
      .filter(p => (p.myMVPs || 0) > 0)
      .sort((a, b) => (b.myMVPs || 0) - (a.myMVPs || 0))
      .slice(0, 3);
  }, [currentPlayers]);

  if (!activeSeason) return null;

  const competitions = activeSeason.competitions || [];
  const awards = activeSeason.awards || { mvp: 'Por determinar', topScorer: 'Por determinar', topAssister: 'Por determinar' };

  const handleOpenAddModal = () => {
    setEditingComp(null);
    setCompName('LaLiga EA Sports');
    setCompType('league');
    setCompStatus('en_curso');
    setLeaguePlacement(1);
    setCupRound('Octavos de Final');
    setCupEliminatedRound('1º Campeones 🏆');
    setVoiceNotice('');
    setIsCompModalOpen(true);
  };

  const handleOpenEditModal = (comp) => {
    setEditingComp(comp);
    setCompName(comp.name);
    setCompType(comp.type || 'league');
    setCompStatus(comp.status || (comp.result?.includes('En Curso') ? 'en_curso' : 'finalizada'));
    setVoiceNotice('');
    setIsCompModalOpen(true);
  };

  const handleToggleVoiceDictation = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;

      setIsListening(true);
      setVoiceNotice('Escuchando... Di por ejemplo: "LaLiga finalizada en 1º puesto" o "Champions League en curso en octavos de final"');

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const parsed = parseCompVoiceDictation(transcript);

        if (parsed) {
          if (parsed.name) setCompName(parsed.name);
          if (parsed.type) setCompType(parsed.type);
          if (parsed.status) setCompStatus(parsed.status);
          
          if (parsed.type === 'league' && parsed.status === 'finalizada') {
            const numMatch = parsed.result.match(/(\d+)/);
            if (numMatch) setLeaguePlacement(Number(numMatch[1]));
          } else if (parsed.type === 'cup') {
            if (parsed.status === 'en_curso') setCupRound(parsed.result);
            else setCupEliminatedRound(parsed.result);
          }

          setVoiceNotice(`✨ Formulario rellenado desde voz: "${transcript}"`);
        }
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } else {
      alert("El micrófono no está soportado en este navegador. Por favor completa los datos en el formulario.");
    }
  };

  const handleSubmitComp = (e) => {
    e.preventDefault();
    if (!compName.trim()) return;

    let computedResult = "En Curso";

    if (compType === 'league') {
      if (compStatus === 'en_curso') {
        computedResult = "En Curso";
      } else {
        computedResult = Number(leaguePlacement) === 1 ? "1º Campeón 🏆" : `${leaguePlacement}º Puesto`;
      }
    } else {
      if (compStatus === 'en_curso') {
        computedResult = `En Curso (${cupRound})`;
      } else {
        computedResult = cupEliminatedRound;
      }
    }

    if (editingComp) {
      updateCompetitionEntry(editingComp.id, {
        name: compName,
        type: compType,
        status: compStatus,
        result: computedResult
      });
    } else {
      addCompetition({
        name: compName,
        type: compType,
        status: compStatus,
        result: computedResult
      });
    }

    setIsCompModalOpen(false);
  };

  const handleDeleteComp = (compId, name) => {
    if (window.confirm(`¿Seguro que deseas eliminar la competición "${name}"?`)) {
      deleteCompetitionEntry(compId);
    }
  };

  const handleSaveAwards = (e) => {
    e.preventDefault();
    updateAwards(awardsForm);
    setIsEditingAwards(false);
  };

  return (
    <div className="space-y-8">
      
      {/* Individual Awards Highlight Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-black text-white font-outfit">Premios Individuales de la Temporada</h3>
          </div>
          
          <button
            onClick={() => {
              setAwardsForm({
                mvp: awards.mvp,
                topScorer: awards.topScorer,
                topAssister: awards.topAssister
              });
              setIsEditingAwards(!isEditingAwards);
            }}
            className="flex items-center space-x-1 text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl hover:bg-amber-500/20 transition-all cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Editar Premios</span>
          </button>
        </div>

        {isEditingAwards ? (
          <form onSubmit={handleSaveAwards} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h4 className="text-xs uppercase font-bold text-slate-400">Actualizar Galardonados</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-amber-400 font-bold mb-1">MVP del Año</label>
                <input
                  type="text"
                  value={awardsForm.mvp}
                  onChange={(e) => setAwardsForm({ ...awardsForm, mvp: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-emerald-400 font-bold mb-1">Pichichi (Goleador)</label>
                <input
                  type="text"
                  value={awardsForm.topScorer}
                  onChange={(e) => setAwardsForm({ ...awardsForm, topScorer: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-cyan-400 font-bold mb-1">Máximo Asistente</label>
                <input
                  type="text"
                  value={awardsForm.topAssister}
                  onChange={(e) => setAwardsForm({ ...awardsForm, topAssister: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingAwards(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-amber-400 text-slate-950 rounded-lg shadow cursor-pointer"
              >
                Guardar Premios
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 shadow-xl overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                <Crown className="w-6 h-6" />
              </div>
              <p className="text-[10px] uppercase font-extrabold text-amber-400 tracking-wider">MVP del Año</p>
              <h4 className="text-2xl font-black text-white font-outfit mt-1">{awards.mvp}</h4>
              <p className="text-xs text-slate-400 mt-2">Jugador más determinante de la plantilla</p>
            </div>

            <div className="relative bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-6 shadow-xl overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <Trophy className="w-6 h-6" />
              </div>
              <p className="text-[10px] uppercase font-extrabold text-emerald-400 tracking-wider">Máximo Goleador (Pichichi)</p>
              <h4 className="text-2xl font-black text-white font-outfit mt-1">{awards.topScorer}</h4>
              <p className="text-xs text-slate-400 mt-2">Líder en anotaciones de gol</p>
            </div>

            <div className="relative bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/30 rounded-3xl p-6 shadow-xl overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                <Award className="w-6 h-6" />
              </div>
              <p className="text-[10px] uppercase font-extrabold text-cyan-400 tracking-wider">Máximo Asistente</p>
              <h4 className="text-2xl font-black text-white font-outfit mt-1">{awards.topAssister}</h4>
              <p className="text-xs text-slate-400 mt-2">Líder en pases de gol brindados</p>
            </div>
          </div>
        )}
      </div>

      {/* MVP Leaders Widget (Top 3 Official & Top 3 Manager) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div>
          <h3 className="text-xl font-black text-white font-outfit flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Líderes MVP de la Temporada</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranking acumulado de los jugadores más determinantes elegidos tras cada partido en el Calendario.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* Top 3 Official MVPs */}
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <span className="text-xs font-black uppercase text-amber-400 flex items-center space-x-1.5">
                <Crown className="w-4 h-4" />
                <span>Top 3 • MVPs Oficiales</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold">👑 Premio oficial</span>
            </div>

            {topOfficialMVPs.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs">
                No hay jugadores con MVPs oficiales registrados aún. Registra partidos en el Calendario para sumar MVPs.
              </div>
            ) : (
              <div className="space-y-2">
                {topOfficialMVPs.map((player, idx) => {
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <div 
                      key={player.id}
                      className="flex items-center justify-between bg-slate-900/90 border border-slate-800/80 hover:border-amber-500/40 p-3 rounded-xl transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl shrink-0">{medals[idx] || `#${idx + 1}`}</span>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-black text-white text-sm">{player.name}</span>
                            <span className="bg-slate-950 border border-slate-700 px-1.5 py-0.2 rounded text-[10px] font-black text-emerald-400">
                              {player.position}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">{player.overall} GRL • {player.stats?.matches || 0} partidos</span>
                        </div>
                      </div>

                      <div className="px-3 py-1 bg-amber-950/80 border border-amber-500/40 rounded-xl text-amber-300 font-black text-xs">
                        👑 {player.officialMVPs} {player.officialMVPs === 1 ? 'MVP' : 'MVPs'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top 3 Manager MVPs */}
          <div className="bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <span className="text-xs font-black uppercase text-cyan-400 flex items-center space-x-1.5">
                <Star className="w-4 h-4" />
                <span>Top 3 • MVPs del Mánager</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold">⭐ Elección del DT</span>
            </div>

            {topMyMVPs.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs">
                No hay jugadores con MVPs del Mánager registrados aún. Registra partidos en el Calendario para elegirlos.
              </div>
            ) : (
              <div className="space-y-2">
                {topMyMVPs.map((player, idx) => {
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <div 
                      key={player.id}
                      className="flex items-center justify-between bg-slate-900/90 border border-slate-800/80 hover:border-cyan-500/40 p-3 rounded-xl transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl shrink-0">{medals[idx] || `#${idx + 1}`}</span>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-black text-white text-sm">{player.name}</span>
                            <span className="bg-slate-950 border border-slate-700 px-1.5 py-0.2 rounded text-[10px] font-black text-emerald-400">
                              {player.position}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">{player.overall} GRL • {player.stats?.matches || 0} partidos</span>
                        </div>
                      </div>

                      <div className="px-3 py-1 bg-cyan-950/80 border border-cyan-500/40 rounded-xl text-cyan-300 font-black text-xs">
                        ⭐ {player.myMVPs} {player.myMVPs === 1 ? 'MVP' : 'MVPs'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Official Competitions Grid with Tournament Performance Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-black text-white font-outfit">Competiciones Oficiales y Rendimiento</h3>
            <p className="text-xs text-slate-400">Estadísticas exclusivas de tu club y líderes de goleo en cada torneo</p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg hover:bg-emerald-400 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Competición</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {competitions.map((comp) => {
            const isWinner = comp.result?.includes('1º') || comp.result?.includes('Campeó');
            const summary = getCompetitionTeamSummary(currentMatches, comp.name);
            const compPlayers = calculateSquadStatsByCompetition(currentPlayers, currentMatches, comp.name);
            const compLeaders = getCompetitionLeaders(compPlayers);

            return (
              <div
                key={comp.id || comp.name}
                className={`bg-slate-900 border rounded-3xl p-5 shadow-xl flex flex-col justify-between transition-all space-y-4 ${
                  isWinner ? 'border-amber-500/50 bg-gradient-to-b from-amber-950/30 to-slate-900' : 'border-slate-800'
                }`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-2xl border ${
                      isWinner ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-lg shadow-amber-500/20' : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}>
                      {isWinner ? '🏆' : '⚽'}
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-white font-outfit">{comp.name}</h4>
                      <p className="text-[11px] text-slate-400">
                        Tipo: {comp.type === 'league' ? 'Liga Regular' : 'Torneo de Eliminación'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleOpenEditModal(comp)}
                      title="Editar estado del torneo"
                      className="p-1.5 rounded-lg border border-slate-800 hover:border-amber-500/50 text-slate-400 hover:text-amber-400 bg-slate-950 transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteComp(comp.id, comp.name)}
                      title="Eliminar torneo"
                      className="p-1.5 rounded-lg border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 bg-slate-950 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Status & Result Banner */}
                <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold">Estado actual:</span>
                  <div className={`px-3 py-1 rounded-xl font-black text-xs border ${
                    isWinner ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                  }`}>
                    {comp.result}
                  </div>
                </div>

                {/* Tournament Match Record Metrics */}
                <div className="grid grid-cols-4 gap-2 text-center bg-slate-950/40 p-2.5 rounded-2xl border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Partidos</span>
                    <strong className="text-white font-black text-sm">{summary.total}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-emerald-400 block">V - E - D</span>
                    <span className="text-slate-200 font-bold text-xs">{summary.wins}-{summary.draws}-{summary.losses}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-cyan-400 block">Goles (F/C)</span>
                    <span className="text-slate-200 font-bold text-xs">{summary.goalsFor} / {summary.goalsAgainst}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-amber-400 block">% Victorias</span>
                    <strong className="text-amber-400 font-black text-xs">{summary.winRate}%</strong>
                  </div>
                </div>

                {/* Top Tournament Players */}
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center space-x-1.5 text-slate-300 truncate">
                    <span>⚽</span>
                    <span className="truncate">
                      Goleador: <strong className="text-emerald-400">{compLeaders.topScorer ? `${compLeaders.topScorer.name} (${compLeaders.topScorer.computedStats?.goals})` : '-'}</strong>
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 text-slate-300 truncate">
                    <span>👟</span>
                    <span className="truncate">
                      Asistente: <strong className="text-cyan-400">{compLeaders.topAssister ? `${compLeaders.topAssister.name} (${compLeaders.topAssister.computedStats?.assists})` : '-'}</strong>
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Advanced Add/Edit Competition Modal */}
      {isCompModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <h3 className="font-bold text-white text-base">
                {editingComp ? 'Editar Estado de Competición' : 'Añadir Competición'}
              </h3>
              <button onClick={() => setIsCompModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Voice Bar */}
            <div className="bg-slate-950 px-6 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-slate-300 font-semibold">¿Dictar el resultado por voz?</span>
              </div>

              <button
                type="button"
                onClick={handleToggleVoiceDictation}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isListening ? 'Escuchando...' : 'Dictar por Voz'}</span>
              </button>
            </div>

            {voiceNotice && (
              <div className="mx-6 mt-3 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs font-semibold flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <p>{voiceNotice}</p>
              </div>
            )}

            <form onSubmit={handleSubmitComp} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nombre del Torneo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. LaLiga EA Sports, Copa del Rey, Champions League..."
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Tipo de Torneo</label>
                  <select
                    value={compType}
                    onChange={(e) => setCompType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-bold text-amber-400"
                  >
                    <option value="league">Liga de Puntos (Regular)</option>
                    <option value="cup">Copa / Champions (Eliminatoria)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Estado Actual</label>
                  <select
                    value={compStatus}
                    onChange={(e) => setCompStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-bold text-emerald-400"
                  >
                    <option value="en_curso">En Curso ⏳</option>
                    <option value="finalizada">Finalizada ✅</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Outcome Selectors */}
              {compType === 'league' ? (
                compStatus === 'finalizada' && (
                  <div>
                    <label className="block text-xs font-semibold text-amber-400 uppercase mb-1">Posición Final en la Liga</label>
                    <select
                      value={leaguePlacement}
                      onChange={(e) => setLeaguePlacement(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-extrabold text-amber-400"
                    >
                      {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>
                          {num === 1 ? '1º Puesto - 🏆 CAMPEONES' : `${num}º Puesto`}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              ) : (
                compStatus === 'en_curso' ? (
                  <div>
                    <label className="block text-xs font-semibold text-cyan-400 uppercase mb-1">Ronda Actual Jugando</label>
                    <select
                      value={cupRound}
                      onChange={(e) => setCupRound(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-bold"
                    >
                      <option value="Fase de Grupos">Fase de Grupos</option>
                      <option value="Dieciseisavos">Dieciseisavos de Final</option>
                      <option value="Octavos de Final">Octavos de Final</option>
                      <option value="Cuartos de Final">Cuartos de Final</option>
                      <option value="Semifinales">Semifinales</option>
                      <option value="Final">Final</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-amber-400 uppercase mb-1">Resultado Final en la Copa</label>
                    <select
                      value={cupEliminatedRound}
                      onChange={(e) => setCupEliminatedRound(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-bold text-amber-400"
                    >
                      <option value="1º Campeones 🏆">1º Campeones 🏆</option>
                      <option value="Subcampeón (Final)">Subcampeón (Finalista)</option>
                      <option value="Eliminado en Semifinales">Eliminado en Semifinales</option>
                      <option value="Eliminado en Cuartos">Eliminado en Cuartos de Final</option>
                      <option value="Eliminado en Octavos">Eliminado en Octavos de Final</option>
                      <option value="Eliminado en Dieciseisavos">Eliminado en Dieciseisavos</option>
                      <option value="Eliminado en Fase de Grupos">Eliminado en Fase de Grupos</option>
                    </select>
                  </div>
                )
              )}

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCompModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Torneo</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
