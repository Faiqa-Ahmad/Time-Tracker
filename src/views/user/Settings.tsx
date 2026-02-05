'use client';

import { useState, useRef } from 'react';
import { AppLayout, PageHeader } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Bell, 
  Lock, 
  CreditCard,
  Save,
  Upload,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    phone: '+1 (555) 123-4567',
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
  });

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [payment, setPayment] = useState({
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    cryptoWallet: '',
  });

  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image under 2MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        toast({
          title: "Photo Uploaded",
          description: "Your profile photo has been updated.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile changes have been saved.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Preferences Saved",
      description: "Your notification preferences have been updated.",
    });
  };

  const handleChangePassword = () => {
    if (!password.current) {
      toast({
        title: "Error",
        description: "Please enter your current password.",
        variant: "destructive",
      });
      return;
    }
    if (password.new.length < 8) {
      toast({
        title: "Error",
        description: "New password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }
    if (password.new !== password.confirm) {
      toast({
        title: "Error",
        description: "New passwords don't match.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully.",
    });
    setPassword({ current: '', new: '', confirm: '' });
  };

  const handleSavePayment = () => {
    toast({
      title: "Payment Info Saved",
      description: "Your payment information has been updated.",
    });
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Settings" 
        description="Manage your account and preferences"
      />

      <div className="grid gap-6 max-w-4xl">
        {/* Profile Settings */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and profile picture
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-20 h-20 border-4 border-border">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt="Profile" />
                ) : (
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleFileChange}
                />
                <Button variant="outline" size="sm" onClick={handleAvatarUpload}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  JPG, PNG or GIF. Max 2MB.
                </p>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose how you want to be notified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Alerts</p>
                <p className="text-sm text-muted-foreground">Receive important notifications via email</p>
              </div>
              <Switch
                checked={notifications.emailAlerts}
                onCheckedChange={(checked) => setNotifications({ ...notifications, emailAlerts: checked })}
              />
            </div>
            
            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveNotifications}>
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Security
            </CardTitle>
            <CardDescription>
              Update your password and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={password.current}
                  onChange={(e) => setPassword({ ...password, current: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={password.new}
                  onChange={(e) => setPassword({ ...password, new: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={password.confirm}
                  onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleChangePassword}>
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Payment Information
            </CardTitle>
            <CardDescription>
              Manage your payment details for payroll
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input 
                  id="bankName" 
                  placeholder="Enter bank name"
                  value={payment.bankName}
                  onChange={(e) => setPayment({ ...payment, bankName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input 
                  id="accountNumber" 
                  placeholder="Enter account number"
                  value={payment.accountNumber}
                  onChange={(e) => setPayment({ ...payment, accountNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="routingNumber">Routing Number</Label>
                <Input 
                  id="routingNumber" 
                  placeholder="Enter routing number"
                  value={payment.routingNumber}
                  onChange={(e) => setPayment({ ...payment, routingNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cryptoWallet">Crypto Wallet (Optional)</Label>
                <Input 
                  id="cryptoWallet" 
                  placeholder="Enter wallet address"
                  value={payment.cryptoWallet}
                  onChange={(e) => setPayment({ ...payment, cryptoWallet: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button onClick={handleSavePayment}>
                <Save className="w-4 h-4 mr-2" />
                Save Payment Info
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
