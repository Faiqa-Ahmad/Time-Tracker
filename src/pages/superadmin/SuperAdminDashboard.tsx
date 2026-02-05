import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout, PageHeader } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Building2, 
  Users, 
  Activity,
  Search,
  MoreHorizontal,
  Eye,
  Ban,
  Trash2,
  DollarSign,
  CheckCircle,
  Globe,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useOrganization, Organization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

// Mock platform stats
const PLATFORM_STATS = {
  totalOrganizations: 156,
  totalUsers: 2847,
  activeToday: 423,
  monthlyRevenue: 12450,
  newOrgsThisMonth: 23,
  churnedOrgsThisMonth: 2,
};

// Mock recent signups
const RECENT_SIGNUPS = [
  { id: '1', name: 'Quantum Labs', email: 'admin@quantumlabs.io', plan: 'professional', date: '2026-02-02', users: 8 },
  { id: '2', name: 'StartupXYZ', email: 'hello@startupxyz.com', plan: 'starter', date: '2026-02-01', users: 3 },
  { id: '3', name: 'MegaCorp Inc', email: 'hr@megacorp.com', plan: 'enterprise', date: '2026-01-30', users: 45 },
];

export default function SuperAdminDashboard() {
  const { organizations, setCurrentOrganization } = useOrganization();
  const { startImpersonation } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const allOrgs = [...organizations, ...RECENT_SIGNUPS.map(s => ({
    id: s.id,
    name: s.name,
    slug: s.name.toLowerCase().replace(/\s+/g, '-'),
    plan: s.plan as Organization['plan'],
    createdAt: new Date(s.date),
    ownerId: 'unknown',
    settings: {
      workHoursStart: '09:00',
      workHoursEnd: '18:00',
      timezone: 'UTC',
      defaultPtoDays: 21,
      requireDescription: true,
    },
    memberCount: s.users,
    maxMembers: 50,
  }))];

  const filteredOrgs = allOrgs.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewOrg = (org: Organization) => {
    setSelectedOrg(org);
    setDetailDialogOpen(true);
  };

  const handleSuspendOrg = (orgId: string, orgName: string) => {
    toast({
      title: 'Organization Suspended',
      description: `${orgName} has been suspended.`,
    });
  };

  const handleDeleteOrg = (orgId: string, orgName: string) => {
    toast({
      title: 'Organization Deleted',
      description: `${orgName} has been permanently deleted.`,
      variant: 'destructive',
    });
  };

  const getPlanBadgeColor = (plan: Organization['plan']) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'professional': return 'bg-primary/10 text-primary border-primary/20';
      case 'starter': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Platform Administration"
        description="Manage all organizations and monitor platform health"
      >
        <Badge variant="outline" className="gap-1 px-3 py-1">
          <Globe className="w-3.5 h-3.5" />
          Super Admin
        </Badge>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Organizations"
          value={PLATFORM_STATS.totalOrganizations}
          subtitle={`+${PLATFORM_STATS.newOrgsThisMonth} this month`}
          icon={Building2}
          delay={0}
        />
        <StatCard
          title="Total Users"
          value={PLATFORM_STATS.totalUsers.toLocaleString()}
          icon={Users}
          variant="accent"
          delay={0.1}
        />
        <StatCard
          title="Active Today"
          value={PLATFORM_STATS.activeToday}
          trend={{ value: 12, isPositive: true }}
          icon={Activity}
          variant="success"
          delay={0.2}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${PLATFORM_STATS.monthlyRevenue.toLocaleString()}`}
          trend={{ value: 8, isPositive: true }}
          icon={DollarSign}
          delay={0.3}
        />
      </div>

      <Tabs defaultValue="organizations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="organizations" className="gap-2">
            <Building2 className="w-4 h-4" />
            Organizations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organizations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">All Organizations</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search organizations..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Organization</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Members</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Created</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrgs.map((org) => (
                      <tr key={org.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{org.name}</p>
                              <p className="text-sm text-muted-foreground">{org.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className={getPlanBadgeColor(org.plan)}>
                            {org.plan}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{org.memberCount}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {new Date(org.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewOrg(org)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleSuspendOrg(org.id, org.name)}>
                                <Ban className="w-4 h-4 mr-2" />
                                Suspend
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteOrg(org.id, org.name)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Organization Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              {selectedOrg?.name}
            </DialogTitle>
            <DialogDescription>{selectedOrg?.slug}</DialogDescription>
          </DialogHeader>
          {selectedOrg && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-medium capitalize">{selectedOrg.plan}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Members</p>
                  <p className="font-medium">{selectedOrg.memberCount} / {selectedOrg.maxMembers}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(selectedOrg.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Timezone</p>
                  <p className="font-medium">{selectedOrg.settings.timezone}</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">Work Hours</p>
                <p className="font-medium">{selectedOrg.settings.workHoursStart} - {selectedOrg.settings.workHoursEnd}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
