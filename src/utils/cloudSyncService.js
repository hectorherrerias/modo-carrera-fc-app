/**
 * Cloud Sync Service V3 (Multi-Device Guarantee)
 * Enables guaranteed synchronization between PC, iPad, iPhone, Android, and tablets.
 * Supports:
 * 1. 1-Click Device Sync Links & QR Payloads (Instant local-to-remote zero-config pairing)
 * 2. Direct Firebase Realtime Database REST Sync (Free, unmetered cloud sync)
 * 3. JSON Backups (Import / Export)
 */

const CLOUD_DB_KEY = 'career_tracker_cloud_db_url_v1';
const DEFAULT_FIREBASE_DB = 'https://modo-carrera-fc-sync-default-rtdb.firebaseio.com';

const sanitizeEmail = (email) => {
  return (email || '').trim().toLowerCase();
};

const emailToKey = (email) => {
  const clean = sanitizeEmail(email);
  return clean.replace(/[^a-z0-9]/gi, '_');
};

/**
 * Get or Set custom Firebase Realtime Database URL
 */
export const getStoredCloudDbUrl = () => {
  return localStorage.getItem(CLOUD_DB_KEY) || DEFAULT_FIREBASE_DB;
};

export const setStoredCloudDbUrl = (url) => {
  if (!url) {
    localStorage.removeItem(CLOUD_DB_KEY);
  } else {
    let cleanUrl = url.trim();
    if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);
    localStorage.setItem(CLOUD_DB_KEY, cleanUrl);
  }
};

/**
 * Generate a 1-Click Device Sync Link with base64 payload
 */
export const generateDeviceSyncUrl = (user, careerData) => {
  const payload = {
    user: {
      id: user?.id,
      name: user?.name,
      email: user?.email,
      isGoogle: user?.isGoogle,
      geminiApiKey: user?.geminiApiKey || ''
    },
    careerData: careerData,
    cloudDbUrl: getStoredCloudDbUrl(),
    syncedAt: Date.now()
  };

  try {
    const jsonStr = JSON.stringify(payload);
    const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#sync=${encoded}`;
  } catch (err) {
    console.error("Error generating sync link:", err);
    return null;
  }
};

/**
 * Parse a sync payload from hash or string
 */
export const parseDeviceSyncPayload = (rawString) => {
  try {
    let base64 = rawString;
    if (rawString.includes('#sync=')) {
      base64 = rawString.split('#sync=')[1];
    }
    const jsonStr = decodeURIComponent(escape(atob(base64)));
    const parsed = JSON.parse(jsonStr);
    if (parsed && (parsed.careerData || parsed.user)) {
      return parsed;
    }
  } catch (err) {
    console.warn("Could not parse sync payload:", err);
  }
  return null;
};

/**
 * Fetch user data from Cloud DB (Firebase REST)
 */
export const fetchUserCloudData = async (email, customDbUrl = null) => {
  const cleanEmail = sanitizeEmail(email);
  if (!cleanEmail) return null;

  const key = emailToKey(cleanEmail);
  const dbUrl = customDbUrl || getStoredCloudDbUrl();

  try {
    const endpoint = `${dbUrl}/career_users/${key}.json`;
    const res = await fetch(endpoint, {
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      console.log(`Cloud Sync fetch returned status ${res.status} from ${dbUrl}`);
      return null;
    }

    const doc = await res.json();
    if (doc && doc.careerData) {
      console.log(`Cloud Sync: Successfully loaded cloud document for ${cleanEmail}`);
      return {
        userProfile: {
          id: doc.userId || `user_${cleanEmail}`,
          email: doc.email || cleanEmail,
          name: doc.name || cleanEmail.split('@')[0],
          isGoogle: doc.isGoogle ?? cleanEmail.includes('@gmail.com'),
          geminiApiKey: doc.geminiApiKey || ''
        },
        careerData: doc.careerData,
        updatedAt: doc.updatedAt || Date.now()
      };
    }
  } catch (err) {
    console.warn("Cloud Sync Fetch Warning:", err.message);
  }

  return null;
};

/**
 * Save user data to Cloud DB (Firebase REST)
 */
export const saveUserCloudData = async (email, { userProfile, careerData }, customDbUrl = null) => {
  const cleanEmail = sanitizeEmail(email);
  if (!cleanEmail) return false;

  const key = emailToKey(cleanEmail);
  const dbUrl = customDbUrl || getStoredCloudDbUrl();

  const payload = {
    userId: userProfile?.id || `user_${cleanEmail}`,
    email: cleanEmail,
    name: userProfile?.name || cleanEmail.split('@')[0],
    isGoogle: userProfile?.isGoogle ?? cleanEmail.includes('@gmail.com'),
    geminiApiKey: userProfile?.geminiApiKey || '',
    careerData: careerData || null,
    updatedAt: Date.now()
  };

  try {
    const endpoint = `${dbUrl}/career_users/${key}.json`;
    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      console.log(`Cloud Sync: Saved successfully to cloud for ${cleanEmail}`);
      return true;
    }
  } catch (err) {
    console.warn("Cloud Sync Save Warning:", err.message);
  }

  return false;
};

/**
 * Export career mode data to a downloadable JSON file
 */
export const exportDataToJson = (data, filename = 'modo_carrera_backup.json') => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
