import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { parseCompVoiceDictation } from '../../utils/compVoiceParser';
import { Trophy, Award, Crown, Plus, Edit2, Check, X, Mic, MicOff, Sparkles, Bot, Trash2 } from 'lucide-react';

export const CompetitionsTab = () => {
  const { activeSeason, addCompetition, updateCompetitionEntry, deleteCompetitionEntry, updateAwards } = useApp();

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
      // Cup
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
            className="flex items-center space-x-1 text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl hover:bg-amber-500/20 transition-all"
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
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-amber-400 text-slate-950 rounded-lg shadow"
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

      {/* Competitions Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-black text-white font-outfit">Competiciones Oficiales</h3>
            <p className="text-xs text-slate-400">Edita el estado, rondas eliminatorias o posición final de tus torneos</p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg hover:bg-emerald-400 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Competición</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competitions.map((comp) => {
            const isWinner = comp.result?.includes('1º') || comp.result?.includes('Campeó');
            return (
              <div
                key={comp.id || comp.name}
                className={`bg-slate-900 border rounded-2xl p-5 shadow-lg flex items-center justify-between transition-all ${
                  isWinner ? 'border-amber-500/50 bg-gradient-to-r from-amber-950/30 to-slate-900' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xl border ${
                    isWinner ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}>
                    {isWinner ? '🏆' : '⚽'}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-white">{comp.name}</h4>
                    <p className="text-[11px] text-slate-400">
                      Tipo: {comp.type === 'league' ? 'Liga de Puntos' : 'Copa Eliminatoria'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1.5 rounded-xl font-extrabold text-xs border ${
                    isWinner ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-slate-950 border-emerald-500/30 text-emerald-400'
                  }`}>
                    {comp.result}
                  </div>

                  <button
                    onClick={() => handleOpenEditModal(comp)}
                    title="Editar estado del torneo"
                    className="p-1.5 rounded-lg border border-slate-800 hover:border-amber-500/50 text-slate-400 hover:text-amber-400 bg-slate-950 transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteComp(comp.id, comp.name)}
                    title="Eliminar torneo"
                    className="p-1.5 rounded-lg border border-slate-800 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 bg-slate-950 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
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
              <button onClick={() => setIsCompModalOpen(false)} className="text-slate-400 hover:text-white">
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
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all ${
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
                // Cup / Champions
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
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-1"
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
