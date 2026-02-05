'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout, PageHeader } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileBarChart, Download, Calendar, Clock, TrendingUp, FileText } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

const WEEKLY_DATA = [
  { week: 'Week 1', hours: 42, projects: 3, billable: 35 },
  { week: 'Week 2', hours: 38, projects: 2, billable: 30 },
  { week: 'Week 3', hours: 45, projects: 4, billable: 40 },
  { week: 'Week 4', hours: 40, projects: 3, billable: 32 },
];

const MONTHLY_SUMMARY = {
  totalHours: 165,
  billableHours: 137,
  nonBillableHours: 28,
  projectsWorked: 5,
  avgHoursPerDay: 7.5,
  overtimeHours: 5,
};

interface Report {
  id: string;
  name: string;
  type: string;
  date: string;
  size: string;
}

const RECENT_REPORTS: Report[] = [
  { id: '1', name: 'January 2026 Timesheet', type: 'PDF', date: '2026-02-01', size: '245 KB' },
  { id: '2', name: 'Q4 2025 Summary', type: 'Excel', date: '2026-01-05', size: '512 KB' },
  { id: '3', name: 'December 2025 Timesheet', type: 'PDF', date: '2026-01-01', size: '198 KB' },
  { id: '4', name: 'November 2025 Timesheet', type: 'PDF', date: '2025-12-01', size: '210 KB' },
];

export default function Reports() {
  const [dateRange, setDateRange] = useState({ start: '2026-01-01', end: '2026-01-31' });
  const [reportFormat, setReportFormat] = useState('pdf');
  const { toast } = useToast();

  const handleGenerateReport = () => {
    // Simulate report generation
    const formatLabels: { [key: string]: string } = {
      pdf: 'PDF',
      csv: 'CSV',
      excel: 'Excel'
    };

    toast({
      title: "Report Generated",
      description: `Your ${formatLabels[reportFormat]} report for ${dateRange.start} to ${dateRange.end} is being downloaded.`,
    });

    // Create sample content based on format
    let content: string;
    let mimeType: string;
    let extension: string;

    if (reportFormat === 'csv') {
      content = 'Date,Description,Project,Hours,Type\n';
      content += '2026-01-15,Frontend Development,Website Redesign,8.0,Billable\n';
      content += '2026-01-16,Bug Fixes,Mobile App,6.5,Billable\n';
      content += '2026-01-17,Team Meeting,Internal,2.0,Non-billable\n';
      mimeType = 'text/csv';
      extension = 'csv';
    } else {
      // For PDF and Excel, we'll create a text file as a simulation
      content = `Time Report\n\nDate Range: ${dateRange.start} to ${dateRange.end}\n\nTotal Hours: ${MONTHLY_SUMMARY.totalHours}h\nBillable: ${MONTHLY_SUMMARY.billableHours}h\nNon-Billable: ${MONTHLY_SUMMARY.nonBillableHours}h\n`;
      mimeType = 'text/plain';
      extension = reportFormat === 'pdf' ? 'pdf' : 'xlsx';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-report-${dateRange.start}-to-${dateRange.end}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadReport = (report: Report) => {
    toast({
      title: "Downloading Report",
      description: `${report.name} is being downloaded.`,
    });

    // Simulate download
    const content = `${report.name}\n\nGenerated: ${report.date}\nFormat: ${report.type}\nSize: ${report.size}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.name.replace(/\s+/g, '-').toLowerCase()}.${report.type.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    toast({
      title: "Exporting All Reports",
      description: "All your reports are being compiled for download.",
    });

    // Create combined report
    const content = RECENT_REPORTS.map(r => `${r.name} (${r.date}) - ${r.size}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all-reports-summary.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <PageHeader 
        title="My Reports" 
        description="View and download your work reports"
      >
        <Button onClick={handleExportAll}>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </PageHeader>

      {/* Report Generator */}
      <Card className="card-modern mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="w-5 h-5 text-primary" />
            Generate Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={reportFormat} onValueChange={setReportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button className="w-full" onClick={handleGenerateReport}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Total Hours
            </div>
            <div className="text-2xl font-bold mt-1">{MONTHLY_SUMMARY.totalHours}h</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              Billable
            </div>
            <div className="text-2xl font-bold mt-1 text-success">{MONTHLY_SUMMARY.billableHours}h</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Non-Billable
            </div>
            <div className="text-2xl font-bold mt-1">{MONTHLY_SUMMARY.nonBillableHours}h</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Projects
            </div>
            <div className="text-2xl font-bold mt-1">{MONTHLY_SUMMARY.projectsWorked}</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Avg/Day
            </div>
            <div className="text-2xl font-bold mt-1">{MONTHLY_SUMMARY.avgHoursPerDay}h</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Overtime
            </div>
            <div className="text-2xl font-bold mt-1 text-warning">{MONTHLY_SUMMARY.overtimeHours}h</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Breakdown */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle>Weekly Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Week</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead className="text-right">Billable</TableHead>
                  <TableHead className="text-right">Projects</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {WEEKLY_DATA.map((week) => (
                  <TableRow key={week.week}>
                    <TableCell className="font-medium">{week.week}</TableCell>
                    <TableCell className="text-right">{week.hours}h</TableCell>
                    <TableCell className="text-right text-success">{week.billable}h</TableCell>
                    <TableCell className="text-right">{week.projects}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {RECENT_REPORTS.map((report) => (
                <motion.div
                  key={report.id}
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{report.name}</p>
                      <p className="text-xs text-muted-foreground">{report.date} • {report.size}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{report.type}</Badge>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleDownloadReport(report)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
