import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout, PageHeader } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  Search, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash2,
  Clock,
  UserCheck,
  UserX,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee' | 'pending';
  department: string;
  status: 'online' | 'offline' | 'away';
  joinDate: string;
  lastActive: string;
}

// Mock users - in real app, these would be filtered by currentOrganization.id from backend
const DUMMY_USERS: User[] = [
  { id: '1', name: 'Alex Johnson', email: 'admin@roburna.com', role: 'admin', department: 'Management', status: 'online', joinDate: '2024-01-01', lastActive: 'Now' },
  { id: '2', name: 'Sarah Miller', email: 'employee@roburna.com', role: 'employee', department: 'Engineering', status: 'online', joinDate: '2024-06-15', lastActive: '5 min ago' },
  { id: '3', name: 'John Smith', email: 'john@roburna.com', role: 'employee', department: 'Design', status: 'offline', joinDate: '2024-03-10', lastActive: '2 hours ago' },
  { id: '4', name: 'Emily Brown', email: 'emily@roburna.com', role: 'pending', department: 'Marketing', status: 'offline', joinDate: '2026-01-28', lastActive: 'Never' },
  { id: '5', name: 'Michael Lee', email: 'michael@roburna.com', role: 'pending', department: 'Engineering', status: 'offline', joinDate: '2026-01-30', lastActive: 'Never' },
  { id: '6', name: 'Jessica Taylor', email: 'jessica@roburna.com', role: 'employee', department: 'Sales', status: 'away', joinDate: '2024-09-01', lastActive: '30 min ago' },
];

interface TimeLog {
  id: string;
  date: string;
  hours: number;
  description: string;
  project: string;
}

const MOCK_TIME_LOGS: Record<string, TimeLog[]> = {
  '2': [
    { id: '1', date: '2026-02-03', hours: 8.0, description: 'Frontend development', project: 'Website Redesign' },
    { id: '2', date: '2026-02-02', hours: 7.5, description: 'API integration', project: 'Website Redesign' },
    { id: '3', date: '2026-02-01', hours: 8.5, description: 'Bug fixes and testing', project: 'Website Redesign' },
  ],
  '3': [
    { id: '4', date: '2026-02-03', hours: 7.0, description: 'UI/UX design work', project: 'Mobile App' },
    { id: '5', date: '2026-02-02', hours: 6.5, description: 'Design review', project: 'Mobile App' },
  ],
};

export default function UserManagement() {
  const { currentOrganization } = useOrganization();
  const [users, setUsers] = useState<User[]>(DUMMY_USERS);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTimeLogsDialogOpen, setIsTimeLogsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('employee');
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    department: '',
    role: 'employee' as 'admin' | 'employee',
  });
  const { toast } = useToast();

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const pendingUsers = users.filter(u => u.role === 'pending');

  const handleApprove = (user: User) => {
    setSelectedUser(user);
    setIsApproveDialogOpen(true);
  };

  const handleConfirmApprove = () => {
    if (selectedUser) {
      setUsers(users.map(u => 
        u.id === selectedUser.id ? { ...u, role: selectedRole as any } : u
      ));
      toast({
        title: "User Approved",
        description: `${selectedUser.name} has been approved as ${selectedRole}.`,
      });
      setIsApproveDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleReject = (user: User) => {
    setUsers(users.filter(u => u.id !== user.id));
    toast({
      title: "User Rejected",
      description: `${user.name}'s registration has been rejected.`,
      variant: "destructive",
    });
  };

  const handleDeactivate = (user: User) => {
    setUsers(users.filter(u => u.id !== user.id));
    toast({
      title: "User Deactivated",
      description: `${user.name} has been deactivated.`,
    });
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      department: user.department,
      role: user.role === 'pending' ? 'employee' : user.role,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedUser) {
      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { 
              ...u, 
              name: editFormData.name,
              email: editFormData.email,
              department: editFormData.department,
              role: editFormData.role,
            } 
          : u
      ));
      toast({
        title: "User Updated",
        description: `${editFormData.name}'s information has been updated.`,
      });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleViewTimeLogs = (user: User) => {
    setSelectedUser(user);
    setIsTimeLogsDialogOpen(true);
  };

  const getUserTimeLogs = (userId: string): TimeLog[] => {
    return MOCK_TIME_LOGS[userId] || [];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online': return <Badge className="bg-success text-white">Online</Badge>;
      case 'offline': return <Badge variant="secondary">Offline</Badge>;
      case 'away': return <Badge className="bg-warning text-white">Away</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge className="bg-primary">Admin</Badge>;
      case 'employee': return <Badge variant="outline">Employee</Badge>;
      case 'pending': return <Badge className="bg-warning text-white">Pending</Badge>;
      default: return <Badge variant="secondary">{role}</Badge>;
    }
  };

  return (
    <AppLayout>
      <PageHeader 
        title={`User Management - ${currentOrganization?.name || 'Organization'}`}
        description={`Manage users and approve new registrations for ${currentOrganization?.name || 'your organization'}`}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total Users</span>
            </div>
            <div className="text-2xl font-bold mt-1">{users.length}</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-success" />
              <span className="text-sm text-muted-foreground">Active</span>
            </div>
            <div className="text-2xl font-bold mt-1">{users.filter(u => u.role !== 'pending').length}</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning" />
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <div className="text-2xl font-bold mt-1">{pendingUsers.length}</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Online Now</span>
            </div>
            <div className="text-2xl font-bold mt-1">{users.filter(u => u.status === 'online').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <Card className="card-modern mb-6 border-warning/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertCircle className="w-5 h-5" />
              Pending Approvals ({pendingUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingUsers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-warning/5 border border-warning/20"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-warning/20 text-warning">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email} • {user.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleApprove(user)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleReject(user)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Users */}
      <Card className="card-modern">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Users</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>{user.joinDate}</TableCell>
                  <TableCell className="text-muted-foreground">{user.lastActive}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewTimeLogs(user)}>
                          <Clock className="w-4 h-4 mr-2" />
                          View Time Logs
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeactivate(user)}
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve User</DialogTitle>
            <DialogDescription>
              Select a role for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmApprove}>
              Approve User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Full Name</Label>
              <Input
                id="editName"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editEmail">Email Address</Label>
              <Input
                id="editEmail"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDepartment">Department</Label>
              <Input
                id="editDepartment"
                value={editFormData.department}
                onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                placeholder="Enter department"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editRole">Role</Label>
              <Select 
                value={editFormData.role} 
                onValueChange={(value: 'admin' | 'employee') => 
                  setEditFormData({ ...editFormData, role: value })
                }
              >
                <SelectTrigger id="editRole">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Time Logs Dialog */}
      <Dialog open={isTimeLogsDialogOpen} onOpenChange={setIsTimeLogsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Time Logs - {selectedUser?.name}</DialogTitle>
            <DialogDescription>
              Recent time tracking entries for this user
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedUser && getUserTimeLogs(selectedUser.id).length > 0 ? (
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-sm text-muted-foreground">Total Hours</div>
                      <div className="text-2xl font-bold">
                        {getUserTimeLogs(selectedUser.id).reduce((sum, log) => sum + log.hours, 0).toFixed(1)}h
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-sm text-muted-foreground">Total Entries</div>
                      <div className="text-2xl font-bold">
                        {getUserTimeLogs(selectedUser.id).length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-sm text-muted-foreground">Avg Hours/Day</div>
                      <div className="text-2xl font-bold">
                        {(getUserTimeLogs(selectedUser.id).reduce((sum, log) => sum + log.hours, 0) / 
                          getUserTimeLogs(selectedUser.id).length).toFixed(1)}h
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Time Logs Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Hours</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getUserTimeLogs(selectedUser.id).map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.date}</TableCell>
                          <TableCell>{log.project}</TableCell>
                          <TableCell className="max-w-xs truncate">{log.description}</TableCell>
                          <TableCell className="text-right font-medium">{log.hours}h</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No time logs found for this user</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTimeLogsDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsTimeLogsDialogOpen(false);
              window.location.href = '/admin/time';
            }}>
              View All Time Logs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
