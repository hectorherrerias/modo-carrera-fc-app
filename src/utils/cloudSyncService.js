/**
 * Cloud Sync Service for Career Mode Tracker
 * Enables instant cross-device data synchronization when logging in with the same Gmail address.
 * Uses a cloud master registry and dedicated user objects with automatic local fallback.
 */

const API_BASE = 'https://api.restful-api.dev/objects';
const MASTER_REGISTRY_ID = 'ff8081819ff5b11001a015c20a22454a';

const sanitizeEmail = (email) => {
  return (email || '').trim().toLowerCase();
};

/**
 * Fetch the master registry that maps emails to cloud document IDs
 */
export const getMasterRegistry = async () => {
  try {
    const res = await fetch(`${API_BASE}/${MASTER_REGISTRY_ID}`);
    if (!res.ok) {
      console.warn("Could not fetch cloud master registry, status:", res.status);
      return {};
    }
    const doc = await res.json();
    return doc.data?.userMap || {};
  } catch (err) {
    console.warn("Error loading cloud registry:", err);
    return {};
  }
};

/**
 * Update the master registry with a new email -> objectId mapping
 */
const updateMasterRegistry = async (userMap) => {
  try {
    const res = await fetch(`${API_BASE}/${MASTER_REGISTRY_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'CAREER_MODE_MASTER_REGISTRY_V1',
        data: { userMap }
      })
    });
    return res.ok;
  } catch (err) {
    console.warn("Error updating cloud registry:", err);
    return false;
  }
};

/**
 * Fetch user data (profile & career data) from the cloud by Gmail / email
 */
export const fetchUserCloudData = async (email) => {
  const cleanEmail = sanitizeEmail(email);
  if (!cleanEmail) return null;

  try {
    const registry = await getMasterRegistry();
    const objectId = registry[cleanEmail];

    if (!objectId) {
      console.log(`Cloud Sync: No cloud document yet for ${cleanEmail}`);
      return null;
    }

    const res = await fetch(`${API_BASE}/${objectId}`);
    if (!res.ok) {
      console.warn(`Cloud Sync: Failed to fetch object ${objectId}`);
      return null;
    }

    const doc = await res.json();
    if (doc.data) {
      console.log(`Cloud Sync: Successfully loaded cloud data for ${cleanEmail}`);
      return {
        userProfile: {
          id: doc.data.userId || `user_${cleanEmail}`,
          email: doc.data.email || cleanEmail,
          name: doc.data.name || cleanEmail.split('@')[0],
          isGoogle: doc.data.isGoogle ?? cleanEmail.includes('@gmail.com'),
          geminiApiKey: doc.data.geminiApiKey || ''
        },
        careerData: doc.data.careerData || null,
        updatedAt: doc.data.updatedAt || doc.updatedAt || Date.now(),
        cloudObjectId: objectId
      };
    }
    return null;
  } catch (err) {
    console.error("Cloud Sync Fetch Error:", err);
    return null;
  }
};

/**
 * Save / Update user profile & career data in the cloud
 */
export const saveUserCloudData = async (email, { userProfile, careerData }) => {
  const cleanEmail = sanitizeEmail(email);
  if (!cleanEmail) return false;

  try {
    const registry = await getMasterRegistry();
    let objectId = registry[cleanEmail];

    const payload = {
      name: `career_user_${cleanEmail}`,
      data: {
        userId: userProfile?.id || `user_${cleanEmail}`,
        email: cleanEmail,
        name: userProfile?.name || cleanEmail.split('@')[0],
        isGoogle: userProfile?.isGoogle ?? cleanEmail.includes('@gmail.com'),
        geminiApiKey: userProfile?.geminiApiKey || '',
        careerData: careerData || null,
        updatedAt: Date.now()
      }
    };

    if (objectId) {
      // Update existing object
      const res = await fetch(`${API_BASE}/${objectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        console.log(`Cloud Sync: Saved updates to cloud object ${objectId} for ${cleanEmail}`);
        return true;
      }
    }

    // If no object exists or update failed, create a new cloud object
    const createRes = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (createRes.ok) {
      const created = await createRes.json();
      objectId = created.id;
      registry[cleanEmail] = objectId;
      await updateMasterRegistry(registry);
      console.log(`Cloud Sync: Registered new cloud object ${objectId} for ${cleanEmail}`);
      return true;
    }

    return false;
  } catch (err) {
    console.error("Cloud Sync Save Error:", err);
    return false;
  }
};

/**
 * Test connectivity to cloud sync server
 */
export const testCloudConnection = async () => {
  try {
    const start = performance.now();
    const res = await fetch(`${API_BASE}/${MASTER_REGISTRY_ID}`);
    const duration = Math.round(performance.now() - start);
    return { ok: res.ok, latency: duration };
  } catch (err) {
    return { ok: false, error: err.message };
  }
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
