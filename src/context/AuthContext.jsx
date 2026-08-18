import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const USERS_STORAGE_KEY = 'career_tracker_users_v16';
const CURRENT_USER_KEY = 'career_tracker_current_user_v16';

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
    return null; // Force login on fresh start
  });

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

  // Google / Gmail OAuth Handler
  const loginWithGoogle = (googleEmail = '', googleName = '') => {
    const email = (googleEmail || 'usuario.google@gmail.com').trim().toLowerCase();
    const name = googleName || email.split('@')[0];

    let user = users.find(u => u.email.toLowerCase() === email);
    if (!user) {
      user = {
        id: 'user_google_' + Date.now(),
        name: name,
        email: email,
        isGoogle: true,
        geminiApiKey: ''
      };
      setUsers(prev => [...prev, user]);
    }

    setCurrentUser(user);
    return user;
  };

  const registerUser = (name, email, password) => {
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
      isGoogle: false,
      geminiApiKey: ''
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return newUser;
  };

  const loginUser = (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
    if (!user) {
      throw new Error("Correo o contraseña incorrectos.");
    }
    setCurrentUser(user);
    return user;
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const updateGeminiApiKey = (apiKey) => {
    if (!currentUser) return;
    const updated = { ...currentUser, geminiApiKey: apiKey.trim() };
    setCurrentUser(updated);

    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, geminiApiKey: apiKey.trim() } : u));
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      users,
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
