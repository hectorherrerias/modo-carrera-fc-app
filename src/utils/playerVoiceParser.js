/**
 * Voice & Speech Dictation Parser for Player Creation
 * Extracts Name, Position, Overall, and match Statistics from spoken Spanish text.
 */

export const parsePlayerVoiceDictation = (spokenText) => {
  const text = (spokenText || '').toLowerCase().trim();
  
  if (!text) return null;

  // 1. POSITION EXTRACTOR
  const posMap = {
    'portero': 'POR', 'por': 'POR', 'guardameta': 'POR',
    'lateral derecho': 'LD', 'ld': 'LD',
    'defensa central': 'DFC', 'central': 'DFC', 'dfc': 'DFC',
    'lateral izquierdo': 'LI', 'li': 'LI',
    'pivote': 'MCD', 'mediocentro defensivo': 'MCD', 'mcd': 'MCD',
    'mediocentro': 'MC', 'mc': 'MC',
    'mediapunta': 'MCO', 'mco': 'MCO',
    'extremo derecho': 'ED', 'ed': 'ED',
    'extremo izquierdo': 'EI', 'ei': 'EI',
    'delantero centro': 'DC', 'delantero': 'DC', 'dc': 'DC',
    'carrilero derecho': 'CAD', 'cad': 'CAD',
    'carrilero izquierdo': 'CAI', 'cai': 'CAI',
    'medio derecho': 'MD', 'md': 'MD',
    'medio izquierdo': 'MI', 'mi': 'MI'
  };

  let foundPosition = 'DC';
  for (const [key, val] of Object.entries(posMap)) {
    if (text.includes(key)) {
      foundPosition = val;
      break;
    }
  }

  // 2. OVERALL (GRL / MEDIA) EXTRACTOR
  const ovrMatch = text.match(/(?:media|ovr|grl)\s*(\d+)/i) || 
                   text.match(/(\d+)\s*(?:de media|de ovr|de grl)/i) ||
                   text.match(/media de\s*(\d+)/i);
  const overall = ovrMatch ? Number(ovrMatch[1]) : 78;

  // 3. STATS EXTRACTORS
  const matchesMatch = text.match(/(\d+)\s*partido/i);
  const matches = matchesMatch ? Number(matchesMatch[1]) : 0;

  const goalsMatch = text.match(/(\d+)\s*gol/i);
  const goals = goalsMatch ? Number(goalsMatch[1]) : 0;

  const assistsMatch = text.match(/(\d+)\s*asistencia/i);
  const assists = assistsMatch ? Number(assistsMatch[1]) : 0;

  const cleanSheetsMatch = text.match(/(\d+)\s*(?:portería|porterias|valla)/i);
  const cleanSheets = cleanSheetsMatch ? Number(cleanSheetsMatch[1]) : 0;

  const yellowMatch = text.match(/(\d+)\s*amarilla/i);
  const yellowCards = yellowMatch ? Number(yellowMatch[1]) : 0;

  const redMatch = text.match(/(\d+)\s*roja/i);
  const redCards = redMatch ? Number(redMatch[1]) : 0;

  const minutes = matches > 0 ? matches * 80 : 0;

  // 4. NAME EXTRACTOR
  let name = "";
  const nameMatch = text.match(/(?:añade a|añade un jugador llamado|añadir a|jugador llamado|jugador|llama|llamado)\s+([a-záéíóúñ\s\.\'-]+?)(?=\s+(?:de|con|media|posicion|partidos|goles|$))/i);
  
  if (nameMatch && nameMatch[1]) {
    name = nameMatch[1].replace(/^(un|una|el|la)\s+/i, '').trim();
  } else {
    // Fallback: take first words before keywords
    const words = text.split(' ');
    name = words.slice(0, 2).join(' ');
  }

  name = capitalizeName(name || "Jugador");

  return {
    name,
    position: foundPosition,
    overall,
    stats: {
      matches,
      minutes,
      goals,
      assists,
      cleanSheets,
      yellowCards,
      redCards
    }
  };
};

function capitalizeName(str) {
  if (!str) return '';
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}
