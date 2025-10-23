import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HomePage } from './components/HomePage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { SubmitGrievancePage } from './components/SubmitGrievancePage';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AILogsPage } from './components/AILogsPage';
import { ProfilePage } from './components/ProfilePage';
import { AboutAIPage } from './components/AboutAIPage';
import { ContactPage } from './components/ContactPage';
import { ManageSystemPage } from './components/ManageSystemPage';
import { Toaster } from './components/ui/sonner';

function ProtectedRoute({
  children,
  adminOnly = false,
  superAdminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
}) {
  const { user, loading, isAdmin, isHOD } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Super admin routes (admin only, not HOD)
  if (superAdminOnly && !isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Allow admins and HODs to access admin-only routes
  if (adminOnly && !isAdmin && !isHOD) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AuthRedirect() {
  const { user, loading, isAdmin, isHOD } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect when user logs in from login/register pages
    if (!loading && user) {
      const currentPath = location.pathname;
      // Only redirect if on login/register pages
      if (currentPath === '/login' || currentPath === '/register') {
        if (isAdmin || isHOD) {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [user, loading, isAdmin, isHOD, navigate, location.pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthRedirect />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/about" element={<AboutAIPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Protected Routes - Any authenticated user */}
          <Route
            path="/submit"
            element={
              <ProtectedRoute>
                <SubmitGrievancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin Only Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ai-logs"
            element={
              <ProtectedRoute adminOnly>
                <AILogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manage"
            element={
              <ProtectedRoute superAdminOnly>
                <ManageSystemPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
