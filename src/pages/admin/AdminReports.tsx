import { useState } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  FileBarChart, 
  Download, 
  Users,
  Clock,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';

const DEPARTMENT_DATA = [
  { name: 'Engineering', employees: 3, hours: 485, billable: 420, overtime: 12 },
  { name: 'Design', employees: 1, hours: 160, billable: 145, overtime: 5 },
  { name: 'Marketing', employees: 1, hours: 168, billable: 80, overtime: 0 },
  { name: 'Sales', employees: 1, hours: 175, billable: 120, overtime: 8 },
  { name: 'Management', employees: 1, hours: 180, billable: 40, overtime: 0 },
];

const ATTENDANCE_DATA = [
  { date: '2026-02-01', present: 5, absent: 1, late: 0, remote: 2 },
  { date: '2026-01-31', present: 6, absent: 0, late: 1, remote: 1 },
  { date: '2026-01-30', present: 5, absent: 1, late: 0, remote: 3 },
  { date: '2026-01-29', present: 6, absent: 0, late: 2, remote: 1 },
  { date: '2026-01-28', present: 4, absent: 2, late: 0, remote: 2 },
];

const PAYROLL_SUMMARY = [
  { name: 'Sarah Miller', department: 'Engineering', hours: 172, rate: 75, gross: 12900, overtime: 4 },
  { name: 'John Smith', department: 'Design', hours: 160, rate: 65, gross: 10400, overtime: 0 },
  { name: 'Jessica Taylor', department: 'Sales', hours: 175, rate: 55, gross: 9625, overtime: 8 },
];

const SUMMARY_STATS = {
  totalHours: 1168,
  billableHours: 805,
  billablePercentage: 69,
  totalOvertime: 25,
  avgHoursPerEmployee: 194.7,
  totalPayroll: 85250,
};

export default function AdminReports() {
  const [dateRange, setDateRange] = useState({ start: '2026-01-01', end: '2026-01-31' });
  const [reportType, setReportType] = useState('all');
  const { toast } = useToast();

  const handleGenerateReport = () => {
    toast({
      title: "Report Generated",
      description: `${reportType === 'all' ? 'Complete' : reportType.charAt(0).toUpperCase() + reportType.slice(1)} report for ${dateRange.start} to ${dateRange.end} has been generated.`,
    });

    // Create report content based on type
    let content = `Report Type: ${reportType}\nDate Range: ${dateRange.start} to ${dateRange.end}\n\n`;
    
    if (reportType === 'all' || reportType === 'attendance') {
      content += 'ATTENDANCE SUMMARY\n';
      content += 'Date,Present,Absent,Late,Remote\n';
      ATTENDANCE_DATA.forEach(day => {
        content += `${day.date},${day.present},${day.absent},${day.late},${day.remote}\n`;
      });
      content += '\n';
    }
    
    if (reportType === 'all' || reportType === 'department') {
      content += 'DEPARTMENT BREAKDOWN\n';
      content += 'Department,Employees,Hours,Billable,Overtime\n';
      DEPARTMENT_DATA.forEach(dept => {
        content += `${dept.name},${dept.employees},${dept.hours},${dept.billable},${dept.overtime}\n`;
      });
      content += '\n';
    }
    
    if (reportType === 'all' || reportType === 'payroll') {
      content += 'PAYROLL SUMMARY\n';
      content += 'Employee,Department,Hours,Rate,Overtime,Gross\n';
      PAYROLL_SUMMARY.forEach(emp => {
        content += `${emp.name},${emp.department},${emp.hours},$${emp.rate},${emp.overtime}h,$${emp.gross}\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-report-${reportType}-${dateRange.start}-to-${dateRange.end}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    toast({
      title: "Exporting All Reports",
      description: "Complete company reports are being compiled.",
    });

    let content = `COMPANY REPORTS\nGenerated: ${new Date().toISOString()}\n\n`;
    content += `SUMMARY STATISTICS\n`;
    content += `Total Hours: ${SUMMARY_STATS.totalHours}h\n`;
    content += `Billable Hours: ${SUMMARY_STATS.billableHours}h (${SUMMARY_STATS.billablePercentage}%)\n`;
    content += `Overtime: ${SUMMARY_STATS.totalOvertime}h\n`;
    content += `Avg/Employee: ${SUMMARY_STATS.avgHoursPerEmployee}h\n`;
    content += `Total Payroll: $${SUMMARY_STATS.totalPayroll.toLocaleString()}\n\n`;
    
    content += 'DEPARTMENT DATA\n';
    DEPARTMENT_DATA.forEach(dept => {
      content += `${dept.name}: ${dept.hours}h (${dept.billable}h billable)\n`;
    });
    
    content += '\nPAYROLL DATA\n';
    PAYROLL_SUMMARY.forEach(emp => {
      content += `${emp.name}: $${emp.gross.toLocaleString()}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `company-reports-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExportPayroll = () => {
    toast({
      title: "Exporting Payroll",
      description: "Payroll data is being downloaded.",
    });

    const headers = 'Employee,Department,Hours,Rate ($/hr),Overtime,Gross Pay\n';
    const rows = PAYROLL_SUMMARY.map(emp => 
      `${emp.name},${emp.department},${emp.hours},$${emp.rate},${emp.overtime}h,$${emp.gross}`
    ).join('\n');
    
    const content = headers + rows;
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-export-${dateRange.start}-to-${dateRange.end}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Reports & Analytics" 
        description="Company-wide reports and insights"
      >
        <Button onClick={handleExportAll}>
          <Download className="w-4 h-4 mr-2" />
          Export All
        </Button>
      </PageHeader>

      {/* Report Generator */}
      <Card className="card-modern mb-6">
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-[160px]"
              />
            </div>
            <div className="space-y-1">
              <Label>End Date</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-[160px]"
              />
            </div>
            <div className="space-y-1">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="payroll">Payroll</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>&nbsp;</Label>
              <Button className="w-full" onClick={handleGenerateReport}>Generate Report</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Total Hours
            </div>
            <div className="text-2xl font-bold mt-1">{SUMMARY_STATS.totalHours}h</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              Billable
            </div>
            <div className="text-2xl font-bold mt-1 text-success">{SUMMARY_STATS.billableHours}h</div>
            <div className="text-xs text-muted-foreground">{SUMMARY_STATS.billablePercentage}%</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="w-4 h-4" />
              Overtime
            </div>
            <div className="text-2xl font-bold mt-1 text-warning">{SUMMARY_STATS.totalOvertime}h</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              Avg/Employee
            </div>
            <div className="text-2xl font-bold mt-1">{SUMMARY_STATS.avgHoursPerEmployee}h</div>
          </CardContent>
        </Card>
        <Card className="card-modern lg:col-span-2">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              Total Payroll
            </div>
            <div className="text-2xl font-bold mt-1">${SUMMARY_STATS.totalPayroll.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Department Report */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Department Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Staff</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead className="text-right">Billable</TableHead>
                  <TableHead className="text-right">OT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEPARTMENT_DATA.map((dept) => (
                  <TableRow key={dept.name}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell className="text-right">{dept.employees}</TableCell>
                    <TableCell className="text-right">{dept.hours}h</TableCell>
                    <TableCell className="text-right text-success">{dept.billable}h</TableCell>
                    <TableCell className="text-right">
                      {dept.overtime > 0 ? (
                        <span className="text-warning">{dept.overtime}h</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Attendance Report */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Attendance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Present</TableHead>
                  <TableHead className="text-right">Absent</TableHead>
                  <TableHead className="text-right">Late</TableHead>
                  <TableHead className="text-right">Remote</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ATTENDANCE_DATA.map((day) => (
                  <TableRow key={day.date}>
                    <TableCell className="font-medium">{day.date}</TableCell>
                    <TableCell className="text-right text-success">{day.present}</TableCell>
                    <TableCell className="text-right">
                      {day.absent > 0 ? (
                        <span className="text-destructive">{day.absent}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {day.late > 0 ? (
                        <span className="text-warning">{day.late}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{day.remote}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Summary */}
      <Card className="card-modern">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Payroll Summary
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleExportPayroll}>
            <Download className="w-4 h-4 mr-2" />
            Export Payroll
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">Rate ($/hr)</TableHead>
                <TableHead className="text-right">Overtime</TableHead>
                <TableHead className="text-right">Gross Pay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PAYROLL_SUMMARY.map((employee) => (
                <TableRow key={employee.name}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell className="text-right">{employee.hours}h</TableCell>
                  <TableCell className="text-right">${employee.rate}</TableCell>
                  <TableCell className="text-right">
                    {employee.overtime > 0 ? (
                      <Badge className="bg-warning text-white">{employee.overtime}h</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">${employee.gross.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
