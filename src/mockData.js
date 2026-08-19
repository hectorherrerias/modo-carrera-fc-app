export const INITIAL_DATA = {
  clubs: [
    {
      id: "c1",
      name: "CD Leganés",
      stadium: "Estadio Municipal de Butarque",
      logo: "⚽",
      color: "#0055A5",
      managerName: "Héctor Herrerías",
      globalWinRate: 65.5,
      totalTrophies: 2
    },
    {
      id: "c2",
      name: "Real Madrid",
      stadium: "Estadio Santiago Bernabéu",
      logo: "👑",
      color: "#FEBE10",
      managerName: "Héctor Herrerías",
      globalWinRate: 82.0,
      totalTrophies: 5
    }
  ],
  seasons: [
    {
      id: "s1",
      clubId: "c1",
      year: "2024/25",
      budget: 15000000,
      tactics: {
        formation: "4-2-3-1",
        style: "Presión Alta",
        startingXI: [
          { position: "POR", playerName: "", substitutes: [] },
          { position: "LD",  playerName: "", substitutes: [] },
          { position: "DFC", playerName: "", substitutes: [] },
          { position: "DFC", playerName: "", substitutes: [] },
          { position: "LI",  playerName: "", substitutes: [] },
          { position: "MCD", playerName: "", substitutes: [] },
          { position: "MC",  playerName: "", substitutes: [] },
          { position: "MCO", playerName: "", substitutes: [] },
          { position: "ED",  playerName: "", substitutes: [] },
          { position: "EI",  playerName: "", substitutes: [] },
          { position: "DC",  playerName: "", substitutes: [] }
        ]
      },
      competitions: [
        { id: "comp1", name: "LaLiga EA Sports", result: "En Curso" },
        { id: "comp2", name: "Copa del Rey", result: "En Curso" }
      ],
      awards: {
        mvp: "Por determinar",
        topScorer: "Por determinar",
        topAssister: "Por determinar"
      }
    }
  ],
  // Empty player squad by default so user can enter all players manually
  players: [],
  transfers: [],
  youthAcademy: [],
  matches: [],
  shortlist: []
};
