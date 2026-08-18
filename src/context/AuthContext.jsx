import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUserCloudData, saveUserCloudData } from '../utils/cloudSyncService';
import { 
  auth, 
  signInWithRealGoogle, 
  onAuthStateChanged, 
  signOut as firebaseSignOut 
} from '../utils/firebaseConfig';

const AuthContext = createContext();

const USERS_STORAGE_KEY = 'career_tracker_users_v17';
const CURRENT_USER_KEY = 'career_tracker_current_user_v17';

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

  // Listen to Firebase Auth state for Real Google Sign-In
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email.toLowerCase();
        console.log("[Auth] Real Google account detected:", email);

        // Fetch DB data for this real Google account
        let cloudUser = null;
        try {
          const cloudResult = await fetchUserCloudData(email);
          if (cloudResult && cloudResult.userProfile) {
            cloudUser = cloudResult.userProfile;
          }
        } catch (e) {}

        const userObj = {
          id: firebaseUser.uid || `user_google_${email}`,
          name: firebaseUser.displayName || email.split('@')[0],
          email: email,
          photoURL: firebaseUser.photoURL || '',
          isGoogle: true,
          geminiApiKey: cloudUser?.geminiApiKey || ''
        };

        setCurrentUser(userObj);
        setUsers(prev => {
          const filtered = prev.filter(u => u.email.toLowerCase() !== email);
          return [...filtered, userObj];
        });
      }
    });

    return () => unsubscribe();
  }, []);

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

  // Real Google Sign-In Flow
  const loginWithRealGoogleAccount = async () => {
    setIsCloudLoading(true);
    try {
      const googleUser = await signInWithRealGoogle();
      const email = googleUser.email.toLowerCase();

      // Look up DB profile
      let cloudUser = null;
      try {
        const cloudResult = await fetchUserCloudData(email);
        if (cloudResult && cloudResult.userProfile) {
          cloudUser = cloudResult.userProfile;
        }
      } catch (e) {}

      const finalUser = {
        id: googleUser.uid || `user_google_${email}`,
        name: googleUser.displayName || email.split('@')[0],
        email: email,
        photoURL: googleUser.photoURL || '',
        isGoogle: true,
        geminiApiKey: cloudUser?.geminiApiKey || ''
      };

      setUsers(prev => {
        const filtered = prev.filter(u => u.email.toLowerCase() !== email);
        return [...filtered, finalUser];
      });

      setCurrentUser(finalUser);
      saveUserCloudData(email, { userProfile: finalUser }).catch(err => console.warn(err));

      setIsCloudLoading(false);
      return finalUser;
    } catch (err) {
      setIsCloudLoading(false);
      throw err;
    }
  };

  // Fallback Google Login by email
  const loginWithGoogle = async (googleEmail = '', googleName = '') => {
    const email = (googleEmail || 'usuario.google@gmail.com').trim().toLowerCase();
    const name = googleName || email.split('@')[0];

    setIsCloudLoading(true);

    let cloudUser = null;
    try {
      const cloudResult = await fetchUserCloudData(email);
      if (cloudResult && cloudResult.userProfile) {
        cloudUser = cloudResult.userProfile;
      }
    } catch (e) {
      console.warn("DB lookup warning on Google login:", e);
    }

    let localUser = users.find(u => u.email.toLowerCase() === email);

    let finalUser = {
      id: cloudUser?.id || localUser?.id || ('user_google_' + Date.now()),
      name: cloudUser?.name || localUser?.name || name,
      email: email,
      isGoogle: true,
      geminiApiKey: cloudUser?.geminiApiKey || localUser?.geminiApiKey || ''
    };

    setUsers(prev => {
      const filtered = prev.filter(u => u.email.toLowerCase() !== email);
      return [...filtered, finalUser];
    });

    setCurrentUser(finalUser);
    saveUserCloudData(email, { userProfile: finalUser }).catch(err => console.warn(err));

    setIsCloudLoading(false);
    return finalUser;
  };

  const registerUser = async (name, email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error("Ya existe un usuario registrado con este correo.");
    }

    const newUser = {
      id: 'user_' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      password,
      isGoogle: cleanEmail.includes('@gmail.com'),
      geminiApiKey: ''
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);

    saveUserCloudData(cleanEmail, { userProfile: newUser }).catch(err => console.warn(err));

    return newUser;
  };

  const loginUser = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    let user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
    
    if (!user) {
      try {
        const cloudResult = await fetchUserCloudData(cleanEmail);
        if (cloudResult && cloudResult.userProfile) {
          user = {
            ...cloudResult.userProfile,
            password: password
          };
          setUsers(prev => [...prev, user]);
        }
      } catch (e) {}
    }

    if (!user) {
      throw new Error("Correo o contraseña incorrectos.");
    }

    setCurrentUser(user);
    return user;
  };

  const logoutUser = async () => {
    if (auth) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {}
    }
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
