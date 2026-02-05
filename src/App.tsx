'use client';

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TimeTrackingProvider } from "@/contexts/TimeTrackingContext";
import { OrganizationProvider, useOrganization } from "@/contexts/OrganizationContext";
import { useEffect } from "react";

// Public Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EmployeeSignup from "./pages/EmployeeSignup";
import ForgotPassword from "./pages/ForgotPassword";

// User Pages
import UserDashboard from "./pages/user/UserDashboard";
import TimeTracking from "./pages/user/TimeTracking";
import TimeLogs from "./pages/user/TimeLogs";
import Projects from "./pages/user/Projects";
import TimeOff from "./pages/user/TimeOff";
import Reports from "./pages/user/Reports";
import Settings from "./pages/user/Settings";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import TimeManagement from "./pages/admin/TimeManagement";
import AdminProjects from "./pages/admin/AdminProjects";
import TimeOffManagement from "./pages/admin/TimeOffManagement";
import AdminReports from "./pages/admin/AdminReports";
import AuditLogs from "./pages/admin/AuditLogs";
import AdminSettings from "./pages/admin/AdminSettings";

// Organization Pages
import CreateOrganization from "./pages/organization/CreateOrganization";
import SelectOrganization from "./pages/organization/SelectOrganization";
import OrganizationSettings from "./pages/organization/OrganizationSettings";

// Super Admin Pages
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import GlobalUsers from "./pages/superadmin/GlobalUsers";
import BillingSubscriptions from "./pages/superadmin/BillingSubscriptions";
import SystemSettings from "./pages/superadmin/SystemSettings";
import GlobalReports from "./pages/superadmin/GlobalReports";
import SupportTools from "./pages/superadmin/SupportTools";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route component
function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requireFullAdmin = false,
  requireSuperAdmin = false,
  requireOrganization = true,
}: { 
  children: React.ReactNode; 
  requireAdmin?: boolean;
  requireFullAdmin?: boolean; // Only org admin, not manager
  requireSuperAdmin?: boolean;
  requireOrganization?: boolean;
}) {
  const { isAuthenticated, isAdmin, isSuperAdmin, user } = useAuth();
  const { currentOrganization } = useOrganization();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Full admin check (org admin only, not manager)
  if (requireFullAdmin && user?.role !== 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Super admins don't need an organization
  if (requireOrganization && !isSuperAdmin && !currentOrganization) {
    return <Navigate to="/select-organization" replace />;
  }

  return <>{children}</>;
}

// App Routes
function AppRoutes() {
  const { isAuthenticated, isAdmin, isSuperAdmin, user, currentView } = useAuth();
  const { currentOrganization, organizations, setCurrentOrganization } = useOrganization();

  // Auto-select organization for admins when they login
  useEffect(() => {
    if (isAuthenticated && !isSuperAdmin && !currentOrganization && organizations.length > 0) {
      // For admins: automatically select their only organization
      if (isAdmin && organizations.length === 1) {
        setCurrentOrganization(organizations[0]);
      }
      // For regular users: automatically select if they only have one organization
      else if (organizations.length === 1) {
        setCurrentOrganization(organizations[0]);
      }
    }
  }, [isAuthenticated, isSuperAdmin, isAdmin, currentOrganization, organizations, setCurrentOrganization]);

  const getDefaultRoute = () => {
    if (!isAuthenticated) return "/login";
    if (isSuperAdmin) return "/superadmin";
    if (!currentOrganization) return "/select-organization";
    // Use currentView to determine the default route for admin/manager users
    if (isAdmin) {
      return currentView === 'admin' ? "/admin" : "/dashboard";
    }
    return "/dashboard";
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <Navigate to={getDefaultRoute()} replace />
          ) : (
            <Index />
          )
        } 
      />
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            <Navigate to={getDefaultRoute()} replace />
          ) : (
            <Login />
          )
        } 
      />
      <Route 
        path="/signup" 
        element={
          isAuthenticated ? (
            <Navigate to={getDefaultRoute()} replace />
          ) : (
            <Signup />
          )
        } 
      />
      <Route 
        path="/employee-signup" 
        element={
          isAuthenticated ? (
            <Navigate to={getDefaultRoute()} replace />
          ) : (
            <EmployeeSignup />
          )
        } 
      />
      <Route 
        path="/forgot-password" 
        element={
          isAuthenticated ? (
            <Navigate to={getDefaultRoute()} replace />
          ) : (
            <ForgotPassword />
          )
        } 
      />

      {/* Organization routes (no org required) */}
      <Route 
        path="/create-organization" 
        element={
          <ProtectedRoute requireOrganization={false}>
            <CreateOrganization />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/select-organization" 
        element={
          <ProtectedRoute requireOrganization={false}>
            <SelectOrganization />
          </ProtectedRoute>
        } 
      />

      {/* User routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/time-tracking" 
        element={
          <ProtectedRoute>
            <TimeTracking />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/time-logs" 
        element={
          <ProtectedRoute>
            <TimeLogs />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/projects" 
        element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/time-off" 
        element={
          <ProtectedRoute>
            <TimeOff />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      />

      {/* Admin routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute requireFullAdmin>
            <UserManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/time" 
        element={
          <ProtectedRoute requireAdmin>
            <TimeManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/projects" 
        element={
          <ProtectedRoute requireAdmin>
            <AdminProjects />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/time-off" 
        element={
          <ProtectedRoute requireAdmin>
            <TimeOffManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/reports" 
        element={
          <ProtectedRoute requireAdmin>
            <AdminReports />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/audit" 
        element={
          <ProtectedRoute requireFullAdmin>
            <AuditLogs />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/settings" 
        element={
          <ProtectedRoute requireFullAdmin>
            <AdminSettings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/organization/settings" 
        element={
          <ProtectedRoute requireFullAdmin>
            <OrganizationSettings />
          </ProtectedRoute>
        } 
      />

      {/* Super Admin routes */}
      <Route 
        path="/superadmin" 
        element={
          <ProtectedRoute requireSuperAdmin requireOrganization={false}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/superadmin/users" 
        element={
          <ProtectedRoute requireSuperAdmin requireOrganization={false}>
            <GlobalUsers />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/superadmin/billing" 
        element={
          <ProtectedRoute requireSuperAdmin requireOrganization={false}>
            <BillingSubscriptions />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/superadmin/settings" 
        element={
          <ProtectedRoute requireSuperAdmin requireOrganization={false}>
            <SystemSettings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/superadmin/reports" 
        element={
          <ProtectedRoute requireSuperAdmin requireOrganization={false}>
            <GlobalReports />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/superadmin/support" 
        element={
          <ProtectedRoute requireSuperAdmin requireOrganization={false}>
            <SupportTools />
          </ProtectedRoute>
        } 
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <OrganizationProvider>
        <TimeTrackingProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </TimeTrackingProvider>
      </OrganizationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
