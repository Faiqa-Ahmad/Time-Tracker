'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout, PageHeader } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  Search, 
  MoreVertical, 
  Eye, 
  Ban, 
  Trash2,
  Mail,
  Building2,
  Shield,
  Clock,
  Download,
  Filter,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';

interface GlobalUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'employee';
  organization: string;
  organizationId: string;
  status: 'active' | 'inactive' | 'suspended';
  lastActive: string;
  joinDate: string;
  totalHours: number;
}

const MOCK_GLOBAL_USERS: GlobalUser[] = [
  { id: '1', name: 'Platform Admin', email: 'superadmin@roburna.com', role: 'superadmin', organization: 'Platform', organizationId: 'platform', status: 'active', lastActive: 'Now', joinDate: '2023-01-01', totalHours: 0 },
  { id: '2', name: 'Alex Johnson', email: 'admin@roburna.com', role: 'admin', organization: 'Roburna Labs', organizationId: 'org-1', status: 'active', lastActive: '5 min ago', joinDate: '2024-01-01', totalHours: 1248 },
  { id: '3', name: 'Sarah Miller', email: 'employee@roburna.com', role: 'employee', organization: 'Roburna Labs', organizationId: 'org-1', status: 'active', lastActive: '10 min ago', joinDate: '2024-06-15', totalHours: 856 },
  { id: '5', name: 'Emily Brown', email: 'emily@quantumlabs.io', role: 'employee', organization: 'Quantum Labs', organizationId: 'org-3', status: 'active', lastActive: '2 hours ago', joinDate: '2026-01-15', totalHours: 128 },
  { id: '6', name: 'John Doe', email: 'john@startupxyz.com', role: 'admin', organization: 'StartupXYZ', organizationId: 'org-4', status: 'inactive', lastActive: '3 days ago', joinDate: '2026-01-01', totalHours: 64 },
];

export default function GlobalUsers() {
  const [users, setUsers] = useState<GlobalUser[]>(MOCK_GLOBAL_USERS);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterOrg, setFilterOrg] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<GlobalUser | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                         user.email.toLowerCase().includes(search.toLowerCase()) ||
                         user.organization.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesOrg = filterOrg === 'all' || user.organizationId === filterOrg;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesOrg && matchesStatus;
  });

  const uniqueOrgs = Array.from(new Set(users.map(u => ({ id: u.organizationId, name: u.organization }))));

  const handleViewUser = (user: GlobalUser) => {
    setSelectedUser(user);
    setDetailDialogOpen(true);
  };


  const handleSuspendUser = (userId: string, userName: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: u.status === 'suspended' ? 'active' : 'suspended' as const } : u
    ));
    toast.success(`User ${userName} has been ${users.find(u => u.id === userId)?.status === 'suspended' ? 'reactivated' : 'suspended'}`);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setUsers(users.filter(u => u.id !== userId));
    toast.success(`User ${userName} has been deleted`);
  };

  const handleExportUsers = () => {
    toast.success('Exporting users...', {
      description: 'CSV file will be downloaded shortly',
    });
  };

  const getRoleBadgeColor = (role: GlobalUser['role']) => {
    switch (role) {
      case 'superadmin': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'admin': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusBadgeColor = (status: GlobalUser['status']) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success border-success/20';
      case 'inactive': return 'bg-muted text-muted-foreground';
      case 'suspended': return 'bg-destructive/10 text-destructive border-destructive/20';
    }
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Global User Management"
        description="Manage all users across the platform"
      >
        <Button onClick={handleExportUsers} className="gap-2">
          <Download className="w-4 h-4" />
          Export Users
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</p>
              </div>
              <UserCheck className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin' || u.role === 'superadmin').length}</p>
              </div>
              <Shield className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{users.reduce((acc, u) => acc + u.totalHours, 0).toLocaleString()}</p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="superadmin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterOrg} onValueChange={setFilterOrg}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                {uniqueOrgs.map(org => (
                  <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              All Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Organization</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Active</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Hours</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{user.organization}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={getStatusBadgeColor(user.status)}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {user.lastActive}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {user.totalHours.toLocaleString()}h
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewUser(user)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleSuspendUser(user.id, user.name)}>
                              <Ban className="w-4 h-4 mr-2" />
                              {user.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                            </DropdownMenuItem>
                            {user.role !== 'superadmin' && (
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteUser(user.id, user.name)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            )}
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
      </motion.div>

      {/* User Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback>
                  {selectedUser?.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {selectedUser?.name}
            </DialogTitle>
            <DialogDescription>{selectedUser?.email}</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Organization</p>
                  <p className="font-medium">{selectedUser.organization}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium capitalize">{selectedUser.role}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{selectedUser.status}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Join Date</p>
                  <p className="font-medium">{new Date(selectedUser.joinDate).toLocaleDateString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                  <p className="font-medium">{selectedUser.totalHours.toLocaleString()} hours</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Last Active</p>
                  <p className="font-medium">{selectedUser.lastActive}</p>
                </div>
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
