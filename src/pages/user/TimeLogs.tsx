import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout, PageHeader } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, Clock, FileText, Download, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface TimeLog {
  id: string;
  date: string;
  hours: number;
  description: string;
  project: string;
  billable: boolean;
  startTime: string;
  endTime: string;
}

// Dummy data for time logs
const DUMMY_LOGS: TimeLog[] = [
  { id: '1', date: '2026-02-01', hours: 8.5, description: 'Working on frontend components for the new dashboard', project: 'Website Redesign', billable: true, startTime: '09:00', endTime: '17:30' },
  { id: '2', date: '2026-01-31', hours: 7.0, description: 'Bug fixes and testing for login functionality', project: 'Mobile App', billable: true, startTime: '10:00', endTime: '17:00' },
  { id: '3', date: '2026-01-30', hours: 8.0, description: 'Team meeting and code review session', project: 'Internal Tools', billable: false, startTime: '09:00', endTime: '17:00' },
  { id: '4', date: '2026-01-29', hours: 6.5, description: 'API integration work with third-party services', project: 'Website Redesign', billable: true, startTime: '09:30', endTime: '16:00' },
  { id: '5', date: '2026-01-28', hours: 8.0, description: 'Documentation and training materials preparation', project: 'Internal Tools', billable: false, startTime: '09:00', endTime: '17:00' },
  { id: '6', date: '2026-01-27', hours: 7.5, description: 'Feature development for user authentication', project: 'Mobile App', billable: true, startTime: '09:00', endTime: '16:30' },
  { id: '7', date: '2026-01-24', hours: 8.0, description: 'Sprint planning and backlog grooming', project: 'Website Redesign', billable: false, startTime: '09:00', endTime: '17:00' },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function TimeLogs() {
  const [currentMonth, setCurrentMonth] = useState(1); // February (0-indexed)
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedLog, setSelectedLog] = useState<TimeLog | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();

  // Generate calendar data for current month
  const generateCalendarData = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days: { date: number; hours: number; log?: TimeLog }[] = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const log = DUMMY_LOGS.find(l => l.date === dateStr);
      days.push({ date: i, hours: log?.hours || 0, log });
    }
    return days;
  };

  const calendarDays = generateCalendarData();
  
  const filteredLogs = DUMMY_LOGS.filter(log => {
    const logDate = new Date(log.date);
    return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
  });

  const totalHours = filteredLogs.reduce((sum, log) => sum + log.hours, 0);
  const avgHours = filteredLogs.length > 0 ? totalHours / filteredLogs.length : 0;
  const workingDays = filteredLogs.length;

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDayClick = (day: { date: number; hours: number; log?: TimeLog }) => {
    if (day.log) {
      setSelectedLog(day.log);
      setIsDetailDialogOpen(true);
    }
  };

  const handleRowClick = (log: TimeLog) => {
    setSelectedLog(log);
    setIsDetailDialogOpen(true);
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Date', 'Description', 'Project', 'Hours', 'Type', 'Start Time', 'End Time'];
    const rows = filteredLogs.map(log => [
      log.date,
      `"${log.description}"`,
      log.project,
      log.hours.toString(),
      log.billable ? 'Billable' : 'Non-billable',
      log.startTime,
      log.endTime
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-logs-${MONTHS[currentMonth]}-${currentYear}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export Successful",
      description: `Time logs for ${MONTHS[currentMonth]} ${currentYear} have been downloaded.`,
    });
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Time Logs" 
        description="View and manage your time entries"
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
            <div className="text-sm text-muted-foreground">Total Hours</div>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Avg Hours/Day</div>
            <div className="text-2xl font-bold">{avgHours.toFixed(1)}h</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Working Days</div>
            <div className="text-2xl font-bold">{workingDays}</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Total Sessions</div>
            <div className="text-2xl font-bold">{filteredLogs.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <Card className="card-modern lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {MONTHS[currentMonth]} {currentYear}
            </CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-muted-foreground font-medium py-1">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for first day offset */}
              {Array.from({ length: new Date(currentYear, currentMonth, 1).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {calendarDays.map((day) => (
                <motion.div
                  key={day.date}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-colors ${
                    day.hours > 0 
                      ? 'bg-primary/20 hover:bg-primary/30 text-primary-foreground cursor-pointer' 
                      : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <span className="font-medium">{day.date}</span>
                  {day.hours > 0 && (
                    <span className="text-[10px] text-primary">{day.hours}h</span>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time Logs Table */}
        <Card className="card-modern lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Time Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No time entries for {MONTHS[currentMonth]} {currentYear}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow 
                      key={log.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRowClick(log)}
                    >
                      <TableCell className="font-medium">{log.date}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{log.description}</TableCell>
                      <TableCell>{log.project}</TableCell>
                      <TableCell className="text-right">{log.hours}h</TableCell>
                      <TableCell>
                        <Badge variant={log.billable ? 'default' : 'secondary'}>
                          {log.billable ? 'Billable' : 'Non-billable'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Time Entry Details
            </DialogTitle>
            <DialogDescription>
              {selectedLog?.date}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Start Time</p>
                  <p className="font-medium">{selectedLog.startTime}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">End Time</p>
                  <p className="font-medium">{selectedLog.endTime}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{selectedLog.hours} hours</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Project</p>
                <p className="font-medium">{selectedLog.project}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{selectedLog.description}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Type</p>
                <Badge variant={selectedLog.billable ? 'default' : 'secondary'}>
                  {selectedLog.billable ? 'Billable' : 'Non-billable'}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
