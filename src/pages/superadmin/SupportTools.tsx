import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout, PageHeader } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  MessageSquare,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
  Send,
  Search,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: Date;
  organization: string;
  from: string;
  fromEmail: string;
  isEscalated: boolean;
  response?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const MOCK_TICKETS: SupportTicket[] = [
  { 
    id: '1', 
    subject: 'Need more user licenses', 
    description: 'We need to upgrade our plan to add 20 more users',
    status: 'open',
    createdAt: new Date('2026-02-02'),
    organization: 'Roburna Labs',
    from: 'Admin',
    fromEmail: 'admin@roburna.com',
    isEscalated: false,
    priority: 'high',
  },
  { 
    id: '2', 
    subject: 'Billing issue - double charged', 
    description: 'We were charged twice this month, need refund',
    status: 'in_progress',
    createdAt: new Date('2026-02-01'),
    organization: 'LiquidNFT',
    from: 'Admin',
    fromEmail: 'admin@liquidnft.com',
    isEscalated: false,
    response: 'Investigating the billing issue. Will resolve within 24 hours.',
    priority: 'urgent',
  },
  { 
    id: '3', 
    subject: 'Time tracking button not working', 
    description: 'Employee reported: The start timer button is not responding',
    status: 'open',
    createdAt: new Date('2026-02-03'),
    organization: 'Roburna Labs',
    from: 'Sarah Miller (via Admin)',
    fromEmail: 'sarah@roburna.com',
    isEscalated: true,
    priority: 'high',
  },
  { 
    id: '4', 
    subject: 'Unable to export reports', 
    description: 'Getting 500 error when trying to download monthly reports',
    status: 'resolved',
    createdAt: new Date('2026-01-28'),
    organization: 'Quantum Labs',
    from: 'Admin',
    fromEmail: 'admin@quantumlabs.io',
    isEscalated: false,
    response: 'Fixed the export issue. Reports are now downloadable.',
    priority: 'medium',
  },
];

export default function SupportTools() {
  const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_TICKETS);
  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [emailTemplateDialog, setEmailTemplateDialog] = useState(false);
  const [ticketResponse, setTicketResponse] = useState('');

  const filteredTickets = tickets.filter(ticket => 
    ticket.organization.toLowerCase().includes(search.toLowerCase()) ||
    ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
    ticket.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setTicketResponse(ticket.response || '');
    setDetailDialogOpen(true);
  };

  const handleUpdateStatus = (ticketId: string, newStatus: SupportTicket['status']) => {
    setTickets(tickets.map(t => 
      t.id === ticketId ? { ...t, status: newStatus } : t
    ));
    toast.success('Ticket status updated');
  };

  const handleSendResponse = () => {
    if (!selectedTicket || !ticketResponse.trim()) {
      toast.error('Please enter a response');
      return;
    }

    setTickets(tickets.map(t => 
      t.id === selectedTicket.id 
        ? { ...t, status: 'resolved' as const, response: ticketResponse }
        : t
    ));
    
    setDetailDialogOpen(false);
    setSelectedTicket(null);
    setTicketResponse('');
    
    toast.success('Response sent', {
      description: `Response sent to ${selectedTicket.organization}`,
    });
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'high': return 'bg-warning/10 text-warning border-warning/20';
      case 'medium': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-warning/10 text-warning border-warning/20';
      case 'in_progress': return 'bg-primary/10 text-primary border-primary/20';
      case 'resolved': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Support Tools"
        description="Customer support and system maintenance tools"
      />

      <Tabs defaultValue="tickets" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tickets" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Support Tickets
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="w-4 h-4" />
            Email Templates
          </TabsTrigger>
        </TabsList>

        {/* Support Tickets */}
        <TabsContent value="tickets">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Open Tickets</p>
                      <p className="text-2xl font-bold">{tickets.filter(t => t.status === 'open').length}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                      <p className="text-2xl font-bold">{tickets.filter(t => t.status === 'in_progress').length}</p>
                    </div>
                    <Clock className="w-8 h-8 text-warning" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Resolved</p>
                      <p className="text-2xl font-bold">{tickets.filter(t => t.status === 'resolved').length}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-success" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Response Time</p>
                      <p className="text-2xl font-bold">2.4h</p>
                    </div>
                    <Clock className="w-8 h-8 text-accent" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tickets by ID, organization, or subject..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tickets List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">All Tickets ({filteredTickets.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredTickets.map((ticket) => (
                    <div 
                      key={ticket.id}
                      className="p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{ticket.subject}</p>
                            <Badge variant="outline" className={getPriorityBadgeColor(ticket.priority)}>
                              {ticket.priority}
                            </Badge>
                            {ticket.isEscalated && (
                              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 text-xs">
                                Escalated
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {ticket.organization} • {ticket.from}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select 
                            value={ticket.status} 
                            onValueChange={(value) => handleUpdateStatus(ticket.id, value as SupportTicket['status'])}
                          >
                            <SelectTrigger className="w-[130px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewTicket(ticket)}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Respond
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
                      {ticket.response && (
                        <div className="mt-3 p-3 rounded bg-success/5 border border-success/20">
                          <p className="text-xs font-medium text-success mb-1">Your Response:</p>
                          <p className="text-xs text-muted-foreground">{ticket.response}</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {ticket.createdAt.toLocaleDateString()} • {ticket.fromEmail}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Email Templates */}
        <TabsContent value="email">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Email Templates</CardTitle>
                <CardDescription>
                  Manage automated email templates for common scenarios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Welcome Email</h4>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Sent when a new user signs up</p>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Password Reset</h4>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Sent when a user requests password reset</p>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Invoice Receipt</h4>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Sent when payment is received</p>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Subscription Expiring</h4>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Sent 7 days before subscription expires</p>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                </div>
                <Button className="gap-2">
                  <Mail className="w-4 h-4" />
                  Create New Template
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Ticket Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Respond to Ticket</DialogTitle>
            <DialogDescription>
              {selectedTicket?.organization} • {selectedTicket?.from}
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4 py-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium mb-1">Subject:</p>
                <p className="text-sm">{selectedTicket.subject}</p>
                <p className="text-sm font-medium mt-3 mb-1">Description:</p>
                <p className="text-sm text-muted-foreground">{selectedTicket.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Badge variant="outline" className={getStatusBadgeColor(selectedTicket.status)}>
                    {selectedTicket.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Badge variant="outline" className={getPriorityBadgeColor(selectedTicket.priority)}>
                    {selectedTicket.priority}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Your Response</Label>
                <Textarea 
                  placeholder="Provide a solution, update, or next steps..." 
                  className="min-h-[120px]"
                  value={ticketResponse}
                  onChange={(e) => setTicketResponse(e.target.value)}
                />
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-xs text-muted-foreground">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Response will be sent to {selectedTicket.organization}'s admin
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleSendResponse} className="gap-2">
              <Send className="w-4 h-4" />
              Send Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
