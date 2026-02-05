'use client';

import { useState } from 'react';
import { AppLayout, PageHeader } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Settings as SettingsIcon, 
  Clock, 
  Users, 
  Building,
  Bell,
  Shield,
  Save,
  Plus,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';

interface Department {
  id: string;
  name: string;
  manager: string;
  employees: number;
}

const DUMMY_DEPARTMENTS: Department[] = [
  { id: '1', name: 'Engineering', manager: 'Sarah Miller', employees: 3 },
  { id: '2', name: 'Design', manager: 'John Smith', employees: 1 },
  { id: '3', name: 'Marketing', manager: 'Emily Brown', employees: 1 },
  { id: '4', name: 'Sales', manager: 'Jessica Taylor', employees: 1 },
  { id: '5', name: 'Management', manager: 'Alex Johnson', employees: 1 },
];

export default function AdminSettings() {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>(DUMMY_DEPARTMENTS);
  
  const [workHours, setWorkHours] = useState({
    startTime: '09:00',
    endTime: '18:00',
    breakDuration: '60',
    overtimeThreshold: '40',
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    weeklyReport: true,
  });

  const [newDepartment, setNewDepartment] = useState('');

  const handleSaveWorkHours = () => {
    toast({
      title: "Work Hours Updated",
      description: "Company work hour settings have been saved.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification Settings Saved",
      description: "Your notification preferences have been updated.",
    });
  };

  const handleAddDepartment = () => {
    if (newDepartment.trim()) {
      setDepartments([
        ...departments,
        { id: Date.now().toString(), name: newDepartment, manager: 'Unassigned', employees: 0 }
      ]);
      setNewDepartment('');
      toast({
        title: "Department Added",
        description: `${newDepartment} has been created.`,
      });
    }
  };

  const handleDeleteDepartment = (id: string) => {
    setDepartments(departments.filter(d => d.id !== id));
    toast({
      title: "Department Removed",
      description: "The department has been deleted.",
    });
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Admin Settings" 
        description="Configure system-wide settings and policies"
      />

      <div className="grid gap-6 max-w-4xl">
        {/* Work Hours Settings */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Work Hours Configuration
            </CardTitle>
            <CardDescription>
              Set standard work hours and overtime rules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={workHours.startTime}
                  onChange={(e) => setWorkHours({ ...workHours, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={workHours.endTime}
                  onChange={(e) => setWorkHours({ ...workHours, endTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="breakDuration">Break (minutes)</Label>
                <Input
                  id="breakDuration"
                  type="number"
                  value={workHours.breakDuration}
                  onChange={(e) => setWorkHours({ ...workHours, breakDuration: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="overtimeThreshold">Weekly OT Threshold (hrs)</Label>
                <Input
                  id="overtimeThreshold"
                  type="number"
                  value={workHours.overtimeThreshold}
                  onChange={(e) => setWorkHours({ ...workHours, overtimeThreshold: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveWorkHours}>
                <Save className="w-4 h-4 mr-2" />
                Save Work Hours
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Department Management */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              Department Management
            </CardTitle>
            <CardDescription>
              Create and manage company departments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="New department name"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
              />
              <Button onClick={handleAddDepartment}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div>
                    <p className="font-medium">{dept.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Manager: {dept.manager} • {dept.employees} employees
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteDepartment(dept.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              System Notifications
            </CardTitle>
            <CardDescription>
              Configure system-wide notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Alerts</p>
                <p className="text-sm text-muted-foreground">Send email notifications for important events</p>
              </div>
              <Switch
                checked={notifications.emailAlerts}
                onCheckedChange={(checked) => setNotifications({ ...notifications, emailAlerts: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekly Report</p>
                <p className="text-sm text-muted-foreground">Generate and send weekly summary reports</p>
              </div>
              <Switch
                checked={notifications.weeklyReport}
                onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReport: checked })}
              />
            </div>
            
            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveNotifications}>
                <Save className="w-4 h-4 mr-2" />
                Save Notifications
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
