import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import AdminLogin from "./pages/auth/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import InvitationsPage from "./pages/admin/InvitationsPage";
import ManageProperties from "./pages/admin/ManageProperties";
import PaymentRequests from "./pages/admin/PaymentRequests";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import TrustLevels from "./pages/owner/TrustLevels";
import SuggestProperty from "./pages/owner/SuggestProperty";
import ManageNetwork from "./pages/owner/ManageNetwork";
import Payments from "./pages/owner/Payments";
import PropertyDetails from "./pages/property/PropertyDetails";
// New imports for admin routes
import ManageOwners from "./pages/admin/ManageOwners";
import UserManagement from "./pages/admin/UserManagement";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import AllPropertiesAdmin from "./pages/admin/AllProperties";
import SuggestedProperties from "./pages/admin/SuggestedProperties";
import AdminPropertyDetails from "./pages/admin/PropertyDetails";
import FundRequests from "./pages/admin/FundRequests";
// New imports for owner routes
import PropertiesPage from "./pages/owner/PropertiesPage";
import BookingsPage from "./pages/owner/BookingsPage";
import SettingsPage from "./pages/owner/SettingsPage";
// Onboarding imports
import OwnerOnboarding from "./pages/onboarding/OwnerOnboarding";
import UserOnboarding from "./pages/onboarding/UserOnboarding";
// User routes
import Profile from "./pages/user/Profile";
import UserSettings from "./pages/user/Settings";
import InvitationResponse from "./pages/invitation/InvitationResponse";
// New page imports
import ContactAdmin from "./pages/ContactAdmin";
import About from "./pages/About";
import Careers from "./pages/Careers";
import Press from "./pages/Press";
import Policies from "./pages/Policies";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import AllProperties from "./pages/AllProperties";
import FAQ from "./pages/FAQ";
import TrustSafety from "./pages/TrustSafety";

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
      // For anonymous users, use shorter stale times
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected Route Component with Anonymous User Support
const ProtectedRoute = ({ children, allowedRoles }: { 
  children: React.ReactNode; 
  allowedRoles?: ( 'admin')[] 
}) => {
  const { user, userProfile, loading, isAnonymous } = useAuth();
  
  // IMPORTANT: Always show loading state while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-airbnb-primary"></div>
      </div>
    );
  }
  
  // Only redirect to login if we're certain there's no user AND we're not loading
  if (!loading && (!user || !userProfile)) {
    return <Navigate to="/login" replace />;
  }
  
    if (userProfile.user_type == "admin") {
     
        return <Navigate to="/admin" replace />;
    }
  
  // If we get here, user has access
  return <>{children}</>;
};



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
    console.log('No user/profile, redirecting to admin login');
    return <Navigate to="/login" replace />;
  }
  
  if (userProfile.user_type !== 'admin') {
    console.log('Non-admin user accessing admin route, redirecting to admin login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('Admin user confirmed, rendering admin content');
  return <>{children}</>;
};

// Loading component
const AppLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-airbnb-primary"></div>
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
        <Route path="/admin/payments" element={
          <AdminProtectedRoute>
            <PaymentRequests />
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
        <Route path="/admin/fund-requests" element={
          <AdminProtectedRoute>
            <FundRequests />
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