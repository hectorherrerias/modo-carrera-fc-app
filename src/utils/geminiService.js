/**
 * Google Gemini Live AI Integration Service (Advanced Suite)
 * Provides AI Press Conferences, Press Article Generation, Season Narrative drafting,
 * Command parsing, and API key validation.
 */

/**
 * Validate if a Gemini API key is valid by sending a test generation request
 */
export const validateGeminiApiKey = async (apiKey) => {
  if (!apiKey || !apiKey.trim()) {
    return { valid: false, message: "La API Key no puede estar vacía." };
  }

  const cleanKey = apiKey.trim();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${cleanKey}`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Responde OK si estás activo." }] }]
      })
    });

    if (res.ok) {
      return { valid: true, message: "✓ Clave de Google Gemini validada y activa." };
    }

    const err = await res.json().catch(() => ({}));
    return { 
      valid: false, 
      message: err.error?.message || `Error de validación (${res.status}). Revisa que la clave sea correcta.` 
    };
  } catch (err) {
    return { valid: false, message: `Error de red al conectar con Gemini: ${err.message}` };
  }
};

/**
 * Generic Gemini API Call with system instruction and JSON/text handling
 */
export const callGeminiLiveAPI = async (apiKey, promptText, systemInstruction = "", options = {}) => {
  if (!apiKey || !apiKey.trim()) {
    throw new Error("No se ha configurado la API Key de Google Gemini.");
  }

  const cleanKey = apiKey.trim();
  const model = options.model || "gemini-1.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: promptText }
        ]
      }
    ],
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxOutputTokens ?? 1024
    }
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Error en la API de Gemini (${res.status})`);
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText || "";
  } catch (err) {
    console.error("Gemini API Call Error:", err);
    throw err;
  }
};

/**
 * Generate 3 Deep Journalist Questions via Gemini
 */
export const generateGeminiPressQuestions = async (apiKey, { clubName, managerName, seasonContext, matchPreview, teamStats }) => {
  const systemPrompt = `Eres un generador de simulación deportiva de prensa para el modo carrera de EA FC / FIFA en español.
Debes generar exactamente 3 preguntas de rueda de prensa de 3 periodistas reales y con personalidades muy marcadas:
1. José Félix Díaz (Diario MARCA): Estilo formal, institucional, exigente con la directiva, táctica y objetivos.
2. Tomás Roncero (Diario AS): Pasional, enfocado en el honor, la garra, la emoción y la afición.
3. Josep Pedrerol (El Chiringuito): Incisivo, dramático, busca exclusivas y titulares polémicos sobre el vestuario y el futuro del entrenador.

IMPORTANTE:
Debes tener MUY en cuenta el "Contexto de la Temporada" (por ejemplo si llegó a mitad de temporada, si pelean el descenso, si hay crisis o si van líderes) combinado con la "Previa del Partido".

Devuelve SOLAMENTE un array JSON válido sin bloques markdown extra, con este formato:
[
  { "id": "q1", "journalist": "José Félix Díaz", "outletName": "Diario MARCA", "question": "..." },
  { "id": "q2", "journalist": "Tomás Roncero", "outletName": "Diario AS", "question": "..." },
  { "id": "q3", "journalist": "Josep Pedrerol", "outletName": "El Chiringuito", "question": "..." }
]`;

  const userPrompt = `Club: ${clubName}
Entrenador/Mánager: ${managerName}
Contexto General de la Temporada: ${seasonContext || "Temporada regular en curso buscando cumplir los objetivos."}
Previa / Situación del Partido Actual: ${matchPreview || "Próximo partido de competición oficial."}
Balance de Resultados: ${teamStats?.wins || 0} Victorias, ${teamStats?.draws || 0} Empates, ${teamStats?.losses || 0} Derrotas (% Victorias: ${teamStats?.winRate || 50}%)

Genera las 3 preguntas personalizadas para esta rueda de prensa en formato JSON puro.`;

  try {
    const rawText = await callGeminiLiveAPI(apiKey, userPrompt, systemPrompt, { temperature: 0.75 });
    // Clean potential markdown fencing
    const cleaned = rawText.replace(/```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length >= 3) {
      return parsed.map((p, idx) => ({
        id: `q${idx + 1}`,
        journalist: p.journalist || (idx === 0 ? 'José Félix Díaz' : idx === 1 ? 'Tomás Roncero' : 'Josep Pedrerol'),
        outletName: p.outletName || (idx === 0 ? 'Diario MARCA' : idx === 1 ? 'Diario AS' : 'El Chiringuito'),
        question: p.question,
        answer: ''
      }));
    }
  } catch (err) {
    console.warn("Could not parse Gemini questions JSON, returning fallback:", err);
  }
  return null;
};

/**
 * Generate 3 Newspaper Front Pages via Gemini based on Q&A declarations
 */
export const generateGeminiPressArticles = async (apiKey, { clubName, managerName, seasonContext, matchPreview, qaList }) => {
  const systemPrompt = `Eres un redactor jefe de prensa deportiva española de alto nivel.
Genera 3 portadas/noticias completas de periódicos deportivos (Diario MARCA, Diario AS, El Chiringuito) basadas en las declaraciones del entrenador en rueda de prensa.
Cada medio tiene su tono:
- MARCA: Titular impactante con comillas de la declaración más táctica, tono periodístico riguroso.
- AS: Titular con garra y mayúsculas, foco en la épica de la respuesta.
- EL CHIRINGUITO: Titular de ¡EXCLUSIVA!, foco en la tensión o ambición del vestuario.

Devuelve SOLAMENTE un array JSON válido:
[
  {
    "outletId": "marca",
    "outletName": "Diario MARCA",
    "outletLogo": "🔴 MARCA",
    "headline": "TITULAR",
    "subheadline": "Subtítulo explicativo",
    "body": "Cuerpo de la noticia de 3 a 5 líneas citando las respuestas del entrenador...",
    "author": "José Félix Díaz (MARCA)"
  },
  {
    "outletId": "as",
    "outletName": "Diario AS",
    "outletLogo": "🟧 AS",
    "headline": "TITULAR",
    "subheadline": "Subtítulo",
    "body": "Cuerpo...",
    "author": "Tomás Roncero (AS)"
  },
  {
    "outletId": "chiringuito",
    "outletName": "El Chiringuito de Jugones",
    "outletLogo": "⚡ EL CHIRINGUITO",
    "headline": "TITULAR",
    "subheadline": "Subtítulo",
    "body": "Cuerpo...",
    "author": "Josep Pedrerol (El Chiringuito)"
  }
]`;

  const qaFormatted = qaList.map(qa => `${qa.journalist} (${qa.outletName}): "${qa.question}" -> Mánager: "${qa.answer}"`).join("\n");

  const userPrompt = `Club: ${clubName}
Mánager: ${managerName}
Contexto Temporada: ${seasonContext}
Previa Partido: ${matchPreview}
Declaraciones en la Rueda de Prensa:
${qaFormatted}

Genera las 3 portadas en JSON.`;

  try {
    const rawText = await callGeminiLiveAPI(apiKey, userPrompt, systemPrompt, { temperature: 0.8 });
    const cleaned = rawText.replace(/```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length >= 3) {
      const dateStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
      return parsed.map((item, idx) => ({
        id: `news_${item.outletId || 'press'}_${Date.now()}_${idx}`,
        outletId: item.outletId || (idx === 0 ? 'marca' : idx === 1 ? 'as' : 'chiringuito'),
        outletName: item.outletName,
        outletLogo: item.outletLogo,
        headline: item.headline,
        subheadline: item.subheadline,
        body: item.body,
        date: dateStr,
        author: item.author,
        isFavorite: false
      }));
    }
  } catch (err) {
    console.warn("Could not generate Gemini articles, returning fallback:", err);
  }
  return null;
};

/**
 * Generate Season Narrative Context via Gemini
 */
export const generateGeminiSeasonNarrative = async (apiKey, { clubName, managerName, year, winRate, wins, draws, losses }) => {
  const prompt = `Escribe un resumen narrativo breve (2 o 3 frases) y realista para el contexto de la temporada de Modo Carrera EA FC de ${clubName}, entrenado por ${managerName} en la temporada ${year}.
Estadísticas actuales: ${wins} victorias, ${draws} empates, ${losses} derrotas (% victorias: ${winRate}%).
El texto debe sonar apasionante, mencionando los retos del club (descenso, zona media, Europa o campeonato) y el ambiente en el vestuario para que sirva de contexto en las ruedas de prensa.
Responde únicamente con el párrafo de texto, sin comillas ni títulos.`;

  return await callGeminiLiveAPI(apiKey, prompt, "Eres un cronista deportivo de EA FC experto en narrativa futbolística.");
};
