/**
 * AI Natural Language Command Processor for Career Mode Tracker
 * Parses Spanish instructions and applies actions directly to AppContext state.
 */

export const processAICommand = (instruction, context) => {
  const text = instruction.toLowerCase().trim();
  const { 
    activeClub, activeSeason, currentPlayers, 
    addPlayer, updatePlayerStats, deletePlayer, 
    updateTactics, addTransfer, updateClub, 
    addCompetition, updateAwards, setData 
  } = context;

  if (!text) {
    return { success: false, message: "Por favor, escribe una instrucción para la IA." };
  }

  // 1. EDIT CLUB / MANAGER / STADIUM
  // Examples: "Cambia el entrenador a Héctor", "Cambia el estadio a San Mamés", "Cambia el nombre a Leganés"
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

  // 2. CLEAR ALL PLAYERS / VACIAR PLANTILLA
  if (text.includes("elimina todos los jugadores") || text.includes("vaciar plantilla") || text.includes("borra la plantilla")) {
    setData(prev => ({
      ...prev,
      players: prev.players.filter(p => p.seasonId !== activeSeason.id)
    }));
    return { success: true, message: "🗑️ Se han eliminado todos los jugadores de la plantilla." };
  }

  // 3. TRANSFER SIGNINGS / FICHAJES
  // Example: "Ficha a Bellingham por 90M del Real Madrid" or "Ficha a Mbappé de DC con media 91"
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

  // 4. ADD PLAYER (CREAR JUGADOR)
  // Example: "Añade un jugador llamado Conde de POR con media 77"
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

  // 5. UPDATE PLAYER STATS (GOALS, ASSISTS, MATCHES)
  // Example: "Añade 3 goles a Haller", "Suma 2 asistencias a Cissé", "Pon 15 partidos a Conde"
  if (text.includes("gol") || text.includes("asistencia") || text.includes("partido") || text.includes("minuto")) {
    const numMatch = text.match(/(\d+)/);
    const amount = numMatch ? Number(numMatch[1]) : 1;

    // Find player name mentioned in text
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

  // 6. FORMATION & TACTICS
  // Example: "Cambia la formación a 4-3-3", "Pon estilo Tiki Taka"
  if (text.includes("formación") || text.includes("formacion")) {
    const formMatch = text.match(/\b(4-2-3-1|4-3-3|4-4-2|3-5-2|5-2-1-2)\b/i);
    if (formMatch) {
      const newForm = formMatch[1];
      updateTactics(newForm, activeSeason.tactics?.style || "Presión Alta", activeSeason.tactics?.startingXI || []);
      return { success: true, message: `📋 Formación táctica cambiada a ${newForm}.` };
    }
  }

  if (text.includes("estilo")) {
    const styleMatch = text.match(/estilo\s+([a-záéíóúñ\s]+)/i);
    if (styleMatch) {
      const newStyle = styleMatch[1].trim();
      updateTactics(activeSeason.tactics?.formation || "4-2-3-1", capitalizeName(newStyle), activeSeason.tactics?.startingXI || []);
      return { success: true, message: `🎨 Estilo de juego actualizado a "${capitalizeName(newStyle)}".` };
    }
  }

  // 7. AWARDS & COMPETITIONS
  // Example: "Pon el MVP a Bellingham", "Añade el torneo Copa del Rey como Campeón"
  if (text.includes("mvp")) {
    const mvpMatch = text.match(/mvp\s+(?:a|es|por)?\s*([a-záéíóúñ\s]+)/i);
    if (mvpMatch) {
      const mvpName = capitalizeName(mvpMatch[1].trim());
      updateAwards({ mvp: mvpName });
      return { success: true, message: `🏆 MVP de la temporada asignado a ${mvpName}.` };
    }
  }

  if (text.includes("pichichi") || text.includes("goleador")) {
    const pichichiMatch = text.match(/(?:pichichi|goleador)\s+(?:a|es|por)?\s*([a-záéíóúñ\s]+)/i);
    if (pichichiMatch) {
      const name = capitalizeName(pichichiMatch[1].trim());
      updateAwards({ topScorer: name });
      return { success: true, message: `👟 Máximo Goleador (Pichichi) asignado a ${name}.` };
    }
  }

  // Generic fallback if not matched specifically
  return {
    success: false,
    message: `🤖 Entendido. Prueba con órdenes como: "Ficha a Bellingham por 90M", "Cambia el entrenador a Héctor", "Añade 3 goles a Haller" o "Cambia la formación a 4-3-3".`
  };
};

function capitalizeName(str) {
  if (!str) return '';
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}
