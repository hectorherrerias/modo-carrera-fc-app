import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { processAICommand } from '../utils/aiCommandProcessor';
import { callGeminiLiveAPI } from '../utils/geminiService';
import { Sparkles, Mic, Send, X, Bot, CheckCircle2, AlertCircle, Key } from 'lucide-react';
import { AuthModal } from './Modals/AuthModal';

export const AIAssistantModal = () => {
  const context = useApp();
  const { activeClub, activeSeason, currentPlayers, clubTotalWins, clubTotalDraws, clubTotalLosses, computedWinRate } = context;
  const { currentUser } = useAuth();
  
  const [isOpen, setIsOpen] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [geminiLiveResponse, setGeminiLiveResponse] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const executeInstruction = async (textToRun) => {
    const cleanText = textToRun.trim();
    if (!cleanText) return;

    // 1. Process application state command locally
    const result = processAICommand(cleanText, context);
    setFeedback(result);

    // 2. If Gemini API Key connected, call live Gemini model with full rich team context
    if (currentUser?.geminiApiKey) {
      setIsAiLoading(true);
      try {
        const teamSummary = `Club: ${activeClub?.name || 'Club'} | Mánager: ${activeClub?.managerName || 'Mánager'} | Estadio: ${activeClub?.stadium || 'Estadio'} | Temporada: ${activeSeason?.year || '2024/25'} | Balance: ${clubTotalWins}V - ${clubTotalDraws}E - ${clubTotalLosses}D (% Victorias: ${computedWinRate}%) | Contexto Temporada: ${activeSeason?.narrativeContext || 'En curso'} | Jugadores Clave: ${(currentPlayers || []).slice(0, 5).map(p => p.name).join(', ')}`;
        
        const systemPrompt = `Eres el Director Deportivo y Asistente Técnico jefe en EA FC para el club.
Contexto actual del club: ${teamSummary}.
Responde en español de forma concisa, profesional y entusiasta, aconsejando tácticamente o valorando la orden ejecutada.`;

        const liveReply = await callGeminiLiveAPI(
          currentUser.geminiApiKey,
          cleanText,
          systemPrompt
        );
        setGeminiLiveResponse(liveReply);
      } catch (err) {
        console.warn("Live Gemini Error:", err);
      }
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!instruction.trim()) return;
    const toRun = instruction;
    setInstruction('');
    await executeInstruction(toRun);
  };

  const handleMicClick = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;

      setIsListening(true);

      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        setInstruction(transcript);
        setIsListening(false);
        await executeInstruction(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } else {
      alert("El micrófono no está soportado en este navegador.");
    }
  };

  const samplePrompts = [
    "Contexto de temporada: Llegamos en puesto 14 a salvar el descenso",
    "Ficha a Bellingham por 90M del Dortmund",
    "Cambia el entrenador a Héctor y estadio a San Mamés",
    "Cambia la formación a 4-3-3",
    "Sumar victoria",
    "Pon el MVP a Bellingham"
  ];

  return (
    <>
      {/* Floating Magic AI Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center space-x-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black text-xs shadow-2xl shadow-emerald-500/40 hover:scale-105 transition-all duration-300 border border-white/20"
      >
        <Sparkles className="w-4 h-4 text-slate-950" />
        <span>ASISTENTE IA</span>
        {currentUser?.geminiApiKey && <Key className="w-3 h-3 text-slate-950 fill-slate-950" />}
      </button>

      {/* AI Assistant Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-extrabold text-sm sm:text-base text-white">Director Deportivo & Asistente IA</h3>
                    {currentUser?.geminiApiKey ? (
                      <span className="text-[9px] font-black text-amber-400 bg-amber-950 border border-amber-500/30 px-1.5 py-0.5 rounded">
                        Gemini Live ⚡
                      </span>
                    ) : (
                      <button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="text-[9px] font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-1.5 py-0.5 rounded hover:bg-cyan-900"
                      >
                        + Conectar API Key
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-emerald-400 font-semibold">Procesador de Órdenes en Español & Voz</p>
                </div>
              </div>

              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              
              {/* Feedback Alert Toast */}
              {feedback && (
                <div className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-start space-x-3 transition-all ${
                  feedback.success 
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200' 
                    : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
                }`}>
                  {feedback.success ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
                  <div>
                    <p className="font-bold text-sm">{feedback.success ? "¡Acción Ejecutada!" : "Atención"}</p>
                    <p className="mt-0.5">{feedback.message}</p>
                  </div>
                </div>
              )}

              {/* Gemini Live API Reply */}
              {geminiLiveResponse && (
                <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-2xl text-amber-200 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Análisis del Director Deportivo (Gemini IA):</span>
                  </span>
                  <p className="italic leading-relaxed">{geminiLiveResponse}</p>
                </div>
              )}

              <p className="text-xs text-slate-300">
                Escribe o háblale a la IA para modificar el club, definir el contexto de temporada, fichar jugadores, registrar resultados o cambiar tácticas:
              </p>

              {/* Sample Prompts */}
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase font-bold text-slate-500">Sugerencias rápidas:</p>
                <div className="flex flex-wrap gap-1.5">
                  {samplePrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => executeInstruction(prompt)}
                      className="text-[11px] bg-slate-950 border border-slate-800 hover:border-emerald-500/50 px-2.5 py-1 rounded-full text-slate-300 hover:text-emerald-300 transition-all text-left"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="pt-2 flex items-center space-x-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Ej. Contexto de temporada: Peleando el título..."
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-white focus:outline-none focus:border-emerald-500 shadow-inner"
                  />
                  
                  <button
                    type="button"
                    onClick={handleMicClick}
                    title="Voz a texto"
                    className={`absolute right-3 top-2.5 p-1 rounded-full transition-all ${
                      isListening ? 'text-rose-400 animate-pulse bg-rose-500/20' : 'text-slate-400 hover:text-emerald-400'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isAiLoading}
                  className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-1 shrink-0 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">{isAiLoading ? 'Pensando...' : 'Ejecutar'}</span>
                </button>
              </form>

            </div>

          </div>
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};
