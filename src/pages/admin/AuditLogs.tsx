import { useState } from 'react';
import { AppLayout, PageHeader } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  ClipboardList, 
  Search, 
  Filter,
  UserCheck,
  LogIn,
  Clock,
  Settings,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  category: 'auth' | 'time' | 'user' | 'project' | 'settings' | 'timeoff';
  details: string;
  ipAddress: string;
}

const DUMMY_LOGS: AuditLog[] = [
  { id: '1', timestamp: '2026-02-01 14:32:15', userId: '1', userName: 'Alex Johnson', userAvatar: 'A', action: 'Login', category: 'auth', details: 'Successful login from Chrome on Windows', ipAddress: '192.168.1.100' },
  { id: '2', timestamp: '2026-02-01 14:30:00', userId: '2', userName: 'Sarah Miller', userAvatar: 'S', action: 'Clock In', category: 'time', details: 'Started session: "Frontend development"', ipAddress: '192.168.1.101' },
  { id: '3', timestamp: '2026-02-01 14:25:00', userId: '1', userName: 'Alex Johnson', userAvatar: 'A', action: 'User Approved', category: 'user', details: 'Approved user: Emily Brown as Employee', ipAddress: '192.168.1.100' },
  { id: '4', timestamp: '2026-02-01 13:45:00', userId: '3', userName: 'John Smith', userAvatar: 'J', action: 'Time Off Request', category: 'timeoff', details: 'Submitted vacation request for 2026-02-10', ipAddress: '192.168.1.102' },
  { id: '5', timestamp: '2026-02-01 12:00:00', userId: '2', userName: 'Sarah Miller', userAvatar: 'S', action: 'Clock Out', category: 'time', details: 'Ended session: 4.5 hours logged', ipAddress: '192.168.1.101' },
  { id: '6', timestamp: '2026-02-01 11:30:00', userId: '1', userName: 'Alex Johnson', userAvatar: 'A', action: 'Project Created', category: 'project', details: 'Created project: "Mobile App Phase 2"', ipAddress: '192.168.1.100' },
  { id: '7', timestamp: '2026-02-01 10:15:00', userId: '1', userName: 'Alex Johnson', userAvatar: 'A', action: 'Settings Updated', category: 'settings', details: 'Updated work hours: 9:00 AM - 6:00 PM', ipAddress: '192.168.1.100' },
  { id: '8', timestamp: '2026-02-01 09:00:00', userId: '6', userName: 'Jessica Taylor', userAvatar: 'J', action: 'Login', category: 'auth', details: 'Successful login from Safari on macOS', ipAddress: '192.168.1.103' },
  { id: '9', timestamp: '2026-01-31 18:00:00', userId: '2', userName: 'Sarah Miller', userAvatar: 'S', action: 'Logout', category: 'auth', details: 'User logged out', ipAddress: '192.168.1.101' },
  { id: '10', timestamp: '2026-01-31 17:45:00', userId: '1', userName: 'Alex Johnson', userAvatar: 'A', action: 'Time Log Edited', category: 'time', details: 'Modified time log for John Smith: adjusted hours from 8.0 to 7.5', ipAddress: '192.168.1.100' },
];

export default function AuditLogs() {
  const [logs] = useState<AuditLog[]>(DUMMY_LOGS);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const { toast } = useToast();

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase()) ||
                          log.userName.toLowerCase().includes(search.toLowerCase()) ||
                          log.details.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || log.category === filterCategory;
    const matchesDate = !filterDate || log.timestamp.startsWith(filterDate);
    return matchesSearch && matchesCategory && matchesDate;
  });

  const handleClearFilters = () => {
    setSearch('');
    setFilterCategory('all');
    setFilterDate('');
  };

  const handleExportLogs = () => {
    const headers = 'Timestamp,User,Action,Category,Details,IP Address\n';
    const rows = filteredLogs.map(log => 
      `"${log.timestamp}","${log.userName}","${log.action}","${log.category}","${log.details}","${log.ipAddress}"`
    ).join('\n');
    
    const content = headers + rows;
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Logs Exported",
      description: `${filteredLogs.length} audit log entries have been exported.`,
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth': return <LogIn className="w-4 h-4" />;
      case 'time': return <Clock className="w-4 h-4" />;
      case 'user': return <UserCheck className="w-4 h-4" />;
      case 'project': return <ClipboardList className="w-4 h-4" />;
      case 'settings': return <Settings className="w-4 h-4" />;
      case 'timeoff': return <Clock className="w-4 h-4" />;
      default: return <ClipboardList className="w-4 h-4" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'auth': return <Badge variant="outline" className="capitalize">Auth</Badge>;
      case 'time': return <Badge className="bg-primary capitalize">Time</Badge>;
      case 'user': return <Badge className="bg-success text-white capitalize">User</Badge>;
      case 'project': return <Badge className="bg-accent text-white capitalize">Project</Badge>;
      case 'settings': return <Badge variant="secondary" className="capitalize">Settings</Badge>;
      case 'timeoff': return <Badge className="bg-warning text-white capitalize">Time Off</Badge>;
      default: return <Badge variant="secondary" className="capitalize">{category}</Badge>;
    }
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Audit Logs" 
        description="Track all system activities and changes"
      >
        <Button variant="outline" onClick={handleExportLogs}>
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Total Logs</div>
            <div className="text-2xl font-bold">{logs.length}</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Auth Events</div>
            <div className="text-2xl font-bold">{logs.filter(l => l.category === 'auth').length}</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Time Events</div>
            <div className="text-2xl font-bold">{logs.filter(l => l.category === 'time').length}</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">User Events</div>
            <div className="text-2xl font-bold">{logs.filter(l => l.category === 'user').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-modern mb-6">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="auth">Auth</SelectItem>
                <SelectItem value="time">Time</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
                <SelectItem value="timeoff">Time Off</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-[160px]"
            />
            <Button variant="outline" onClick={handleClearFilters}>
              <Filter className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            Activity Log ({filteredLogs.length} entries)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs">{log.userAvatar}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{log.userName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(log.category)}
                      <span>{log.action}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryBadge(log.category)}</TableCell>
                  <TableCell className="max-w-[250px] truncate text-muted-foreground">
                    {log.details}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {log.ipAddress}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
