import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout, PageHeader } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  CalendarOff, 
  CheckCircle, 
  XCircle, 
  Clock,
  Calendar,
  AlertCircle,
  Settings,
  Plus,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';

interface TimeOffRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  type: 'vacation' | 'sick' | 'personal' | 'other';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

const DUMMY_REQUESTS: TimeOffRequest[] = [
  { id: '1', userId: '2', userName: 'Sarah Miller', userAvatar: 'S', type: 'vacation', startDate: '2026-03-01', endDate: '2026-03-05', days: 5, reason: 'Family vacation to Hawaii', status: 'pending', submittedAt: '2026-01-28' },
  { id: '2', userId: '3', userName: 'John Smith', userAvatar: 'J', type: 'sick', startDate: '2026-02-10', endDate: '2026-02-11', days: 2, reason: 'Doctor appointment and recovery', status: 'pending', submittedAt: '2026-02-01' },
  { id: '3', userId: '6', userName: 'Jessica Taylor', userAvatar: 'J', type: 'personal', startDate: '2026-02-14', endDate: '2026-02-14', days: 1, reason: 'Personal errands', status: 'approved', submittedAt: '2026-01-20' },
  { id: '4', userId: '2', userName: 'Sarah Miller', userAvatar: 'S', type: 'vacation', startDate: '2026-01-02', endDate: '2026-01-03', days: 2, reason: 'New Year extended holiday', status: 'approved', submittedAt: '2025-12-20' },
  { id: '5', userId: '3', userName: 'John Smith', userAvatar: 'J', type: 'vacation', startDate: '2025-12-24', endDate: '2025-12-26', days: 3, reason: 'Christmas holiday', status: 'approved', submittedAt: '2025-12-01' },
];

interface Holiday {
  id: string;
  date: string;
  name: string;
}

const INITIAL_HOLIDAYS: Holiday[] = [
  { id: '1', date: '2026-01-01', name: "New Year's Day" },
  { id: '2', date: '2026-01-20', name: 'Martin Luther King Jr. Day' },
  { id: '3', date: '2026-02-17', name: "Presidents' Day" },
  { id: '4', date: '2026-05-25', name: 'Memorial Day' },
  { id: '5', date: '2026-07-04', name: 'Independence Day' },
  { id: '6', date: '2026-12-25', name: 'Christmas Day' },
];

export default function TimeOffManagement() {
  const [requests, setRequests] = useState<TimeOffRequest[]>(DUMMY_REQUESTS);
  const [holidays, setHolidays] = useState<Holiday[]>(INITIAL_HOLIDAYS);
  const [selectedRequest, setSelectedRequest] = useState<TimeOffRequest | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isPTOSettingsOpen, setIsPTOSettingsOpen] = useState(false);
  const [isAddHolidayOpen, setIsAddHolidayOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [newHoliday, setNewHoliday] = useState({ name: '', date: '' });
  const [ptoSettings, setPtoSettings] = useState({
    annualDays: '20',
    carryOver: '5',
    sickDays: '10',
  });
  const { toast } = useToast();

  const pendingRequests = requests.filter(r => r.status === 'pending');

  const handleApprove = (request: TimeOffRequest) => {
    setRequests(requests.map(r => 
      r.id === request.id ? { ...r, status: 'approved' as const } : r
    ));
    toast({
      title: "Request Approved",
      description: `${request.userName}'s time off request has been approved.`,
    });
  };

  const handleRejectClick = (request: TimeOffRequest) => {
    setSelectedRequest(request);
    setIsRejectDialogOpen(true);
  };

  const handleConfirmReject = () => {
    if (selectedRequest) {
      setRequests(requests.map(r => 
        r.id === selectedRequest.id ? { ...r, status: 'rejected' as const } : r
      ));
      toast({
        title: "Request Rejected",
        description: `${selectedRequest.userName}'s time off request has been rejected.`,
        variant: "destructive",
      });
      setIsRejectDialogOpen(false);
      setSelectedRequest(null);
      setRejectReason('');
    }
  };

  const handleAddHoliday = () => {
    if (newHoliday.name.trim() && newHoliday.date) {
      const holiday: Holiday = {
        id: Date.now().toString(),
        name: newHoliday.name,
        date: newHoliday.date,
      };
      setHolidays([...holidays, holiday].sort((a, b) => a.date.localeCompare(b.date)));
      setNewHoliday({ name: '', date: '' });
      setIsAddHolidayOpen(false);
      toast({
        title: "Holiday Added",
        description: `${holiday.name} has been added to the calendar.`,
      });
    }
  };

  const handleDeleteHoliday = (id: string) => {
    const holiday = holidays.find(h => h.id === id);
    setHolidays(holidays.filter(h => h.id !== id));
    toast({
      title: "Holiday Removed",
      description: `${holiday?.name} has been removed.`,
    });
  };

  const handleSavePTOSettings = () => {
    toast({
      title: "PTO Settings Updated",
      description: "Time off policy has been updated successfully.",
    });
    setIsPTOSettingsOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return <Badge className="bg-success text-white">Approved</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      case 'pending': return <Badge className="bg-warning text-white">Pending</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'vacation': return <Badge variant="outline" className="border-primary text-primary">Vacation</Badge>;
      case 'sick': return <Badge variant="outline" className="border-destructive text-destructive">Sick</Badge>;
      case 'personal': return <Badge variant="outline">Personal</Badge>;
      default: return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Time Off Management" 
        description="Manage employee time off requests and company holidays"
      >
        <Button variant="outline" onClick={() => setIsPTOSettingsOpen(true)}>
          <Settings className="w-4 h-4 mr-2" />
          PTO Settings
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning" />
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <div className="text-2xl font-bold mt-1">{pendingRequests.length}</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-sm text-muted-foreground">Approved</span>
            </div>
            <div className="text-2xl font-bold mt-1">{requests.filter(r => r.status === 'approved').length}</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-muted-foreground">Rejected</span>
            </div>
            <div className="text-2xl font-bold mt-1">{requests.filter(r => r.status === 'rejected').length}</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Company Holidays</span>
            </div>
            <div className="text-2xl font-bold mt-1">{holidays.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card className="card-modern mb-6 border-warning/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertCircle className="w-5 h-5" />
              Pending Requests ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-warning/5 border border-warning/20"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-warning/20 text-warning">
                        {request.userAvatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{request.userName}</p>
                        {getTypeBadge(request.type)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {request.startDate} → {request.endDate} ({request.days} days)
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{request.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleApprove(request)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleRejectClick(request)}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* All Requests */}
        <Card className="card-modern lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarOff className="w-5 h-5 text-primary" />
              All Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-xs">{request.userAvatar}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{request.userName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(request.type)}</TableCell>
                    <TableCell className="text-sm">
                      {request.startDate} → {request.endDate}
                    </TableCell>
                    <TableCell>{request.days}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Company Holidays */}
        <Card className="card-modern">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Company Holidays
            </CardTitle>
            <Button size="sm" onClick={() => setIsAddHolidayOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {holidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <div>
                      <p className="font-medium text-sm">{holiday.name}</p>
                      <p className="text-xs text-muted-foreground">{holiday.date}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteHoliday(holiday.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting {selectedRequest?.userName}'s request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              placeholder="Enter reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmReject}>
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Holiday Dialog */}
      <Dialog open={isAddHolidayOpen} onOpenChange={setIsAddHolidayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Company Holiday</DialogTitle>
            <DialogDescription>
              Add a new holiday to the company calendar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="holidayName">Holiday Name</Label>
              <Input
                id="holidayName"
                placeholder="e.g., Independence Day"
                value={newHoliday.name}
                onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="holidayDate">Date</Label>
              <Input
                id="holidayDate"
                type="date"
                value={newHoliday.date}
                onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddHolidayOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddHoliday}>
              Add Holiday
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PTO Settings Dialog */}
      <Dialog open={isPTOSettingsOpen} onOpenChange={setIsPTOSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>PTO Settings</DialogTitle>
            <DialogDescription>
              Configure paid time off and leave policies
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="annualDays">Annual PTO Days</Label>
              <Input
                id="annualDays"
                type="number"
                value={ptoSettings.annualDays}
                onChange={(e) => setPtoSettings({ ...ptoSettings, annualDays: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carryOver">Max Carry Over Days</Label>
              <Input
                id="carryOver"
                type="number"
                value={ptoSettings.carryOver}
                onChange={(e) => setPtoSettings({ ...ptoSettings, carryOver: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sickDays">Annual Sick Days</Label>
              <Input
                id="sickDays"
                type="number"
                value={ptoSettings.sickDays}
                onChange={(e) => setPtoSettings({ ...ptoSettings, sickDays: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPTOSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePTOSettings}>
              Save PTO Policy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
