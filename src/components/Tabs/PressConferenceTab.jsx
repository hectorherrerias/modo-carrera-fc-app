import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { generatePressQuestions, generateNewsFromPressConference } from '../../utils/pressAIEngine';
import { Mic, MicOff, Send, Sparkles, CheckCircle2, History, Bot, RefreshCw, Newspaper } from 'lucide-react';

export const PressConferenceTab = () => {
  const { activeClub, activeSeason, currentPress, savePressConference, saveNewsArticle, clearUnfavoritedNews } = useApp();

  const [contextInput, setContextInput] = useState('');
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '' });
  const [activeMicQuestion, setActiveMicQuestion] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  if (!activeClub || !activeSeason) return null;

  const handleGenerateQuestions = (e) => {
    e.preventDefault();
    if (!contextInput.trim()) return;

    // Clear old non-favorited news when starting a new match conference
    clearUnfavoritedNews();

    const generated = generatePressQuestions(
      contextInput, 
      activeClub.name, 
      activeClub.managerName
    );

    setQuestions(generated);
    setAnswers({ q1: '', q2: '', q3: '' });
    setIsFinished(false);
  };

  const handleAnswerChange = (qId, val) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: val
    }));
  };

  const handleToggleMic = (qId) => {
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
      alert("El micrófono no está soportado en este navegador. Por favor escribe tu respuesta en el campo de texto.");
    }
  };

  const handleFinishAndAutoGenerateNews = () => {
    if (!questions) return;

    const qaList = questions.map(q => ({
      journalist: q.journalist,
      outletName: q.outletName,
      question: q.question,
      answer: answers[q.id] || "Sin declaración adicional."
    }));

    const conferenceData = {
      context: contextInput,
      managerName: activeClub.managerName,
      qaList: qaList
    };

    savePressConference(conferenceData);

    // AUTO-GENERATE NEWSPAPER FRONT PAGES FROM CONFERENCES & ANSWERS
    const generatedArticles = generateNewsFromPressConference(
      contextInput,
      qaList,
      activeClub.name,
      activeClub.managerName
    );

    generatedArticles.forEach(article => {
      saveNewsArticle(article);
    });

    setIsFinished(true);
  };

  const handleResetForNewMatch = () => {
    setContextInput('');
    setQuestions(null);
    setAnswers({ q1: '', q2: '', q3: '' });
    setIsFinished(false);
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Mic className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase text-amber-400 bg-amber-950 border border-amber-500/30 px-2 py-0.5 rounded">Sala de Prensa Oficial</span>
            </div>
            <h3 className="text-2xl font-black text-white font-outfit mt-1">Ruedas de Prensa con Periodistas Reales</h3>
            <p className="text-xs text-slate-400 mt-1">
              José Félix Díaz (MARCA), Tomás Roncero (AS) y Josep Pedrerol (El Chiringuito) te preguntan antes o después del partido.
            </p>
          </div>
        </div>

        {questions && (
          <button
            onClick={handleResetForNewMatch}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 transition-all"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Nueva Rueda de Prensa (Siguiente Partido)</span>
          </button>
        )}
      </div>

      {/* Context Input Form */}
      {!questions && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h4 className="text-base font-extrabold text-white flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>1. Contexto o Previa del Partido</span>
          </h4>

          <form onSubmit={handleGenerateQuestions} className="space-y-4">
            <textarea
              rows="3"
              required
              placeholder="Ej: Nos jugamos las semifinales de Copa contra el Barcelona tras perder 0-1 en la ida. Venimos de 3 victorias seguidas y tenemos al delantero lesionado..."
              value={contextInput}
              onChange={(e) => setContextInput(e.target.value)}
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-amber-400 shadow-inner"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all"
              >
                <Bot className="w-4 h-4" />
                <span>Generar Preguntas de los Periodistas</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Generated 3 Questions Interactive Room */}
      {questions && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in">
          
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-950 px-2.5 py-0.5 rounded border border-amber-500/30">
                En Directo • Sala de Prensa
              </span>
              <h3 className="text-xl font-black text-white font-outfit mt-1">Rueda de Prensa de {activeClub.managerName}</h3>
            </div>

            {isFinished && (
              <div className="flex items-center space-x-2">
                <span className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardada y Noticias Generadas en Prensa 📰</span>
                </span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                
                {/* Real Journalist Name & Outlet */}
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
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

                {/* Manager Answer Input */}
                <div className="pt-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
                    <span>Respuesta del Entrenador ({activeClub.managerName}):</span>
                    <span className="text-emerald-400">Escribe o usa el micrófono</span>
                  </label>

                  <div className="relative">
                    <textarea
                      rows="2"
                      placeholder="Escribe tu respuesta oficial o presiona el micrófono para dictar..."
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="w-full p-3 pr-10 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />

                    <button
                      type="button"
                      onClick={() => handleToggleMic(q.id)}
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
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
              >
                <Newspaper className="w-4 h-4" />
                <span>Finalizar y Generar Portadas de Prensa en Noticia 📰</span>
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

      {/* Conference History */}
      <div className="space-y-4">
        <h4 className="text-lg font-black text-white font-outfit flex items-center space-x-2">
          <History className="w-5 h-5 text-amber-400" />
          <span>Historial de Ruedas de Prensa del Club</span>
        </h4>

        {currentPress.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-500 text-xs">
            Aún no has guardado ruedas de prensa en este club.
          </div>
        ) : (
          <div className="space-y-4">
            {currentPress.map((conf) => (
              <div key={conf.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400">Fecha: {conf.date}</span>
                    <p className="text-xs font-semibold text-slate-300 italic mt-0.5">Previa: "{conf.context}"</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    DT: {conf.managerName}
                  </span>
                </div>

                <div className="space-y-3">
                  {(conf.qaList || []).map((qa, idx) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
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

    </div>
  );
};
