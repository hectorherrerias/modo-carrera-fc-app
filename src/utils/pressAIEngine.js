/**
 * Press & News AI Engine V5
 * 100% Automatic AI News Generation based on Press Conferences & AI Assistant actions.
 * Real Journalists: José Félix Díaz (MARCA), Tomás Roncero (AS), Josep Pedrerol (El Chiringuito), Lluís Mascaró (SPORT), Fernando Polo (Mundo Deportivo), Guillem Balagué (BBC Sport).
 */

export const REAL_JOURNALISTS = [
  { name: 'José Félix Díaz', outletId: 'marca', outletName: 'Diario MARCA' },
  { name: 'Tomás Roncero', outletId: 'as', outletName: 'Diario AS' },
  { name: 'Josep Pedrerol', outletId: 'chiringuito', outletName: 'El Chiringuito' },
  { name: 'Lluís Mascaró', outletId: 'sport', outletName: 'Diario SPORT' },
  { name: 'Fernando Polo', outletId: 'mundodeportivo', outletName: 'Mundo Deportivo' },
  { name: 'Guillem Balagué', outletId: 'bbcsport', outletName: 'BBC Sport' }
];

export const MEDIA_OUTLETS = [
  { id: 'marca', name: 'Diario MARCA', color: '#E53E3E', bg: 'bg-red-600', text: 'text-red-500', logo: '🔴 MARCA', motto: 'El periódico de la afición' },
  { id: 'as', name: 'Diario AS', color: '#DD6B20', bg: 'bg-amber-600', text: 'text-amber-500', logo: '🟧 AS', motto: 'Diario de referencia deportiva' },
  { id: 'sport', name: 'Diario SPORT', color: '#CC0000', bg: 'bg-red-700', text: 'text-red-400', logo: '🔻 SPORT', motto: 'Siempre con la emoción del fútbol' },
  { id: 'mundodeportivo', name: 'Mundo Deportivo', color: '#2B6CB0', bg: 'bg-blue-600', text: 'text-blue-400', logo: '🔷 MUNDO DEPORTIVO', motto: 'Decano de la prensa deportiva' },
  { id: 'chiringuito', name: 'El Chiringuito de Jugones', color: '#805AD5', bg: 'bg-purple-600', text: 'text-purple-400', logo: '⚡ EL CHIRINGUITO', motto: '¡Exclusiva en el plató!' },
  { id: 'bbcsport', name: 'BBC Sport', color: '#319795', bg: 'bg-teal-600', text: 'text-teal-400', logo: '🌐 BBC SPORT', motto: 'International Sports Coverage' }
];

export const generatePressQuestions = (contextInput, clubName = 'el club', managerName = 'Mánager') => {
  const text = (contextInput || '').toLowerCase();
  
  let q1 = "";
  let q2 = "";
  let q3 = "";

  if (text.includes("copa") || text.includes("semifinal") || text.includes("final") || text.includes("ida") || text.includes("vuelta")) {
    q1 = `Mánager ${managerName}, se juegan la clasificación trascendental. ¿Qué planteamiento táctico propondrá para este choque eliminatorio?`;
    q2 = `El vestuario sabe lo que hay en juego hoy. ¿Cómo ve la preparación mental y la solidez defensiva del equipo?`;
    q3 = `La afición está volcada con el equipo. ¿Qué mensaje le transmite a los seguidores antes del pitido inicial?`;
  } else if (text.includes("derbi") || text.includes("clásico") || text.includes("rival") || text.includes("madrid") || text.includes("barcelona")) {
    q1 = `Mánager, medirse a un gigante siempre exige máxima concentración. ¿Considera que el equipo llega preparado para dar la sorpresa?`;
    q2 = `Se ha hablado mucho en la previa del ritmo del rival. ¿Le preocupa la presión que puedan ejercer en los primeros minutos?`;
    q3 = `En choques de esta magnitud los detalles deciden. ¿Dónde cree que estará la clave para llevarse la victoria?`;
  } else if (text.includes("derrota") || text.includes("perder") || text.includes("baja") || text.includes("mala racha")) {
    q1 = `Mánager ${managerName}, tras los últimos tropiezos, ¿siente que la presión sobre el banquillo se ha incrementado?`;
    q2 = `Algunos sectores critican la falta de eficacia goleadora. ¿Hará cambios importantes en el 11 inicial?`;
    q3 = `¿Confía plenamente en que la plantilla revertirá la situación en los próximos partidos?`;
  } else {
    q1 = `Mánager ${managerName}, afrontan este compromiso con altas expectativas. ¿Cuáles son las claves tácticas para hoy?`;
    q2 = `Con el calendario tan cargado, ¿cómo gestionará los minutos de los jugadores titulares?`;
    q3 = `La afición pide intensidad desde el inicio. ¿Qué balance hace del rendimiento del grupo hasta el momento?`;
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
 * Automatically generates 3 newspaper front pages (MARCA, AS, SPORT) from Press Conference Q&A declarations
 */
export const generateNewsFromPressConference = (contextInput, qaList, clubName = 'Club', managerName = 'Mánager') => {
  const answer1 = qaList[0]?.answer || "Vamos a salir a ganar con todo nuestro potencial.";
  const answer2 = qaList[1]?.answer || "Confío plenamente en el trabajo y la unión de la plantilla.";
  const answer3 = qaList[2]?.answer || "La afición será nuestro jugador número 12.";

  const dateStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  // MARCA FRONT PAGE
  const marcaArticle = {
    id: 'news_marca_' + Date.now(),
    outletId: 'marca',
    outletName: 'Diario MARCA',
    outletLogo: '🔴 MARCA',
    headline: `"${answer1.slice(0, 48).toUpperCase()}..."`,
    subheadline: `Declaraciones exclusivas de ${managerName} en la rueda de prensa previa del ${clubName}.`,
    body: `El técnico del ${clubName}, ${managerName}, compareció ante los medios de comunicación. Ante la pregunta de José Félix Díaz (MARCA), el entrenador dejó clara su convicción: "${answer1}". Sobre la motivación del vestuario añadió: "${answer2}". Un mensaje de autoridad que marca el camino hacia el objetivo.`,
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
    headline: `¡${managerName.toUpperCase()} LANZA UN MENSAJE DE CONTUNDENCIA!`,
    subheadline: `Tomás Roncero analiza la rueda de prensa del técnico del ${clubName}.`,
    body: `Ambiente de máxima expectación en la sala de prensa del ${clubName}. Tomás Roncero (Diario AS) preguntó al mánager por la solidez táctica. ${managerName} fue muy claro: "${answer2}". Además, mandó un mensaje contundente a la grada: "${answer3}". La afición ya vibra antes del pitido inicial.`,
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
    headline: `¡EXCLUSIVA! ${managerName.toUpperCase()}: "LA AFICIÓN RESPONDERÁ"`,
    subheadline: `Josep Pedrerol reacciona en directo a las palabras del mánager del ${clubName}.`,
    body: `¡Atención! Josep Pedrerol arrancó la edición con la respuesta directa de ${managerName}: "${answer3}". El plató analiza el impacto de la rueda de prensa previa y el vestuario está conjurado para lograr el triunfo.`,
    date: dateStr,
    author: 'Josep Pedrerol (El Chiringuito)',
    isFavorite: false
  };

  return [marcaArticle, asArticle, chiringuitoArticle];
};
