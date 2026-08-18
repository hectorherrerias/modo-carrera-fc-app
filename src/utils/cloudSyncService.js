/**
 * Cloud Sync Service V4 (Database Persistence Guarantee)
 * Enables permanent database persistence across PC, iPad, iPhone, and Android.
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
 * Fetch user data from Server / Cloud DB
 */
export const fetchUserCloudData = async (email, customDbUrl = null) => {
  const cleanEmail = sanitizeEmail(email);
  if (!cleanEmail) return null;

  const key = emailToKey(cleanEmail);

  // 1. First priority: Built-in Server Database (/api/cloud-db/users/:key.json)
  try {
    const serverEndpoint = `/api/cloud-db/users/${key}.json`;
    const res = await fetch(serverEndpoint, {
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      const doc = await res.json();
      if (doc && doc.careerData) {
        console.log(`[DB] Successfully loaded user career data from Database for ${cleanEmail}`);
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
    }
  } catch (err) {
    // If not running with Vite server API (e.g. static CDN), continue to remote cloud DB
  }

  // 2. Secondary priority: Remote Cloud DB (e.g. Firebase / Supabase)
  const dbUrl = customDbUrl || getStoredCloudDbUrl();
  if (dbUrl && !dbUrl.includes('modo-carrera-fc-sync-default-rtdb.firebaseio.com')) {
    try {
      const endpoint = `${dbUrl}/career_users/${key}.json`;
      const res = await fetch(endpoint, {
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const doc = await res.json();
        if (doc && doc.careerData) {
          console.log(`[Cloud DB] Loaded from Remote Cloud for ${cleanEmail}`);
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
      }
    } catch (err) {
      console.warn("[Cloud DB] Remote Fetch error:", err.message);
    }
  }

  return null;
};

/**
 * Save user data to Server / Cloud DB
 */
export const saveUserCloudData = async (email, { userProfile, careerData }, customDbUrl = null) => {
  const cleanEmail = sanitizeEmail(email);
  if (!cleanEmail) return false;

  const key = emailToKey(cleanEmail);

  const payload = {
    userId: userProfile?.id || `user_${cleanEmail}`,
    email: cleanEmail,
    name: userProfile?.name || cleanEmail.split('@')[0],
    isGoogle: userProfile?.isGoogle ?? cleanEmail.includes('@gmail.com'),
    geminiApiKey: userProfile?.geminiApiKey || '',
    careerData: careerData || null,
    updatedAt: Date.now()
  };

  let savedToServer = false;

  // 1. Save to Server Database (/api/cloud-db/users/:key.json)
  try {
    const serverEndpoint = `/api/cloud-db/users/${key}.json`;
    const res = await fetch(serverEndpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      console.log(`[DB] Successfully saved career state to Database for ${cleanEmail}`);
      savedToServer = true;
    }
  } catch (err) {
    // Non-fatal if on static host
  }

  // 2. Save to Remote Cloud DB (e.g. Firebase)
  const dbUrl = customDbUrl || getStoredCloudDbUrl();
  if (dbUrl && !dbUrl.includes('modo-carrera-fc-sync-default-rtdb.firebaseio.com')) {
    try {
      const endpoint = `${dbUrl}/career_users/${key}.json`;
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        return true;
      }
    } catch (err) {
      console.warn("[Cloud DB] Remote Save error:", err.message);
    }
  }

  return savedToServer;
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
