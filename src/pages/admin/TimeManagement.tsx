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
  Clock, 
  Search, 
  Download,
  Filter,
  CheckCircle,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';

interface TimeLog {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  date: string;
  hours: number;
  description: string;
  project: string;
  billable: boolean;
  status: 'approved' | 'pending' | 'flagged';
}

const DUMMY_TIME_LOGS: TimeLog[] = [
  { id: '1', userId: '2', userName: 'Sarah Miller', userAvatar: 'S', date: '2026-02-01', hours: 8.5, description: 'Frontend development for new features', project: 'Website Redesign', billable: true, status: 'approved' },
  { id: '2', userId: '3', userName: 'John Smith', userAvatar: 'J', date: '2026-02-01', hours: 7.0, description: 'UI/UX design mockups', project: 'Mobile App', billable: true, status: 'pending' },
  { id: '3', userId: '6', userName: 'Jessica Taylor', userAvatar: 'J', date: '2026-02-01', hours: 6.5, description: 'Client calls and demos', project: 'Sales', billable: false, status: 'approved' },
  { id: '4', userId: '2', userName: 'Sarah Miller', userAvatar: 'S', date: '2026-01-31', hours: 8.0, description: 'Bug fixes and testing', project: 'Website Redesign', billable: true, status: 'approved' },
  { id: '5', userId: '3', userName: 'John Smith', userAvatar: 'J', date: '2026-01-31', hours: 9.5, description: 'Overtime on critical deadline', project: 'Mobile App', billable: true, status: 'flagged' },
  { id: '6', userId: '6', userName: 'Jessica Taylor', userAvatar: 'J', date: '2026-01-31', hours: 7.5, description: 'Marketing meeting and strategy', project: 'Internal', billable: false, status: 'approved' },
  { id: '7', userId: '2', userName: 'Sarah Miller', userAvatar: 'S', date: '2026-01-30', hours: 8.0, description: 'API integration work', project: 'Website Redesign', billable: true, status: 'approved' },
  { id: '8', userId: '3', userName: 'John Smith', userAvatar: 'J', date: '2026-01-30', hours: 7.0, description: 'Design review session', project: 'Mobile App', billable: false, status: 'approved' },
];

export default function TimeManagement() {
  const { currentOrganization } = useOrganization();
  const [logs, setLogs] = useState<TimeLog[]>(DUMMY_TIME_LOGS);
  const [search, setSearch] = useState('');
  const [filterUser, setFilterUser] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const { toast } = useToast();

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.description.toLowerCase().includes(search.toLowerCase()) ||
                          log.userName.toLowerCase().includes(search.toLowerCase());
    const matchesUser = filterUser === 'all' || log.userId === filterUser;
    const matchesDate = !filterDate || log.date === filterDate;
    return matchesSearch && matchesUser && matchesDate;
  });

  const totalHours = filteredLogs.reduce((sum, log) => sum + log.hours, 0);
  const billableHours = filteredLogs.filter(l => l.billable).reduce((sum, log) => sum + log.hours, 0);

  const handleApprove = (log: TimeLog) => {
    setLogs(logs.map(l => 
      l.id === log.id ? { ...l, status: 'approved' as const } : l
    ));
    toast({
      title: "Time Log Approved",
      description: `${log.userName}'s time log has been approved.`,
    });
  };

  const handleFlag = (log: TimeLog) => {
    setLogs(logs.map(l => 
      l.id === log.id ? { ...l, status: 'flagged' as const } : l
    ));
    toast({
      title: "Time Log Flagged",
      description: `${log.userName}'s time log has been flagged for review.`,
      variant: "destructive",
    });
  };

  const handleExport = () => {
    const headers = ['Employee', 'Date', 'Description', 'Project', 'Hours', 'Type', 'Status'];
    const rows = filteredLogs.map(log => [
      log.userName,
      log.date,
      `"${log.description}"`,
      log.project,
      log.hours.toString(),
      log.billable ? 'Billable' : 'Non-billable',
      log.status
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-logs-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export Successful",
      description: "Time logs have been exported to CSV.",
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setFilterUser('all');
    setFilterDate('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-success text-white">Approved</Badge>;
      case 'pending': return <Badge variant="secondary">Pending</Badge>;
      case 'flagged': return <Badge className="bg-warning text-white">Flagged</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const uniqueUsers = Array.from(new Map(logs.map(l => [l.userId, { id: l.userId, name: l.userName }])).values());

  return (
    <AppLayout>
      <PageHeader 
        title={`Time Management - ${currentOrganization?.name || 'Organization'}`}
        description={`View and manage employee time logs for ${currentOrganization?.name || 'your organization'}`}
      >
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Total Logs</div>
            <div className="text-2xl font-bold">{filteredLogs.length}</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Total Hours</div>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Billable Hours</div>
            <div className="text-2xl font-bold text-success">{billableHours.toFixed(1)}h</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Pending Review</div>
            <div className="text-2xl font-bold text-warning">{logs.filter(l => l.status === 'pending').length}</div>
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
                placeholder="Search by description or user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterUser} onValueChange={setFilterUser}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {uniqueUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-[180px]"
            />
            <Button variant="outline" onClick={handleClearFilters}>
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Time Logs Table */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            All Time Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Project</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs">{log.userAvatar}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{log.userName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{log.date}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{log.description}</TableCell>
                  <TableCell>{log.project}</TableCell>
                  <TableCell className="text-right font-medium">{log.hours}h</TableCell>
                  <TableCell>
                    <Badge variant={log.billable ? 'default' : 'secondary'}>
                      {log.billable ? 'Billable' : 'Non-billable'}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {log.status !== 'approved' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-success hover:text-success hover:bg-success/10"
                          onClick={() => handleApprove(log)}
                          title="Approve time log"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      {log.status !== 'flagged' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-warning hover:text-warning hover:bg-warning/10"
                          onClick={() => handleFlag(log)}
                          title="Flag for review"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
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
