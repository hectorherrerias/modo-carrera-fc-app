import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { INITIAL_DATA } from '../mockData';
import { fetchUserCloudData, saveUserCloudData } from '../utils/cloudSyncService';

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

  // Re-load data whenever currentUser changes: Check Cloud First!
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
  const currentYouth = data.youthAcademy?.filter(y => y.seasonId === activeSeasonId) || [];
  const currentPress = (data.pressConferences || []).filter(p => p.seasonId === activeSeasonId);
  const currentNews = (data.newsArticles || []).filter(n => n.seasonId === activeSeasonId);

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
      const remainingYouth = prev.youthAcademy.filter(y => y.seasonId !== seasonId);
      const remainingPress = (prev.pressConferences || []).filter(p => p.seasonId !== seasonId);
      const remainingNews = (prev.newsArticles || []).filter(n => n.seasonId !== seasonId);

      return {
        ...prev,
        seasons: remainingSeasons,
        players: remainingPlayers,
        transfers: remainingTransfers,
        youthAcademy: remainingYouth,
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
    if (lastSeason && seasonData.copySquad) {
      const prevPlayers = data.players.filter(p => p.seasonId === lastSeason.id);
      copiedPlayers = prevPlayers.map(p => ({
        ...p,
        id: "p_" + Math.random().toString(36).substr(2, 9),
        seasonId: seasonId,
        stats: { minutes: 0, matches: 0, goals: 0, assists: 0, cleanSheets: 0, yellowCards: 0, redCards: 0 }
      }));
    }

    setData(prev => ({
      ...prev,
      seasons: [...prev.seasons, newSeason],
      players: [...prev.players, ...copiedPlayers]
    }));

    setActiveSeasonId(seasonId);
  };

  const addPlayer = (playerInfo) => {
    if (!activeSeasonId) return;
    const newPlayer = {
      id: "p_" + Date.now(),
      seasonId: activeSeasonId,
      name: playerInfo.name,
      position: playerInfo.position,
      overall: Number(playerInfo.overall) || 75,
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
          return {
            ...p,
            name: updatedStats.name !== undefined ? updatedStats.name : p.name,
            position: updatedStats.position !== undefined ? updatedStats.position : p.position,
            overall: updatedStats.overall !== undefined ? Number(updatedStats.overall) : p.overall,
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

  const updatePhaseTactics = (phase, phaseData) => {
    if (!activeSeasonId) return;
    const key = phase === 'ofensive' ? 'tacticsOfensive' : 'tacticsDefensive';
    
    setData(prev => ({
      ...prev,
      seasons: prev.seasons.map(s => {
        if (s.id === activeSeasonId) {
          return {
            ...s,
            [key]: {
              ...(s[key] || {}),
              ...phaseData
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

  const addYouthProspect = (youthInfo) => {
    if (!activeSeasonId) return;
    const initOvr = Number(youthInfo.initialOverall) || 64;
    const currOvr = Number(youthInfo.currentOverall) || initOvr;

    const newYouth = {
      id: "y_" + Date.now(),
      seasonId: activeSeasonId,
      name: youthInfo.name,
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
      currentYouth,
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
      updatePhaseTactics,
      addTransfer,
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
