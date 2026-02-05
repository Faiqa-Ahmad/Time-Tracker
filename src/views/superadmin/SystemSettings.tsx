'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout, PageHeader } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Settings, 
  Mail,
  Shield,
  Save,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    // General Settings
    platformName: 'Roburna Tracker',
    supportEmail: 'support@roburna.com',
    defaultTimezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    defaultWorkHours: '09:00-18:00',
    defaultPTODays: 15,
    
    // Security
    sessionTimeout: 30,
    passwordMinLength: 8,
    requireStrongPasswords: true,
    maxLoginAttempts: 5,
    ipWhitelisting: false,
    
    
  });

  const handleSave = (section: string) => {
    toast.success(`${section} settings saved successfully`);
  };

  const handleReset = (section: string) => {
    toast.info(`${section} settings reset to defaults`);
  };

  return (
    <AppLayout>
      <PageHeader 
        title="System Settings"
        description="Configure platform-wide settings and features"
      />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Settings className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Platform Configuration</CardTitle>
                <CardDescription>
                  Core platform settings and defaults
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platformName">Platform Name</Label>
                    <Input
                      id="platformName"
                      value={settings.platformName}
                      onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Default Timezone</Label>
                    <Select value={settings.defaultTimezone} onValueChange={(value) => setSettings({ ...settings, defaultTimezone: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">EST</SelectItem>
                        <SelectItem value="PST">PST</SelectItem>
                        <SelectItem value="GMT">GMT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select value={settings.dateFormat} onValueChange={(value) => setSettings({ ...settings, dateFormat: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workHours">Default Work Hours</Label>
                    <Input
                      id="workHours"
                      value={settings.defaultWorkHours}
                      onChange={(e) => setSettings({ ...settings, defaultWorkHours: e.target.value })}
                      placeholder="09:00-18:00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ptoDays">Default PTO Days</Label>
                    <Input
                      id="ptoDays"
                      type="number"
                      value={settings.defaultPTODays}
                      onChange={(e) => setSettings({ ...settings, defaultPTODays: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button onClick={() => handleSave('General')} className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => handleReset('General')} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Security Configuration</CardTitle>
                <CardDescription>
                  Configure security and authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">Min Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={settings.passwordMinLength}
                      onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Strong Passwords Required</Label>
                      <p className="text-sm text-muted-foreground">Require uppercase, lowercase, numbers, and symbols</p>
                    </div>
                    <Switch
                      checked={settings.requireStrongPasswords}
                      onCheckedChange={(checked) => setSettings({ ...settings, requireStrongPasswords: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>IP Whitelisting</Label>
                      <p className="text-sm text-muted-foreground">Restrict access to whitelisted IPs</p>
                    </div>
                    <Switch
                      checked={settings.ipWhitelisting}
                      onCheckedChange={(checked) => setSettings({ ...settings, ipWhitelisting: checked })}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button onClick={() => handleSave('Security')} className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
