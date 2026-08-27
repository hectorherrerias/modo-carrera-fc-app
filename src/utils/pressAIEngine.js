/**
 * Press & News AI Engine V6
 * Automatic AI News & Press Generation powered by Google Gemini AI & Heuristic Fallbacks.
 * Real Journalists: José Félix Díaz (MARCA), Tomás Roncero (AS), Josep Pedrerol (El Chiringuito).
 */

import { generateGeminiPressQuestions, generateGeminiPressArticles, generateGeminiMatchNews } from './geminiService';

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

/**
 * Async Match News Generator: Calls Gemini if API key available, else heuristic
 */
export const generateNewsFromMatchResultAsync = async ({ apiKey, match, clubName, managerName, currentPlayers = [] }) => {
  const participants = match.playersInvolved || [];
  const scorers = participants.filter(p => (p.goals || 0) > 0).map(p => `${p.playerName}${p.goals > 1 ? ` (${p.goals})` : ''}`);
  const assisters = participants.filter(p => (p.assists || 0) > 0).map(p => `${p.playerName}${p.assists > 1 ? ` (${p.assists})` : ''}`);
  const officialMVPObj = currentPlayers.find(p => p.id === match.officialMVP);
  const myMVPObj = currentPlayers.find(p => p.id === match.myMVP);

  if (apiKey && apiKey.trim()) {
    try {
      const geminiArticles = await generateGeminiMatchNews(apiKey, {
        match,
        clubName,
        managerName,
        scorers,
        assisters,
        officialMVPName: officialMVPObj ? officialMVPObj.name : '',
        myMVPName: myMVPObj ? myMVPObj.name : ''
      });
      if (geminiArticles && geminiArticles.length >= 3) {
        return geminiArticles;
      }
    } catch (err) {
      console.warn("Falling back to heuristic match news generation:", err);
    }
  }

  return generateNewsFromMatchResult({ match, clubName, managerName, currentPlayers });
};

/**
 * Heuristic Match Result News Generator (Fallback)
 */
export const generateNewsFromMatchResult = ({ match, clubName = 'Club', managerName = 'Mánager', currentPlayers = [] }) => {
  const participants = match.playersInvolved || [];
  const scorers = participants.filter(p => (p.goals || 0) > 0).map(p => `${p.playerName}${p.goals > 1 ? ` (${p.goals})` : ''}`);
  const assisters = participants.filter(p => (p.assists || 0) > 0).map(p => `${p.playerName}${p.assists > 1 ? ` (${p.assists})` : ''}`);
  const redCards = participants.filter(p => (p.redCards || 0) > 0).map(p => p.playerName);

  const officialMVPObj = currentPlayers.find(p => p.id === match.officialMVP);
  const myMVPObj = currentPlayers.find(p => p.id === match.myMVP);
  const mvpName = officialMVPObj?.name || myMVPObj?.name || (scorers[0] ? scorers[0].split(' ')[0] : 'El equipo');

  const ourGoals = Number(match.ourGoals) >= 0 ? Number(match.ourGoals) : 0;
  const oppGoals = Number(match.opponentGoals) >= 0 ? Number(match.opponentGoals) : 0;
  const goalDiff = ourGoals - oppGoals;
  const isBlowoutWin = match.result === 'V' && goalDiff >= 3;
  const isTightWin = match.result === 'V' && goalDiff <= 2;
  const isCleanSheet = oppGoals === 0;
  const isHeavyDefeat = match.result === 'D' && goalDiff <= -3;
  const isTightDefeat = match.result === 'D' && goalDiff >= -2;
  const isGoallessDraw = match.result === 'E' && ourGoals === 0;
  const isScoringDraw = match.result === 'E' && ourGoals > 0;

  const dateStr = match.date || new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const venueText = match.venue === 'visitante' ? 'a domicilio' : 'ante su afición';
  const scorersListText = scorers.length > 0 ? scorers.join(', ') : 'el colectivo';

  let marcaHead = '';
  let marcaSub = '';
  let marcaBody = '';

  let asHead = '';
  let asSub = '';
  let asBody = '';

  let chiriHead = '';
  let chiriSub = '';
  let chiriBody = '';

  if (match.result === 'V') {
    if (isBlowoutWin) {
      marcaHead = `FIESTA TOTAL: EL ${clubName.toUpperCase()} APLASTA AL ${match.opponent.toUpperCase()} (${match.score})`;
      marcaSub = `Exhibición táctica del conjunto de ${managerName} en ${match.competition}. ${scorersListText} firman una goleada memorable.`;
      marcaBody = `Noche para el recuerdo de ${clubName}. Con un despliegue ofensivo arrollador ${venueText}, el equipo de ${managerName} no dio opción al ${match.opponent}. Los goles de ${scorersListText} y el liderazgo de ${mvpName} desataron el entusiasmo de la afición.`;

      asHead = `¡QUÉ VENDAVAL! EL ${clubName.toUpperCase()} ENAMORA Y GOLEA`;
      asSub = `Tomás Roncero: "Este equipo tiene alma de campeón. Vaya recital ante el ${match.opponent}".`;
      asBody = `¡Puro fútbol, corazón y goles! El ${clubName} pasó por encima del ${match.opponent} con un contundente ${match.score}. ${mvpName} brilló con luz propia en una actuación memorable donde la garra y el talento se unieron para firmar un triunfo de época.`;

      chiriHead = `¡BOMBAZO! ${managerName.toUpperCase()} DESATA LA LOCURA CON UN ${match.score} HISTÓRICO`;
      chiriSub = `Josep Pedrerol: "¡Atención a lo que ha hecho hoy el ${clubName}! ¿Hay techo para este proyecto?"`;
      chiriBody = `¡Exclusiva en el plató! El ${clubName} fulmina al ${match.opponent} con una goleada que retumba en todo el panorama futbolístico. El vestuario celebra un triunfo monumental liderado por ${mvpName} y los goles de ${scorersListText}.`;
    } else {
      marcaHead = `TRIUNFO DE ORO: EL ${clubName.toUpperCase()} SE IMPONE AL ${match.opponent.toUpperCase()} (${match.score})`;
      marcaSub = `Victoria trabajada del cuadro de ${managerName} en ${match.competition} con ${isCleanSheet ? 'cerrojo defensivo y ' : ''}gol decisivo de ${scorersListText}.`;
      marcaBody = `El ${clubName} sumó tres puntos vitales tras doblegar al ${match.opponent} por ${match.score}. Los pupilos de ${managerName} mostraron madurez competitiva ${venueText}. La solidez en los momentos clave y el acierto de ${scorersListText} marcaron la diferencia.`;

      asHead = `¡CON CARÁCTER Y ORGULLO! VICTORIA CLAVE DEL ${clubName.toUpperCase()}`;
      asSub = `Un triunfo de los que forjan temporadas. ${mvpName} lidera la resistencia ante el ${match.opponent}.`;
      asBody = `Partido de brega, entrega incondicional y premio mayor para el ${clubName}. Con el pitido final, el marcador de ${match.score} hizo justicia al esfuerzo de los jugadores de ${managerName}. ${scorers.length > 0 ? `El gol de ${scorers[0]} desató el júbilo.` : 'La unión del vestuario fue la clave.'}`;

      chiriHead = `¡PASO AL FRENTE! EL ${clubName.toUpperCase()} GANA CON AUTORIDAD AL ${match.opponent.toUpperCase()}`;
      chiriSub = `Josep Pedrerol analiza el golpe sobre la mesa de ${managerName} en ${match.competition}.`;
      chiriBody = `¡Victoria crucial! En un duelo de máxima tensión, el ${clubName} se llevó los tres puntos (${match.score}). El debate en El Chiringuito se centra en el gran momento de forma de ${mvpName} y el planteamiento ganador del entrenador.`;
    }
  } else if (match.result === 'E') {
    if (isGoallessDraw) {
      marcaHead = `TABLAS SIN GOLES: ${clubName.toUpperCase()} Y ${match.opponent.toUpperCase()} FIRMAN UN 0-0 TÁCTICO`;
      marcaSub = `Faltó puntería en los metros finales en ${match.competition}. Buena imagen defensiva pero pólvora mojada.`;
      marcaBody = `Empate sin goles en un encuentro de mucho rigor táctico y pocas concesiones. El ${clubName} de ${managerName} mantuvo la compostura atrás ${venueText}, aunque acusó la falta de pegada para perforar la portería rival.`;

      asHead = `¡MUCHA PELEA Y POCO PREMIO! EMPATE A CERO ANTE EL ${match.opponent.toUpperCase()}`;
      asSub = `El ${clubName} lo intentó con insistencia hasta el 90' pero el balón no quiso entrar.`;
      asBody = `El ${clubName} mereció más en su duelo frente al ${match.opponent}. A pesar del dominio y la intensidad transmitida desde el banquillo por ${managerName}, el 0-0 final deja un sabor agridulce tras un desgaste físico mayúsculo.`;

      chiriHead = `¡DEBATE ABIERTO TRAS EL 0-0! ¿PUNTO GANADO O DOS PUNTOS PERDIDOS?`;
      chiriSub = `Josep Pedrerol: "Faltó ambición en ataque. El ${clubName} no puede conformarse con el empate".`;
      chiriBody = `Reparto de puntos y discusión servida. ¿Es suficiente el punto sumado ante el ${match.opponent}? ${managerName} defendió la solidez de su equipo, pero en el plató se exige más colmillo de cara a portería.`;
    } else {
      marcaHead = `TABLAS VIBRANTES: EL ${clubName.toUpperCase()} EMPATA (${match.score}) CON EL ${match.opponent.toUpperCase()}`;
      marcaSub = `Duelo de ida y vuelta en ${match.competition}. ${scorersListText} anotaron para el conjunto de ${managerName}.`;
      marcaBody = `Espectáculo y goles en un encuentro frenético que terminó con reparto de puntos (${match.score}). El ${clubName} demostró capacidad de reacción ${venueText} gracias al acierto de ${scorersListText}, aunque no pudo sellar la victoria en los compases finales.`;

      asHead = `¡BATALLA SIN TREGUA! EMPATE CON GOLES Y CORAZÓN`;
      asSub = `Tomás Roncero: "Se dejaron la piel. El ${match.score} refleja la emoción de un partidazo".`;
      asBody = `Nadie se guardó nada sobre el césped. El ${clubName} plantó cara al ${match.opponent} en un choque trepidante repleto de alternativas. Los tantos de ${scorersListText} hicieron vibrar a los aficionados.`;

      chiriHead = `¡LOCURA DE PARTIDO! ${match.score} ENTRE ${clubName.toUpperCase()} Y ${match.opponent.toUpperCase()}`;
      chiriSub = `Josep Pedrerol: "¡Qué partido! Pero ojo a los errores atrás que costaron la victoria".`;
      chiriBody = `¡Festival goleador y tensión hasta el descuento! El ${clubName} y el ${match.opponent} firmaron un espectacular ${match.score}. En El Chiringuito se analizan los aciertos ofensivos de ${mvpName} y los desajustes defensivos.`;
    }
  } else {
    if (isHeavyDefeat) {
      marcaHead = `NOCHE NEGRA: EL ${clubName.toUpperCase()} CAE GOLEADO ANTE EL ${match.opponent.toUpperCase()} (${match.score})`;
      marcaSub = `Dura bofetada en ${match.competition}. ${managerName} obligado a hacer autocrítica urgente tras una actuación irreconocible.`;
      marcaBody = `Doloroso revés para el ${clubName}. El conjunto de ${managerName} fue superado con claridad por el ${match.opponent} (${match.score}) ${venueText}. Urge corregir errores y recuperar la identidad competitiva de cara a las próximas jornadas.`;

      asHead = `¡GOLPE MUY DURO! EL ${clubName.toUpperCase()} SE DESMORONA EN UN DÍA GRIS`;
      asSub = `Tomás Roncero: "Hay que pedir perdón a la afición y levantarse ya mismo de este ${match.score}".`;
      asBody = `Nadie esperaba un desenlace tan amargo. El ${clubName} sufrió un castigo excesivo frente al ${match.opponent} en una tarde donde nada salió bien. Toca resetear el vestuario, apretar los dientes y dar la cara en el próximo compromiso.`;

      chiriHead = `¡ALARMA TOTAL! BARRAPENAS DEL ${clubName.toUpperCase()} ANTE EL ${match.opponent.toUpperCase()}`;
      chiriSub = `Josep Pedrerol: "¡CUIDADO! Esto no se puede repetir. ¿Qué le ha pasado al equipo de ${managerName}?"`;
      chiriBody = `¡Incendio en sala de prensa! La contundente derrota (${match.score}) desata las críticas más severas. El Chiringuito analiza si el crédito del técnico se resiente o si habrá revolución en el próximo once titular.`;
    } else {
      marcaHead = `TROPICIEZO AJUSTADO: EL ${clubName.toUpperCase()} CEDE ANTE EL ${match.opponent.toUpperCase()} (${match.score})`;
      marcaSub = `Un detalle decantó la balanza en ${match.competition}. El equipo de ${managerName} lo intentó hasta el final sin fortuna.`;
      marcaBody = `Derrota por la mínima del ${clubName} frente al ${match.opponent} (${match.score}). Pese al esfuerzo colectivo y las ocasiones generadas ${venueText}, los errores puntuales castigaron al cuadro de ${managerName}.`;

      asHead = `¡CRUEL DESENLACE! EL ${clubName.toUpperCase()} ROZÓ EL PREMIO PERO CAE DERROTADO`;
      asSub = `Castigo inmerecido tras un partido de gran desgaste. El vestuario promete revancha.`;
      asBody = `El fútbol a veces no entiende de merecimientos. El ${clubName} dio la cara en todo momento ante el ${match.opponent}, pero un ${match.score} adverso frena la progresión del equipo. ${managerName} apeló a la unión del grupo para rehacerse de inmediato.`;

      chiriHead = `¡FALTA DE CONTUNDENCIA! EL ${clubName.toUpperCase()} PIERDE POR LA MÍNIMA (${match.score})`;
      chiriSub = `Josep Pedrerol: "En estos partidos no se puede perdonar tanto. Hay que exigir más".`;
      chiriBody = `Decepción tras la derrota ante el ${match.opponent}. El ${clubName} compitió pero se marcha de vacío. El plató debate si faltó puntería o si los cambios tácticos en la segunda mitad llegaron demasiado tarde.`;
    }
  }

  const matchContext = `${match.competition} • ${match.score} vs ${match.opponent}`;

  return [
    {
      id: 'news_match_marca_' + Date.now() + '_1',
      outletId: 'marca',
      outletName: 'Diario MARCA',
      outletLogo: '🔴 MARCA',
      headline: marcaHead,
      subheadline: marcaSub,
      body: marcaBody,
      date: dateStr,
      author: 'José Félix Díaz (MARCA)',
      matchId: match.id,
      matchContext: matchContext,
      matchResult: match.result,
      isFavorite: false
    },
    {
      id: 'news_match_as_' + Date.now() + '_2',
      outletId: 'as',
      outletName: 'Diario AS',
      outletLogo: '🟧 AS',
      headline: asHead,
      subheadline: asSub,
      body: asBody,
      date: dateStr,
      author: 'Tomás Roncero (AS)',
      matchId: match.id,
      matchContext: matchContext,
      matchResult: match.result,
      isFavorite: false
    },
    {
      id: 'news_match_chiri_' + Date.now() + '_3',
      outletId: 'chiringuito',
      outletName: 'El Chiringuito de Jugones',
      outletLogo: '⚡ EL CHIRINGUITO',
      headline: chiriHead,
      subheadline: chiriSub,
      body: chiriBody,
      date: dateStr,
      author: 'Josep Pedrerol (El Chiringuito)',
      matchId: match.id,
      matchContext: matchContext,
      matchResult: match.result,
      isFavorite: false
    }
  ];
};

