import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type OrganizationPlan = 'free' | 'starter' | 'professional' | 'enterprise';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  plan: OrganizationPlan;
  createdAt: Date;
  ownerId: string;
  settings: {
    workHoursStart: string;
    workHoursEnd: string;
    timezone: string;
    defaultPtoDays: number;
    requireDescription: boolean;
  };
  memberCount: number;
  maxMembers: number;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: 'owner' | 'admin' | 'manager' | 'employee';
  joinedAt: Date;
  invitedBy?: string;
}

interface OrganizationContextType {
  organizations: Organization[];
  currentOrganization: Organization | null;
  setCurrentOrganization: (org: Organization | null) => void;
  createOrganization: (name: string, slug: string, plan?: OrganizationPlan) => Promise<Organization>;
  updateOrganization: (id: string, updates: Partial<Organization>) => Promise<void>;
  deleteOrganization: (id: string) => Promise<void>;
  inviteMember: (email: string, role: OrganizationMember['role']) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  updateMemberRole: (memberId: string, role: OrganizationMember['role']) => Promise<void>;
  members: OrganizationMember[];
  isOrgOwner: boolean;
  isOrgAdmin: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

// Mock organizations
const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-1',
    name: 'Roburna Labs',
    slug: 'roburna-labs',
    plan: 'professional',
    createdAt: new Date('2024-01-01'),
    ownerId: '1',
    settings: {
      workHoursStart: '09:00',
      workHoursEnd: '18:00',
      timezone: 'UTC',
      defaultPtoDays: 21,
      requireDescription: true,
    },
    memberCount: 12,
    maxMembers: 50,
  },
  {
    id: 'org-3',
    name: 'Tech Innovators',
    slug: 'tech-innovators',
    plan: 'enterprise',
    createdAt: new Date('2023-11-20'),
    ownerId: '4',
    settings: {
      workHoursStart: '08:00',
      workHoursEnd: '17:00',
      timezone: 'PST',
      defaultPtoDays: 25,
      requireDescription: false,
    },
    memberCount: 45,
    maxMembers: 100,
  },
];

const MOCK_MEMBERS: OrganizationMember[] = [
  { id: 'mem-1', organizationId: 'org-1', userId: '1', role: 'owner', joinedAt: new Date('2024-01-01') },
  { id: 'mem-2', organizationId: 'org-1', userId: '2', role: 'employee', joinedAt: new Date('2024-06-15'), invitedBy: '1' },
  { id: 'mem-3', organizationId: 'org-1', userId: '5', role: 'admin', joinedAt: new Date('2024-02-10'), invitedBy: '1' },
  { id: 'mem-4', organizationId: 'org-1', userId: '6', role: 'manager', joinedAt: new Date('2024-03-20'), invitedBy: '1' },
  { id: 'mem-5', organizationId: 'org-2', userId: '3', role: 'owner', joinedAt: new Date('2024-06-15') },
];

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>(MOCK_ORGANIZATIONS);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>(MOCK_MEMBERS);
  
  // Get current user from AuthContext to filter organizations
  // In a real app, this would come from the auth context
  const [currentUserId] = useState('1'); // This would come from useAuth()
  
  // Filter organizations based on user membership
  // Admins can only see organizations they belong to
  const userMemberships = members.filter(m => m.userId === currentUserId);
  const userOrgIds = userMemberships.map(m => m.organizationId);
  const organizations = allOrganizations.filter(org => userOrgIds.includes(org.id));

  const createOrganization = useCallback(async (name: string, slug: string, plan: OrganizationPlan = 'free'): Promise<Organization> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Set maxMembers based on plan
    const planLimits = {
      free: 5,
      starter: 10,
      professional: 50,
      enterprise: 999,
    };
    
    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name,
      slug,
      plan,
      createdAt: new Date(),
      ownerId: currentUserId,
      settings: {
        workHoursStart: '09:00',
        workHoursEnd: '18:00',
        timezone: 'UTC',
        defaultPtoDays: plan === 'enterprise' ? 25 : plan === 'professional' ? 21 : 15,
        requireDescription: true,
      },
      memberCount: 1,
      maxMembers: planLimits[plan],
    };

    setAllOrganizations(prev => [...prev, newOrg]);
    setCurrentOrganization(newOrg);
    
    // Add owner as member
    setMembers(prev => [...prev, {
      id: `mem-${Date.now()}`,
      organizationId: newOrg.id,
      userId: currentUserId,
      role: 'owner',
      joinedAt: new Date(),
    }]);

    return newOrg;
  }, [currentUserId]);

  const updateOrganization = useCallback(async (id: string, updates: Partial<Organization>): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setAllOrganizations(prev => prev.map(org => 
      org.id === id ? { ...org, ...updates } : org
    ));
    
    if (currentOrganization?.id === id) {
      setCurrentOrganization(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [currentOrganization]);

  const deleteOrganization = useCallback(async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    setAllOrganizations(prev => prev.filter(org => org.id !== id));
    setMembers(prev => prev.filter(m => m.organizationId !== id));
    if (currentOrganization?.id === id) {
      setCurrentOrganization(null);
    }
  }, [currentOrganization]);

  const inviteMember = useCallback(async (email: string, role: OrganizationMember['role']): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!currentOrganization) return;
    
    const newMember: OrganizationMember = {
      id: `mem-${Date.now()}`,
      organizationId: currentOrganization.id,
      userId: `user-${Date.now()}`,
      role,
      joinedAt: new Date(),
      invitedBy: '1',
    };
    
      setMembers(prev => [...prev, newMember]);
    setAllOrganizations(prev => prev.map(org => 
      org.id === currentOrganization.id 
        ? { ...org, memberCount: org.memberCount + 1 }
        : org
    ));
  }, [currentOrganization]);

  const removeMember = useCallback(async (memberId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const member = members.find(m => m.id === memberId);
    if (member) {
      setMembers(prev => prev.filter(m => m.id !== memberId));
      setAllOrganizations(prev => prev.map(org => 
        org.id === member.organizationId 
          ? { ...org, memberCount: org.memberCount - 1 }
          : org
      ));
    }
  }, [members]);

  const updateMemberRole = useCallback(async (memberId: string, role: OrganizationMember['role']): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    setMembers(prev => prev.map(m => 
      m.id === memberId ? { ...m, role } : m
    ));
  }, []);

  const currentUserMembership = members.find(
    m => m.organizationId === currentOrganization?.id && m.userId === currentUserId
  );

  const value: OrganizationContextType = {
    organizations, // Only organizations user belongs to
    currentOrganization,
    setCurrentOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    inviteMember,
    removeMember,
    updateMemberRole,
    members: members.filter(m => m.organizationId === currentOrganization?.id),
    isOrgOwner: currentUserMembership?.role === 'owner',
    isOrgAdmin: currentUserMembership?.role === 'owner' || currentUserMembership?.role === 'admin',
  };

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
