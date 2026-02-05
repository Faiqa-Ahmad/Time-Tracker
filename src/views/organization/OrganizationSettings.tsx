'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout, PageHeader } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useOrganization, OrganizationMember } from '@/contexts/OrganizationContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Settings, 
  Users, 
  CreditCard, 
  Shield, 
  Upload,
  UserPlus,
  MoreHorizontal,
  Crown,
  Trash2,
  Mail,
  Check,
  Zap,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock users for member display
const MOCK_USERS: Record<string, { name: string; email: string; avatar?: string }> = {
  '1': { name: 'Alex Johnson', email: 'admin@roburna.com' },
  '2': { name: 'Sarah Miller', email: 'sarah@roburna.com' },
  '5': { name: 'John Smith', email: 'john@roburna.com' },
  '6': { name: 'Emma Wilson', email: 'emma@roburna.com' },
};

export default function OrganizationSettings() {
  const { currentOrganization, updateOrganization, members, inviteMember, removeMember, updateMemberRole, isOrgOwner } = useOrganization();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<OrganizationMember['role']>('employee');
  
  // Role change with department/project assignment
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{ id: string; name: string; currentRole: string } | null>(null);
  const [newRole, setNewRole] = useState<OrganizationMember['role']>('employee');
  const [managerAssignment, setManagerAssignment] = useState({ type: 'department', value: '' });
  
  // Password change
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  
  const [settings, setSettings] = useState({
    name: currentOrganization?.name || '',
    slug: currentOrganization?.slug || '',
    workHoursStart: currentOrganization?.settings.workHoursStart || '09:00',
    workHoursEnd: currentOrganization?.settings.workHoursEnd || '18:00',
    timezone: currentOrganization?.settings.timezone || 'UTC',
    defaultPtoDays: currentOrganization?.settings.defaultPtoDays || 21,
    requireDescription: currentOrganization?.settings.requireDescription ?? true,
  });

  const handleSaveGeneral = async () => {
    if (!currentOrganization) return;
    
    setIsLoading(true);
    try {
      await updateOrganization(currentOrganization.id, {
        name: settings.name,
        slug: settings.slug,
        settings: {
          ...currentOrganization.settings,
          workHoursStart: settings.workHoursStart,
          workHoursEnd: settings.workHoursEnd,
          timezone: settings.timezone,
          defaultPtoDays: settings.defaultPtoDays,
          requireDescription: settings.requireDescription,
        },
      });
      toast({ title: 'Settings saved', description: 'Organization settings have been updated.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    
    try {
      await inviteMember(inviteEmail, inviteRole);
      toast({ title: 'Invitation sent', description: `Invited ${inviteEmail} as ${inviteRole}` });
      setInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRole('employee');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to send invitation', variant: 'destructive' });
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    try {
      await removeMember(memberId);
      toast({ title: 'Member removed', description: `${memberName} has been removed from the organization.` });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to remove member', variant: 'destructive' });
    }
  };

  const handleRoleChangeClick = (memberId: string, memberName: string, currentRole: string) => {
    setSelectedMember({ id: memberId, name: memberName, currentRole });
    setNewRole('employee');
    setManagerAssignment({ type: 'department', value: '' });
    setIsRoleDialogOpen(true);
  };

  const handleConfirmRoleChange = async () => {
    if (!selectedMember) return;
    
    // Validate manager assignment
    if (newRole === 'manager' && !managerAssignment.value) {
      toast({ 
        title: 'Assignment Required', 
        description: 'Please select a department or project for the manager role.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      await updateMemberRole(selectedMember.id, newRole);
      toast({ 
        title: 'Role updated', 
        description: `${selectedMember.name} is now ${newRole}${newRole === 'manager' ? ` of ${managerAssignment.value}` : ''}.` 
      });
      setIsRoleDialogOpen(false);
      setSelectedMember(null);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update role', variant: 'destructive' });
    }
  };

  const handleChangePassword = () => {
    if (passwordData.new !== passwordData.confirm) {
      toast({ title: 'Error', description: 'New passwords do not match', variant: 'destructive' });
      return;
    }
    if (passwordData.new.length < 8) {
      toast({ title: 'Error', description: 'Password must be at least 8 characters', variant: 'destructive' });
      return;
    }
    
    toast({ title: 'Password Changed', description: 'Your password has been updated successfully.' });
    setIsPasswordDialogOpen(false);
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  const getRoleBadgeColor = (role: OrganizationMember['role']) => {
    switch (role) {
      case 'owner': return 'bg-warning/10 text-warning border-warning/20';
      case 'admin': return 'bg-primary/10 text-primary border-primary/20';
      case 'manager': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const plans = [
    { id: 'free', name: 'Free', price: '$0', members: '5 members', features: ['Basic time tracking', 'Simple reports'] },
    { id: 'starter', name: 'Starter', price: '$9', members: '10 members', features: ['Everything in Free', 'Project tracking', 'Export reports'] },
    { id: 'professional', name: 'Professional', price: '$29', members: '50 members', features: ['Everything in Starter', 'Advanced analytics', 'Payroll integration'], recommended: true },
    { id: 'enterprise', name: 'Enterprise', price: 'Custom', members: 'Unlimited', features: ['Everything in Pro', 'SSO & SAML', 'Dedicated support'] },
  ];

  if (!currentOrganization) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-muted-foreground">No organization selected</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader 
        title="Organization Settings"
        description={`Manage settings for ${currentOrganization.name}`}
      />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" className="gap-2">
            <Building2 className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users className="w-4 h-4" />
            Members
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Organization Profile</CardTitle>
                <CardDescription>Basic information about your organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-primary" />
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Logo
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input
                      id="org-name"
                      value={settings.name}
                      onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-slug">URL Slug</Label>
                    <Input
                      id="org-slug"
                      value={settings.slug}
                      onChange={(e) => setSettings({ ...settings, slug: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Work Settings</CardTitle>
                <CardDescription>Configure default work hours and policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Work Hours Start</Label>
                    <Input
                      type="time"
                      value={settings.workHoursStart}
                      onChange={(e) => setSettings({ ...settings, workHoursStart: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Work Hours End</Label>
                    <Input
                      type="time"
                      value={settings.workHoursEnd}
                      onChange={(e) => setSettings({ ...settings, workHoursEnd: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select value={settings.timezone} onValueChange={(v) => setSettings({ ...settings, timezone: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">Eastern (EST)</SelectItem>
                        <SelectItem value="PST">Pacific (PST)</SelectItem>
                        <SelectItem value="CET">Central European (CET)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Default PTO Days per Year</Label>
                    <Input
                      type="number"
                      value={settings.defaultPtoDays}
                      onChange={(e) => setSettings({ ...settings, defaultPtoDays: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <Label>Require Work Description</Label>
                      <p className="text-sm text-muted-foreground">Require description when clocking in</p>
                    </div>
                    <Switch
                      checked={settings.requireDescription}
                      onCheckedChange={(checked) => setSettings({ ...settings, requireDescription: checked })}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveGeneral} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Team Members</CardTitle>
                <CardDescription>
                  {currentOrganization.memberCount} of {currentOrganization.maxMembers} members
                </CardDescription>
              </div>
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>Send an invitation to join your organization</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        placeholder="colleague@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select value={inviteRole} onValueChange={(v: OrganizationMember['role']) => setInviteRole(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleInvite} className="gap-2">
                      <Mail className="w-4 h-4" />
                      Send Invitation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {members.map((member) => {
                  const user = MOCK_USERS[member.userId];
                  if (!user) return null;
                  
                  return (
                    <div 
                      key={member.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{user.name}</span>
                            {member.role === 'owner' && (
                              <Crown className="w-4 h-4 text-warning" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={getRoleBadgeColor(member.role)}>
                          {member.role}
                        </Badge>
                        {member.role !== 'owner' && isOrgOwner && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleRoleChangeClick(member.id, user.name, member.role)}>
                                Change Role
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleRemoveMember(member.id, user.name)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Plan</CardTitle>
                <CardDescription>You are currently on the {currentOrganization.plan} plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {plans.map((plan) => (
                    <motion.div
                      key={plan.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        currentOrganization.plan === plan.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      } ${plan.recommended ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    >
                      {plan.recommended && (
                        <Badge className="mb-2 bg-primary">Recommended</Badge>
                      )}
                      <h3 className="font-semibold">{plan.name}</h3>
                      <p className="text-2xl font-bold mt-1">{plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                      <p className="text-sm text-muted-foreground mt-1">{plan.members}</p>
                      <ul className="mt-4 space-y-2">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-success" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      {currentOrganization.plan === plan.id ? (
                        <Button variant="outline" className="w-full mt-4" disabled>
                          Current Plan
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full mt-4">
                          {plan.id === 'enterprise' ? 'Contact Sales' : 'Upgrade'}
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Security Settings</CardTitle>
                <CardDescription>Manage organization security and access controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for all members</p>
                  </div>
                  <Switch />
                </div>

                {isOrgOwner && (
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Password</Label>
                        <p className="text-sm text-muted-foreground">Change your account password</p>
                      </div>
                      <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>
                        Change Password
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {isOrgOwner && (
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
                  <CardDescription>Irreversible and destructive actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2">
                        <Trash2 className="w-4 h-4" />
                        Delete Organization
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Organization?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the organization
                          and remove all associated data including users, time logs, and projects.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete Organization
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Role Change Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Member Role</DialogTitle>
            <DialogDescription>
              Update role for {selectedMember?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Role</Label>
              <div className="p-3 rounded-lg bg-muted/50">
                <Badge variant="outline" className={getRoleBadgeColor(selectedMember?.currentRole as OrganizationMember['role'])}>
                  {selectedMember?.currentRole}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>New Role</Label>
              <Select value={newRole} onValueChange={(v: OrganizationMember['role']) => setNewRole(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newRole === 'manager' && (
              <div className="space-y-3 p-4 rounded-lg bg-success/5 border border-success/20">
                <Label className="text-success">Manager Assignment</Label>
                <div className="space-y-2">
                  <Select 
                    value={managerAssignment.type} 
                    onValueChange={(v) => setManagerAssignment({ ...managerAssignment, type: v, value: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="department">Department</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={managerAssignment.value} 
                    onValueChange={(v) => setManagerAssignment({ ...managerAssignment, value: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${managerAssignment.type}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {managerAssignment.type === 'department' ? (
                        <>
                          <SelectItem value="Engineering">Engineering</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Sales">Sales</SelectItem>
                          <SelectItem value="Management">Management</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="Mobile App Redesign">Mobile App Redesign</SelectItem>
                          <SelectItem value="API Integration">API Integration</SelectItem>
                          <SelectItem value="Dashboard v2">Dashboard v2</SelectItem>
                          <SelectItem value="Marketing Campaign">Marketing Campaign</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  This manager will oversee the selected {managerAssignment.type}
                </p>
              </div>
            )}

            {newRole === 'admin' && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-primary">Admins</strong> can access the admin dashboard with permissions to:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4 list-disc">
                  <li>View organization reports</li>
                  <li>Manage time logs (flagging only)</li>
                  <li>Approve time-off requests</li>
                  <li>View audit logs</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  Note: Only owners can manage users and organization settings.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmRoleChange}>
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update your account password
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
