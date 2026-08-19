/**
 * Voice Parser for Youth Academy Prospect Creation
 * Extracts Name, Position, Potential, Initial Overall, and Growth (+GRL) from spoken Spanish text.
 */

export const parseYouthVoiceDictation = (spokenText) => {
  const text = (spokenText || '').toLowerCase().trim();
  if (!text) return null;

  // 1. POSITION EXTRACTOR
  const posMap = {
    'portero': 'POR', 'por': 'POR',
    'lateral derecho': 'LD', 'ld': 'LD',
    'defensa central': 'DFC', 'central': 'DFC', 'dfc': 'DFC',
    'lateral izquierdo': 'LI', 'li': 'LI',
    'pivote': 'MCD', 'mcd': 'MCD',
    'mediocentro': 'MC', 'mc': 'MC',
    'mediapunta': 'MCO', 'mco': 'MCO',
    'extremo derecho': 'ED', 'ed': 'ED',
    'extremo izquierdo': 'EI', 'ei': 'EI',
    'delantero centro': 'DC', 'delantero': 'DC', 'dc': 'DC'
  };

  let foundPosition = 'MCO';
  for (const [key, val] of Object.entries(posMap)) {
    if (text.includes(key)) {
      foundPosition = val;
      break;
    }
  }

  // 2. POTENTIAL RANGE EXTRACTOR
  const potMatch = text.match(/potencial\s*(\d{2}\s*-\s*\d{2})/i) || 
                   text.match(/(\d{2}\s*-\s*\d{2})/i);
  const potential = potMatch ? potMatch[1].replace(/\s+/g, '') : "85-94";

  // 3. INITIAL OVERALL & GROWTH EXTRACTORS
  const initOvrMatch = text.match(/(?:empezó|empezo|inicio|inicial|con)\s*(?:con)?\s*(\d{2})/i) ||
                       text.match(/media\s*(?:de)?\s*(\d{2})/i);
  let initialOverall = initOvrMatch ? Number(initOvrMatch[1]) : 64;

  const growthMatch = text.match(/(?:subido|ha subido|crecido|subió)\s*(\d+)/i) ||
                      text.match(/\+(\d+)\s*(?:de media|puntos|grl)/i);
  const growth = growthMatch ? Number(growthMatch[1]) : 0;

  const currentOverall = initialOverall + growth;

  // 4. AGE EXTRACTOR
  const ageMatch = text.match(/(?:de|edad|tiene)?\s*(\d{2})\s*(?:años|año)/i) ||
                   text.match(/edad\s*(\d{2})/i);
  let age = ageMatch ? Number(ageMatch[1]) : 16;
  if (age < 14 || age > 25) age = 16;

  // 5. NAME EXTRACTOR
  let name = "";
  const nameMatch = text.match(/(?:añade a|promesa llamada|prospecto llamado|llamado|canterano llamado|jugador|canterano)\s+([a-záéíóúñ\s\.\'-]+?)(?=\s+(?:de\s+\d{2}\s*años|de|con|potencial|empezo|media|edad|$))/i);
  
  if (nameMatch && nameMatch[1]) {
    name = nameMatch[1].replace(/^(un|una|el|la)\s+/i, '').trim();
  } else {
    name = text.split(' ').slice(0, 2).join(' ');
  }

  name = capitalizeName(name || "Joven Promesa");

  return {
    name,
    age,
    position: foundPosition,
    potential,
    initialOverall,
    currentOverall
  };
};

function capitalizeName(str) {
  if (!str) return '';
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}
