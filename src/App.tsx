import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SitesProvider } from './context/SitesContext';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import TemplatePicker from './pages/TemplatePicker';
import Editor from './pages/Editor';
import PublishedSite from './pages/PublishedSite';
import { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function Layout() {
  const location = useLocation();
  // We want to hide header on:
  // 1. Editor (/editor/...)
  // 2. Published site (/p/...)
  const isEditor = location.pathname.startsWith('/editor/');
  const isPublished = location.pathname.startsWith('/p/');
  
  const showHeader = !isEditor && !isPublished;

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/new" element={<ProtectedRoute><TemplatePicker /></ProtectedRoute>} />
        <Route path="/editor/:id" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
        <Route path="/p/:id" element={<PublishedSite />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <SitesProvider>
          <Layout />
        </SitesProvider>
      </AuthProvider>
    </HashRouter>
  );
}
