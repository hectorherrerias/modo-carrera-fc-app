import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FootballPitch, FORMATION_PRESETS } from '../FootballPitch';
import { Settings, UserCheck, X, Plus, Check, Swords, Shield, Sliders, ArrowUpDown, Link2, Copy, RefreshCw } from 'lucide-react';

export const TacticsTab = () => {
  const { activeSeason, currentPlayers, updatePhaseTactics, replicateSquadAcrossPhases } = useApp();
  
  // Tactical Phase State: 'ofensive' | 'defensive'
  const [activePhase, setActivePhase] = useState('ofensive');
  const [syncBothSquads, setSyncBothSquads] = useState(true);
  const [syncToast, setSyncToast] = useState('');

  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [selectedSlotData, setSelectedSlotData] = useState(null);
  const [isManagingSubstitutes, setIsManagingSubstitutes] = useState(false);

  if (!activeSeason) return null;

  // Retrieve phase tactics or fallback
  const ofensiveTactics = activeSeason.tacticsOfensive || activeSeason.tactics || {
    formation: "4-2-3-1 (Estrecho)",
    style: "Posesión",
    width: 65,
    depth: 70,
    playersInBox: 6,
    startingXI: []
  };

  const defensiveTactics = activeSeason.tacticsDefensive || activeSeason.tactics || {
    formation: "4-4-2 (Plano)",
    style: "Presión tras Pérdida",
    width: 45,
    depth: 40,
    startingXI: []
  };

  const isOfensive = activePhase === 'ofensive';
  const currentPhaseTactics = isOfensive ? ofensiveTactics : defensiveTactics;

  const formationsList = Object.keys(FORMATION_PRESETS);
  const ofensiveStyles = ["Posesión", "Contraataque", "Balón Largo", "Pase Rápido", "Equilibrado"];
  const defensiveStyles = ["Presión tras Pérdida", "Presión Alta", "Bloque Medio", "Bloque Bajo / Repliegue", "Presión Constante"];

  const showToast = (msg) => {
    setSyncToast(msg);
    setTimeout(() => setSyncToast(''), 3000);
  };

  const handleFormationChange = (newFormation) => {
    updatePhaseTactics(activePhase, { formation: newFormation }, false);
  };

  const handleStyleChange = (newStyle) => {
    updatePhaseTactics(activePhase, { style: newStyle }, false);
  };

  const handleSliderChange = (field, val) => {
    updatePhaseTactics(activePhase, { [field]: Number(val) }, false);
  };

  const handleSlotClick = (index, slot, assignedItem, isSubMode = false) => {
    setSelectedSlotIndex(index);
    setSelectedSlotData({ slot, assignedItem });
    setIsManagingSubstitutes(isSubMode);
  };

  const handleUpdatePositionCoords = (slotIndex, coords) => {
    const newStartingXI = [...(currentPhaseTactics.startingXI || [])];
    const existingSlot = newStartingXI[slotIndex] || { position: "DC", playerName: "", substitutes: [] };

    newStartingXI[slotIndex] = {
      ...existingSlot,
      customPos: coords
    };

    updatePhaseTactics(activePhase, { startingXI: newStartingXI }, false);
  };

  const handleResetCoords = () => {
    const newStartingXI = (currentPhaseTactics.startingXI || []).map(slot => {
      const { customPos, ...rest } = slot;
      return rest;
    });

    updatePhaseTactics(activePhase, { startingXI: newStartingXI }, false);
  };

  const handleSwapStarterSub = (slotIndex, subPlayerName) => {
    const newStartingXI = [...(currentPhaseTactics.startingXI || [])];
    const currentSlot = newStartingXI[slotIndex] || { position: "DC", playerName: "", substitutes: [] };
    const oldStarterName = currentSlot.playerName;

    const newSubs = (currentSlot.substitutes || []).filter(name => name.toLowerCase() !== subPlayerName.toLowerCase());
    if (oldStarterName) newSubs.push(oldStarterName);

    newStartingXI[slotIndex] = {
      ...currentSlot,
      playerName: subPlayerName,
      substitutes: newSubs
    };

    updatePhaseTactics(activePhase, { startingXI: newStartingXI }, syncBothSquads);
    if (syncBothSquads) {
      showToast("✓ Cambio reflejado en fase ofensiva y defensiva");
    }
  };

  const handleAssignStarter = (playerName) => {
    if (selectedSlotIndex === null) return;
    const newStartingXI = [...(currentPhaseTactics.startingXI || [])];
    while (newStartingXI.length < 11) {
      newStartingXI.push({ position: "DC", playerName: "", substitutes: [] });
    }

    const slotPos = selectedSlotData.slot.pos;
    const existingSlot = newStartingXI[selectedSlotIndex] || { position: slotPos, playerName: "", substitutes: [] };

    newStartingXI[selectedSlotIndex] = {
      ...existingSlot,
      position: slotPos,
      playerName: playerName
    };

    updatePhaseTactics(activePhase, { startingXI: newStartingXI }, syncBothSquads);
    if (syncBothSquads) {
      showToast("✓ Titular sincronizado en fase ofensiva y defensiva");
    }

    setSelectedSlotIndex(null);
    setSelectedSlotData(null);
  };

  const handleToggleSubForPosition = (playerName) => {
    if (selectedSlotIndex === null) return;
    const newStartingXI = [...(currentPhaseTactics.startingXI || [])];
    const slotPos = selectedSlotData.slot.pos;
    const existingSlot = newStartingXI[selectedSlotIndex] || { position: slotPos, playerName: "", substitutes: [] };

    let currentSubs = [...(existingSlot.substitutes || [])];
    if (currentSubs.includes(playerName)) {
      currentSubs = currentSubs.filter(name => name !== playerName);
    } else {
      currentSubs.push(playerName);
    }

    newStartingXI[selectedSlotIndex] = {
      ...existingSlot,
      substitutes: currentSubs
    };

    updatePhaseTactics(activePhase, { startingXI: newStartingXI }, syncBothSquads);
    if (syncBothSquads) {
      showToast("✓ Suplentes sincronizados en ambas fases");
    }

    setSelectedSlotData({ ...selectedSlotData, assignedItem: newStartingXI[selectedSlotIndex] });
  };

  const handleManualReplicate = () => {
    replicateSquadAcrossPhases(activePhase);
    showToast(`✓ Titulares y suplentes copiados a la fase ${isOfensive ? 'defensiva' : 'ofensiva'}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Dual Phase Selector Pill Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setActivePhase('ofensive')}
            className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
              isOfensive
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/30 scale-105'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>FASE OFENSIVA (CON BALÓN)</span>
          </button>

          <button
            onClick={() => setActivePhase('defensive')}
            className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
              !isOfensive
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/30 scale-105'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>FASE DEFENSIVA (SIN BALÓN)</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-semibold px-2">
          Estructura activa: <strong className={isOfensive ? 'text-emerald-400 font-bold' : 'text-cyan-400 font-bold'}>
            {isOfensive ? 'Ataque y Construcción' : 'Defensa y Bloque'}
          </strong>
        </div>
      </div>

      {/* Auto-Replication & Squad Sync Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/90 border border-slate-800/90 rounded-2xl px-4 py-3 text-xs shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSyncBothSquads(!syncBothSquads)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              syncBothSquads 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm' 
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Sincronización Automática Ofensiva ↔ Defensiva: <strong className={syncBothSquads ? 'text-emerald-300 underline' : 'text-slate-400'}>{syncBothSquads ? 'ACTIVA' : 'DESACTIVADA'}</strong></span>
          </button>

          {syncToast && (
            <span className="text-[11px] text-emerald-400 font-bold animate-fade-in flex items-center space-x-1 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-500/30">
              <Check className="w-3.5 h-3.5" />
              <span>{syncToast}</span>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleManualReplicate}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold rounded-xl border border-slate-700 transition-all text-xs shrink-0"
        >
          <Copy className="w-3.5 h-3.5 text-cyan-400" />
          <span>Copiar 11 y Suplentes a {isOfensive ? 'Defensa' : 'Ataque'}</span>
        </button>
      </div>

      {/* Phase Settings & Sliders Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        
        {/* Top Controls: Formation & Style */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
              isOfensive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
            }`}>
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Configuración {isOfensive ? 'Ofensiva (Ataque)' : 'Defensiva (Defensa)'}
              </h3>
              <p className="text-xs text-slate-400">Ajusta el dibujo táctico y parámetros específicos de esta fase</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Formación de la Fase</label>
              <select
                value={currentPhaseTactics.formation || "4-2-3-1 (Estrecho)"}
                onChange={(e) => handleFormationChange(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-amber-400 font-bold text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-400"
              >
                {formationsList.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Estilo de Juego</label>
              <select
                value={currentPhaseTactics.style || (isOfensive ? "Posesión" : "Presión tras Pérdida")}
                onChange={(e) => handleStyleChange(e.target.value)}
                className={`bg-slate-950 border border-slate-700 font-bold text-xs rounded-lg px-3 py-1.5 focus:outline-none ${
                  isOfensive ? 'text-emerald-400 focus:border-emerald-400' : 'text-cyan-400 focus:border-cyan-400'
                }`}
              >
                {(isOfensive ? ofensiveStyles : defensiveStyles).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-300">Anchura Táctica</span>
              <span className={isOfensive ? 'text-emerald-400' : 'text-cyan-400'}>{currentPhaseTactics.width || 50} / 100</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={currentPhaseTactics.width || 50}
              onChange={(e) => handleSliderChange('width', e.target.value)}
              className="w-full accent-emerald-500 bg-slate-950 rounded-lg h-2"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-300">Profundidad de Línea</span>
              <span className={isOfensive ? 'text-emerald-400' : 'text-cyan-400'}>{currentPhaseTactics.depth || 50} / 100</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={currentPhaseTactics.depth || 50}
              onChange={(e) => handleSliderChange('depth', e.target.value)}
              className="w-full accent-cyan-500 bg-slate-950 rounded-lg h-2"
            />
          </div>

          {isOfensive && (
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-300">Jugadores en el Área</span>
                <span className="text-amber-400">{currentPhaseTactics.playersInBox || 5} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={currentPhaseTactics.playersInBox || 5}
                onChange={(e) => handleSliderChange('playersInBox', e.target.value)}
                className="w-full accent-amber-500 bg-slate-950 rounded-lg h-2"
              />
            </div>
          )}
        </div>

      </div>

      {/* Visual Pitch Render per Phase */}
      <div className="py-2">
        <FootballPitch
          tactics={currentPhaseTactics}
          players={currentPlayers}
          phase={activePhase}
          onSelectSlot={handleSlotClick}
          onSwapStarterSub={handleSwapStarterSub}
          onUpdatePositionCoords={handleUpdatePositionCoords}
          onResetCoords={handleResetCoords}
        />
      </div>

      {/* Modal for Player Assignment */}
      {selectedSlotIndex !== null && selectedSlotData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
              <div>
                <h3 className="font-bold text-sm text-white">
                  Posición: <span className={isOfensive ? 'text-emerald-400' : 'text-cyan-400'}>{selectedSlotData.slot.pos}</span>
                </h3>
                <div className="flex space-x-2 mt-1">
                  <button
                    onClick={() => setIsManagingSubstitutes(false)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-all ${
                      !isManagingSubstitutes ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    Elegir Titular
                  </button>

                  <button
                    onClick={() => setIsManagingSubstitutes(true)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-all ${
                      isManagingSubstitutes ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    Recuadro Suplentes
                  </button>
                </div>
              </div>

              <button onClick={() => setSelectedSlotIndex(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1">
              {!isManagingSubstitutes ? (
                <>
                  <p className="text-xs text-slate-400 mb-2">Selecciona el jugador **Titular** de la posición:</p>

                  <div
                    onClick={() => handleAssignStarter("")}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-rose-500/50 cursor-pointer flex justify-between items-center text-xs text-rose-400 font-bold"
                  >
                    <span>[ Dejar sin titular ]</span>
                  </div>

                  {currentPlayers.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleAssignStarter(p.name)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                        selectedSlotData.assignedItem?.playerName === p.name
                          ? 'bg-emerald-500/10 border-emerald-500 text-white'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-extrabold text-amber-400 bg-slate-900 px-2 py-1 rounded border border-slate-700">
                          {p.overall}
                        </span>
                        <div>
                          <p className="font-bold text-sm text-white">{p.name}</p>
                          <p className="text-[10px] text-slate-400">Pos: {p.position}</p>
                        </div>
                      </div>

                      {selectedSlotData.assignedItem?.playerName === p.name && (
                        <Check className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <p className="text-xs text-slate-400 mb-2">
                    Selecciona los jugadores **Suplentes** para el recuadro de esta posición ({selectedSlotData.slot.pos}):
                  </p>

                  {currentPlayers.map(p => {
                    const isSub = (selectedSlotData.assignedItem?.substitutes || []).includes(p.name);
                    const isStarter = selectedSlotData.assignedItem?.playerName === p.name;

                    return (
                      <div
                        key={p.id}
                        onClick={() => !isStarter && handleToggleSubForPosition(p.name)}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between text-xs ${
                          isStarter ? 'opacity-40 cursor-not-allowed bg-slate-950 border-slate-900' :
                          isSub ? 'bg-cyan-500/10 border-cyan-500 text-white cursor-pointer' :
                          'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="font-extrabold text-amber-400 bg-slate-900 px-2 py-1 rounded border border-slate-700">
                            {p.overall}
                          </span>
                          <div>
                            <p className="font-bold text-sm text-white">{p.name}</p>
                            <p className="text-[10px] text-slate-400">
                              {isStarter ? 'Titular de esta posición' : `Pos: ${p.position}`}
                            </p>
                          </div>
                        </div>

                        {isSub && (
                          <span className="text-cyan-400 font-bold text-[10px] bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                            En recuadro suplentes
                          </span>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
