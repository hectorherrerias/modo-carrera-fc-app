import React, { useState } from 'react';
import { Sparkles, Check, HeartPulse, ShieldCheck, UserCheck, X, ChevronRight, ChevronLeft, Calendar } from 'lucide-react';
import { formatDateSpanish } from '../../utils/injuryHelper';

export const PlayerRecoveryModal = ({ isOpen, recoveredPlayers = [], onClose, clubName = 'Tu Club' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen || !recoveredPlayers || recoveredPlayers.length === 0) return null;

  const currentPlayer = recoveredPlayers[currentIndex] || recoveredPlayers[0];
  const isMultiple = recoveredPlayers.length > 1;

  const handleNext = () => {
    if (currentIndex < recoveredPlayers.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const injuryType = currentPlayer.injuryDetails?.injuryType || currentPlayer.injury?.injuryType || 'Lesión muscular';
  const durationLabel = currentPlayer.injuryDetails?.durationLabel || currentPlayer.injury?.durationLabel || 'tiempo de baja';
  const returnDateStr = currentPlayer.injuryDetails?.expectedReturnDate || currentPlayer.injury?.expectedReturnDate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/40 rounded-3xl shadow-2xl shadow-emerald-500/10 overflow-hidden flex flex-col animate-scale-up">
        
        {/* Top Decorative Glow Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 animate-pulse" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
              <HeartPulse className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>SERVICIO MÉDICO DE {clubName.toUpperCase()}</span>
              </span>
              <h3 className="font-black text-xl text-white font-outfit">
                ¡Alta Médica y Recuperación! 🎉
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Main Player Spotlight Card */}
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            
            {/* Background watermark badge */}
            <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none">
              <ShieldCheck className="w-40 h-40 text-emerald-400" />
            </div>

            <div className="flex items-center space-x-4">
              {/* OVR & Position Circle */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-950 to-slate-900 border-2 border-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <span className="text-2xl font-black text-emerald-300 font-outfit">
                    {currentPlayer.overall || 75}
                  </span>
                </div>
                <span className="mt-1 bg-slate-950 border border-slate-700 px-2 py-0.5 rounded-md text-[10px] font-black text-emerald-400 uppercase">
                  {currentPlayer.position || 'DC'}
                </span>
              </div>

              {/* Player Name & Recovery Notice */}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="text-xl font-black text-white font-outfit">
                    {currentPlayer.name}
                  </h4>
                </div>
                
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-300">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                    <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    100% Disponible
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 font-medium">Baja superada: <strong className="text-slate-200">{durationLabel}</strong></span>
                </div>
              </div>
            </div>

            {/* Medical Report Box */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Diagnóstico superado:</span>
                <strong className="text-emerald-400 font-semibold">{injuryType}</strong>
              </div>
              {returnDateStr && (
                <div className="flex items-center justify-between text-slate-400">
                  <span>Fecha de alta médica:</span>
                  <span className="flex items-center space-x-1 text-slate-200 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{formatDateSpanish(returnDateStr)}</span>
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* Narrative Info Box */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed">
            <p>
              El jugador ha completado todas las fases de rehabilitación física y entrenamientos con balón. Su estado ha sido actualizado a <strong>Disponible</strong> y ya puede ser convocado para el próximo partido.
            </p>
          </div>

          {/* Pagination Controls if multiple players recovered */}
          {isMultiple && (
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-slate-400 font-semibold">
                Jugador {currentIndex + 1} de {recoveredPlayers.length}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentIndex === recoveredPlayers.length - 1}
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-950 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 cursor-pointer transition-all hover:scale-[1.02]"
          >
            <Check className="w-4 h-4" />
            <span>{isMultiple ? 'Entendido (Cerrar Notificaciones)' : 'Incorporar a la Convocatoria'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
