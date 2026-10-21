/**
 * Win/draw/loss record of a club, summed over its seasons' counters.
 * winRate is null when no match has been played yet, so the UI can show "—"
 * instead of an invented percentage.
 */
export const clubRecord = (seasons = [], clubId) => {
  const own = (seasons || []).filter(s => s.clubId === clubId);
  const wins = own.reduce((acc, s) => acc + (s.matchResults?.wins || 0), 0);
  const draws = own.reduce((acc, s) => acc + (s.matchResults?.draws || 0), 0);
  const losses = own.reduce((acc, s) => acc + (s.matchResults?.losses || 0), 0);
  const total = wins + draws + losses;
  return {
    wins,
    draws,
    losses,
    total,
    winRate: total > 0 ? Number(((wins / total) * 100).toFixed(1)) : null
  };
};

/** "62.5%" or "—" when there are no matches */
export const formatWinRate = (winRate) => (winRate === null || winRate === undefined ? '—' : `${winRate}%`);
