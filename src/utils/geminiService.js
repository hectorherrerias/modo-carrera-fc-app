/**
 * Google Gemini Live AI Integration Service
 * Uses the user's personal Google Gemini API Key to process natural language commands, press conference responses, and match tactics.
 */

export const callGeminiLiveAPI = async (apiKey, promptText, systemInstruction = "") => {
  if (!apiKey || !apiKey.trim()) {
    throw new Error("No se ha configurado la API Key de Google Gemini.");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: systemInstruction ? `${systemInstruction}\n\nPrompt: ${promptText}` : promptText }
        ]
      }
    ]
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Error en la API de Gemini (${res.status})`);
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText || "Sin respuesta recibida de Gemini.";
  } catch (err) {
    console.error("Gemini API Error:", err);
    throw err;
  }
};
