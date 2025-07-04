import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import InvitationsPage from "./pages/admin/InvitationsPage";
import ManageProperties from "./pages/admin/ManageProperties";
import ManageOwners from "./pages/admin/ManageOwners";
import UserManagement from "./pages/admin/UserManagement";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import AllPropertiesAdmin from "./pages/admin/AllProperties";
import SuggestedProperties from "./pages/admin/SuggestedProperties";
import AdminPropertyDetails from "./pages/admin/PropertyDetails";
import AdminLogin from "./pages/auth/AdminLogin";

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Admin Protected Route Component
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, userProfile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }
  
  console.log('AdminProtectedRoute:', { user: !!user, userProfile, userType: userProfile?.user_type });
  
  if (!user || !userProfile) {
    console.log('No user/profile, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  if (userProfile.user_type !== 'admin') {
    console.log('Non-admin user accessing admin route, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('Admin user confirmed, rendering admin content');
  return <>{children}</>;
};

// Loading component
const AppLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
  </div>
);

const AppRoutes = () => {
  const { loading } = useAuth();
  
  if (loading) {
    return <AppLoading />;
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<AdminLogin />} />

        {/* Default route - redirect to admin dashboard */}
        <Route path="/" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/invitations" element={
          <AdminProtectedRoute>
            <InvitationsPage />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/properties" element={
          <AdminProtectedRoute>
            <ManageProperties />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/owners" element={
          <AdminProtectedRoute>
            <ManageOwners />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <AdminProtectedRoute>
            <UserManagement />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <AdminProtectedRoute>
            <Reports />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <AdminProtectedRoute>
            <Settings />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/all-properties" element={
          <AdminProtectedRoute>
            <AllPropertiesAdmin />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/suggested-properties" element={
          <AdminProtectedRoute>
            <SuggestedProperties />
          </AdminProtectedRoute>
        } />
        <Route path="/admin/property/:id" element={
          <AdminProtectedRoute>
            <AdminPropertyDetails />
          </AdminProtectedRoute>
        } />
     
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;