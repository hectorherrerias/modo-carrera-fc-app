import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { INITIAL_DATA } from '../mockData';
import { fetchUserCloudData, saveUserCloudData } from '../utils/cloudSyncService';
import { generateNewsFromMatchResultAsync } from '../utils/pressAIEngine';
import { buildInjuryObject, findRecoveredPlayersForDate, parseDurationDaysFromString, formatToISODate } from '../utils/injuryHelper';

const AppContext = createContext();

const DEFAULT_SEASON_NARRATIVE = "Llegamos con la máxima ilusión. El objetivo es competir en cada jornada, consolidar la solidez táctica del equipo y cumplir las expectativas de la directiva y de la afición.";

export const AppProvider = ({ children }) => {
  const { currentUser } = useAuth();
  
  const userStorageKey = currentUser 
    ? `career_tracker_data_${currentUser.id}` 
    : 'career_tracker_data_guest';

  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'syncing' | 'offline' | 'error'
  const [lastSyncedAt, setLastSyncedAt] = useState(Date.now());
  const syncTimeoutRef = useRef(null);
  const initialCloudLoadDoneRef = useRef(false);

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(userStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure seasons have narrativeContext
        if (parsed.seasons) {
          parsed.seasons = parsed.seasons.map(s => ({
            ...s,
            narrativeContext: s.narrativeContext || DEFAULT_SEASON_NARRATIVE
          }));
        }
        return parsed;
      } catch (e) {
        console.error("Error loading saved data:", e);
      }
    }
    return {
      ...INITIAL_DATA,
      clubs: INITIAL_DATA.clubs.map(c => ({
        ...c,
        managerName: currentUser ? currentUser.name : c.managerName
      })),
      seasons: INITIAL_DATA.seasons.map(s => ({
        ...s,
        narrativeContext: DEFAULT_SEASON_NARRATIVE
      })),
      pressConferences: [],
      newsArticles: []
    };
  });

  // Re-load data whenever currentUser changes: Check Database First!
  useEffect(() => {
    if (!currentUser) {
      initialCloudLoadDoneRef.current = false;
      return;
    }

    let isMounted = true;
    setSyncStatus('syncing');

    const loadUserInitialData = async () => {
      let loadedFromCloud = false;

      // 1. Try Cloud fetch
      try {
        const cloudResult = await fetchUserCloudData(currentUser.email);
        if (isMounted && cloudResult && cloudResult.careerData && cloudResult.careerData.clubs?.length > 0) {
          const cloudData = cloudResult.careerData;
          // Ensure seasons have narrativeContext
          if (cloudData.seasons) {
            cloudData.seasons = cloudData.seasons.map(s => ({
              ...s,
              narrativeContext: s.narrativeContext || DEFAULT_SEASON_NARRATIVE
            }));
          }
          setData(cloudData);
          localStorage.setItem(userStorageKey, JSON.stringify(cloudData));
          loadedFromCloud = true;
          setSyncStatus('synced');
          setLastSyncedAt(Date.now());
        }
      } catch (err) {
        console.warn("Cloud initial load warning:", err);
      }

      // 2. If not from cloud, load from localStorage
      if (!loadedFromCloud && isMounted) {
        const saved = localStorage.getItem(userStorageKey);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.seasons) {
              parsed.seasons = parsed.seasons.map(s => ({
                ...s,
                narrativeContext: s.narrativeContext || DEFAULT_SEASON_NARRATIVE
              }));
            }
            setData(parsed);
            setSyncStatus('synced');
          } catch (e) {}
        } else {
          // New user default template
          const newDefault = {
            ...INITIAL_DATA,
            clubs: [
              {
                id: "c1_" + Date.now(),
                name: "CD Leganés",
                stadium: "Estadio Municipal de Butarque",
                logo: "⚽",
                color: "#0055A5",
                managerName: currentUser ? currentUser.name : "Mánager",
                globalWinRate: 50.0,
                totalTrophies: 0
              }
            ],
            seasons: [
              {
                id: "s1_" + Date.now(),
                clubId: "c1_" + Date.now(),
                year: "2024/25",
                budget: 15000000,
                narrativeContext: DEFAULT_SEASON_NARRATIVE,
                matchResults: { wins: 0, draws: 0, losses: 0 },
                tacticsOfensive: {
                  formation: "4-2-3-1 (Estrecho)",
                  style: "Posesión",
                  width: 65,
                  depth: 70,
                  playersInBox: 6,
                  startingXI: []
                },
                tacticsDefensive: {
                  formation: "4-4-2 (Plano)",
                  style: "Presión tras Pérdida",
                  width: 45,
                  depth: 40,
                  startingXI: []
                },
                competitions: [
                  { id: "comp_" + Date.now(), name: "LaLiga EA Sports", type: "league", status: "en_curso", result: "En Curso" }
                ],
                awards: { mvp: "Por determinar", topScorer: "Por determinar", topAssister: "Por determinar" }
              }
            ],
            players: [],
            transfers: [],
            youthAcademy: [],
            pressConferences: [],
            newsArticles: []
          };
          setData(newDefault);
          setSyncStatus('synced');
        }
      }

      initialCloudLoadDoneRef.current = true;
    };

    loadUserInitialData();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.email]);

  // Save to LocalStorage & Debounced Auto-Sync to Cloud
  useEffect(() => {
    if (!data || !userStorageKey) return;

    // Save immediately to localStorage
    localStorage.setItem(userStorageKey, JSON.stringify(data));

    // If logged in, debounce sync to Cloud
    if (currentUser?.email && initialCloudLoadDoneRef.current) {
      setSyncStatus('syncing');

      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      syncTimeoutRef.current = setTimeout(async () => {
        try {
          const success = await saveUserCloudData(currentUser.email, {
            userProfile: currentUser,
            careerData: data
          });
          if (success) {
            setSyncStatus('synced');
            setLastSyncedAt(Date.now());
          } else {
            setSyncStatus('offline');
          }
        } catch (e) {
          console.warn("Auto-sync error:", e);
          setSyncStatus('error');
        }
      }, 1500);
    }

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [data, userStorageKey, currentUser]);

  const forceSyncCloud = useCallback(async () => {
    if (!currentUser?.email) return false;
    setSyncStatus('syncing');
    try {
      const success = await saveUserCloudData(currentUser.email, {
        userProfile: currentUser,
        careerData: data
      });
      if (success) {
        setSyncStatus('synced');
        setLastSyncedAt(Date.now());
        return true;
      }
      setSyncStatus('offline');
      return false;
    } catch (err) {
      setSyncStatus('error');
      return false;
    }
  }, [currentUser, data]);

  const [activeClubId, setActiveClubId] = useState(null);
  const [activeSeasonId, setActiveSeasonId] = useState(null);

  // Sync active club & season whenever data changes
  useEffect(() => {
    if (data.clubs && data.clubs.length > 0) {
      const currentActiveClub = data.clubs.find(c => c.id === activeClubId) || data.clubs[0];
      setActiveClubId(currentActiveClub.id);

      const clubSeasons = data.seasons.filter(s => s.clubId === currentActiveClub.id);
      if (clubSeasons.length > 0) {
        const currentActiveSeason = clubSeasons.find(s => s.id === activeSeasonId) || clubSeasons[clubSeasons.length - 1];
        setActiveSeasonId(currentActiveSeason.id);
      } else {
        setActiveSeasonId(null);
      }
    } else {
      setActiveClubId(null);
      setActiveSeasonId(null);
    }
  }, [data, activeClubId, activeSeasonId]);

  const selectClub = (clubId) => {
    setActiveClubId(clubId);
    const clubSeasons = data.seasons.filter(s => s.clubId === clubId);
    if (clubSeasons.length > 0) {
      setActiveSeasonId(clubSeasons[clubSeasons.length - 1].id);
    } else {
      setActiveSeasonId(null);
    }
  };

  const activeClub = data.clubs?.find(c => c.id === activeClubId);
  const activeSeason = data.seasons?.find(s => s.id === activeSeasonId);
  const clubSeasons = data.seasons?.filter(s => s.clubId === activeClubId) || [];
  const currentPlayers = data.players?.filter(p => p.seasonId === activeSeasonId) || [];
  const currentTransfers = data.transfers?.filter(t => t.seasonId === activeSeasonId) || [];
  const currentShortlist = data.shortlist?.filter(s => s.seasonId === activeSeasonId) || [];
  const currentYouth = data.youthAcademy?.filter(y => y.seasonId === activeSeasonId) || [];
  const currentMatches = data.matches?.filter(m => m.seasonId === activeSeasonId) || [];
  const currentPress = (data.pressConferences || []).filter(p => p.seasonId === activeSeasonId);
  const currentNews = (data.newsArticles || []).filter(n => n.seasonId === activeSeasonId);

  // Recovered players modal queue
  const [recoveredPlayersQueue, setRecoveredPlayersQueue] = useState([]);

  // Dynamic Current Match Calendar Date
  const latestMatchDate = useMemo(() => {
    if (!currentMatches || currentMatches.length === 0) return new Date().toISOString().split('T')[0];
    const sorted = [...currentMatches].sort((a, b) => new Date(formatToISODate(b.date || '')) - new Date(formatToISODate(a.date || '')));
    return formatToISODate(sorted[0]?.date);
  }, [currentMatches]);

  const dismissRecoveredModal = useCallback(() => {
    setRecoveredPlayersQueue([]);
  }, []);

  const manuallyDischargePlayer = useCallback((playerId) => {
    let recoveredPlayerObj = null;
    setData(prev => ({
      ...prev,
      players: prev.players.map(p => {
        if (p.id === playerId) {
          recoveredPlayerObj = {
            ...p,
            status: 'Disponible',
            injuryDetails: p.injury || { injuryType: 'Lesión', durationLabel: 'Alta Médica' }
          };
          return {
            ...p,
            status: 'Disponible',
            injury: p.injury ? { ...p.injury, recovered: true } : null
          };
        }
        return p;
      })
    }));

    if (recoveredPlayerObj) {
      setRecoveredPlayersQueue(prev => [...prev, recoveredPlayerObj]);
    }
  }, []);

  // Dynamic Win Rate Math per User
  const clubTotalWins = clubSeasons.reduce((acc, s) => acc + (s.matchResults?.wins || 0), 0);
  const clubTotalDraws = clubSeasons.reduce((acc, s) => acc + (s.matchResults?.draws || 0), 0);
  const clubTotalLosses = clubSeasons.reduce((acc, s) => acc + (s.matchResults?.losses || 0), 0);
  const clubTotalMatches = clubTotalWins + clubTotalDraws + clubTotalLosses;
  const computedWinRate = clubTotalMatches > 0 
    ? Number(((clubTotalWins / clubTotalMatches) * 100).toFixed(1)) 
    : (activeClub?.globalWinRate || 50.0);

  // Actions
  const updateSeasonNarrative = (narrativeText) => {
    if (!activeSeasonId) return;
    setData(prev => ({
      ...prev,
      seasons: prev.seasons.map(s => s.id === activeSeasonId ? { ...s, narrativeContext: narrativeText } : s)
    }));
  };

  const recordMatchResult = (resultType, delta = 1) => {
    if (!activeSeasonId) return;
    setData(prev => ({
      ...prev,
      seasons: prev.seasons.map(s => {
        if (s.id === activeSeasonId) {
          const currentResults = s.matchResults || { wins: 0, draws: 0, losses: 0 };
          const key = resultType === 'win' ? 'wins' : (resultType === 'draw' ? 'draws' : 'losses');
          const newVal = Math.max(0, (currentResults[key] || 0) + delta);

          return {
            ...s,
            matchResults: {
              ...currentResults,
              [key]: newVal
            }
          };
        }
        return s;
      })
    }));
  };

  const updateClub = (clubId, updatedFields) => {
    setData(prev => ({
      ...prev,
      clubs: prev.clubs.map(c => c.id === clubId ? { ...c, ...updatedFields } : c)
    }));
  };

  const addClub = (newClub) => {
    const clubId = "c_" + Date.now();
    const club = {
      id: clubId,
      name: newClub.name,
      stadium: newClub.stadium || "Estadio Municipal",
      logo: newClub.logo || "⚽",
      color: newClub.color || "#10B981",
      managerName: newClub.managerName || (currentUser ? currentUser.name : "Mánager"),
      globalWinRate: 50.0,
      totalTrophies: 0
    };
    
    const seasonId = "s_" + Date.now();
    const firstSeason = {
      id: seasonId,
      clubId: clubId,
      year: newClub.initialSeasonYear || "2024/25",
      budget: newClub.budget ? Number(newClub.budget) : 10000000,
      narrativeContext: DEFAULT_SEASON_NARRATIVE,
      matchResults: { wins: 0, draws: 0, losses: 0 },
      tacticsOfensive: {
        formation: "4-2-3-1 (Estrecho)",
        style: "Posesión",
        width: 65,
        depth: 70,
        playersInBox: 6,
        startingXI: []
      },
      tacticsDefensive: {
        formation: "4-4-2 (Plano)",
        style: "Presión tras Pérdida",
        width: 45,
        depth: 40,
        startingXI: []
      },
      competitions: [
        { id: "comp_" + Date.now(), name: "LaLiga EA Sports", type: "league", status: "en_curso", result: "En Curso" }
      ],
      awards: { mvp: "Por determinar", topScorer: "Por determinar", topAssister: "Por determinar" }
    };

    setData(prev => ({
      ...prev,
      clubs: [...prev.clubs, club],
      seasons: [...prev.seasons, firstSeason]
    }));

    setActiveClubId(clubId);
    setActiveSeasonId(seasonId);
  };

  const updateSeason = (seasonId, updatedFields) => {
    setData(prev => ({
      ...prev,
      seasons: prev.seasons.map(s => {
        if (s.id === seasonId) {
          return {
            ...s,
            ...updatedFields,
            budget: updatedFields.budget !== undefined ? Number(updatedFields.budget) : s.budget
          };
        }
        return s;
      })
    }));
  };

  const deleteSeason = (seasonId) => {
    setData(prev => {
      const remainingSeasons = prev.seasons.filter(s => s.id !== seasonId);
      const remainingPlayers = prev.players.filter(p => p.seasonId !== seasonId);
      const remainingTransfers = prev.transfers.filter(t => t.seasonId !== seasonId);
      const remainingShortlist = (prev.shortlist || []).filter(s => s.seasonId !== seasonId);
      const remainingYouth = prev.youthAcademy.filter(y => y.seasonId !== seasonId);
      const remainingMatches = (prev.matches || []).filter(m => m.seasonId !== seasonId);
      const remainingPress = (prev.pressConferences || []).filter(p => p.seasonId !== seasonId);
      const remainingNews = (prev.newsArticles || []).filter(n => n.seasonId !== seasonId);

      return {
        ...prev,
        seasons: remainingSeasons,
        players: remainingPlayers,
        transfers: remainingTransfers,
        shortlist: remainingShortlist,
        youthAcademy: remainingYouth,
        matches: remainingMatches,
        pressConferences: remainingPress,
        newsArticles: remainingNews
      };
    });
  };

  const addSeason = (seasonData) => {
    if (!activeClubId) return;
    const seasonId = "s_" + Date.now();
    
    const lastSeason = clubSeasons[clubSeasons.length - 1];
    const baseOfensive = lastSeason ? JSON.parse(JSON.stringify(lastSeason.tacticsOfensive || lastSeason.tactics || {})) : {
      formation: "4-2-3-1 (Estrecho)",
      style: "Posesión",
      width: 65,
      depth: 70,
      playersInBox: 6,
      startingXI: []
    };
    const baseDefensive = lastSeason ? JSON.parse(JSON.stringify(lastSeason.tacticsDefensive || lastSeason.tactics || {})) : {
      formation: "4-4-2 (Plano)",
      style: "Presión tras Pérdida",
      width: 45,
      depth: 40,
      startingXI: []
    };

    const newSeason = {
      id: seasonId,
      clubId: activeClubId,
      year: seasonData.year,
      budget: Number(seasonData.budget) || 15000000,
      narrativeContext: DEFAULT_SEASON_NARRATIVE,
      matchResults: { wins: 0, draws: 0, losses: 0 },
      tacticsOfensive: baseOfensive,
      tacticsDefensive: baseDefensive,
      competitions: seasonData.competitions || [
        { id: "c1_" + Date.now(), name: "LaLiga EA Sports", type: "league", status: "en_curso", result: "En Curso" }
      ],
      awards: { mvp: "En curso", topScorer: "En curso", topAssister: "En curso" }
    };

    let copiedPlayers = [];
    let copiedYouth = [];
    if (lastSeason && seasonData.copySquad) {
      const prevPlayers = (data.players || []).filter(p => p.seasonId === lastSeason.id);
      copiedPlayers = prevPlayers.map(p => ({
        ...p,
        id: "p_" + Math.random().toString(36).substr(2, 9),
        seasonId: seasonId,
        initialOvr: Number(p.overall) || 75,
        contractYears: p.contractYears !== undefined ? Math.max(0, p.contractYears - 1) : 2,
        status: "Disponible",
        officialMVPs: 0,
        myMVPs: 0,
        stats: { minutes: 0, matches: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0 }
      }));

      const prevYouth = (data.youthAcademy || []).filter(y => y.seasonId === lastSeason.id && !y.promoted);
      copiedYouth = prevYouth.map(y => ({
        ...y,
        id: "y_" + Math.random().toString(36).substr(2, 9),
        seasonId: seasonId,
        age: (Number(y.age) || 16) + 1,
        initialOverall: Number(y.currentOverall) || Number(y.initialOverall) || 65,
        currentOverall: Number(y.currentOverall) || Number(y.initialOverall) || 65,
        potential: y.potential || "85-94",
        promoted: false
      }));
    }

    setData(prev => ({
      ...prev,
      seasons: [...prev.seasons, newSeason],
      players: [...prev.players, ...copiedPlayers],
      youthAcademy: [...(prev.youthAcademy || []), ...copiedYouth]
    }));

    setActiveSeasonId(seasonId);
  };

  const addPlayer = (playerInfo) => {
    if (!activeSeasonId) return;
    const ovr = Number(playerInfo.overall) || 75;
    const initOvr = Number(playerInfo.initialOvr) || ovr;
    const rawStatus = playerInfo.status || "Disponible";

    let injuryObj = playerInfo.injury || null;
    if (!injuryObj && rawStatus.toLowerCase().includes('lesionad')) {
      injuryObj = buildInjuryObject({
        durationDays: parseDurationDaysFromString(rawStatus),
        startDate: latestMatchDate,
        injuryType: playerInfo.injuryType || 'Lesión muscular'
      });
    }

    const newPlayer = {
      id: "p_" + Date.now(),
      seasonId: activeSeasonId,
      name: playerInfo.name,
      position: playerInfo.position,
      overall: ovr,
      initialOvr: initOvr,
      contractYears: Number(playerInfo.contractYears) >= 0 ? Number(playerInfo.contractYears) : 3,
      status: rawStatus,
      injury: injuryObj,
      officialMVPs: Number(playerInfo.officialMVPs) || 0,
      myMVPs: Number(playerInfo.myMVPs) || 0,
      stats: {
        minutes: Number(playerInfo.minutes) || 0,
        matches: Number(playerInfo.matches) || 0,
        goals: Number(playerInfo.goals) || 0,
        assists: Number(playerInfo.assists) || 0,
        cleanSheets: Number(playerInfo.cleanSheets) || 0,
        yellowCards: Number(playerInfo.yellowCards) || 0,
        redCards: Number(playerInfo.redCards) || 0
      }
    };

    setData(prev => ({
      ...prev,
      players: [...prev.players, newPlayer]
    }));
  };

  const updatePlayerStats = (playerId, updatedStats) => {
    setData(prev => ({
      ...prev,
      players: prev.players.map(p => {
        if (p.id === playerId) {
          const newOvr = updatedStats.overall !== undefined ? Number(updatedStats.overall) : p.overall;
          const newInitOvr = updatedStats.initialOvr !== undefined ? Number(updatedStats.initialOvr) : (p.initialOvr !== undefined ? p.initialOvr : p.overall);
          const newStatus = updatedStats.status !== undefined ? updatedStats.status : (p.status || "Disponible");

          let newInjury = updatedStats.injury !== undefined ? updatedStats.injury : p.injury;
          if (newStatus.toLowerCase().includes('disponible')) {
            newInjury = null;
          } else if (newStatus.toLowerCase().includes('lesionad') && !newInjury) {
            newInjury = buildInjuryObject({
              durationDays: parseDurationDaysFromString(newStatus),
              startDate: latestMatchDate,
              injuryType: 'Lesión muscular'
            });
          }

          return {
            ...p,
            name: updatedStats.name !== undefined ? updatedStats.name : p.name,
            position: updatedStats.position !== undefined ? updatedStats.position : p.position,
            overall: newOvr,
            initialOvr: newInitOvr,
            contractYears: updatedStats.contractYears !== undefined ? Number(updatedStats.contractYears) : (p.contractYears ?? 3),
            status: newStatus,
            injury: newInjury,
            officialMVPs: updatedStats.officialMVPs !== undefined ? Number(updatedStats.officialMVPs) : (p.officialMVPs || 0),
            myMVPs: updatedStats.myMVPs !== undefined ? Number(updatedStats.myMVPs) : (p.myMVPs || 0),
            stats: {
              ...p.stats,
              ...updatedStats.stats
            }
          };
        }
        return p;
      })
    }));
  };

  const deletePlayer = (playerId) => {
    setData(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== playerId)
    }));
  };

  const cleanSheetPositions = new Set(['POR', 'GK', 'PT', 'DFC', 'CB', 'CENTRAL', 'LD', 'LI', 'CAD', 'CAI', 'RB', 'LB', 'RWB', 'LWB']);

  // Match Tracking & Automated Stats Updating
  const addMatch = (matchData) => {
    if (!activeSeasonId) return;
    const matchId = "m_" + Date.now();
    const newMatch = {
      id: matchId,
      seasonId: activeSeasonId,
      date: matchData.date || new Date().toISOString().split('T')[0],
      opponent: matchData.opponent || 'Rival',
      competition: matchData.competition || 'LaLiga EA Sports',
      venue: matchData.venue || 'local', // 'local' | 'visitante'
      result: matchData.result || 'V', // 'V' | 'E' | 'D'
      score: matchData.score || '1 - 0',
      ourGoals: Number(matchData.ourGoals) >= 0 ? Number(matchData.ourGoals) : 1,
      opponentGoals: Number(matchData.opponentGoals) >= 0 ? Number(matchData.opponentGoals) : 0,
      playersInvolved: matchData.playersInvolved || [], // [{ playerId, playerName, position, minutesPlayed, goals, assists, yellowCards, redCards }]
      officialMVP: matchData.officialMVP || null,
      myMVP: matchData.myMVP || null,
      notes: matchData.notes || ''
    };

    // Check for clean sheet (opponent goals === 0)
    let rivalGoals = newMatch.opponentGoals;
    if (matchData.score && matchData.score.includes('-')) {
      const parts = matchData.score.split('-').map(s => Number(s.trim()) || 0);
      if (parts.length === 2) {
        rivalGoals = parts[1];
      }
    }
    const isCleanSheetMatch = rivalGoals === 0;

    const playersInvolvedMap = new Map();
    (matchData.playersInvolved || []).forEach(p => {
      if (p.playerId) {
        playersInvolvedMap.set(p.playerId, {
          minutesPlayed: Number(p.minutesPlayed) || 90,
          goals: Number(p.goals) || 0,
          assists: Number(p.assists) || 0,
          yellowCards: Number(p.yellowCards) || 0,
          redCards: Number(p.redCards) || 0
        });
      }
    });

    setData(prev => {
      // 1. Update match results in active season (wins, draws, losses)
      const resKey = newMatch.result === 'V' ? 'wins' : (newMatch.result === 'E' ? 'draws' : 'losses');
      const updatedSeasons = prev.seasons.map(s => {
        if (s.id === activeSeasonId) {
          const currentResults = s.matchResults || { wins: 0, draws: 0, losses: 0 };
          return {
            ...s,
            matchResults: {
              ...currentResults,
              [resKey]: (currentResults[resKey] || 0) + 1
            }
          };
        }
        return s;
      });

      // 2. Update players: stats & MVPs
      const updatedPlayers = prev.players.map(p => {
        if (p.seasonId !== activeSeasonId) return p;

        const isParticipant = playersInvolvedMap.has(p.id);
        const pData = isParticipant ? playersInvolvedMap.get(p.id) : null;
        
        const minutesToAdd = pData ? pData.minutesPlayed : 0;
        const matchesToAdd = isParticipant ? 1 : 0;
        const goalsToAdd = pData ? pData.goals : 0;
        const assistsToAdd = pData ? pData.assists : 0;
        const yellowCardsToAdd = pData ? pData.yellowCards : 0;
        const redCardsToAdd = pData ? pData.redCards : 0;

        const pPos = (p.position || '').toUpperCase();
        const isEligibleDefOrGk = cleanSheetPositions.has(pPos);
        const cleanSheetToAdd = (isCleanSheetMatch && isEligibleDefOrGk && minutesToAdd >= 60) ? 1 : 0;

        const isOfficialMVP = matchData.officialMVP === p.id;
        const isMyMVP = matchData.myMVP === p.id;

        if (isParticipant || isOfficialMVP || isMyMVP) {
          const currentStats = p.stats || { minutes: 0, matches: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0 };
          return {
            ...p,
            officialMVPs: (p.officialMVPs || 0) + (isOfficialMVP ? 1 : 0),
            myMVPs: (p.myMVPs || 0) + (isMyMVP ? 1 : 0),
            stats: {
              ...currentStats,
              matches: (currentStats.matches || 0) + matchesToAdd,
              minutes: (currentStats.minutes || 0) + minutesToAdd,
              goals: (currentStats.goals || 0) + goalsToAdd,
              assists: (currentStats.assists || 0) + assistsToAdd,
              yellowCards: (currentStats.yellowCards || 0) + yellowCardsToAdd,
              redCards: (currentStats.redCards || 0) + redCardsToAdd,
              cleanSheets: (currentStats.cleanSheets || 0) + cleanSheetToAdd
            }
          };
        }
        return p;
      });

      // 3. Check for any injured players who recovered on this match date
      const seasonPlayers = prev.players.filter(p => p.seasonId === activeSeasonId);
      const recoveredOnMatch = findRecoveredPlayersForDate(seasonPlayers, newMatch.date);
      let finalPlayers = updatedPlayers;
      if (recoveredOnMatch.length > 0) {
        const recoveredIds = new Set(recoveredOnMatch.map(p => p.id));
        finalPlayers = updatedPlayers.map(p => {
          if (recoveredIds.has(p.id)) {
            return {
              ...p,
              status: 'Disponible',
              injury: p.injury ? { ...p.injury, recovered: true } : null
            };
          }
          return p;
        });
        setTimeout(() => {
          setRecoveredPlayersQueue(prevQ => {
            const existingIds = new Set(prevQ.map(p => p.id));
            const newItems = recoveredOnMatch.filter(p => !existingIds.has(p.id));
            return [...prevQ, ...newItems];
          });
        }, 300);
      }

      return {
        ...prev,
        seasons: updatedSeasons,
        players: finalPlayers,
        matches: [newMatch, ...(prev.matches || [])]
      };
    });

    // Auto-generate press news for this match
    generateNewsFromMatchResultAsync({
      apiKey: currentUser?.geminiApiKey,
      match: newMatch,
      clubName: activeClub?.name || 'Club',
      managerName: activeClub?.managerName || 'Mánager',
      currentPlayers
    }).then(articles => {
      if (articles && articles.length > 0) {
        setData(prev => ({
          ...prev,
          newsArticles: [...articles.map(a => ({ ...a, seasonId: activeSeasonId })), ...(prev.newsArticles || [])]
        }));
      }
    }).catch(err => {
      console.warn("Could not auto-generate match news:", err);
    });
  };

  const deleteMatch = (matchId) => {
    setData(prev => {
      const matchToDelete = (prev.matches || []).find(m => m.id === matchId);
      if (!matchToDelete) return prev;

      const sId = matchToDelete.seasonId;
      const resKey = matchToDelete.result === 'V' ? 'wins' : (matchToDelete.result === 'E' ? 'draws' : 'losses');

      // 1. Revert season match results
      const updatedSeasons = prev.seasons.map(s => {
        if (s.id === sId) {
          const currentResults = s.matchResults || { wins: 0, draws: 0, losses: 0 };
          return {
            ...s,
            matchResults: {
              ...currentResults,
              [resKey]: Math.max(0, (currentResults[resKey] || 0) - 1)
            }
          };
        }
        return s;
      });

      // 2. Revert player stats
      const isCleanSheetMatch = Number(matchToDelete.opponentGoals) === 0;
      const playersInvolvedMap = new Map();
      (matchToDelete.playersInvolved || []).forEach(p => {
        if (p.playerId) {
          playersInvolvedMap.set(p.playerId, {
            minutesPlayed: Number(p.minutesPlayed) || 90,
            goals: Number(p.goals) || 0,
            assists: Number(p.assists) || 0,
            yellowCards: Number(p.yellowCards) || 0,
            redCards: Number(p.redCards) || 0
          });
        }
      });

      const updatedPlayers = prev.players.map(p => {
        if (p.seasonId !== sId) return p;

        const isParticipant = playersInvolvedMap.has(p.id);
        const pData = isParticipant ? playersInvolvedMap.get(p.id) : null;
        
        const minutesToSub = pData ? pData.minutesPlayed : 0;
        const matchesToSub = isParticipant ? 1 : 0;
        const goalsToSub = pData ? pData.goals : 0;
        const assistsToSub = pData ? pData.assists : 0;
        const yellowCardsToSub = pData ? pData.yellowCards : 0;
        const redCardsToSub = pData ? pData.redCards : 0;

        const pPos = (p.position || '').toUpperCase();
        const isEligibleDefOrGk = cleanSheetPositions.has(pPos);
        const cleanSheetToSub = (isCleanSheetMatch && isEligibleDefOrGk && minutesToSub >= 60) ? 1 : 0;

        const isOfficialMVP = matchToDelete.officialMVP === p.id;
        const isMyMVP = matchToDelete.myMVP === p.id;

        if (isParticipant || isOfficialMVP || isMyMVP) {
          const currentStats = p.stats || { minutes: 0, matches: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0 };
          return {
            ...p,
            officialMVPs: Math.max(0, (p.officialMVPs || 0) - (isOfficialMVP ? 1 : 0)),
            myMVPs: Math.max(0, (p.myMVPs || 0) - (isMyMVP ? 1 : 0)),
            stats: {
              ...currentStats,
              matches: Math.max(0, (currentStats.matches || 0) - matchesToSub),
              minutes: Math.max(0, (currentStats.minutes || 0) - minutesToSub),
              goals: Math.max(0, (currentStats.goals || 0) - goalsToSub),
              assists: Math.max(0, (currentStats.assists || 0) - assistsToSub),
              yellowCards: Math.max(0, (currentStats.yellowCards || 0) - yellowCardsToSub),
              redCards: Math.max(0, (currentStats.redCards || 0) - redCardsToSub),
              cleanSheets: Math.max(0, (currentStats.cleanSheets || 0) - cleanSheetToSub)
            }
          };
        }
        return p;
      });

      return {
        ...prev,
        seasons: updatedSeasons,
        players: updatedPlayers,
        matches: prev.matches.filter(m => m.id !== matchId),
        newsArticles: (prev.newsArticles || []).filter(n => n.matchId !== matchId || n.isFavorite)
      };
    });
  };

  const updateMatch = (matchId, updatedFields) => {
    let updatedMatchObj = null;

    setData(prev => {
      const oldMatch = (prev.matches || []).find(m => m.id === matchId);
      if (!oldMatch) return prev;

      const sId = oldMatch.seasonId;
      const newMatch = {
        ...oldMatch,
        ...updatedFields,
        ourGoals: Number(updatedFields.ourGoals) >= 0 ? Number(updatedFields.ourGoals) : oldMatch.ourGoals,
        opponentGoals: Number(updatedFields.opponentGoals) >= 0 ? Number(updatedFields.opponentGoals) : oldMatch.opponentGoals,
        score: updatedFields.score || `${Number(updatedFields.ourGoals) || 0} - ${Number(updatedFields.opponentGoals) || 0}`,
        playersInvolved: updatedFields.playersInvolved || oldMatch.playersInvolved || []
      };
      updatedMatchObj = newMatch;

      // 1. Reconcile season match results if result changed
      let updatedSeasons = prev.seasons;
      if (oldMatch.result !== newMatch.result) {
        const oldKey = oldMatch.result === 'V' ? 'wins' : (oldMatch.result === 'E' ? 'draws' : 'losses');
        const newKey = newMatch.result === 'V' ? 'wins' : (newMatch.result === 'E' ? 'draws' : 'losses');

        updatedSeasons = prev.seasons.map(s => {
          if (s.id === sId) {
            const currentResults = s.matchResults || { wins: 0, draws: 0, losses: 0 };
            return {
              ...s,
              matchResults: {
                ...currentResults,
                [oldKey]: Math.max(0, (currentResults[oldKey] || 0) - 1),
                [newKey]: (currentResults[newKey] || 0) + 1
              }
            };
          }
          return s;
        });
      }

      // 2. Reconcile player statistics
      const oldCleanSheet = Number(oldMatch.opponentGoals) === 0;
      const newCleanSheet = Number(newMatch.opponentGoals) === 0;

      const oldPMap = new Map();
      (oldMatch.playersInvolved || []).forEach(p => {
        if (p.playerId) oldPMap.set(p.playerId, p);
      });

      const newPMap = new Map();
      (newMatch.playersInvolved || []).forEach(p => {
        if (p.playerId) newPMap.set(p.playerId, p);
      });

      const updatedPlayers = prev.players.map(p => {
        if (p.seasonId !== sId) return p;

        const pPos = (p.position || '').toUpperCase();
        const isEligibleDefOrGk = cleanSheetPositions.has(pPos);

        // Old stats contributed by this match
        const hadOld = oldPMap.has(p.id);
        const oldPData = hadOld ? oldPMap.get(p.id) : null;
        const oldMins = oldPData ? (Number(oldPData.minutesPlayed) || 90) : 0;
        const oldMatches = hadOld ? 1 : 0;
        const oldGoals = oldPData ? (Number(oldPData.goals) || 0) : 0;
        const oldAssists = oldPData ? (Number(oldPData.assists) || 0) : 0;
        const oldYellow = oldPData ? (Number(oldPData.yellowCards) || 0) : 0;
        const oldRed = oldPData ? (Number(oldPData.redCards) || 0) : 0;
        const oldClean = (oldCleanSheet && isEligibleDefOrGk && oldMins >= 60) ? 1 : 0;
        const wasOldOfficialMVP = oldMatch.officialMVP === p.id ? 1 : 0;
        const wasOldMyMVP = oldMatch.myMVP === p.id ? 1 : 0;

        // New stats contributed by this match
        const hasNew = newPMap.has(p.id);
        const newPData = hasNew ? newPMap.get(p.id) : null;
        const newMins = newPData ? (Number(newPData.minutesPlayed) || 90) : 0;
        const newMatches = hasNew ? 1 : 0;
        const newGoals = newPData ? (Number(newPData.goals) || 0) : 0;
        const newAssists = newPData ? (Number(newPData.assists) || 0) : 0;
        const newYellow = newPData ? (Number(newPData.yellowCards) || 0) : 0;
        const newRed = newPData ? (Number(newPData.redCards) || 0) : 0;
        const newClean = (newCleanSheet && isEligibleDefOrGk && newMins >= 60) ? 1 : 0;
        const isNewOfficialMVP = newMatch.officialMVP === p.id ? 1 : 0;
        const isNewMyMVP = newMatch.myMVP === p.id ? 1 : 0;

        if (hadOld || hasNew || wasOldOfficialMVP || isNewOfficialMVP || wasOldMyMVP || isNewMyMVP) {
          const currentStats = p.stats || { minutes: 0, matches: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0 };
          return {
            ...p,
            officialMVPs: Math.max(0, (p.officialMVPs || 0) - wasOldOfficialMVP + isNewOfficialMVP),
            myMVPs: Math.max(0, (p.myMVPs || 0) - wasOldMyMVP + isNewMyMVP),
            stats: {
              ...currentStats,
              matches: Math.max(0, (currentStats.matches || 0) - oldMatches + newMatches),
              minutes: Math.max(0, (currentStats.minutes || 0) - oldMins + newMins),
              goals: Math.max(0, (currentStats.goals || 0) - oldGoals + newGoals),
              assists: Math.max(0, (currentStats.assists || 0) - oldAssists + newAssists),
              yellowCards: Math.max(0, (currentStats.yellowCards || 0) - oldYellow + newYellow),
              redCards: Math.max(0, (currentStats.redCards || 0) - oldRed + newRed),
              cleanSheets: Math.max(0, (currentStats.cleanSheets || 0) - oldClean + newClean)
            }
          };
        }
        return p;
      });

      // 3. Check for any injured players who recovered on updated match date
      const seasonPlayers = prev.players.filter(p => p.seasonId === sId);
      const recoveredOnMatch = findRecoveredPlayersForDate(seasonPlayers, newMatch.date);
      let finalPlayers = updatedPlayers;
      if (recoveredOnMatch.length > 0) {
        const recoveredIds = new Set(recoveredOnMatch.map(p => p.id));
        finalPlayers = updatedPlayers.map(p => {
          if (recoveredIds.has(p.id)) {
            return {
              ...p,
              status: 'Disponible',
              injury: p.injury ? { ...p.injury, recovered: true } : null
            };
          }
          return p;
        });
        setTimeout(() => {
          setRecoveredPlayersQueue(prevQ => {
            const existingIds = new Set(prevQ.map(p => p.id));
            const newItems = recoveredOnMatch.filter(p => !existingIds.has(p.id));
            return [...prevQ, ...newItems];
          });
        }, 300);
      }

      return {
        ...prev,
        seasons: updatedSeasons,
        players: finalPlayers,
        matches: prev.matches.map(m => m.id === matchId ? newMatch : m)
      };
    });

    // Re-generate press news for updated match
    if (updatedMatchObj) {
      generateNewsFromMatchResultAsync({
        apiKey: currentUser?.geminiApiKey,
        match: updatedMatchObj,
        clubName: activeClub?.name || 'Club',
        managerName: activeClub?.managerName || 'Mánager',
        currentPlayers
      }).then(articles => {
        if (articles && articles.length > 0) {
          setData(prev => ({
            ...prev,
            newsArticles: [
              ...articles.map(a => ({ ...a, seasonId: activeSeasonId })),
              ...(prev.newsArticles || []).filter(n => n.matchId !== matchId || n.isFavorite)
            ]
          }));
        }
      }).catch(err => {
        console.warn("Could not regenerate match news on edit:", err);
      });
    }
  };

  const updatePhaseTactics = (phase, phaseData, syncBothSquads = true) => {
    if (!activeSeasonId) return;
    const currentKey = phase === 'ofensive' ? 'tacticsOfensive' : 'tacticsDefensive';
    const otherKey = phase === 'ofensive' ? 'tacticsDefensive' : 'tacticsOfensive';
    
    setData(prev => ({
      ...prev,
      seasons: prev.seasons.map(s => {
        if (s.id === activeSeasonId) {
          const currentPhaseTactics = s[currentKey] || {};
          const otherPhaseTactics = s[otherKey] || {};

          const updatedCurrentPhase = {
            ...currentPhaseTactics,
            ...phaseData
          };

          let updatedOtherPhase = { ...otherPhaseTactics };

          // If startingXI (starters/subs) changed and syncBothSquads is true, replicate player assignments to other phase
          if (phaseData.startingXI && syncBothSquads) {
            const currentXI = phaseData.startingXI;
            const otherXI = otherPhaseTactics.startingXI || [];

            const syncedOtherXI = currentXI.map((slot, idx) => {
              const existingOtherSlot = otherXI[idx] || {};
              return {
                ...existingOtherSlot,
                playerName: slot.playerName,
                substitutes: slot.substitutes ? [...slot.substitutes] : []
              };
            });

            updatedOtherPhase = {
              ...updatedOtherPhase,
              startingXI: syncedOtherXI
            };
          }

          return {
            ...s,
            [currentKey]: updatedCurrentPhase,
            ...(syncBothSquads && phaseData.startingXI ? { [otherKey]: updatedOtherPhase } : {})
          };
        }
        return s;
      })
    }));
  };

  const replicateSquadAcrossPhases = (sourcePhase = 'ofensive') => {
    if (!activeSeasonId) return;
    const fromKey = sourcePhase === 'ofensive' ? 'tacticsOfensive' : 'tacticsDefensive';
    const toKey = sourcePhase === 'ofensive' ? 'tacticsDefensive' : 'tacticsOfensive';

    setData(prev => ({
      ...prev,
      seasons: prev.seasons.map(s => {
        if (s.id === activeSeasonId) {
          const fromTactics = s[fromKey] || {};
          const toTactics = s[toKey] || {};
          const fromXI = fromTactics.startingXI || [];
          const toXI = toTactics.startingXI || [];

          const syncedXI = fromXI.map((slot, idx) => {
            const destSlot = toXI[idx] || {};
            return {
              ...destSlot,
              playerName: slot.playerName,
              substitutes: slot.substitutes ? [...slot.substitutes] : []
            };
          });

          return {
            ...s,
            [toKey]: {
              ...toTactics,
              startingXI: syncedXI
            }
          };
        }
        return s;
      })
    }));
  };

  const addTransfer = (transferData) => {
    if (!activeSeasonId) return;
    const fee = Number(transferData.fee) || 0;
    const newTransfer = {
      id: "t_" + Date.now(),
      seasonId: activeSeasonId,
      playerName: transferData.playerName,
      type: transferData.type,
      fee: fee,
      fromTo: transferData.fromTo
    };

    let budgetDelta = 0;
    if (transferData.type === 'Fichaje') budgetDelta = -fee;
    if (transferData.type === 'Venta') budgetDelta = fee;

    setData(prev => ({
      ...prev,
      transfers: [newTransfer, ...prev.transfers],
      seasons: prev.seasons.map(s => {
        if (s.id === activeSeasonId) {
          return {
            ...s,
            budget: Math.max(0, s.budget + budgetDelta)
          };
        }
        return s;
      })
    }));
  };

  const addShortlistPlayer = (playerData) => {
    if (!activeSeasonId) return;
    const newShortlistPlayer = {
      id: "sh_" + Date.now(),
      seasonId: activeSeasonId,
      name: playerData.name || '',
      position: playerData.position || 'DC',
      age: Number(playerData.age) || 23,
      currentClub: playerData.currentClub || '',
      estimatedValue: Number(playerData.estimatedValue) || 10000000,
      contractExpiring: Boolean(playerData.contractExpiring), // Termina contrato (Fichaje Libre)
      notes: playerData.notes || ''
    };

    setData(prev => ({
      ...prev,
      shortlist: [newShortlistPlayer, ...(prev.shortlist || [])]
    }));
  };

  const deleteShortlistPlayer = (shortlistId) => {
    setData(prev => ({
      ...prev,
      shortlist: (prev.shortlist || []).filter(s => s.id !== shortlistId)
    }));
  };

  const updateShortlistPlayer = (shortlistId, updatedFields) => {
    setData(prev => ({
      ...prev,
      shortlist: (prev.shortlist || []).map(s => s.id === shortlistId ? { ...s, ...updatedFields } : s)
    }));
  };

  const addYouthProspect = (youthInfo) => {
    if (!activeSeasonId) return;
    const initOvr = Number(youthInfo.initialOverall) || 64;
    const currOvr = Number(youthInfo.currentOverall) || initOvr;
    const age = Number(youthInfo.age) || 16;

    const newYouth = {
      id: "y_" + Date.now(),
      seasonId: activeSeasonId,
      name: youthInfo.name,
      age: age,
      position: youthInfo.position,
      potential: youthInfo.potential || "85-94",
      initialOverall: initOvr,
      currentOverall: currOvr,
      promoted: false
    };

    setData(prev => ({
      ...prev,
      youthAcademy: [newYouth, ...prev.youthAcademy]
    }));
  };

  const updateYouthProspect = (youthId, updatedFields) => {
    setData(prev => ({
      ...prev,
      youthAcademy: prev.youthAcademy.map(y => {
        if (y.id === youthId) {
          return { ...y, ...updatedFields };
        }
        return y;
      })
    }));
  };

  const deleteYouthProspect = (youthId) => {
    setData(prev => ({
      ...prev,
      youthAcademy: prev.youthAcademy.filter(y => y.id !== youthId)
    }));
  };

  const promoteYouthProspect = (youthId) => {
    const youth = data.youthAcademy.find(y => y.id === youthId);
    if (!youth || youth.promoted) return;

    const finalOverall = youth.currentOverall || youth.initialOverall || 70;
    const newPlayer = {
      id: "p_promoted_" + Date.now(),
      seasonId: activeSeasonId,
      name: youth.name + " (Cantera)",
      position: youth.position,
      age: youth.age || 17,
      overall: finalOverall,
      stats: { minutes: 0, matches: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0 }
    };

    setData(prev => ({
      ...prev,
      players: [...prev.players, newPlayer],
      youthAcademy: prev.youthAcademy.map(y => y.id === youthId ? { ...y, promoted: true } : y)
    }));
  };

  const savePressConference = (conferenceObj) => {
    if (!activeSeasonId) return;
    const newConf = {
      id: "press_" + Date.now(),
      seasonId: activeSeasonId,
      date: new Date().toLocaleDateString('es-ES'),
      ...conferenceObj
    };
    setData(prev => ({
      ...prev,
      pressConferences: [newConf, ...(prev.pressConferences || [])]
    }));
  };

  const saveNewsArticle = (articleObj) => {
    if (!activeSeasonId) return;
    const newArticle = {
      id: "article_" + Date.now(),
      seasonId: activeSeasonId,
      isFavorite: false,
      ...articleObj
    };
    setData(prev => ({
      ...prev,
      newsArticles: [newArticle, ...(prev.newsArticles || [])]
    }));
  };

  const toggleNewsFavorite = (articleId) => {
    setData(prev => ({
      ...prev,
      newsArticles: (prev.newsArticles || []).map(n => {
        if (n.id === articleId) {
          return { ...n, isFavorite: !n.isFavorite };
        }
        return n;
      })
    }));
  };

  const clearUnfavoritedNews = () => {
    if (!activeSeasonId) return;
    setData(prev => ({
      ...prev,
      newsArticles: (prev.newsArticles || []).filter(n => n.seasonId !== activeSeasonId || n.isFavorite)
    }));
  };

  const addCompetition = (compData) => {
    if (!activeSeasonId) return;
    const newEntry = {
      id: "comp_" + Date.now(),
      name: compData.name,
      type: compData.type || "league",
      status: compData.status || "en_curso",
      result: compData.result || "En Curso"
    };

    setData(prev => ({
      ...prev,
      seasons: prev.seasons.map(s => {
        if (s.id === activeSeasonId) {
          return {
            ...s,
            competitions: [...(s.competitions || []), newEntry]
          };
        }
        return s;
      })
    }));
  };

  const updateCompetitionEntry = (compId, updatedFields) => {
    if (!activeSeasonId) return;
    setData(prev => ({
      ...prev,
      seasons: prev.seasons.map(s => {
        if (s.id === activeSeasonId) {
          return {
            ...s,
            competitions: (s.competitions || []).map(c => c.id === compId ? { ...c, ...updatedFields } : c)
          };
        }
        return s;
      })
    }));
  };

  const deleteCompetitionEntry = (compId) => {
    if (!activeSeasonId) return;
    setData(prev => ({
      ...prev,
      seasons: prev.seasons.map(s => {
        if (s.id === activeSeasonId) {
          return {
            ...s,
            competitions: (s.competitions || []).filter(c => c.id !== compId)
          };
        }
        return s;
      })
    }));
  };

  const updateAwards = (newAwards) => {
    if (!activeSeasonId) return;
    setData(prev => ({
      ...prev,
      seasons: prev.seasons.map(s => {
        if (s.id === activeSeasonId) {
          return {
            ...s,
            awards: { ...s.awards, ...newAwards }
          };
        }
        return s;
      })
    }));
  };

  const resetToDefaultData = () => {
    localStorage.removeItem(userStorageKey);
    const resetObj = {
      ...INITIAL_DATA,
      clubs: [
        {
          id: "c1_" + Date.now(),
          name: "CD Leganés",
          stadium: "Estadio Municipal de Butarque",
          logo: "⚽",
          color: "#0055A5",
          managerName: currentUser ? currentUser.name : "Mánager",
          globalWinRate: 50.0,
          totalTrophies: 0
        }
      ],
      seasons: [
        {
          id: "s1_" + Date.now(),
          clubId: "c1_" + Date.now(),
          year: "2024/25",
          budget: 15000000,
          narrativeContext: DEFAULT_SEASON_NARRATIVE,
          matchResults: { wins: 0, draws: 0, losses: 0 },
          tacticsOfensive: {
            formation: "4-2-3-1 (Estrecho)",
            style: "Posesión",
            width: 65,
            depth: 70,
            playersInBox: 6,
            startingXI: []
          },
          tacticsDefensive: {
            formation: "4-4-2 (Plano)",
            style: "Presión tras Pérdida",
            width: 45,
            depth: 40,
            startingXI: []
          },
          competitions: [
            { id: "comp_" + Date.now(), name: "LaLiga EA Sports", type: "league", status: "en_curso", result: "En Curso" }
          ],
          awards: { mvp: "Por determinar", topScorer: "Por determinar", topAssister: "Por determinar" }
        }
      ],
      players: [],
      transfers: [],
      youthAcademy: [],
      pressConferences: [],
      newsArticles: []
    };

    setData(resetObj);
    if (currentUser?.email) {
      saveUserCloudData(currentUser.email, { userProfile: currentUser, careerData: resetObj });
    }
  };

  return (
    <AppContext.Provider value={{
      data,
      setData,
      syncStatus,
      lastSyncedAt,
      forceSyncCloud,
      activeClubId,
      activeSeasonId,
      activeClub,
      activeSeason,
      clubSeasons,
      currentPlayers,
      currentTransfers,
      currentShortlist,
      currentYouth,
      currentMatches,
      latestMatchDate,
      recoveredPlayersQueue,
      dismissRecoveredModal,
      manuallyDischargePlayer,
      currentPress,
      currentNews,
      computedWinRate,
      clubTotalWins,
      clubTotalDraws,
      clubTotalLosses,
      clubTotalMatches,
      updateSeasonNarrative,
      recordMatchResult,
      selectClub,
      setActiveSeasonId,
      updateClub,
      addClub,
      addSeason,
      updateSeason,
      deleteSeason,
      addPlayer,
      updatePlayerStats,
      deletePlayer,
      addMatch,
      deleteMatch,
      updateMatch,
      updatePhaseTactics,
      replicateSquadAcrossPhases,
      addTransfer,
      addShortlistPlayer,
      deleteShortlistPlayer,
      updateShortlistPlayer,
      addYouthProspect,
      updateYouthProspect,
      deleteYouthProspect,
      promoteYouthProspect,
      savePressConference,
      saveNewsArticle,
      toggleNewsFavorite,
      clearUnfavoritedNews,
      addCompetition,
      updateCompetitionEntry,
      deleteCompetitionEntry,
      updateAwards,
      resetToDefaultData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
