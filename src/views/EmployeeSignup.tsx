'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Timer, Mail, Lock, ArrowRight, Loader2, User, Phone, Building2, CheckCircle, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function EmployeeSignup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  
  // Get invite token and email from URL
  const inviteToken = searchParams.get('token');
  const prefilledEmail = searchParams.get('email');
  const orgName = searchParams.get('org') || 'Your Organization';

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: prefilledEmail || '',
    phone: '',
    password: '',
    confirmPassword: '',
    profilePhoto: null as File | null,
  });

  useEffect(() => {
    // Validate invite token
    if (!inviteToken) {
      toast.error('Invalid invitation link');
      navigate('/login');
    }
  }, [inviteToken, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo must be less than 5MB');
        return;
      }
      setFormData(prev => ({ ...prev, profilePhoto: file }));
    }
  };

  const validateForm = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('First name and last name are required');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Valid email is required');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate account creation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Account created successfully! 🎉', {
        description: 'You can now sign in with your credentials.',
      });
      
      // Navigate to login
      navigate('/login');
    } catch (error) {
      toast.error('Failed to create account', {
        description: 'Please try again or contact your administrator.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
        <Link to="/" className='flex justify-center items-center mb-4'>
            <img src="/roburna_labs.jpg" alt="Roburna" className="w-16 h-16 rounded-lg" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Join {orgName}</h1>
          <p className="text-muted-foreground mt-1">Complete your profile to get started</p>
        </div>

        {/* Invitation Info */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="pt-6 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">You've been invited!</p>
              <p className="text-sm text-muted-foreground">Join {orgName} as an employee</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-medium border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Create Your Account</CardTitle>
            <CardDescription>
              Set up your employee profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Profile Photo */}
              <div className="flex flex-col items-center gap-4 pb-4">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="bg-primary/10 text-lg">
                    {formData.firstName?.[0]?.toUpperCase() || 'U'}{formData.lastName?.[0]?.toUpperCase() || ''}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="photo" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <Upload className="w-4 h-4" />
                      Upload Profile Photo (Optional)
                    </div>
                  </Label>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  {formData.profilePhoto && (
                    <p className="text-xs text-muted-foreground mt-1">{formData.profilePhoto.name}</p>
                  )}
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10"
                    disabled={!!prefilledEmail}
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Create Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full gap-2 mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <CheckCircle className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 Roburna Tracker. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
