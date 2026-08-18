/**
 * Voice Parser for Transfers & Loans Operation Creation
 * Extracts Player Name, Operation Type (Fichaje/Venta/Cesión Entrada/Cesión Salida), Fee, and Team from spoken Spanish text.
 */

export const parseTransferVoiceDictation = (spokenText) => {
  const text = (spokenText || '').toLowerCase().trim();
  if (!text) return null;

  let type = "Fichaje"; // 'Fichaje' | 'Venta' | 'Cesión (Entrada)' | 'Cesión (Salida)'
  let fee = 0;
  let fromTo = "Club Externo";
  let playerName = "";
  let loanDetails = "";

  // 1. TYPE EXTRACTOR
  if (text.includes("cesion entrada") || text.includes("cesión entrada") || text.includes("cedido de") || text.includes("viene cedido") || text.includes("cesion del") || text.includes("cesión del")) {
    type = "Cesión (Entrada)";
  } else if (text.includes("cesion salida") || text.includes("cesión salida") || text.includes("cedido al") || text.includes("sale cedido") || text.includes("cedemos a")) {
    type = "Cesión (Salida)";
  } else if (text.includes("venta") || text.includes("vendido") || text.includes("vendemos")) {
    type = "Venta";
  } else {
    type = "Fichaje";
  }

  // 2. FEE / MONEY EXTRACTOR
  const feeMatch = text.match(/(\d+)\s*(?:millones|millon|m|€)/i) ||
                   text.match(/(?:por|coste|precio|opcion de|opción de)\s*(\d+)/i);
  if (feeMatch) {
    const rawNum = Number(feeMatch[1]);
    if (rawNum < 1000) {
      fee = rawNum * 1000000;
    } else {
      fee = rawNum;
    }
  }

  // 3. TEAM EXTRACTOR
  const teamMatch = text.match(/(?:del|desde el|de el|al|hacia el|con el)\s+([a-záéíóúñ\s]+?)(?=\s+(?:por|con|opcion|opción|€|$))/i);
  if (teamMatch && teamMatch[1]) {
    fromTo = capitalizeName(teamMatch[1].trim());
  }

  // 4. LOAN CLAUSE EXTRACTOR
  if (type.includes("Cesión")) {
    if (text.includes("sin opcion") || text.includes("sin opción") || text.includes("cesion simple")) {
      loanDetails = "Cesión simple sin opción de compra";
    } else if (fee > 0) {
      loanDetails = `Opción de compra de ${(fee / 1000000).toFixed(0)}M €`;
    } else {
      loanDetails = "Con opción de compra negociable";
    }
  }

  // 5. PLAYER NAME EXTRACTOR
  const nameMatch = text.match(/(?:fichaje de|venta de|cesion de|cesión de|cedido|jugador|fichar a|vender a)\s+([a-záéíóúñ\s\.\'-]+?)(?=\s+(?:del|de|al|por|con|opcion|opción|$))/i);
  if (nameMatch && nameMatch[1]) {
    playerName = capitalizeName(nameMatch[1].replace(/^(un|una|el|la)\s+/i, '').trim());
  } else {
    playerName = capitalizeName(text.split(' ').slice(0, 2).join(' '));
  }

  return {
    playerName,
    type,
    fee,
    fromTo,
    loanDetails
  };
};

function capitalizeName(str) {
  if (!str) return '';
  return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}
