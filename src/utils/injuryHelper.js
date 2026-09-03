/**
 * Helper utilities for player injuries, durations, return dates, and countdown calculation
 */

export const INJURY_TYPE_PRESETS = [
  'Rotura de fibras / Desgarro muscular',
  'Esguince de tobillo',
  'Esguince de rodilla',
  'Rotura de ligamentos cruzados (LCA)',
  'Rotura de menisco',
  'Sobrecarga / Molestias musculares',
  'Fractura ósea',
  'Pubalgia',
  'Tendinitis rotuliana',
  'Lesión en el hombro',
  'Contusión fuerte',
  'Enfermedad / Gripe'
];

export const INJURY_DURATION_PRESETS = [
  { label: '5 días', days: 5 },
  { label: '1 semana (7 días)', days: 7 },
  { label: '2 semanas (14 días)', days: 14 },
  { label: '3 semanas (21 días)', days: 21 },
  { label: '1 mes (30 días)', days: 30 },
  { label: '6 semanas (42 días)', days: 42 },
  { label: '2 meses (60 días)', days: 60 },
  { label: '3 meses (90 días)', days: 90 },
  { label: '4 meses (120 días)', days: 120 },
  { label: '6 meses (180 días)', days: 180 },
  { label: '8 meses (240 días)', days: 240 }
];

export const formatToISODate = (dateStr) => {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    const parts = dateStr.split('/');
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return new Date().toISOString().split('T')[0];
};

export const addDaysToDate = (baseDateStr, days) => {
  const base = new Date(formatToISODate(baseDateStr));
  if (isNaN(base.getTime())) return new Date().toISOString().split('T')[0];
  base.setDate(base.getDate() + Number(days));
  return base.toISOString().split('T')[0];
};

export const formatDateSpanish = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(formatToISODate(dateStr));
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Parses any status string (e.g. "Lesionado (2 meses)", "Lesionado (1 semana)", "Lesionado (15 días)")
 * and returns duration in days.
 */
export const parseDurationDaysFromString = (statusStr) => {
  if (!statusStr) return 14;
  const s = statusStr.toLowerCase();

  // Look for exact months
  if (s.includes('1 mes') || s.includes('un mes')) return 30;
  if (s.includes('2 meses') || s.includes('dos meses')) return 60;
  if (s.includes('3 meses') || s.includes('tres meses')) return 90;
  if (s.includes('4 meses')) return 120;
  if (s.includes('5 meses')) return 150;
  if (s.includes('6 meses')) return 180;
  if (s.includes('7 meses')) return 210;
  if (s.includes('8 meses')) return 240;

  // Look for regex "X mes" or "X meses"
  const monthMatch = s.match(/(\d+)\s*mes(es)?/);
  if (monthMatch) return Number(monthMatch[1]) * 30;

  // Look for exact weeks
  if (s.includes('1 semana') || s.includes('una semana')) return 7;
  if (s.includes('2 semanas') || s.includes('dos semanas')) return 14;
  if (s.includes('3 semanas') || s.includes('tres semanas')) return 21;
  if (s.includes('4 semanas')) return 28;
  if (s.includes('5 semanas')) return 35;
  if (s.includes('6 semanas')) return 42;

  // Look for regex "X semana(s)"
  const weekMatch = s.match(/(\d+)\s*semana(s)?/);
  if (weekMatch) return Number(weekMatch[1]) * 7;

  // Look for regex "X día(s)" or "X dias"
  const dayMatch = s.match(/(\d+)\s*d[ií]a(s)?/);
  if (dayMatch) return Number(dayMatch[1]);

  return 14; // Default fallback: 2 weeks
};

/**
 * Creates or updates an injury object from user input
 */
export const buildInjuryObject = ({
  durationDays,
  durationLabel,
  startDate,
  injuryType = 'Lesión muscular',
  recovered = false
}) => {
  const days = Number(durationDays) || 14;
  const start = formatToISODate(startDate || new Date().toISOString().split('T')[0]);
  const expectedReturn = addDaysToDate(start, days);

  return {
    startDate: start,
    durationDays: days,
    durationLabel: durationLabel || (days >= 30 ? `${Math.round(days / 30)} meses` : `${Math.round(days / 7)} semanas`),
    injuryType: injuryType || 'Lesión',
    expectedReturnDate: expectedReturn,
    recovered: Boolean(recovered)
  };
};

/**
 * Calculates countdown and recovery state for a player compared against referenceDate (e.g. latest match date)
 */
export const getPlayerInjuryStatus = (player, referenceDate) => {
  if (!player) return { isInjured: false };

  const statusStr = (player.status || '').toLowerCase();
  const isMarkedInjured = statusStr.includes('lesionad');

  // If not marked injured and no active injury object, player is not injured
  if (!isMarkedInjured && (!player.injury || player.injury.recovered)) {
    return {
      isInjured: false,
      statusLabel: player.status || 'Disponible'
    };
  }

  // Determine current timeline reference date
  const refDate = formatToISODate(referenceDate || new Date().toISOString().split('T')[0]);

  // Ensure structured injury object exists
  let injury = player.injury;
  if (!injury || !injury.expectedReturnDate) {
    const days = parseDurationDaysFromString(player.status);
    injury = buildInjuryObject({
      durationDays: days,
      startDate: player.injury?.startDate || refDate,
      injuryType: player.injury?.injuryType || 'Lesión'
    });
  }

  const returnDate = formatToISODate(injury.expectedReturnDate);
  const refTime = new Date(refDate).getTime();
  const returnTime = new Date(returnDate).getTime();
  const diffDays = Math.ceil((returnTime - refTime) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0 || injury.recovered) {
    // Player reached recovery date according to match calendar
    return {
      isInjured: false,
      isRecovered: true,
      daysLeft: 0,
      injury,
      expectedReturnDate: returnDate,
      formattedReturnDate: formatDateSpanish(returnDate),
      countdownText: '¡Alta Médica completada!',
      badgeText: 'Recuperado (Listo)'
    };
  }

  // Active injury with countdown
  let countdownText = '';
  if (diffDays >= 60) {
    const months = (diffDays / 30).toFixed(1);
    countdownText = `Quedan ~${months} meses (${diffDays} días)`;
  } else if (diffDays >= 14) {
    const weeks = Math.round(diffDays / 7);
    countdownText = `Quedan ~${weeks} semanas (${diffDays} días)`;
  } else {
    countdownText = `Quedan ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  }

  return {
    isInjured: true,
    isRecovered: false,
    daysLeft: diffDays,
    injury,
    expectedReturnDate: returnDate,
    formattedReturnDate: formatDateSpanish(returnDate),
    countdownText,
    badgeText: `Lesionado (${countdownText})`
  };
};

/**
 * Finds all players who recovered given a new match date
 */
export const findRecoveredPlayersForDate = (players = [], matchDate) => {
  if (!players || players.length === 0 || !matchDate) return [];
  const mDate = formatToISODate(matchDate);

  const recovered = [];
  players.forEach(player => {
    const statusInfo = getPlayerInjuryStatus(player, mDate);
    // Player had an active injury that now has 0 or negative days left
    const hadActiveInjury = (player.status || '').toLowerCase().includes('lesionad') || (player.injury && !player.injury.recovered);
    if (hadActiveInjury && statusInfo.daysLeft <= 0) {
      recovered.push({
        ...player,
        injuryDetails: player.injury || statusInfo.injury,
        recoveredAtDate: mDate
      });
    }
  });

  return recovered;
};
