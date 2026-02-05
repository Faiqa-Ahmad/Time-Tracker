'use client';

import { motion } from 'framer-motion';
import { AppLayout, PageHeader } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/StatCard';
import { TimeTracker } from '@/components/TimeTracker';
import { useAuth } from '@/contexts/AuthContext';
import { useTimeTracking } from '@/contexts/TimeTrackingContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Clock, 
  Calendar, 
  CalendarCheck,
  DollarSign,
  ArrowRight,
  FileText,
  TrendingUp,
  Building2,
  AlertCircle,
  MessageSquare,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Mock tickets data
interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: Date;
  response?: string;
}

const MOCK_TICKETS: Ticket[] = [
  { 
    id: '1', 
    subject: 'Time tracking button not working', 
    description: 'The start timer button is not responding when clicked',
    status: 'in_progress',
    createdAt: new Date('2026-02-02'),
    response: 'We are investigating this issue. Will update soon.'
  },
  { 
    id: '2', 
    subject: 'Cannot download reports', 
    description: 'Getting error when trying to download my monthly report',
    status: 'resolved',
    createdAt: new Date('2026-02-01'),
    response: 'Issue has been fixed. Please try again.'
  },
];

export default function UserDashboard() {
  const { user } = useAuth();
  const { getTodayHours, getWeekHours, sessions, currentSession } = useTimeTracking();
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();

  const todayHours = getTodayHours().toFixed(1);
  const weekHours = getWeekHours().toFixed(1);
  const ptoBalance = currentOrganization?.settings.defaultPtoDays || 15;
  const nextPayDate = 'Feb 28, 2026'; // Mock data

  // Ticket states
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', description: '' });

  const handleCreateTicket = () => {
    if (!newTicket.subject.trim() || !newTicket.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    const ticket: Ticket = {
      id: Date.now().toString(),
      subject: newTicket.subject,
      description: newTicket.description,
      status: 'open',
      createdAt: new Date(),
    };

    setTickets([ticket, ...tickets]);
    setNewTicket({ subject: '', description: '' });
    setIsTicketDialogOpen(false);
    
    toast({
      title: 'Ticket Created',
      description: 'Your ticket has been sent to your organization admin.',
    });
  };

  return (
    <AppLayout>
      <PageHeader 
        title={`Welcome back, ${user?.name?.split(' ')[0]}!`}
        description={`Here's your work overview at ${currentOrganization?.name || 'your organization'}`}
      >
        <Badge variant="outline" className="gap-1.5">
          <Building2 className="w-3.5 h-3.5" />
          {currentOrganization?.name}
        </Badge>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Hours Today"
          value={`${todayHours}h`}
          subtitle="Keep up the great work!"
          icon={Clock}
          variant="accent"
          delay={0}
        />
        <StatCard
          title="Hours This Week"
          value={`${weekHours}h`}
          trend={{ value: 12, isPositive: true }}
          icon={TrendingUp}
          delay={0.1}
        />
        <StatCard
          title="PTO Balance"
          value={`${ptoBalance} days`}
          subtitle="Vacation, sick leave"
          icon={CalendarCheck}
          variant="success"
          delay={0.2}
        />
        <StatCard
          title="Next Payday"
          value={nextPayDate}
          icon={DollarSign}
          delay={0.3}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time Tracker - Prominent placement */}
        <div className="lg:col-span-2">
          <TimeTracker />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/time-tracking">
                <Button variant="outline" className="w-full justify-between group">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    View Time Logs
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/time-off">
                <Button variant="outline" className="w-full justify-between group">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Request Time Off
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/reports">
                <Button variant="outline" className="w-full justify-between group">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Download Reports
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Today's Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                Today's Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 && !currentSession ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No activity recorded yet today.</p>
                  <p className="text-sm">Clock in to start tracking your work!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentSession && (
                    <div className="flex items-start gap-4 p-3 rounded-lg bg-success/5 border border-success/20">
                      <div className="w-2 h-2 mt-2 rounded-full bg-success animate-pulse" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">Currently Working</p>
                        <p className="text-sm text-muted-foreground truncate">{currentSession.description}</p>
                        {currentSession.projectName && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Project: {currentSession.projectName}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-success font-medium">In Progress</span>
                    </div>
                  )}
                  {sessions.slice(0, 3).map((session) => (
                    <div key={session.id} className="flex items-start gap-4 p-3 rounded-lg bg-muted/30">
                      <div className="w-2 h-2 mt-2 rounded-full bg-muted-foreground/30" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{session.description}</p>
                        {session.projectName && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Project: {session.projectName}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {session.endTime && (
                          `${Math.round((session.endTime.getTime() - session.startTime.getTime()) / 60000)} min`
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Support Tickets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                Support Tickets
              </CardTitle>
              <Button 
                size="sm" 
                onClick={() => setIsTicketDialogOpen(true)}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                New Ticket
              </Button>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No support tickets yet.</p>
                  <p className="text-sm">Report any issues to your admin.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {tickets.map((ticket) => (
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
                          <p className="text-xs font-medium text-primary mb-1">Admin Response:</p>
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
        </motion.div>
      </div>

      {/* Create Ticket Dialog */}
      <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
            <DialogDescription>
              Report any issues or problems to your organization admin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-border rounded-md"
                placeholder="Brief description of the issue"
                value={newTicket.subject}
                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Detailed description of the issue (button not working, page not loading, etc.)"
                className="min-h-[120px]"
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
              />
            </div>
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                This ticket will be sent to your organization admin for review.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTicketDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTicket}>
              <Send className="w-4 h-4 mr-2" />
              Submit Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
