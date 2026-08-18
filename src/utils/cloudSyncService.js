/**
 * Cloud Sync Service V5 (User-Centric Database Synchronization)
 * Automatically syncs user career data with the database backend by user email/UID.
 */

const sanitizeEmail = (email) => {
  return (email || '').trim().toLowerCase();
};

const emailToKey = (email) => {
  const clean = sanitizeEmail(email);
  return clean.replace(/[^a-z0-9]/gi, '_');
};

/**
 * Fetch user data from Server / Cloud DB by user email
 */
export const fetchUserCloudData = async (email) => {
  const cleanEmail = sanitizeEmail(email);
  if (!cleanEmail) return null;

  const key = emailToKey(cleanEmail);

  try {
    const serverEndpoint = `/api/cloud-db/users/${key}.json`;
    const res = await fetch(serverEndpoint, {
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      const doc = await res.json();
      if (doc && doc.careerData) {
        console.log(`[DB] Successfully loaded user career data for ${cleanEmail}`);
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
    console.warn("[DB] Fetch error:", err.message);
  }

  return null;
};

/**
 * Save user data to Server / Cloud DB by user email
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

  try {
    const serverEndpoint = `/api/cloud-db/users/${key}.json`;
    const res = await fetch(serverEndpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      console.log(`[DB] Saved career data for ${cleanEmail}`);
      return true;
    }
  } catch (err) {
    console.warn("[DB] Save error:", err.message);
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
