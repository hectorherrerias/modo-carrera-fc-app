import React, { useState, useRef } from 'react';
import { Move, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Plus, ArrowUpDown, Swords, Shield } from 'lucide-react';

export const FORMATION_PRESETS = {
  "4-2-3-1 (Estrecho)": [
    { pos: "POR", x: 50, y: 7 },
    { pos: "LD",  x: 84, y: 22 },
    { pos: "DFC", x: 62, y: 19 },
    { pos: "DFC", x: 38, y: 19 },
    { pos: "LI",  x: 16, y: 22 },
    { pos: "MCD", x: 63, y: 38 },
    { pos: "MC",  x: 37, y: 38 },
    { pos: "ED",  x: 82, y: 64 },
    { pos: "MCO", x: 50, y: 60 },
    { pos: "EI",  x: 18, y: 64 },
    { pos: "DC",  x: 50, y: 84 }
  ],
  "4-2-3-1 (Ancho)": [
    { pos: "POR", x: 50, y: 7 },
    { pos: "LD",  x: 88, y: 22 },
    { pos: "DFC", x: 62, y: 19 },
    { pos: "DFC", x: 38, y: 19 },
    { pos: "LI",  x: 12, y: 22 },
    { pos: "MCD", x: 64, y: 36 },
    { pos: "MCD", x: 36, y: 36 },
    { pos: "MD",  x: 88, y: 62 },
    { pos: "MCO", x: 50, y: 60 },
    { pos: "MI",  x: 12, y: 62 },
    { pos: "DC",  x: 50, y: 84 }
  ],
  "4-3-3 (Ofensivo)": [
    { pos: "POR", x: 50, y: 7 },
    { pos: "LD",  x: 85, y: 22 },
    { pos: "DFC", x: 62, y: 19 },
    { pos: "DFC", x: 38, y: 19 },
    { pos: "LI",  x: 15, y: 22 },
    { pos: "MC",  x: 68, y: 44 },
    { pos: "MC",  x: 32, y: 44 },
    { pos: "MCO", x: 50, y: 62 },
    { pos: "ED",  x: 84, y: 78 },
    { pos: "EI",  x: 16, y: 78 },
    { pos: "DC",  x: 50, y: 86 }
  ],
  "4-3-3 (Contención)": [
    { pos: "POR", x: 50, y: 7 },
    { pos: "LD",  x: 85, y: 22 },
    { pos: "DFC", x: 62, y: 19 },
    { pos: "DFC", x: 38, y: 19 },
    { pos: "LI",  x: 15, y: 22 },
    { pos: "MCD", x: 63, y: 36 },
    { pos: "MCD", x: 37, y: 36 },
    { pos: "MC",  x: 50, y: 54 },
    { pos: "ED",  x: 84, y: 78 },
    { pos: "EI",  x: 16, y: 78 },
    { pos: "DC",  x: 50, y: 86 }
  ],
  "4-3-3 (Falso 9)": [
    { pos: "POR", x: 50, y: 7 },
    { pos: "LD",  x: 85, y: 22 },
    { pos: "DFC", x: 62, y: 19 },
    { pos: "DFC", x: 38, y: 19 },
    { pos: "LI",  x: 15, y: 22 },
    { pos: "MCD", x: 50, y: 36 },
    { pos: "MC",  x: 68, y: 52 },
    { pos: "MC",  x: 32, y: 52 },
    { pos: "ED",  x: 85, y: 82 },
    { pos: "EI",  x: 15, y: 82 },
    { pos: "SD",  x: 50, y: 70 }
  ],
  "4-3-3 (Plano)": [
    { pos: "POR", x: 50, y: 7 },
    { pos: "LD",  x: 85, y: 22 },
    { pos: "DFC", x: 62, y: 19 },
    { pos: "DFC", x: 38, y: 19 },
    { pos: "LI",  x: 15, y: 22 },
    { pos: "MC",  x: 72, y: 46 },
    { pos: "MC",  x: 50, y: 44 },
    { pos: "MC",  x: 28, y: 46 },
    { pos: "ED",  x: 84, y: 78 },
    { pos: "EI",  x: 16, y: 78 },
    { pos: "DC",  x: 50, y: 86 }
  ],
  "4-4-2 (Plano)": [
    { pos: "POR", x: 50, y: 7 },
    { pos: "LD",  x: 85, y: 20 },
    { pos: "DFC", x: 62, y: 18 },
    { pos: "DFC", x: 38, y: 18 },
    { pos: "LI",  x: 15, y: 20 },
    { pos: "MD",  x: 84, y: 50 },
    { pos: "MC",  x: 62, y: 44 },
    { pos: "MC",  x: 38, y: 44 },
    { pos: "MI",  x: 16, y: 50 },
    { pos: "DC",  x: 64, y: 80 },
    { pos: "DC",  x: 36, y: 80 }
  ],
  "4-1-2-1-2 (Rombo Estrecho)": [
    { pos: "POR", x: 50, y: 7 },
    { pos: "LD",  x: 85, y: 22 },
    { pos: "DFC", x: 62, y: 19 },
    { pos: "DFC", x: 38, y: 19 },
    { pos: "LI",  x: 15, y: 22 },
    { pos: "MCD", x: 50, y: 35 },
    { pos: "MC",  x: 68, y: 48 },
    { pos: "MC",  x: 32, y: 48 },
    { pos: "MCO", x: 50, y: 64 },
    { pos: "DC",  x: 64, y: 84 },
    { pos: "DC",  x: 36, y: 84 }
  ],
  "4-3-2-1 (Navidad)": [
    { pos: "POR", x: 50, y: 7 },
    { pos: "LD",  x: 85, y: 22 },
    { pos: "DFC", x: 62, y: 19 },
    { pos: "DFC", x: 38, y: 19 },
    { pos: "LI",  x: 15, y: 22 },
    { pos: "MC",  x: 72, y: 42 },
    { pos: "MC",  x: 50, y: 40 },
    { pos: "MC",  x: 28, y: 42 },
    { pos: "SDO", x: 64, y: 65 },
    { pos: "SDO", x: 36, y: 65 },
    { pos: "DC",  x: 50, y: 85 }
  ],
  "4-3-1-2": [
    { pos: "POR", x: 50, y: 7 },
    { pos: "LD",  x: 85, y: 22 },
    { pos: "DFC", x: 62, y: 19 },
    { pos: "DFC", x: 38, y: 19 },
    { pos: "LI",  x: 15, y: 22 },
    { pos: "MC",  x: 72, y: 42 },
    { pos: "MC",  x: 50, y: 40 },
    { pos: "MC",  x: 28, y: 42 },
    { pos: "MCO", x: 50, y: 62 },
    { pos: "DC",  x: 64, y: 84 },
    { pos: "DC",  x: 36, y: 84 }
  ],
  "3-5-2": [
    { pos: "POR", x: 50, y: 7 },
    { pos: "DFC", x: 75, y: 18 },
    { pos: "DFC", x: 50, y: 16 },
    { pos: "DFC", x: 25, y: 18 },
    { pos: "CAD", x: 86, y: 46 },
    { pos: "MCD", x: 62, y: 36 },
    { pos: "MCD", x: 38, y: 36 },
    { pos: "CAI", x: 14, y: 46 },
    { pos: "MCO", x: 50, y: 60 },
    { pos: "DC",  x: 64, y: 82 },
    { pos: "DC",  x: 36, y: 82 }
  ],
  "3-4-3": [
    { pos: "POR", x: 50, y: 7 },
    { pos: "DFC", x: 75, y: 18 },
    { pos: "DFC", x: 50, y: 16 },
    { pos: "DFC", x: 25, y: 18 },
    { pos: "MD",  x: 86, y: 48 },
    { pos: "MC",  x: 62, y: 44 },
    { pos: "MC",  x: 38, y: 44 },
    { pos: "MI",  x: 14, y: 48 },
    { pos: "ED",  x: 82, y: 78 },
    { pos: "EI",  x: 18, y: 78 },
    { pos: "DC",  x: 50, y: 84 }
  ],
  "5-2-1-2": [
    { pos: "POR", x: 50, y: 7 },
    { pos: "CAD", x: 86, y: 24 },
    { pos: "DFC", x: 68, y: 18 },
    { pos: "DFC", x: 50, y: 16 },
    { pos: "DFC", x: 32, y: 18 },
    { pos: "CAI", x: 14, y: 24 },
    { pos: "MC",  x: 63, y: 40 },
    { pos: "MC",  x: 37, y: 40 },
    { pos: "MCO", x: 50, y: 60 },
    { pos: "DC",  x: 64, y: 82 },
    { pos: "DC",  x: 36, y: 82 }
  ],
  "5-3-2": [
    { pos: "POR", x: 50, y: 7 },
    { pos: "CAD", x: 86, y: 24 },
    { pos: "DFC", x: 68, y: 18 },
    { pos: "DFC", x: 50, y: 16 },
    { pos: "DFC", x: 32, y: 18 },
    { pos: "CAI", x: 14, y: 24 },
    { pos: "MC",  x: 72, y: 45 },
    { pos: "MCD", x: 50, y: 38 },
    { pos: "MC",  x: 28, y: 45 },
    { pos: "DC",  x: 64, y: 82 },
    { pos: "DC",  x: 36, y: 82 }
  ],
  "5-4-1": [
    { pos: "POR", x: 50, y: 7 },
    { pos: "CAD", x: 86, y: 24 },
    { pos: "DFC", x: 68, y: 18 },
    { pos: "DFC", x: 50, y: 16 },
    { pos: "DFC", x: 32, y: 18 },
    { pos: "CAI", x: 14, y: 24 },
    { pos: "MD",  x: 84, y: 52 },
    { pos: "MC",  x: 62, y: 46 },
    { pos: "MC",  x: 38, y: 46 },
    { pos: "MI",  x: 16, y: 52 },
    { pos: "DC",  x: 50, y: 84 }
  ]
};

export const FootballPitch = ({ 
  tactics, 
  players, 
  phase = 'ofensive', 
  onSelectSlot, 
  onSwapStarterSub, 
  onUpdatePositionCoords, 
  onResetCoords 
}) => {
  const pitchRef = useRef(null);

  const formationKey = tactics?.formation || (phase === 'ofensive' ? "4-2-3-1 (Estrecho)" : "4-4-2 (Plano)");
  const style = tactics?.style || (phase === 'ofensive' ? "Posesión" : "Presión tras Pérdida");
  const startingXI = tactics?.startingXI || [];

  const baseSlots = FORMATION_PRESETS[formationKey] || FORMATION_PRESETS["4-2-3-1 (Estrecho)"];
  const [activeDraggingIdx, setActiveDraggingIdx] = useState(null);

  const handleNudge = (idx, dx, dy) => {
    if (!onUpdatePositionCoords) return;
    const currentCustom = startingXI[idx]?.customPos;
    const base = baseSlots[idx] || { x: 50, y: 50 };

    const currX = currentCustom ? currentCustom.x : base.x;
    const currY = currentCustom ? currentCustom.y : base.y;

    const newX = Math.min(92, Math.max(8, currX + dx));
    const newY = Math.min(92, Math.max(5, currY + dy));

    onUpdatePositionCoords(idx, { x: newX, y: newY });
  };

  const handlePointerDown = (e, index) => {
    e.stopPropagation();
    setActiveDraggingIdx(index);
  };

  const handlePointerMove = (e) => {
    if (activeDraggingIdx === null || !pitchRef.current || !onUpdatePositionCoords) return;
    
    const rect = pitchRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);

    if (clientX === undefined || clientY === undefined) return;

    const relX = ((clientX - rect.left) / rect.width) * 100;
    const relY = ((rect.bottom - clientY) / rect.height) * 100;

    const clampedX = Math.min(92, Math.max(8, Math.round(relX)));
    const clampedY = Math.min(92, Math.max(5, Math.round(relY)));

    onUpdatePositionCoords(activeDraggingIdx, { x: clampedX, y: clampedY });
  };

  const handlePointerUp = () => {
    setActiveDraggingIdx(null);
  };

  const isOfensive = phase === 'ofensive';

  return (
    <div 
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className={`relative w-full max-w-4xl mx-auto rounded-3xl overflow-hidden border-2 transition-colors duration-300 shadow-2xl p-4 sm:p-6 select-none ${
        isOfensive 
          ? 'border-emerald-500/40 shadow-emerald-950/50 bg-gradient-to-b from-emerald-950 via-pitch-dark to-slate-950' 
          : 'border-cyan-500/40 shadow-cyan-950/50 bg-gradient-to-b from-cyan-950 via-pitch-dark to-slate-950'
      }`}
    >
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 px-2">
        <div className="flex items-center space-x-2 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700 shadow-lg">
          {isOfensive ? (
            <>
              <Swords className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">Fase Ofensiva (Con Balón)</span>
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">Fase Defensiva (Sin Balón)</span>
            </>
          )}
          <span className="text-slate-600">•</span>
          <span className="text-xs text-slate-300 font-semibold">{style}</span>
        </div>

        <div className="flex items-center space-x-2">
          {onResetCoords && (
            <button
              onClick={onResetCoords}
              title="Restablecer alineación de esta fase"
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Restablecer Fase</span>
            </button>
          )}

          <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 shadow-lg">
            <span className="text-xs font-extrabold text-amber-400">{formationKey}</span>
          </div>
        </div>
      </div>

      {/* The Grass Pitch */}
      <div 
        ref={pitchRef}
        className="relative w-full aspect-[3/4.2] sm:aspect-[4/4.8] rounded-2xl bg-gradient-to-b from-pitch-grass via-pitch-dark to-pitch-grass border border-emerald-500/20 shadow-inner overflow-hidden flex flex-col justify-between"
      >
        
        {/* Grass texture & lines */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.35)_100%)]"></div>
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[repeating-linear-gradient(0deg,#fff,#fff_45px,transparent_45px,transparent_90px)]"></div>

        {/* Pitch Lines */}
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
          <div className="relative w-full flex justify-center">
            <div className="w-1/2 h-16 border-b border-x border-pitch-line rounded-b-md flex justify-center items-start">
              <div className="w-1/4 h-6 border-b border-x border-pitch-line"></div>
            </div>
            <div className="absolute top-16 w-24 h-12 border-b border-pitch-line rounded-b-full"></div>
          </div>

          <div className="relative w-full border-t border-pitch-line flex items-center justify-center">
            <div className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full border border-pitch-line flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white/60"></div>
            </div>
          </div>

          <div className="relative w-full flex justify-center">
            <div className="absolute bottom-16 w-24 h-12 border-t border-pitch-line rounded-t-full"></div>
            <div className="w-1/2 h-16 border-t border-x border-pitch-line rounded-t-md flex justify-center items-end">
              <div className="w-1/4 h-6 border-t border-x border-pitch-line"></div>
            </div>
          </div>
        </div>

        {/* Player Nodes Layer with Free Drag Coordinates */}
        <div className="absolute inset-0 z-10">
          {baseSlots.map((baseSlot, index) => {
            const assignedItem = startingXI[index] || { position: baseSlot.pos, playerName: "", substitutes: [] };
            const starterPlayer = players.find(p => p.name.toLowerCase() === assignedItem.playerName?.toLowerCase());

            const posX = assignedItem.customPos ? assignedItem.customPos.x : baseSlot.x;
            const posY = assignedItem.customPos ? assignedItem.customPos.y : baseSlot.y;

            const positionSubs = (assignedItem.substitutes || []).map(subName => {
              return players.find(p => p.name.toLowerCase() === subName.toLowerCase()) || { name: subName, overall: 75 };
            });

            const positionLabel = assignedItem.position || baseSlot.pos;
            const starterName = assignedItem.playerName || "Sin asignar";
            const overall = starterPlayer ? starterPlayer.overall : (assignedItem.playerName ? 75 : "--");

            return (
              <div
                key={index}
                style={{
                  left: `${posX}%`,
                  bottom: `${posY}%`,
                  transform: 'translate(-50%, 50%)'
                }}
                className="absolute flex flex-col items-center group transition-all duration-75"
              >
                
                {/* Drag Handle & Directional Arrows Overlay on Hover */}
                <div className="absolute -top-7 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/90 border border-amber-500/40 rounded-full px-1.5 py-0.5 z-30 shadow-lg">
                  <button onClick={() => handleNudge(index, 0, 4)} title="Adelantar" className="text-slate-300 hover:text-amber-400 p-0.5">
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button onClick={() => handleNudge(index, 0, -4)} title="Retrasar" className="text-slate-300 hover:text-amber-400 p-0.5">
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button onClick={() => handleNudge(index, -4, 0)} title="Abrir Izquierda" className="text-slate-300 hover:text-amber-400 p-0.5">
                    <ArrowLeft className="w-3 h-3" />
                  </button>
                  <button onClick={() => handleNudge(index, 4, 0)} title="Abrir Derecha" className="text-slate-300 hover:text-amber-400 p-0.5">
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* STARTER NODE */}
                <div 
                  onPointerDown={(e) => handlePointerDown(e, index)}
                  onClick={() => onSelectSlot && onSelectSlot(index, baseSlot, assignedItem)}
                  className={`relative flex flex-col items-center cursor-grab active:cursor-grabbing transition-transform ${
                    activeDraggingIdx === index ? 'scale-110 z-30 shadow-2xl' : 'hover:scale-105'
                  }`}
                >
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase shadow-md mb-0.5 flex items-center space-x-1 ${
                    isOfensive 
                      ? 'bg-slate-950/90 text-emerald-400 border-emerald-500/40' 
                      : 'bg-slate-950/90 text-cyan-400 border-cyan-500/40'
                  }`}>
                    <Move className="w-2.5 h-2.5 text-amber-400 opacity-60" />
                    <span>{positionLabel}</span>
                  </span>

                  <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border-2 shadow-xl ${
                    starterPlayer 
                      ? isOfensive 
                        ? 'bg-gradient-to-tr from-slate-900 to-slate-800 border-emerald-400 shadow-emerald-950'
                        : 'bg-gradient-to-tr from-slate-900 to-slate-800 border-cyan-400 shadow-cyan-950'
                      : 'bg-slate-900/90 border-slate-700'
                  }`}>
                    <span className="font-black text-xs sm:text-sm text-white">
                      {overall}
                    </span>
                  </div>

                  <div className="mt-1 bg-slate-950/90 backdrop-blur-md px-2 py-0.5 rounded-full border border-slate-800 shadow-md max-w-[85px] sm:max-w-[105px] truncate text-center">
                    <p className="text-[10px] font-bold text-white truncate">
                      {starterName}
                    </p>
                  </div>
                </div>

                {/* RECUADRO DE SUPLENTES POR POSICIÓN */}
                <div className="mt-1 w-24 sm:w-28 bg-slate-950/95 border border-cyan-500/40 rounded-xl p-1 shadow-2xl backdrop-blur-md">
                  <div className="flex justify-between items-center text-[8px] uppercase font-black text-cyan-400 border-b border-slate-800 pb-0.5 mb-1 px-1">
                    <span>SUPLENTES</span>
                    <button
                      onClick={() => onSelectSlot && onSelectSlot(index, baseSlot, assignedItem, true)}
                      title="Añadir/Editar Suplentes"
                      className="text-slate-400 hover:text-cyan-300"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  {positionSubs.length === 0 ? (
                    <div 
                      onClick={() => onSelectSlot && onSelectSlot(index, baseSlot, assignedItem, true)}
                      className="text-[9px] text-slate-500 text-center py-0.5 cursor-pointer hover:text-cyan-300 font-medium"
                    >
                      + Añadir suplente
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-16 overflow-y-auto scrollbar-none">
                      {positionSubs.map((sub, sIdx) => (
                        <div
                          key={sIdx}
                          onClick={() => onSwapStarterSub && onSwapStarterSub(index, sub.name)}
                          title="Haz clic para poner de Titular"
                          className="bg-slate-900 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/50 rounded px-1.5 py-0.5 flex items-center justify-between cursor-pointer transition-all"
                        >
                          <span className="text-[9px] font-bold text-slate-200 truncate max-w-[60px]">
                            {sub.name}
                          </span>
                          <div className="flex items-center space-x-0.5 text-amber-400 text-[9px] font-bold">
                            <span>{sub.overall || '--'}</span>
                            <ArrowUpDown className="w-2 h-2 text-cyan-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>

      <div className="mt-3 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 px-2 gap-1">
        <span className="flex items-center space-x-1">
          <Move className="w-3.5 h-3.5 text-amber-400" />
          <span>Estructura de la <strong className={isOfensive ? 'text-emerald-400' : 'text-cyan-400'}>{isOfensive ? 'Fase Ofensiva (Ataque)' : 'Fase Defensiva (Defensa)'}</strong>. Arrastra a cualquier jugador para personalizar su puesto.</span>
        </span>
      </div>

    </div>
  );
};
