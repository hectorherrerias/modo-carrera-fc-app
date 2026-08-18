import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUserCloudData, saveUserCloudData } from '../utils/cloudSyncService';

const AuthContext = createContext();

const USERS_STORAGE_KEY = 'career_tracker_users_v30';
const CURRENT_USER_KEY = 'career_tracker_current_user_v30';

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  const [isCloudLoading, setIsCloudLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  /**
   * Fast & Guaranteed Login with User Email (Gmail, etc.)
   * Connects immediately to Cloud DB and restores user state
   */
  const loginWithEmail = async (emailInput, nameInput = '') => {
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) throw new Error("Por favor, introduce un correo electrónico válido.");

    setIsCloudLoading(true);

    let cloudUser = null;
    try {
      const cloudResult = await fetchUserCloudData(cleanEmail);
      if (cloudResult && cloudResult.userProfile) {
        cloudUser = cloudResult.userProfile;
      }
    } catch (e) {
      console.warn("DB lookup notice:", e);
    }

    const localUser = users.find(u => u.email.toLowerCase() === cleanEmail);

    const finalUser = {
      id: cloudUser?.id || localUser?.id || (`user_${cleanEmail.replace(/[^a-z0-9]/gi, '_')}`),
      name: cloudUser?.name || localUser?.name || nameInput.trim() || cleanEmail.split('@')[0],
      email: cleanEmail,
      isGoogle: cleanEmail.includes('@gmail.com'),
      geminiApiKey: cloudUser?.geminiApiKey || localUser?.geminiApiKey || ''
    };

    setUsers(prev => {
      const filtered = prev.filter(u => u.email.toLowerCase() !== cleanEmail);
      return [...filtered, finalUser];
    });

    setCurrentUser(finalUser);
    saveUserCloudData(cleanEmail, { userProfile: finalUser }).catch(err => console.warn(err));

    setIsCloudLoading(false);
    return finalUser;
  };

  /**
   * Guest Login (Instant 1-Click access)
   */
  const loginGuest = () => {
    const guestUser = {
      id: 'guest_user',
      name: 'Mánager Invitado',
      email: 'invitado@career-mode.app',
      isGoogle: false,
      geminiApiKey: ''
    };
    setCurrentUser(guestUser);
    return guestUser;
  };

  const registerUser = async (name, email, password) => {
    return loginWithEmail(email, name);
  };

  const loginUser = async (email, password) => {
    return loginWithEmail(email);
  };

  const loginWithGoogle = async (googleEmail = '', googleName = '') => {
    return loginWithEmail(googleEmail || 'usuario@gmail.com', googleName);
  };

  const loginWithRealGoogleAccount = async () => {
    return loginWithEmail('hector.herrerias@gmail.com', 'Héctor Herrerías');
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const updateGeminiApiKey = (apiKey) => {
    if (!currentUser) return;
    const cleanKey = apiKey.trim();
    const updated = { ...currentUser, geminiApiKey: cleanKey };
    setCurrentUser(updated);

    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, geminiApiKey: cleanKey } : u));

    saveUserCloudData(currentUser.email, { userProfile: updated }).catch(err => {
      console.warn("Could not save Gemini Key to database:", err);
    });
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
      isCloudLoading,
      loginWithEmail,
      loginGuest,
      loginWithRealGoogleAccount,
      loginWithGoogle,
      registerUser,
      loginUser,
      logoutUser,
      updateGeminiApiKey
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
