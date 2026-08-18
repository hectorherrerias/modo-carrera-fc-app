/**
 * Cloud Sync Service V6 (Web-Level Cloud Database Synchronization)
 * Automatically syncs user career data with global web cloud database by user email/UID.
 */

const sanitizeEmail = (email) => {
  return (email || '').trim().toLowerCase();
};

const emailToKey = (email) => {
  const clean = sanitizeEmail(email);
  return clean.replace(/[^a-z0-9]/gi, '_');
};

/**
 * Fetch user data from Global Web Cloud DB by user email
 */
export const fetchUserCloudData = async (email) => {
  const cleanEmail = sanitizeEmail(email);
  if (!cleanEmail) return null;

  const key = emailToKey(cleanEmail);

  // 1. Global Web Cloud Database (Puter KV)
  if (typeof window !== 'undefined' && window.puter && window.puter.kv) {
    try {
      const cloudVal = await window.puter.kv.get(`career_user_${key}`);
      if (cloudVal) {
        const parsed = typeof cloudVal === 'string' ? JSON.parse(cloudVal) : cloudVal;
        if (parsed && (parsed.careerData || parsed.clubs)) {
          console.log(`[Web Cloud DB] Successfully loaded user career data for ${cleanEmail} from Global Cloud`);
          return {
            userProfile: {
              id: parsed.userId || `user_${cleanEmail}`,
              email: parsed.email || cleanEmail,
              name: parsed.name || cleanEmail.split('@')[0],
              isGoogle: parsed.isGoogle ?? cleanEmail.includes('@gmail.com'),
              geminiApiKey: parsed.geminiApiKey || ''
            },
            careerData: parsed.careerData || parsed,
            updatedAt: parsed.updatedAt || Date.now()
          };
        }
      }
    } catch (e) {
      console.warn("[Web Cloud DB] Global KV fetch notice:", e.message);
    }
  }

  // 2. Server API Database (/api/cloud-db/users/:key.json)
  try {
    const serverEndpoint = `/api/cloud-db/users/${key}.json`;
    const res = await fetch(serverEndpoint, {
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      const doc = await res.json();
      if (doc && doc.careerData) {
        console.log(`[Server DB] Successfully loaded user career data for ${cleanEmail}`);
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
  } catch (err) {}

  return null;
};

/**
 * Save user data to Global Web Cloud DB by user email
 */
export const saveUserCloudData = async (email, { userProfile, careerData }) => {
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

  let saved = false;

  // 1. Save to Global Web Cloud Database (Puter KV)
  if (typeof window !== 'undefined' && window.puter && window.puter.kv) {
    try {
      await window.puter.kv.set(`career_user_${key}`, JSON.stringify(payload));
      console.log(`[Web Cloud DB] Saved career data to Global Cloud for ${cleanEmail}`);
      saved = true;
    } catch (e) {
      console.warn("[Web Cloud DB] Global KV save notice:", e.message);
    }
  }

  // 2. Save to Server Database
  try {
    const serverEndpoint = `/api/cloud-db/users/${key}.json`;
    const res = await fetch(serverEndpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      saved = true;
    }
  } catch (err) {}

  return saved;
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
