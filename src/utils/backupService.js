/**
 * Backup helpers: read any Modo Carrera backup format, summarise it and
 * normalise it so the rest of the app can rely on every list existing.
 */

export const CAREER_LISTS = [
  'clubs', 'seasons', 'players', 'matches', 'transfers',
  'youthAcademy', 'shortlist', 'pressConferences', 'newsArticles'
];

export const LIST_LABELS = {
  clubs: 'clubes',
  seasons: 'temporadas',
  players: 'jugadores',
  matches: 'partidos',
  transfers: 'fichajes',
  youthAcademy: 'cantera',
  shortlist: 'seguimiento',
  pressConferences: 'ruedas de prensa',
  newsArticles: 'noticias'
};

const SINGULAR = {
  clubs: 'club',
  seasons: 'temporada',
  players: 'jugador',
  matches: 'partido',
  transfers: 'fichaje',
  youthAcademy: 'cantera',
  shortlist: 'seguimiento',
  pressConferences: 'rueda de prensa',
  newsArticles: 'noticia'
};
const label = (key, n) => `${n} ${n === 1 ? SINGULAR[key] : LIST_LABELS[key]}`;

const DEFAULT_SEASON_NARRATIVE = "Llegamos con la máxima ilusión. El objetivo es competir en cada jornada, consolidar la solidez táctica del equipo y cumplir las expectativas de la directiva y de la afición.";

/** Total number of items in a career (used to compare copies) */
export const careerScore = (career) =>
  career && typeof career === 'object'
    ? CAREER_LISTS.reduce((sum, k) => sum + (Array.isArray(career[k]) ? career[k].length : 0), 0)
    : 0;

/** Untouched demo data from mockData.js (clubs c1/c2, no players or matches) */
export const isDemoCareer = (career) => {
  const ids = (career?.clubs || []).map(c => c.id).sort().join(',');
  return ids === 'c1,c2' && !(career.players || []).length && !(career.matches || []).length;
};

const looksLikeCareer = (obj) =>
  obj && typeof obj === 'object' && !Array.isArray(obj) && Array.isArray(obj.clubs);

const tryParse = (value) => {
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch (e) { return null; }
};

/**
 * Finds the career inside any of the formats we know:
 *  - the app's own "Descargar Backup JSON" export (the career object itself)
 *  - a cloud document ({ careerData: {...} })
 *  - a device backup / localStorage dump ({ storage: { career_tracker_data_x: "..." } })
 * When several careers are present, the one with the most content wins.
 */
export const extractCareer = (raw) => {
  const candidates = [];
  const visit = (node, depth = 0) => {
    if (!node || typeof node !== 'object' || depth > 4) return;
    if (looksLikeCareer(node)) candidates.push(node);
    if (looksLikeCareer(node.careerData)) candidates.push(node.careerData);
    for (const [key, value] of Object.entries(node)) {
      if (key === 'careerData' || CAREER_LISTS.includes(key)) continue;
      const parsed = key.startsWith('career_tracker_data') ? tryParse(value) : value;
      if (parsed && typeof parsed === 'object') visit(parsed, depth + 1);
    }
  };
  visit(raw);
  if (!candidates.length) return null;
  return candidates.sort((a, b) => careerScore(b) - careerScore(a))[0];
};

/** Makes sure every list exists and seasons have the fields the UI expects */
export const normalizeCareer = (career) => {
  const out = { ...career };
  for (const key of CAREER_LISTS) {
    if (!Array.isArray(out[key])) out[key] = [];
  }
  out.seasons = out.seasons.map(s => ({
    ...s,
    narrativeContext: s.narrativeContext || DEFAULT_SEASON_NARRATIVE
  }));
  return out;
};

/** Short human summary: "3 clubes · 120 jugadores · 45 partidos" */
export const summarizeCareer = (career) => {
  const parts = CAREER_LISTS
    .filter(k => Array.isArray(career?.[k]) && career[k].length)
    .map(k => label(k, career[k].length));
  return parts.length ? parts.join(' · ') : 'vacía';
};

/** Same summary from the { clubs: n, players: n, ... } counts the server returns */
export const summarizeCounts = (counts = {}) => {
  const parts = CAREER_LISTS.filter(k => counts[k]).map(k => label(k, counts[k]));
  return parts.length ? parts.join(' · ') : 'vacía';
};

/** Versions of this user's career saved on the server (newest first) */
export const fetchServerVersions = async (email) => {
  const res = await fetch(`/api/cloud-db/history?email=${encodeURIComponent(email)}`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('No se pudo consultar el historial del servidor.');
  return (await res.json()).versions || [];
};

/** One saved version, already normalised */
export const fetchServerVersion = async (email, id) => {
  const res = await fetch(`/api/cloud-db/history?email=${encodeURIComponent(email)}&id=${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error('No se pudo descargar esa versión.');
  const career = extractCareer(await res.json());
  if (!career) throw new Error('Esa versión no contiene una carrera.');
  return normalizeCareer(career);
};

/** Reads a File chosen by the user and returns a normalised career or throws a readable error */
export const readBackupFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.onload = () => {
      const raw = tryParse(String(reader.result || '').replace(/^﻿/, ''));
      if (!raw) return reject(new Error('El archivo no es un JSON válido.'));
      const career = extractCareer(raw);
      if (!career || !career.clubs.length) {
        return reject(new Error('No he encontrado ninguna carrera (clubes, temporadas…) dentro de este archivo.'));
      }
      resolve(normalizeCareer(career));
    };
    reader.readAsText(file);
  });

/** Downloads the given career as a JSON file */
export const downloadCareer = (career, email) => {
  const date = new Date().toISOString().split('T')[0];
  const blob = new Blob([JSON.stringify(career, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `modo_carrera_${email || 'backup'}_${date}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
