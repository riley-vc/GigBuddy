import { createContext, useContext, useState } from 'react';

// Mock users for Phase 1 development
const MOCK_USERS = {
  organizer: {
    _id: '64a1b2c3d4e5f6789012abc1',
    name: 'Carlo Santos',
    email: 'carlo@eventsmanila.ph',
    role: 'organizer',
  },
  musician: {
    _id: '64a1b2c3d4e5f6789012abc2',
    name: 'Juan Dela Cruz',
    email: 'juan@musicianph.com',
    role: 'musician',
  },
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(MOCK_USERS.organizer);

  const toggleRole = () => {
    setCurrentUser((prev) =>
      prev.role === 'organizer' ? MOCK_USERS.musician : MOCK_USERS.organizer
    );
  };

  const isOrganizer = currentUser?.role === 'organizer';
  const isMusician = currentUser?.role === 'musician';

  return (
    <AuthContext.Provider value={{ currentUser, toggleRole, isOrganizer, isMusician }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
