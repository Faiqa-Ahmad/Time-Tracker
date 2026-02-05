'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout, PageHeader } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { CalendarOff, Plus, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface TimeOffRequest {
  id: string;
  type: 'vacation' | 'sick' | 'personal' | 'other';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

const DUMMY_REQUESTS: TimeOffRequest[] = [
  {
    id: '1',
    type: 'vacation',
    startDate: '2026-03-01',
    endDate: '2026-03-05',
    days: 5,
    reason: 'Family vacation to the beach',
    status: 'approved',
    submittedAt: '2026-01-15',
  },
  {
    id: '2',
    type: 'sick',
    startDate: '2026-01-20',
    endDate: '2026-01-21',
    days: 2,
    reason: 'Not feeling well, need rest',
    status: 'approved',
    submittedAt: '2026-01-19',
  },
  {
    id: '3',
    type: 'personal',
    startDate: '2026-02-14',
    endDate: '2026-02-14',
    days: 1,
    reason: 'Personal appointment',
    status: 'pending',
    submittedAt: '2026-02-01',
  },
  {
    id: '4',
    type: 'vacation',
    startDate: '2026-04-10',
    endDate: '2026-04-15',
    days: 6,
    reason: 'Spring break trip',
    status: 'pending',
    submittedAt: '2026-02-01',
  },
];

export default function TimeOff() {
  const [requests, setRequests] = useState<TimeOffRequest[]>(DUMMY_REQUESTS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    type: 'vacation' as const,
    startDate: '',
    endDate: '',
    reason: '',
  });

  const ptoBalance = {
    total: 20,
    used: 8,
    pending: 7,
    remaining: 5,
  };

  const handleSubmitRequest = () => {
    if (newRequest.startDate && newRequest.endDate && newRequest.reason) {
      const start = new Date(newRequest.startDate);
      const end = new Date(newRequest.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      const request: TimeOffRequest = {
        id: Date.now().toString(),
        type: newRequest.type,
        startDate: newRequest.startDate,
        endDate: newRequest.endDate,
        days,
        reason: newRequest.reason,
        status: 'pending',
        submittedAt: new Date().toISOString().split('T')[0],
      };
      setRequests([request, ...requests]);
      setNewRequest({ type: 'vacation', startDate: '', endDate: '', reason: '' });
      setIsDialogOpen(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-destructive" />;
      case 'pending': return <AlertCircle className="w-4 h-4 text-warning" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Time Off" 
        description="Request and manage your time off"
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Request Time Off
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Time Off</DialogTitle>
              <DialogDescription>
                Submit a new time off request for approval.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={newRequest.type}
                  onValueChange={(value: any) => setNewRequest({ ...newRequest, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">Vacation</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newRequest.startDate}
                    onChange={(e) => setNewRequest({ ...newRequest, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newRequest.endDate}
                    onChange={(e) => setNewRequest({ ...newRequest, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Briefly explain your time off request"
                  value={newRequest.reason}
                  onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitRequest}>Submit Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* PTO Balance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total PTO</span>
            </div>
            <div className="text-2xl font-bold mt-1">{ptoBalance.total} days</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-sm text-muted-foreground">Used</span>
            </div>
            <div className="text-2xl font-bold mt-1">{ptoBalance.used} days</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning" />
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <div className="text-2xl font-bold mt-1">{ptoBalance.pending} days</div>
          </CardContent>
        </Card>
        <Card className="card-modern bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CalendarOff className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Remaining</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-primary">{ptoBalance.remaining} days</div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle>My Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="capitalize font-medium">{request.type}</TableCell>
                  <TableCell>
                    {request.startDate} → {request.endDate}
                  </TableCell>
                  <TableCell>{request.days}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{request.reason}</TableCell>
                  <TableCell>{request.submittedAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <Badge variant={getStatusBadge(request.status)} className="capitalize">
                        {request.status}
                      </Badge>
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
