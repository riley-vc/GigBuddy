import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LoginPage from './components/LoginPage.jsx';
import RegisterPage from './components/RegisterPage.jsx';

/**
 * AuthGate — sits between AuthProvider and App.
 * All hooks here run unconditionally; the early return is safe because
 * no hooks appear after it in this component.
 * App is only mounted when currentUser exists, so App's own hooks
 * are never called conditionally.
 */
function AuthGate() {
  const { currentUser } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'

  if (!currentUser) {
    return authView === 'login'
      ? <LoginPage onSwitchToRegister={() => setAuthView('register')} />
      : <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
  }

  return <App />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  </StrictMode>
);
