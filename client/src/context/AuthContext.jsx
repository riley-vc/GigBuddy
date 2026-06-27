import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'gigbag_user';

export function AuthProvider({ children }) {
  // Restore session from localStorage on first render
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  /** Call after a successful login or register API response */
  function login(userObj) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userObj));
    setCurrentUser(userObj);
  }

  /** Clear session */
  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook — use inside any component that needs auth state */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
