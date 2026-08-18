/**
 * AI Natural Language Command Processor for Career Mode Tracker
 * Parses Spanish instructions and applies actions directly to AppContext state.
 */

export const processAICommand = (instruction, context) => {
  const text = instruction.toLowerCase().trim();
  const { 
    activeClub, activeSeason, currentPlayers, 
    addPlayer, updatePlayerStats, deletePlayer, 
    updatePhaseTactics, addTransfer, updateClub, 
    updateSeasonNarrative, recordMatchResult,
    updateAwards, setData 
  } = context;

  if (!text) {
    return { success: false, message: "Por favor, escribe una instrucción para la IA." };
  }

  // 1. UPDATE SEASON NARRATIVE CONTEXT
  if (text.includes("contexto de temporada") || text.includes("hilo de temporada") || text.includes("situación de temporada") || text.includes("situacion de temporada")) {
    const match = text.match(/(?:contexto de temporada|hilo de temporada|situación de temporada|situacion de temporada)\s+(?:a|es|como|:)?\s*(.+)/i);
    if (match && match[1]) {
      const newNarrative = match[1].trim();
      updateSeasonNarrative(newNarrative);
      return { success: true, message: `🎙️ Contexto de temporada actualizado a: "${newNarrative}". Las ruedas de prensa seguirán este hilo.` };
    }
  }

  // 2. EDIT CLUB / MANAGER / STADIUM
  if (text.includes("mánager") || text.includes("manager") || text.includes("entrenador") || text.includes("dt ")) {
    const match = text.match(/(?:mánager|manager|entrenador|dt)\s+(?:a|es|por)\s+([a-záéíóúñ\s]+)/i) ||
                  text.match(/(?:cambia|pon)\s+(?:el|al)\s+(?:mánager|manager|entrenador)\s+a\s+([a-záéíóúñ\s]+)/i);
    if (match && match[1]) {
      const newManager = match[1].trim();
      updateClub(activeClub.id, { managerName: newManager });
      return { success: true, message: `✨ Entrenador actualizado a "${newManager}".` };
    }
  }

  if (text.includes("estadio") || text.includes("campo")) {
    const match = text.match(/(?:estadio|campo)\s+(?:a|es|por)\s+([a-záéíóúñ\s]+)/i) ||
                  text.match(/(?:cambia|pon)\s+(?:el)\s+(?:estadio|campo)\s+a\s+([a-záéíóúñ\s]+)/i);
    if (match && match[1]) {
      const newStadium = match[1].trim();
      updateClub(activeClub.id, { stadium: newStadium });
      return { success: true, message: `✨ Estadio del club actualizado a "${newStadium}".` };
    }
  }

  if (text.includes("nombre del club") || text.includes("nombre de club")) {
    const match = text.match(/nombre del club\s+a\s+([a-záéíóúñ\s]+)/i);
    if (match && match[1]) {
      const newName = match[1].trim();
      updateClub(activeClub.id, { name: newName });
      return { success: true, message: `✨ Nombre del club actualizado a "${newName}".` };
    }
  }

  // 3. MATCH RESULTS (W-D-L)
  if (text.includes("ganamos") || text.includes("victoria") || text.includes("sumar victoria")) {
    recordMatchResult('win', 1);
    return { success: true, message: "⚽ ¡Victoria registrada en el casillero de la temporada (+1 Victoria)!" };
  }
  if (text.includes("empatamos") || text.includes("empate") || text.includes("sumar empate")) {
    recordMatchResult('draw', 1);
    return { success: true, message: "🤝 Empate registrado en el casillero (+1 Empate)." };
  }
  if (text.includes("perdimos") || text.includes("derrota") || text.includes("sumar derrota")) {
    recordMatchResult('loss', 1);
    return { success: true, message: "📉 Derrota registrada en el casillero (+1 Derrota)." };
  }

  // 4. CLEAR ALL PLAYERS / VACIAR PLANTILLA
  if (text.includes("elimina todos los jugadores") || text.includes("vaciar plantilla") || text.includes("borra la plantilla")) {
    setData(prev => ({
      ...prev,
      players: prev.players.filter(p => p.seasonId !== activeSeason.id)
    }));
    return { success: true, message: "🗑️ Se han eliminado todos los jugadores de la plantilla." };
  }

  // 5. TRANSFER SIGNINGS / FICHAJES
  if (text.includes("ficha a") || text.includes("fichar a") || text.includes("comprar a") || text.includes("compra a")) {
    const nameMatch = text.match(/(?:ficha a|fichar a|comprar a|compra a)\s+([a-záéíóúñ\s\.\'-]+?)(?=\s+(?:por|de|con|del|$))/i);
    const playerName = nameMatch ? nameMatch[1].trim() : "Nuevo Jugador";

    // Extract fee
    const feeMatch = text.match(/(\d+)\s*(?:m|millones|€)/i);
    const fee = feeMatch ? Number(feeMatch[1]) * 1000000 : 0;

    // Extract OVR
    const ovrMatch = text.match(/(?:media|ovr|grl)\s*(\d+)/i) || text.match(/(\d+)\s*(?:de media|de ovr)/i);
    const overall = ovrMatch ? Number(ovrMatch[1]) : 78;

    // Extract Position
    const posMatch = text.match(/\b(por|ld|dfc|li|mcd|mc|mco|ed|ei|dc|cad|cai|md|mi)\b/i);
    const position = posMatch ? posMatch[1].toUpperCase() : "DC";

    // Extract Club origin
    const originMatch = text.match(/(?:del|desde|de)\s+([a-záéíóúñ\s]+)$/i);
    const origin = originMatch ? originMatch[1].trim() : "Club Vendedor";

    addPlayer({
      name: capitalizeName(playerName),
      position: position,
      overall: overall
    });

    addTransfer({
      playerName: capitalizeName(playerName),
      type: 'Fichaje',
      fee: fee,
      fromTo: origin
    });

    return { 
      success: true, 
      message: `✅ ¡Fichaje completado! ${capitalizeName(playerName)} (${position}, GRL ${overall}) añadido a la plantilla por €${fee.toLocaleString()}.` 
    };
  }

  // 6. ADD PLAYER (CREAR JUGADOR)
  if (text.includes("añade un jugador") || text.includes("añadir jugador") || text.includes("crea un jugador") || text.includes("crear jugador")) {
    const nameMatch = text.match(/(?:llamado|nombre)?\s*([a-záéíóúñ\s\.\'-]+?)(?=\s+(?:de|con|por|$))/i);
    const playerName = nameMatch ? nameMatch[1].replace(/^(un jugador|jugador|llamado)/i, '').trim() : "Nuevo Jugador";

    const posMatch = text.match(/\b(por|ld|dfc|li|mcd|mc|mco|ed|ei|dc|cad|cai|md|mi)\b/i);
    const position = posMatch ? posMatch[1].toUpperCase() : "DC";

    const ovrMatch = text.match(/(?:media|ovr|grl)\s*(\d+)/i) || text.match(/(\d+)\s*(?:de media|de ovr)/i);
    const overall = ovrMatch ? Number(ovrMatch[1]) : 75;

    addPlayer({
      name: capitalizeName(playerName),
      position: position,
      overall: overall
    });

    return {
      success: true,
      message: `👤 Jugador ${capitalizeName(playerName)} (${position}, GRL ${overall}) creado y añadido a la plantilla.`
    };
  }

  // 7. UPDATE PLAYER STATS (GOALS, ASSISTS, MATCHES)
  if (text.includes("gol") || text.includes("asistencia") || text.includes("partido") || text.includes("minuto")) {
    const numMatch = text.match(/(\d+)/);
    const amount = numMatch ? Number(numMatch[1]) : 1;

    const targetPlayer = currentPlayers.find(p => text.includes(p.name.toLowerCase()));
    
    if (targetPlayer) {
      const currentStats = targetPlayer.stats || { minutes: 0, matches: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0 };
      let updatedField = "";

      if (text.includes("gol")) {
        currentStats.goals += amount;
        updatedField = `${amount} gol(es)`;
      } else if (text.includes("asistencia")) {
        currentStats.assists += amount;
        updatedField = `${amount} asistencia(s)`;
      } else if (text.includes("partido")) {
        currentStats.matches += amount;
        updatedField = `${amount} partido(s)`;
      } else if (text.includes("minuto")) {
        currentStats.minutes += amount;
        updatedField = `${amount} minuto(s)`;
      }

      updatePlayerStats(targetPlayer.id, { stats: currentStats });
      return {
        success: true,
        message: `⚽ Estadísticas actualizadas: Se agregaron ${updatedField} a ${targetPlayer.name}.`
      };
    }
  }

  // 8. FORMATION & TACTICS
  if (text.includes("formación") || text.includes("formacion")) {
    const formMatch = text.match(/\b(4-2-3-1|4-3-3|4-4-2|3-5-2|5-2-1-2|4-1-2-1-2|3-4-3)\b/i);
    if (formMatch) {
      const newForm = formMatch[1];
      updatePhaseTactics('ofensive', { formation: newForm });
      return { success: true, message: `📋 Formación táctica ofensiva cambiada a ${newForm}.` };
    }
  }

  // 9. AWARDS
  if (text.includes("mvp")) {
    const mvpMatch = text.match(/mvp\s+(?:a|es|por)?\s*([a-záéíóúñ\s]+)/i);
    if (mvpMatch) {
      const mvpName = capitalizeName(mvpMatch[1].trim());
      updateAwards({ mvp: mvpName });
      return { success: true, message: `🏆 MVP de la temporada asignado a ${mvpName}.` };
    }
  }

  // Fallback advice
  return {
    success: false,
    message: `🤖 Prueba con órdenes como: "Contexto de temporada: Luchando por la permanencia en puesto 14", "Ficha a Bellingham por 90M", "Sumar victoria", "Añade 2 goles a Haller" o "Cambia la formación a 4-3-3".`
  };
};

function capitalizeName(str) {
  if (!str) return '';
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}
