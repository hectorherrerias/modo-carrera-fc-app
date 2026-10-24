/**
 * IA local (Ollama en el mini PC) a través del servidor de la app (/api/ai): sin clave ni coste.
 * Si el usuario tiene clave de Gemini se sigue usando Gemini; si no, la IA local cuando está disponible.
 */
import { useEffect, useState } from 'react';

export const LOCAL_AI_KEY = 'local';

let status = { available: false, model: '' };
const listeners = new Set();

export const checkLocalAI = async () => {
  try {
    const r = await fetch('/api/ai/status', { cache: 'no-store' });
    status = r.ok ? await r.json() : { available: false, model: '' };
  } catch {
    status = { available: false, model: '' };
  }
  listeners.forEach((fn) => fn(status));
  return status;
};
checkLocalAI();

/** Clave que se pasa a los generadores: la de Gemini, "local", o vacía (modo rápido sin IA) */
export const aiKeyFor = (user) => (user?.geminiApiKey || '').trim() || (status.available ? LOCAL_AI_KEY : '');

/** Nombre corto del motor activo para las etiquetas de la interfaz */
export const aiLabel = (user) => ((user?.geminiApiKey || '').trim() ? 'Gemini' : status.available ? 'IA local' : '');

/** Hook: vuelve a pintar el componente cuando se sabe si la IA local está disponible */
export const useLocalAI = () => {
  const [s, setS] = useState(status);
  useEffect(() => {
    listeners.add(setS);
    return () => listeners.delete(setS);
  }, []);
  return s;
};

export const callLocalAI = async (promptText, systemInstruction = '', options = {}) => {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: promptText,
      system: systemInstruction,
      temperature: options.temperature ?? 0.7,
      // La CPU del mini PC genera ~3 palabras/s: respuestas cortas salvo que se pida más
      maxTokens: Math.min(options.maxOutputTokens ?? 350, 700),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error de la IA local (${res.status})`);
  return data.text || '';
};
