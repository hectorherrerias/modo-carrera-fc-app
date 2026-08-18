/**
 * Competition Voice & Dictation Parser V9
 * Extracts tournament type, status (En Curso vs Finalizada), round, or placement from spoken text.
 */

export const parseCompVoiceDictation = (spokenText) => {
  const text = (spokenText || '').toLowerCase().trim();
  if (!text) return null;

  let name = "LaLiga EA Sports";
  let type = "league"; // 'league' | 'cup'
  let status = "en_curso"; // 'en_curso' | 'finalizada'
  let result = "En Curso";

  // 1. TOURNAMENT NAME & TYPE
  if (text.includes("copa del rey") || text.includes("copa")) {
    name = "Copa del Rey";
    type = "cup";
  } else if (text.includes("champions") || text.includes("champions league") || text.includes("uefa")) {
    name = "UEFA Champions League";
    type = "cup";
  } else if (text.includes("europa league")) {
    name = "UEFA Europa League";
    type = "cup";
  } else if (text.includes("laliga") || text.includes("liga española") || text.includes("liga")) {
    name = "LaLiga EA Sports";
    type = "league";
  } else {
    // Extract first words
    name = capitalizeName(text.split(' ')[0] || "Competición");
  }

  // 2. STATUS (EN CURSO vs FINALIZADA)
  if (text.includes("finalizada") || text.includes("acabada") || text.includes("terminada") || text.includes("campeon") || text.includes("ganada") || text.includes("eliminado")) {
    status = "finalizada";
  } else {
    status = "en_curso";
  }

  // 3. LEAGUE PLACEMENT (IF LEAGUE & FINALIZED)
  if (type === "league") {
    if (status === "finalizada") {
      const posMatch = text.match(/(\d+)\s*(?:º|o|er|puesto|posicion)/i) || text.match(/puesto\s*(\d+)/i);
      const posNum = posMatch ? Number(posMatch[1]) : 1;
      if (posNum === 1 || text.includes("campeon") || text.includes("primer")) {
        result = "1º Campeón 🏆";
      } else {
        result = `${posNum}º Puesto`;
      }
    } else {
      result = "En Curso";
    }
  }

  // 4. CUP ROUND (IF CUP)
  if (type === "cup") {
    if (status === "en_curso") {
      if (text.includes("grupo")) result = "Fase de Grupos";
      else if (text.includes("dieciseisavos")) result = "Dieciseisavos";
      else if (text.includes("octavos")) result = "Octavos de Final";
      else if (text.includes("cuartos")) result = "Cuartos de Final";
      else if (text.includes("semifinal")) result = "Semifinales";
      else if (text.includes("final")) result = "Final";
      else result = "En Curso";
    } else {
      // Finalizada
      if (text.includes("campeon") || text.includes("ganador") || text.includes("ganamos") || text.includes("1º")) {
        result = "1º Campeones 🏆";
      } else if (text.includes("subcampeon") || text.includes("final")) {
        result = "Subcampeón (Final)";
      } else if (text.includes("semifinal")) {
        result = "Eliminado en Semifinales";
      } else if (text.includes("cuartos")) {
        result = "Eliminado en Cuartos";
      } else if (text.includes("octavos")) {
        result = "Eliminado en Octavos";
      } else {
        result = "Eliminado";
      }
    }
  }

  return {
    name,
    type,
    status,
    result
  };
};

function capitalizeName(str) {
  if (!str) return '';
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}
