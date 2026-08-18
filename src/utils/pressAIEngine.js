/**
 * Press & News AI Engine V6
 * Automatic AI News & Press Generation powered by Google Gemini AI & Heuristic Fallbacks.
 * Real Journalists: José Félix Díaz (MARCA), Tomás Roncero (AS), Josep Pedrerol (El Chiringuito).
 */

import { generateGeminiPressQuestions, generateGeminiPressArticles } from './geminiService';

export const REAL_JOURNALISTS = [
  { name: 'José Félix Díaz', outletId: 'marca', outletName: 'Diario MARCA', focus: 'Táctico, institucional y directiva' },
  { name: 'Tomás Roncero', outletId: 'as', outletName: 'Diario AS', focus: 'Pasión, orgullo, afición y garra' },
  { name: 'Josep Pedrerol', outletId: 'chiringuito', outletName: 'El Chiringuito', focus: 'Exclusivas, tensión y titulares bomba' },
  { name: 'Lluís Mascaró', outletId: 'sport', outletName: 'Diario SPORT', focus: 'Seguimiento culé e internacional' },
  { name: 'Fernando Polo', outletId: 'mundodeportivo', outletName: 'Mundo Deportivo', focus: 'Análisis detallado de vestuario' },
  { name: 'Guillem Balagué', outletId: 'bbcsport', outletName: 'BBC Sport', focus: 'Cobertura internacional táctica' }
];

export const MEDIA_OUTLETS = [
  { id: 'marca', name: 'Diario MARCA', color: '#E53E3E', bg: 'bg-red-600', text: 'text-red-500', logo: '🔴 MARCA', motto: 'El periódico de la afición' },
  { id: 'as', name: 'Diario AS', color: '#DD6B20', bg: 'bg-amber-600', text: 'text-amber-500', logo: '🟧 AS', motto: 'Diario de referencia deportiva' },
  { id: 'sport', name: 'Diario SPORT', color: '#CC0000', bg: 'bg-red-700', text: 'text-red-400', logo: '🔻 SPORT', motto: 'Siempre con la emoción del fútbol' },
  { id: 'mundodeportivo', name: 'Mundo Deportivo', color: '#2B6CB0', bg: 'bg-blue-600', text: 'text-blue-400', logo: '🔷 MUNDO DEPORTIVO', motto: 'Decano de la prensa deportiva' },
  { id: 'chiringuito', name: 'El Chiringuito de Jugones', color: '#805AD5', bg: 'bg-purple-600', text: 'text-purple-400', logo: '⚡ EL CHIRINGUITO', motto: '¡Exclusiva en el plató!' },
  { id: 'bbcsport', name: 'BBC Sport', color: '#319795', bg: 'bg-teal-600', text: 'text-teal-400', logo: '🌐 BBC SPORT', motto: 'International Sports Coverage' }
];

export const SEASON_NARRATIVE_PRESETS = [
  {
    id: 'mid_season_rescue',
    title: '🚨 Llegada a Mitad de Temporada (Puesto 14 / Rescate)',
    description: 'Tomamos el mando a mitad de temporada con el equipo en zona baja. La directiva exige evitar el descenso y recuperar la solidez.'
  },
  {
    id: 'title_race',
    title: '👑 Peleando el Título de Liga',
    description: 'Luchamos en los primeros puestos mano a mano por el campeonato. La presión de no fallar ningún fin de semana es máxima.'
  },
  {
    id: 'champions_dream',
    title: '⚡ Equipo Revelación (Puestos Europeos)',
    description: 'Sorprendemos a la liga en los puestos nobles. La prensa empieza a vernos como serios aspirantes a clasificar para Champions/Europa League.'
  },
  {
    id: 'crisis_hotseat',
    title: '🔥 Crisis de Resultados & Rumores de Cese',
    description: 'Mala racha de resultados consecutivos. La afición está impaciente y los medios especulan con la continuidad del banquillo.'
  },
  {
    id: 'youth_project',
    title: '🌱 Reconstrucción con Jóvenes de Cantera',
    description: 'Proyecto a largo plazo apostando por canteranos y promesas jóvenes. Menor presupuesto pero máxima ambición de crecimiento.'
  },
  {
    id: 'unbeaten_streak',
    title: '🛡️ En Racha Imparable (5 Victorias Seguidas)',
    description: 'El equipo viene con la moral por las nubes tras una racha de triunfos y un estilo de juego consolidado.'
  }
];

/**
 * Generate 3 Journalist questions respecting Season Narrative Context + Match Preview
 */
export const generatePressQuestions = (params) => {
  const {
    seasonContext = '',
    matchPreview = '',
    clubName = 'el club',
    managerName = 'Mánager',
    teamStats = { wins: 0, draws: 0, losses: 0, winRate: 50 }
  } = (typeof params === 'string' ? { matchPreview: params } : params);

  const fullText = `${seasonContext} ${matchPreview}`.toLowerCase();

  let q1 = "";
  let q2 = "";
  let q3 = "";

  // 1. Specific Context Logic
  if (fullText.includes("mitad de temporada") || fullText.includes("llegada") || fullText.includes("relevo") || fullText.includes("nuevo entrenador") || fullText.includes("puesto 14") || fullText.includes("descenso") || fullText.includes("permanencia")) {
    q1 = `Mánager ${managerName}, tomar el equipo con la temporada ya avanzada y en esta situación en la tabla es un reto mayúsculo. ¿Siente que el vestuario ha asimilado ya su modelo de juego para este partido clave?`;
    q2 = `Tomás Roncero (AS): "La afición de ${clubName} se niega a sufrir por la permanencia. ¿Qué mensaje de entrega y orgullo le manda hoy a la grada antes de saltar al campo?"`;
    q3 = `Josep Pedrerol (El Chiringuito): "¡Atención Mánager! Si hoy no se consiguen los 3 puntos, la distancia con la zona roja puede ser crítica. ¿Siente que este choque es una auténtica final anticipada?"`;
  } else if (fullText.includes("título") || fullText.includes("lider") || fullText.includes("campeón") || fullText.includes("primero")) {
    q1 = `José Félix Díaz (MARCA): "Mánager ${managerName}, estar en la cima exige convivir con la presión constante. ¿Cómo gestionará la exigencia táctica para mantenerse en el liderato?"`;
    q2 = `Tomás Roncero (AS): "Todo el fútbol español tiene los ojos puestos en ${clubName}. ¿Ve a este grupo con la casta necesaria para levantar el trofeo a final de curso?"`;
    q3 = `Josep Pedrerol (El Chiringuito): "¿Hay vértigo en el vestuario al verse favoritos? ¿Le preocupa que un exceso de confianza pase factura hoy?"`;
  } else if (fullText.includes("copa") || fullText.includes("semifinal") || fullText.includes("final") || fullText.includes("eliminatoria") || fullText.includes("ida") || fullText.includes("vuelta")) {
    q1 = `José Félix Díaz (MARCA): "Mánager ${managerName}, en un choque eliminatorio los detalles marcan la gloria o la decepción. ¿Priorizará la solidez defensiva o buscará golpear primero?"`;
    q2 = `Tomás Roncero (AS): "Estas son las noches que quedan grabadas en la historia del club. ¿Cómo ve los ojos de sus futbolistas en el vestuario antes de la batalla?"`;
    q3 = `Josep Pedrerol (El Chiringuito): "Si hoy quedan eliminados, ¿se consideraría un fracaso para la temporada de ${clubName}?"`;
  } else if (fullText.includes("derbi") || fullText.includes("clásico") || fullText.includes("rival") || fullText.includes("madrid") || fullText.includes("barcelona") || fullText.includes("atleti")) {
    q1 = `José Félix Díaz (MARCA): "Mánager, enfrentarse al máximo rival siempre condiciona la pizarra. ¿Introducirá algún matiz táctico especial en la alineación para neutralizar sus puntos fuertes?"`;
    q2 = `Tomás Roncero (AS): "Un partido así se gana con el corazón y el escudo. ¿Qué futbolista está llamado a ser el héroe de la afición hoy?"`;
    q3 = `Josep Pedrerol (El Chiringuito): "Se habla de tensión y favoritismo en la previa. ¿Acepta que el rival llega como favorito o sale a desafiarlos sin complejos?"`;
  } else if (fullText.includes("crisis") || fullText.includes("racha negativa") || fullText.includes("derrota") || fullText.includes("perder") || fullText.includes("bajas") || fullText.includes("lesion")) {
    q1 = `José Félix Díaz (MARCA): "Mánager ${managerName}, tras los recientes tropiezos, ¿ha mantenido conversaciones con la directiva sobre los objetivos inmediatos?"`;
    q2 = `Tomás Roncero (AS): "En los momentos duros es donde se ven a los auténticos líderes. ¿Confía plenamente en que la plantilla se dejará el alma para revertir la situación?"`;
    q3 = `Josep Pedrerol (El Chiringuito): "¡Exclusiva! Hay debate en la calle sobre el rumbo del equipo. ¿Siente el respaldo incondicional de los pesos pesados del vestuario?"`;
  } else {
    q1 = `José Félix Díaz (MARCA): "Mánager ${managerName}, teniendo en cuenta el contexto de la temporada de ${clubName} (${teamStats.wins}V - ${teamStats.draws}E - ${teamStats.losses}D), ¿cuál es el plan táctico primordial para sumar los 3 puntos hoy?"`;
    q2 = `Tomás Roncero (AS): "¿Qué grado de intensidad y compromiso le exige hoy a los jugadores para que la afición se sienta orgullosa desde el minuto 1?"`;
    q3 = `Josep Pedrerol (El Chiringuito): "Con el calendario tan ajustado y lo que hay en juego, ¿hará rotaciones o pondrá toda la artillería en el 11 titular?"`;
  }

  return [
    { 
      id: 'q1', 
      journalist: 'José Félix Díaz', 
      outletName: 'Diario MARCA', 
      question: q1, 
      answer: '' 
    },
    { 
      id: 'q2', 
      journalist: 'Tomás Roncero', 
      outletName: 'Diario AS', 
      question: q2, 
      answer: '' 
    },
    { 
      id: 'q3', 
      journalist: 'Josep Pedrerol', 
      outletName: 'El Chiringuito', 
      question: q3, 
      answer: '' 
    }
  ];
};

/**
 * Async Question Generator: Calls Gemini if API key available, else heuristic
 */
export const generatePressQuestionsAsync = async ({ apiKey, clubName, managerName, seasonContext, matchPreview, teamStats }) => {
  if (apiKey && apiKey.trim()) {
    try {
      const geminiQuestions = await generateGeminiPressQuestions(apiKey, {
        clubName,
        managerName,
        seasonContext,
        matchPreview,
        teamStats
      });
      if (geminiQuestions && geminiQuestions.length >= 3) {
        return { questions: geminiQuestions, source: 'gemini' };
      }
    } catch (err) {
      console.warn("Falling back to heuristic press questions due to Gemini error:", err);
    }
  }

  const fallback = generatePressQuestions({
    seasonContext,
    matchPreview,
    clubName,
    managerName,
    teamStats
  });

  return { questions: fallback, source: 'heuristic' };
};

/**
 * Async News Generator: Calls Gemini if API key available, else heuristic
 */
export const generateNewsFromPressConferenceAsync = async ({ apiKey, clubName, managerName, seasonContext, matchPreview, qaList }) => {
  if (apiKey && apiKey.trim()) {
    try {
      const geminiArticles = await generateGeminiPressArticles(apiKey, {
        clubName,
        managerName,
        seasonContext,
        matchPreview,
        qaList
      });
      if (geminiArticles && geminiArticles.length >= 3) {
        return geminiArticles;
      }
    } catch (err) {
      console.warn("Falling back to heuristic news generation:", err);
    }
  }

  return generateNewsFromPressConference(seasonContext, matchPreview, qaList, clubName, managerName);
};

/**
 * Heuristic newspaper front pages generator (Fallback)
 */
export const generateNewsFromPressConference = (seasonContext, matchPreview, qaList, clubName = 'Club', managerName = 'Mánager') => {
  const answer1 = qaList[0]?.answer || "Vamos a salir a ganar con todo nuestro potencial y rigor táctico.";
  const answer2 = qaList[1]?.answer || "Confío plenamente en el trabajo, el honor y la unión de la plantilla.";
  const answer3 = qaList[2]?.answer || "La afición será nuestro jugador número doce y responderá en el campo.";

  const dateStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  // MARCA FRONT PAGE
  const marcaArticle = {
    id: 'news_marca_' + Date.now(),
    outletId: 'marca',
    outletName: 'Diario MARCA',
    outletLogo: '🔴 MARCA',
    headline: `"${answer1.slice(0, 52).toUpperCase()}..."`,
    subheadline: `Declaraciones exclusivas de ${managerName} en la previa oficial del ${clubName}.`,
    body: `El técnico del ${clubName}, ${managerName}, compareció en sala de prensa. Consultado sobre el momento del equipo y los objetivos marcados, fue tajante ante José Félix Díaz: "${answer1}". Añadió sobre el compromiso del grupo: "${answer2}". Un plan definido para encarar el choque.`,
    date: dateStr,
    author: 'José Félix Díaz (MARCA)',
    isFavorite: false
  };

  // AS FRONT PAGE
  const asArticle = {
    id: 'news_as_' + Date.now(),
    outletId: 'as',
    outletName: 'Diario AS',
    outletLogo: '🟧 AS',
    headline: `¡${managerName.toUpperCase()}: "ORGULLO Y ENTREGA TOTAL"!`,
    subheadline: `Tomás Roncero analiza la rueda de prensa previa en el feudo de ${clubName}.`,
    body: `Ambiente de máxima expectación. Tomás Roncero (Diario AS) preguntó a ${managerName} por la entrega requerida. El entrenador no dudó: "${answer2}". Además, envió un mensaje apasionado a la grada: "${answer3}". La afición ya está volcada para la cita.`,
    date: dateStr,
    author: 'Tomás Roncero (AS)',
    isFavorite: false
  };

  // EL CHIRINGUITO FRONT PAGE
  const chiringuitoArticle = {
    id: 'news_chiringuito_' + Date.now(),
    outletId: 'chiringuito',
    outletName: 'El Chiringuito de Jugones',
    outletLogo: '⚡ EL CHIRINGUITO',
    headline: `¡EXCLUSIVA! ${managerName.toUpperCase()}: "LA RESPUESTA SERÁ EN EL CÉSPED"`,
    subheadline: `Josep Pedrerol reacciona a las contundentes palabras del míster del ${clubName}.`,
    body: `¡Atención al bombazo en sala de prensa! Josep Pedrerol arrancó el debate con la respuesta de ${managerName}: "${answer3}". El plató analiza si las palabras del técnico aumentan la presión sobre el once titular o suponen el espaldarazo definitivo para el vestuario.`,
    date: dateStr,
    author: 'Josep Pedrerol (El Chiringuito)',
    isFavorite: false
  };

  return [marcaArticle, asArticle, chiringuitoArticle];
};
