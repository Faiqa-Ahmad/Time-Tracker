import { motion } from 'framer-motion';
import { AppLayout, PageHeader } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Clock, 
  AlertCircle,
  CheckCircle,
  ArrowRight,
  UserPlus,
  Activity,
  TrendingUp,
  Building2,
  MessageSquare,
  Send,
  ArrowUpCircle,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Mock data
const MOCK_USERS = [
  { id: '1', name: 'Alex Johnson', email: 'admin@roburna.com', role: 'Admin', status: 'online', department: 'Management' },
  { id: '2', name: 'Sarah Miller', email: 'sarah@roburna.com', role: 'Employee', status: 'online', department: 'Engineering' },
  { id: '3', name: 'Mike Chen', email: 'mike@roburna.com', role: 'Employee', status: 'offline', department: 'Design' },
];

const MOCK_PENDING = [
  { id: '4', name: 'Emma Wilson', email: 'emma@email.com', appliedDate: '2026-01-28' },
];

const MOCK_RECENT_ACTIVITY = [
  { id: '1', type: 'clock_in', user: 'Sarah Miller', time: '5 mins ago', description: 'Clocked in - Working on API integration' },
  { id: '2', type: 'time_off', user: 'Mike Chen', time: '1 hour ago', description: 'Requested 3 days off (Feb 15-17)' },
  { id: '3', type: 'clock_out', user: 'John Doe', time: '2 hours ago', description: 'Clocked out - Completed client meeting' },
];

// Support Tickets
interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: Date;
  from: string; // employee name or 'admin'
  fromEmail: string;
  response?: string;
  escalated?: boolean;
}

const MOCK_EMPLOYEE_TICKETS: Ticket[] = [
  { 
    id: '1', 
    subject: 'Time tracking button not working', 
    description: 'The start timer button is not responding when clicked',
    status: 'open',
    createdAt: new Date('2026-02-03'),
    from: 'Sarah Miller',
    fromEmail: 'sarah@roburna.com',
  },
  { 
    id: '2', 
    subject: 'Cannot download reports', 
    description: 'Getting error when trying to download my monthly report',
    status: 'resolved',
    createdAt: new Date('2026-02-01'),
    from: 'Mike Chen',
    fromEmail: 'mike@roburna.com',
    response: 'Fixed the issue. Please try again.',
  },
];

const MOCK_ADMIN_TICKETS: Ticket[] = [
  { 
    id: '3', 
    subject: 'Need more user licenses', 
    description: 'We need to upgrade our plan to add 20 more users',
    status: 'in_progress',
    createdAt: new Date('2026-02-02'),
    from: 'admin',
    fromEmail: 'admin@roburna.com',
    response: 'Super Admin is reviewing your request.',
  },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { currentOrganization, members } = useOrganization();
  const { toast } = useToast();

  // All data is filtered by currentOrganization - admins can ONLY see their own org data
  const totalUsers = currentOrganization?.memberCount || MOCK_USERS.length;
  const onlineUsers = MOCK_USERS.filter(u => u.status === 'online').length;
  const pendingApprovals = MOCK_PENDING.length;
  const hoursToday = 24.5; // Mock data - in real app, filtered by organization ID

  // Ticket states
  const [employeeTickets, setEmployeeTickets] = useState<Ticket[]>(MOCK_EMPLOYEE_TICKETS);
  const [adminTickets, setAdminTickets] = useState<Ticket[]>(MOCK_ADMIN_TICKETS);
  const [isEmployeeTicketDialogOpen, setIsEmployeeTicketDialogOpen] = useState(false);
  const [isAdminTicketDialogOpen, setIsAdminTicketDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketResponse, setTicketResponse] = useState('');
  const [newAdminTicket, setNewAdminTicket] = useState({ subject: '', description: '' });

  const handleRespondToTicket = () => {
    if (!selectedTicket || !ticketResponse.trim()) return;

    setEmployeeTickets(employeeTickets.map(t => 
      t.id === selectedTicket.id 
        ? { ...t, status: 'resolved' as const, response: ticketResponse }
        : t
    ));
    
    setIsEmployeeTicketDialogOpen(false);
    setSelectedTicket(null);
    setTicketResponse('');
    
    toast({
      title: 'Response Sent',
      description: `Response sent to ${selectedTicket.from}`,
    });
  };

  const handleEscalateTicket = (ticket: Ticket) => {
    setEmployeeTickets(employeeTickets.map(t => 
      t.id === ticket.id 
        ? { ...t, escalated: true, status: 'in_progress' as const }
        : t
    ));
    
    toast({
      title: 'Ticket Escalated',
      description: 'Ticket has been forwarded to Super Admin',
    });
  };

  const handleCreateAdminTicket = () => {
    if (!newAdminTicket.subject.trim() || !newAdminTicket.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    const ticket: Ticket = {
      id: Date.now().toString(),
      subject: newAdminTicket.subject,
      description: newAdminTicket.description,
      status: 'open',
      createdAt: new Date(),
      from: 'admin',
      fromEmail: user?.email || '',
    };

    setAdminTickets([ticket, ...adminTickets]);
    setNewAdminTicket({ subject: '', description: '' });
    setIsAdminTicketDialogOpen(false);
    
    toast({
      title: 'Ticket Created',
      description: 'Your ticket has been sent to Super Admin.',
    });
  };

  return (
    <AppLayout>
      <PageHeader 
        title={`${currentOrganization?.name || 'Organization'} Dashboard`}
        description={`Manage your team and track activity for ${currentOrganization?.name || 'your organization'}`}
      >
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            {currentOrganization?.plan || 'Free'} Plan
          </Badge>
          <Link to="/admin/users">
            <Button className="gap-2 bg-accent hover:bg-accent/90">
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          </Link>
        </div>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Users"
          value={totalUsers}
          subtitle={`${MOCK_PENDING.length} pending approval`}
          icon={Users}
          delay={0}
        />
        <StatCard
          title="Online Now"
          value={onlineUsers}
          icon={Activity}
          variant="success"
          delay={0.1}
        />
        <StatCard
          title="Hours Logged Today"
          value={`${hoursToday}h`}
          trend={{ value: 8, isPositive: true }}
          icon={Clock}
          variant="accent"
          delay={0.2}
        />
        <StatCard
          title="Pending Items"
          value={pendingApprovals}
          subtitle="Requires your attention"
          icon={AlertCircle}
          variant="warning"
          delay={0.3}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-warning" />
                Pending Approvals
              </CardTitle>
              <Link to="/admin/users">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {MOCK_PENDING.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-10 h-10 mx-auto mb-3 text-success opacity-50" />
                  <p>All caught up! No pending approvals.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {MOCK_PENDING.map((pending) => (
                    <div 
                      key={pending.id} 
                      className="flex items-center justify-between p-4 rounded-lg bg-warning/5 border border-warning/20"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-warning/20 text-warning">
                            {pending.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{pending.name}</p>
                          <p className="text-sm text-muted-foreground">{pending.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-warning border-warning/30">
                          New Signup
                        </Badge>
                        <Link to="/admin/users">
                          <Button size="sm" variant="outline">Review</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/admin/users">
                <Button variant="outline" className="w-full justify-between group">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Manage Users
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/admin/time">
                <Button variant="outline" className="w-full justify-between group">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time Management
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/admin/reports">
                <Button variant="outline" className="w-full justify-between group">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    View Reports
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_RECENT_ACTIVITY.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  <div className={`w-2 h-2 mt-2 rounded-full ${
                    activity.type === 'clock_in' ? 'bg-success' : 
                    activity.type === 'clock_out' ? 'bg-muted-foreground' : 
                    'bg-warning'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium text-foreground">{activity.user}</span>
                      <span className="text-muted-foreground"> • {activity.description}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Support Tickets Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employee Tickets */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                Employee Tickets
              </CardTitle>
              <Badge variant="outline">
                {employeeTickets.filter(t => t.status === 'open').length} Open
              </Badge>
            </CardHeader>
            <CardContent>
              {employeeTickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-10 h-10 mx-auto mb-3 text-success opacity-50" />
                  <p>No employee tickets yet.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {employeeTickets.map((ticket) => (
                    <div 
                      key={ticket.id} 
                      className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{ticket.subject}</p>
                          <p className="text-xs text-muted-foreground">From: {ticket.from}</p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={
                            ticket.status === 'resolved' ? 'bg-success/10 text-success border-success/20' :
                            ticket.status === 'in_progress' ? 'bg-primary/10 text-primary border-primary/20' :
                            'bg-warning/10 text-warning border-warning/20'
                          }
                        >
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{ticket.description}</p>
                      {ticket.escalated && (
                        <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/20">
                          <ArrowUpCircle className="w-3 h-3 mr-1" />
                          Escalated to Super Admin
                        </Badge>
                      )}
                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setIsEmployeeTicketDialogOpen(true);
                          }}
                          disabled={ticket.status === 'resolved'}
                        >
                          Respond
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEscalateTicket(ticket)}
                          disabled={ticket.escalated || ticket.status === 'resolved'}
                        >
                          <ArrowUpCircle className="w-3 h-3 mr-1" />
                          Escalate
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Tickets to Super Admin */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Send className="w-5 h-5 text-muted-foreground" />
                My Tickets to Super Admin
              </CardTitle>
              <Button 
                size="sm" 
                onClick={() => setIsAdminTicketDialogOpen(true)}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                New Ticket
              </Button>
            </CardHeader>
            <CardContent>
              {adminTickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No tickets to Super Admin yet.</p>
                  <p className="text-sm">Report platform issues here.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {adminTickets.map((ticket) => (
                    <div 
                      key={ticket.id} 
                      className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-medium text-sm">{ticket.subject}</p>
                        <Badge 
                          variant="outline" 
                          className={
                            ticket.status === 'resolved' ? 'bg-success/10 text-success border-success/20' :
                            ticket.status === 'in_progress' ? 'bg-primary/10 text-primary border-primary/20' :
                            'bg-warning/10 text-warning border-warning/20'
                          }
                        >
                          {ticket.status === 'resolved' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{ticket.description}</p>
                      {ticket.response && (
                        <div className="mt-2 p-2 rounded bg-primary/5 border border-primary/10">
                          <p className="text-xs font-medium text-primary mb-1">Super Admin Response:</p>
                          <p className="text-xs text-muted-foreground">{ticket.response}</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {ticket.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Employee Ticket Response Dialog */}
      <Dialog open={isEmployeeTicketDialogOpen} onOpenChange={setIsEmployeeTicketDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Ticket</DialogTitle>
            <DialogDescription>
              {selectedTicket?.from} • {selectedTicket?.subject}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-1">Issue:</p>
              <p className="text-sm text-muted-foreground">{selectedTicket?.description}</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Your Response</label>
              <Textarea
                placeholder="Provide a solution or update to the employee..."
                className="min-h-[120px]"
                value={ticketResponse}
                onChange={(e) => setTicketResponse(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmployeeTicketDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRespondToTicket}>
              <Send className="w-4 h-4 mr-2" />
              Send Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Admin Ticket Dialog */}
      <Dialog open={isAdminTicketDialogOpen} onOpenChange={setIsAdminTicketDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Ticket to Super Admin</DialogTitle>
            <DialogDescription>
              Report platform issues, request features, or ask for support
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-border rounded-md"
                placeholder="Brief description of the issue"
                value={newAdminTicket.subject}
                onChange={(e) => setNewAdminTicket({ ...newAdminTicket, subject: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Detailed description (platform bugs, feature requests, billing issues, etc.)"
                className="min-h-[120px]"
                value={newAdminTicket.description}
                onChange={(e) => setNewAdminTicket({ ...newAdminTicket, description: e.target.value })}
              />
            </div>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                This ticket will be sent directly to the Super Admin (Platform Owner).
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdminTicketDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAdminTicket}>
              <Send className="w-4 h-4 mr-2" />
              Submit Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
