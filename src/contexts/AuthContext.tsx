import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type UserRole = 'superadmin' | 'admin' | 'manager' | 'employee' | 'pending';
export type DashboardView = 'admin' | 'employee';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  createdAt: Date;
  organizationIds?: string[]; // Organizations user belongs to
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  currentView: DashboardView;
  switchView: (view: DashboardView) => void;
  canSwitchView: boolean; // True if user has admin/manager role
  isImpersonating: boolean;
  impersonatedOrgId: string | null;
  startImpersonation: (orgId: string, view: DashboardView) => void;
  stopImpersonation: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'superadmin@roburna.com': {
    password: 'super123',
    user: {
      id: '0',
      email: 'superadmin@roburna.com',
      name: 'Platform Admin',
      role: 'superadmin',
      department: 'Platform',
      createdAt: new Date('2023-01-01'),
      organizationIds: [],
    },
  },
  'admin@roburna.com': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@roburna.com',
      name: 'Alex Johnson',
      role: 'admin',
      department: 'Management',
      createdAt: new Date('2024-01-01'),
      organizationIds: ['org-1'],
    },
  },
  'employee@roburna.com': {
    password: 'employee123',
    user: {
      id: '2',
      email: 'employee@roburna.com',
      name: 'Sarah Miller',
      role: 'employee',
      department: 'Engineering',
      createdAt: new Date('2024-06-15'),
      organizationIds: ['org-1'],
    },
  },
  'admin@liquidnft.com': {
    password: 'admin123',
    user: {
      id: '3',
      email: 'admin@liquidnft.com',
      name: 'Mike Chen',
      role: 'admin',
      department: 'Operations',
      createdAt: new Date('2024-06-15'),
      organizationIds: ['org-2'],
    },
  },
  'manager@roburna.com': {
    password: 'manager123',
    user: {
      id: '4',
      email: 'manager@roburna.com',
      name: 'Emma Wilson',
      role: 'manager',
      department: 'Engineering',
      createdAt: new Date('2024-08-01'),
      organizationIds: ['org-1'],
    },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<DashboardView>('employee');
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedOrgId, setImpersonatedOrgId] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockUser = MOCK_USERS[email.toLowerCase()];
    
    if (mockUser && mockUser.password === password) {
      setUser(mockUser.user);
      // Default to admin view for admin/manager roles
      if (mockUser.user.role === 'admin' || mockUser.user.role === 'manager') {
        setCurrentView('admin');
      } else {
        setCurrentView('employee');
      }
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setCurrentView('employee');
    setIsImpersonating(false);
    setImpersonatedOrgId(null);
  }, []);

  const switchView = useCallback((view: DashboardView) => {
    setCurrentView(view);
  }, []);

  const startImpersonation = useCallback((orgId: string, view: DashboardView) => {
    setIsImpersonating(true);
    setImpersonatedOrgId(orgId);
    setCurrentView(view);
  }, []);

  const stopImpersonation = useCallback(() => {
    setIsImpersonating(false);
    setImpersonatedOrgId(null);
    setCurrentView('employee');
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'manager' || user?.role === 'superadmin';
  const canSwitchView = (user?.role === 'admin' || user?.role === 'manager') && !isImpersonating;

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    isAdmin,
    isSuperAdmin: user?.role === 'superadmin',
    currentView,
    switchView,
    canSwitchView,
    isImpersonating,
    impersonatedOrgId,
    startImpersonation,
    stopImpersonation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
