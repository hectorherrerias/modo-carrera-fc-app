/**
 * Helper utilities for calculating and aggregating player and team stats by competition
 */

const cleanSheetPositions = new Set(['POR', 'GK', 'PT', 'DFC', 'CB', 'CENTRAL', 'LD', 'LI', 'CAD', 'CAI', 'RB', 'LB', 'RWB', 'LWB']);

/**
 * Calculates statistics for all players in a squad, either globally (ALL) or scoped to a specific competition
 */
export const calculateSquadStatsByCompetition = (players = [], matches = [], selectedComp = 'ALL') => {
  if (!players || players.length === 0) return [];

  if (selectedComp === 'ALL') {
    // Return all players with their global accumulated stats
    return players.map(p => ({
      ...p,
      computedStats: {
        matches: p.stats?.matches || 0,
        minutes: p.stats?.minutes || 0,
        goals: p.stats?.goals || 0,
        assists: p.stats?.assists || 0,
        cleanSheets: p.stats?.cleanSheets || 0,
        yellowCards: p.stats?.yellowCards || 0,
        redCards: p.stats?.redCards || 0
      },
      computedOfficialMVPs: p.officialMVPs || 0,
      computedMyMVPs: p.myMVPs || 0
    }));
  }

  // Scoped to a specific competition: extract stats directly from matches in this competition
  const compMatches = (matches || []).filter(m => m.competition === selectedComp);

  return players.map(player => {
    let matchesCount = 0;
    let minutesTotal = 0;
    let goalsTotal = 0;
    let assistsTotal = 0;
    let cleanSheetsTotal = 0;
    let yellowCardsTotal = 0;
    let redCardsTotal = 0;
    let officialMVPsCount = 0;
    let myMVPsCount = 0;

    const pPos = (player.position || '').toUpperCase();
    const isEligibleForCleanSheet = cleanSheetPositions.has(pPos);

    compMatches.forEach(match => {
      // Check official & my MVP for this match
      if (match.officialMVP === player.id) officialMVPsCount++;
      if (match.myMVP === player.id) myMVPsCount++;

      // Check player participation
      const pInvolved = (match.playersInvolved || []).find(p => p.playerId === player.id);
      if (pInvolved) {
        matchesCount++;
        const mins = Number(pInvolved.minutesPlayed) || 90;
        minutesTotal += mins;
        goalsTotal += Number(pInvolved.goals) || 0;
        assistsTotal += Number(pInvolved.assists) || 0;
        yellowCardsTotal += Number(pInvolved.yellowCards) || 0;
        redCardsTotal += Number(pInvolved.redCards) || 0;

        const isMatchCleanSheet = Number(match.opponentGoals) === 0;
        if (isMatchCleanSheet && isEligibleForCleanSheet && mins >= 60) {
          cleanSheetsTotal++;
        }
      }
    });

    return {
      ...player,
      computedStats: {
        matches: matchesCount,
        minutes: minutesTotal,
        goals: goalsTotal,
        assists: assistsTotal,
        cleanSheets: cleanSheetsTotal,
        yellowCards: yellowCardsTotal,
        redCards: redCardsTotal
      },
      computedOfficialMVPs: officialMVPsCount,
      computedMyMVPs: myMVPsCount
    };
  });
};

/**
 * Extracts leaders (Top Scorer, Top Assister, MVP, Zamora) from a list of players with computed stats
 */
export const getCompetitionLeaders = (playersWithStats = []) => {
  if (!playersWithStats || playersWithStats.length === 0) {
    return {
      topScorer: null,
      topAssister: null,
      topMVP: null,
      topZamora: null
    };
  }

  // Top Scorer (goals > 0)
  const topScorersList = [...playersWithStats]
    .filter(p => (p.computedStats?.goals || 0) > 0)
    .sort((a, b) => (b.computedStats?.goals || 0) - (a.computedStats?.goals || 0));
  const topScorer = topScorersList[0] || null;

  // Top Assister (assists > 0)
  const topAssistersList = [...playersWithStats]
    .filter(p => (p.computedStats?.assists || 0) > 0)
    .sort((a, b) => (b.computedStats?.assists || 0) - (a.computedStats?.assists || 0));
  const topAssister = topAssistersList[0] || null;

  // Top MVP ((officialMVPs + myMVPs) > 0)
  const topMVPsList = [...playersWithStats]
    .filter(p => ((p.computedOfficialMVPs || 0) + (p.computedMyMVPs || 0)) > 0)
    .sort((a, b) => ((b.computedOfficialMVPs || 0) + (b.computedMyMVPs || 0)) - ((a.computedOfficialMVPs || 0) + (a.computedMyMVPs || 0)));
  const topMVP = topMVPsList[0] || null;

  // Top Zamora / Clean Sheets (cleanSheets > 0 for GK/DEF)
  const topZamoraList = [...playersWithStats]
    .filter(p => (p.computedStats?.cleanSheets || 0) > 0 && cleanSheetPositions.has((p.position || '').toUpperCase()))
    .sort((a, b) => (b.computedStats?.cleanSheets || 0) - (a.computedStats?.cleanSheets || 0));
  const topZamora = topZamoraList[0] || null;

  return {
    topScorer,
    topAssister,
    topMVP,
    topZamora
  };
};

/**
 * Returns team overview for a specific competition
 */
export const getCompetitionTeamSummary = (matches = [], competition = 'ALL') => {
  const targetMatches = competition === 'ALL' ? matches : matches.filter(m => m.competition === competition);

  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;
  let cleanSheets = 0;

  targetMatches.forEach(m => {
    if (m.result === 'V') wins++;
    else if (m.result === 'E') draws++;
    else if (m.result === 'D') losses++;

    const gf = Number(m.ourGoals) || 0;
    const ga = Number(m.opponentGoals) || 0;
    goalsFor += gf;
    goalsAgainst += ga;
    if (ga === 0) cleanSheets++;
  });

  const total = targetMatches.length;
  const winRate = total > 0 ? Number(((wins / total) * 100).toFixed(1)) : 0;

  return {
    total,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDiff: goalsFor - goalsAgainst,
    cleanSheets,
    winRate
  };
};
