/**
 * Cloud Sync Service V7 (Vercel Serverless & Cloud DB Persistence)
 * Syncs user career data with Vercel API / Cloud DB by user email/UID.
 */

const sanitizeEmail = (email) => {
  return (email || '').trim().toLowerCase();
};

const emailToKey = (email) => {
  const clean = sanitizeEmail(email);
  return clean.replace(/[^a-z0-9]/gi, '_');
};

/**
 * Fetch user data from Vercel Serverless / Cloud DB by user email
 */
export const fetchUserCloudData = async (email) => {
  const cleanEmail = sanitizeEmail(email);
  if (!cleanEmail) return null;

  const key = emailToKey(cleanEmail);

  const endpoints = [
    `/api/cloud-db?email=${encodeURIComponent(cleanEmail)}`,
    `/api/cloud-db/users/${key}.json`,
    `/api/sync?email=${encodeURIComponent(cleanEmail)}`
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const doc = await res.json();
        if (doc && (doc.careerData || doc.clubs)) {
          console.log(`[Cloud DB] Loaded data for ${cleanEmail} from ${endpoint}`);
          return {
            userProfile: {
              id: doc.userId || `user_${cleanEmail}`,
              email: doc.email || cleanEmail,
              name: doc.name || cleanEmail.split('@')[0],
              isGoogle: doc.isGoogle ?? cleanEmail.includes('@gmail.com'),
              geminiApiKey: doc.geminiApiKey || ''
            },
            careerData: doc.careerData || doc,
            updatedAt: doc.updatedAt || Date.now()
          };
        }
      }
    } catch (err) {
      // try next
    }
  }

  return null;
};

/**
 * Save user data to Vercel Serverless / Cloud DB by user email
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

  const endpoints = [
    `/api/cloud-db?email=${encodeURIComponent(cleanEmail)}`,
    `/api/cloud-db/users/${key}.json`,
    `/api/sync?email=${encodeURIComponent(cleanEmail)}`
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        saved = true;
        break;
      }
    } catch (err) {}
  }

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
