import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import GigCreator from './pages/GigCreator';
import GigMarketplace from './pages/GigMarketplace';

function ProtectedOrganizerRoute({ children }) {
  const { isOrganizer } = useAuth();
  return isOrganizer ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/create-gig"
            element={
              <ProtectedOrganizerRoute>
                <GigCreator />
              </ProtectedOrganizerRoute>
            }
          />
          <Route path="/marketplace" element={<GigMarketplace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
