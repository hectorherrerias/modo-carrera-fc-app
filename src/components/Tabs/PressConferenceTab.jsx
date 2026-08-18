import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  generatePressQuestionsAsync, 
  generateNewsFromPressConferenceAsync, 
  SEASON_NARRATIVE_PRESETS 
} from '../../utils/pressAIEngine';
import { generateGeminiSeasonNarrative } from '../../utils/geminiService';
import { 
  Mic, MicOff, Send, Sparkles, CheckCircle2, History, Bot, 
  RefreshCw, Newspaper, Key, Bookmark, Check, HelpCircle, Flame, Trophy, ShieldAlert 
} from 'lucide-react';
import { AuthModal } from '../Modals/AuthModal';

export const PressConferenceTab = () => {
  const { 
    activeClub, 
    activeSeason, 
    currentPress, 
    clubTotalWins, 
    clubTotalDraws, 
    clubTotalLosses, 
    computedWinRate,
    updateSeasonNarrative, 
    savePressConference, 
    saveNewsArticle, 
    clearUnfavoritedNews 
  } = useApp();

  const { currentUser } = useAuth();

  // Season Narrative Context (persisted per season)
  const [seasonNarrativeInput, setSeasonNarrativeInput] = useState(activeSeason?.narrativeContext || '');
  const [narrativeSavedToast, setNarrativeSavedToast] = useState(false);
  const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);
  const [isNarrativeMicActive, setIsNarrativeMicActive] = useState(false);

  // Match Specific Preview Context
  const [matchPreviewInput, setMatchPreviewInput] = useState('');
  const [isMatchMicActive, setIsMatchMicActive] = useState(false);

  // Question Generation & Interactive Press Room
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [questions, setQuestions] = useState(null);
  const [questionSource, setQuestionSource] = useState('heuristic');
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '' });
  const [activeMicQuestion, setActiveMicQuestion] = useState(null);
  const [isGeneratingNews, setIsGeneratingNews] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync local season narrative when active season changes
  useEffect(() => {
    if (activeSeason) {
      setSeasonNarrativeInput(activeSeason.narrativeContext || '');
    }
  }, [activeSeason?.id]);

  if (!activeClub || !activeSeason) return null;

  // Save Season Narrative Context
  const handleSaveSeasonNarrative = (text) => {
    const textToSave = text !== undefined ? text : seasonNarrativeInput;
    updateSeasonNarrative(textToSave);
    setNarrativeSavedToast(true);
    setTimeout(() => setNarrativeSavedToast(false), 2500);
  };

  const handleSelectPreset = (preset) => {
    const newText = preset.description;
    setSeasonNarrativeInput(newText);
    handleSaveSeasonNarrative(newText);
  };

  // AI Narrative Draft Generator
  const handleGenerateAINarrative = async () => {
    setIsGeneratingNarrative(true);
    try {
      if (currentUser?.geminiApiKey) {
        const aiDraft = await generateGeminiSeasonNarrative(currentUser.geminiApiKey, {
          clubName: activeClub.name,
          managerName: activeClub.managerName,
          year: activeSeason.year,
          winRate: computedWinRate,
          wins: clubTotalWins,
          draws: clubTotalDraws,
          losses: clubTotalLosses
        });
        if (aiDraft) {
          setSeasonNarrativeInput(aiDraft.trim());
          handleSaveSeasonNarrative(aiDraft.trim());
          setIsGeneratingNarrative(false);
          return;
        }
      }

      // Smart heuristic fallback if no key
      const heuristicDraft = `Temporada ${activeSeason.year} con ${activeClub.name}. Dirigidos por ${activeClub.managerName}, acumulamos un ${computedWinRate}% de victorias (${clubTotalWins}V - ${clubTotalDraws}E - ${clubTotalLosses}D). El vestuario afronta una etapa crucial donde cada jornada marcará si alcanzamos los objetivos de la directiva.`;
      setSeasonNarrativeInput(heuristicDraft);
      handleSaveSeasonNarrative(heuristicDraft);
    } catch (e) {
      console.warn("AI narrative error:", e);
    }
    setIsGeneratingNarrative(false);
  };

  // Toggle Voice Recognition for Season Narrative
  const handleToggleNarrativeMic = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;

      setIsNarrativeMicActive(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const updated = (seasonNarrativeInput ? seasonNarrativeInput + " " : "") + transcript;
        setSeasonNarrativeInput(updated);
        handleSaveSeasonNarrative(updated);
        setIsNarrativeMicActive(false);
      };

      recognition.onerror = () => setIsNarrativeMicActive(false);
      recognition.onend = () => setIsNarrativeMicActive(false);

      recognition.start();
    } else {
      alert("El micrófono no está disponible en este navegador.");
    }
  };

  // Toggle Voice Recognition for Match Preview
  const handleToggleMatchMic = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;

      setIsMatchMicActive(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMatchPreviewInput((prev) => (prev ? prev + " " : "") + transcript);
        setIsMatchMicActive(false);
      };

      recognition.onerror = () => setIsMatchMicActive(false);
      recognition.onend = () => setIsMatchMicActive(false);

      recognition.start();
    } else {
      alert("El micrófono no está disponible en este navegador.");
    }
  };

  // Generate Questions via Gemini / Engine
  const handleGenerateQuestions = async (e) => {
    e.preventDefault();
    if (!matchPreviewInput.trim() && !seasonNarrativeInput.trim()) return;

    // Clear old non-favorited news
    clearUnfavoritedNews();
    setIsGeneratingQuestions(true);

    const result = await generatePressQuestionsAsync({
      apiKey: currentUser?.geminiApiKey,
      clubName: activeClub.name,
      managerName: activeClub.managerName,
      seasonContext: seasonNarrativeInput || activeSeason.narrativeContext,
      matchPreview: matchPreviewInput,
      teamStats: {
        wins: clubTotalWins,
        draws: clubTotalDraws,
        losses: clubTotalLosses,
        winRate: computedWinRate
      }
    });

    setQuestions(result.questions);
    setQuestionSource(result.source);
    setAnswers({ q1: '', q2: '', q3: '' });
    setIsFinished(false);
    setIsGeneratingQuestions(false);
  };

  const handleAnswerChange = (qId, val) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: val
    }));
  };

  const handleToggleAnswerMic = (qId) => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;

      setActiveMicQuestion(qId);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setAnswers(prev => ({
          ...prev,
          [qId]: (prev[qId] ? prev[qId] + " " : "") + transcript
        }));
        setActiveMicQuestion(null);
      };

      recognition.onerror = () => setActiveMicQuestion(null);
      recognition.onend = () => setActiveMicQuestion(null);

      recognition.start();
    } else {
      alert("El micrófono no está soportado en este navegador.");
    }
  };

  const handleFinishAndAutoGenerateNews = async () => {
    if (!questions) return;
    setIsGeneratingNews(true);

    const qaList = questions.map(q => ({
      journalist: q.journalist,
      outletName: q.outletName,
      question: q.question,
      answer: answers[q.id] || "Sin declaración adicional."
    }));

    const conferenceData = {
      seasonNarrative: seasonNarrativeInput || activeSeason.narrativeContext,
      context: matchPreviewInput,
      managerName: activeClub.managerName,
      qaList: qaList
    };

    savePressConference(conferenceData);

    // AUTO-GENERATE REALISTIC NEWSPAPER FRONT PAGES VIA GEMINI OR HEURISTIC
    const generatedArticles = await generateNewsFromPressConferenceAsync({
      apiKey: currentUser?.geminiApiKey,
      clubName: activeClub.name,
      managerName: activeClub.managerName,
      seasonContext: seasonNarrativeInput || activeSeason.narrativeContext,
      matchPreview: matchPreviewInput,
      qaList: qaList
    });

    generatedArticles.forEach(article => {
      saveNewsArticle(article);
    });

    setIsGeneratingNews(false);
    setIsFinished(true);
  };

  const handleResetForNewMatch = () => {
    setMatchPreviewInput('');
    setQuestions(null);
    setAnswers({ q1: '', q2: '', q3: '' });
    setIsFinished(false);
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner & AI Connection Status */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Mic className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase text-amber-400 bg-amber-950 border border-amber-500/30 px-2 py-0.5 rounded">
                Sala de Prensa Oficial
              </span>

              {currentUser?.geminiApiKey ? (
                <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-950 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Gemini IA Activa</span>
                </span>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded flex items-center space-x-1 transition-all"
                >
                  <Key className="w-3 h-3 text-cyan-400" />
                  <span>Conectar Gemini API Key (100% Gratis)</span>
                </button>
              )}
            </div>
            
            <h3 className="text-2xl font-black text-white font-outfit mt-1">Ruedas de Prensa con Periodistas Reales</h3>
            <p className="text-xs text-slate-400 mt-1">
              José Félix Díaz (MARCA), Tomás Roncero (AS) y Josep Pedrerol (El Chiringuito) siguen el hilo de tu temporada con Inteligencia Artificial.
            </p>
          </div>
        </div>

        {questions && (
          <button
            onClick={handleResetForNewMatch}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 transition-all shrink-0"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Siguiente Partido</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. DEDICATED SEASON NARRATIVE & CONTEXT ZONE (PERSISTENT & EDITABLE)     */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-base sm:text-lg font-black text-white font-outfit">
                  Contexto e Hilo Narrativo de la Temporada ({activeSeason.year})
                </h4>
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950 border border-emerald-500/30 px-2 py-0.5 rounded hidden sm:inline">
                  Persistente
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Define cómo va la temporada (ej. si empezaste a mitad de año, peleas el descenso, hay crisis o vas líder) para que los periodistas siempre mantengan ese hilo.
              </p>
            </div>
          </div>

          {/* AI Narrative Generator Button */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleGenerateAINarrative}
              disabled={isGeneratingNarrative}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isGeneratingNarrative ? 'Generando con IA...' : 'Redactar con IA ✨'}</span>
            </button>
          </div>
        </div>

        {/* Quick Preset Narrative Chips */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1">
            <Bookmark className="w-3 h-3 text-emerald-400" />
            <span>Plantillas de situación rápida (un clic para cargar):</span>
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {SEASON_NARRATIVE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="text-left p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-xs transition-all group"
              >
                <p className="font-extrabold text-slate-200 group-hover:text-emerald-400 transition-colors">
                  {preset.title}
                </p>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                  {preset.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Season Narrative Textarea */}
        <div className="space-y-2 pt-1">
          <div className="relative">
            <textarea
              rows="3"
              placeholder="Escribe el contexto general de tu temporada (ej: Empecé en enero con el equipo en el puesto 14. La directiva me pide salvar el descenso y llevamos 2 derrotas seguidas...)"
              value={seasonNarrativeInput}
              onChange={(e) => setSeasonNarrativeInput(e.target.value)}
              className="w-full p-4 pr-12 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none shadow-inner leading-relaxed"
            />

            <button
              type="button"
              onClick={handleToggleNarrativeMic}
              title="Dictar por voz"
              className={`absolute right-3.5 top-3.5 p-2 rounded-xl transition-all ${
                isNarrativeMicActive
                  ? 'text-rose-400 animate-pulse bg-rose-500/20'
                  : 'text-slate-400 hover:text-emerald-400 bg-slate-900'
              }`}
            >
              {isNarrativeMicActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center space-x-2 text-slate-400">
              {narrativeSavedToast && (
                <span className="text-emerald-400 font-bold flex items-center space-x-1 animate-fade-in">
                  <Check className="w-4 h-4" />
                  <span>¡Contexto guardado y sincronizado con la temporada!</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleSaveSeasonNarrative()}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all"
            >
              Guardar Contexto de Temporada
            </button>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. MATCH SPECIFIC PREVIEW & QUESTIONS GENERATOR                           */}
      {/* ========================================================================= */}
      {!questions && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-sm">
              2
            </div>
            <div>
              <h4 className="text-base font-extrabold text-white flex items-center space-x-2">
                <span>Previa o Situación del Partido Actual</span>
              </h4>
              <p className="text-xs text-slate-400">
                Añade los detalles del partido de hoy (rival, ida/vuelta de eliminatoria, bajas, si vienes de ganar, etc.):
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerateQuestions} className="space-y-4">
            <div className="relative">
              <textarea
                rows="3"
                required
                placeholder="Ej: Nos jugamos el pase a la final de Copa contra el Sevilla tras el 0-0 de la ida. El delantero titular llega con molestias y el rival no ha perdido en casa..."
                value={matchPreviewInput}
                onChange={(e) => setMatchPreviewInput(e.target.value)}
                className="w-full p-4 pr-12 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-amber-400 shadow-inner"
              />

              <button
                type="button"
                onClick={handleToggleMatchMic}
                title="Dictar por voz"
                className={`absolute right-3.5 top-3.5 p-2 rounded-xl transition-all ${
                  isMatchMicActive
                    ? 'text-rose-400 animate-pulse bg-rose-500/20'
                    : 'text-slate-400 hover:text-amber-400 bg-slate-900'
                }`}
              >
                {isMatchMicActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                <Bot className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {currentUser?.geminiApiKey 
                    ? "✨ La IA combinará el Contexto de la Temporada + Esta Previa para formular preguntas reales."
                    : "⚡ Modo rápido activo. Para máxima personalización con Gemini IA conecta tu API Key."}
                </span>
              </div>

              <button
                type="submit"
                disabled={isGeneratingQuestions}
                className="flex items-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 via-teal-400 to-emerald-400 hover:from-amber-400 hover:to-emerald-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGeneratingQuestions ? 'Generando preguntas con IA...' : 'Generar Preguntas de los Periodistas'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. GENERATED QUESTIONS INTERACTIVE ROOM                                    */}
      {/* ========================================================================= */}
      {questions && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-950 px-2.5 py-0.5 rounded border border-amber-500/30">
                  En Directo • Sala de Prensa
                </span>
                {questionSource === 'gemini' && (
                  <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-950 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Gemini IA Live</span>
                  </span>
                )}
              </div>
              <h3 className="text-xl font-black text-white font-outfit mt-1">Rueda de Prensa de {activeClub.managerName}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Previa: "{matchPreviewInput}"</p>
            </div>

            {isFinished && (
              <div className="flex items-center space-x-2">
                <span className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardada y Noticias Publicadas en Prensa 📰</span>
                </span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
                
                {/* Journalist Badge & Outlet */}
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-xs shrink-0">
                    P{idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-amber-400">{q.journalist}</span>
                      <span className="text-[10px] font-extrabold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {q.outletName}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white mt-1">"{q.question}"</p>
                  </div>
                </div>

                {/* Manager Answer Input with Voice Button */}
                <div className="pt-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
                    <span>Respuesta del Entrenador ({activeClub.managerName}):</span>
                    <span className="text-emerald-400">Escribe o presiona el micro</span>
                  </label>

                  <div className="relative">
                    <textarea
                      rows="2"
                      placeholder="Escribe tu respuesta oficial o pulsa el micrófono para dictar..."
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="w-full p-3 pr-10 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500 shadow-inner"
                    />

                    <button
                      type="button"
                      onClick={() => handleToggleAnswerMic(q.id)}
                      title="Dictar por voz"
                      className={`absolute right-3 top-3 p-1.5 rounded-full transition-all ${
                        activeMicQuestion === q.id 
                          ? 'text-rose-400 animate-pulse bg-rose-500/20' 
                          : 'text-slate-400 hover:text-emerald-400 bg-slate-950'
                      }`}
                    >
                      {activeMicQuestion === q.id ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {!isFinished ? (
            <div className="pt-2 flex justify-end space-x-3">
              <button
                onClick={handleFinishAndAutoGenerateNews}
                disabled={isGeneratingNews}
                className="flex items-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                <Newspaper className="w-4 h-4" />
                <span>{isGeneratingNews ? 'Redactando Portadas con IA...' : 'Finalizar y Generar Portadas de Prensa 📰'}</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleResetForNewMatch}
                className="flex items-center space-x-2 px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all"
              >
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>Iniciar Rueda de Prensa del Siguiente Partido</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. CONFERENCE HISTORY                                                     */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <h4 className="text-lg font-black text-white font-outfit flex items-center space-x-2">
          <History className="w-5 h-5 text-amber-400" />
          <span>Historial de Ruedas de Prensa de la Temporada</span>
        </h4>

        {currentPress.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-500 text-xs">
            Aún no has guardado ruedas de prensa en esta temporada.
          </div>
        ) : (
          <div className="space-y-4">
            {currentPress.map((conf) => (
              <div key={conf.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400">Fecha: {conf.date}</span>
                    <p className="text-xs font-semibold text-slate-300 italic mt-0.5">Previa: "{conf.context}"</p>
                    {conf.seasonNarrative && (
                      <p className="text-[11px] text-emerald-400 font-medium mt-0.5">Contexto temporada: "{conf.seasonNarrative}"</p>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-500/30 shrink-0">
                    DT: {conf.managerName}
                  </span>
                </div>

                <div className="space-y-3">
                  {(conf.qaList || []).map((qa, idx) => (
                    <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
                      <p className="font-bold text-amber-400">{qa.journalist} ({qa.outletName}): "{qa.question}"</p>
                      <p className="text-slate-200 pl-3 border-l-2 border-emerald-500">👉 DT: "{qa.answer}"</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

    </div>
  );
};
