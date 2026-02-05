import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Timer, Mail, Lock, ArrowRight, ArrowLeft, Loader2, Building2, Globe, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isSuperAdmin, isAdmin } = useAuth();
  const { organizations, setCurrentOrganization } = useOrganization();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check for success message from payment flow
  useEffect(() => {
    const state = location.state as { email?: string; message?: string };
    if (state?.message) {
      toast.success(state.message);
      if (state.email) {
        setEmail(state.email);
      }
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }

    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);

    if (success) {
      toast.success('Welcome back!');
      
      // Super admin goes straight to platform admin
      if (email.toLowerCase() === 'superadmin@roburna.com') {
        navigate('/superadmin');
        return;
      }
      
      // For org admins/employees, auto-select their first org if they have one
      const userOrgs = organizations.filter(org => {
        // In real app, this would check user's organizationIds
        if (email.toLowerCase().includes('liquidnft')) {
          return org.id === 'org-2';
        }
        return org.id === 'org-1'; // Default to Roburna Labs
      });
      
      if (userOrgs.length === 1) {
        setCurrentOrganization(userOrgs[0]);
        navigate(email.toLowerCase().includes('admin') ? '/admin' : '/dashboard');
      } else if (userOrgs.length > 1) {
        navigate('/select-organization');
      } else {
        navigate('/create-organization');
      }
    } else {
      toast.error('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      {/* Back to Home Button - Top Left */}
      <div className="fixed top-6 left-6 z-50">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </div>

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
          <h1 className="text-2xl font-bold text-foreground">Roburna Tracker</h1>
          <p className="text-muted-foreground mt-1">Track time. Manage work. Stay productive.</p>
        </div>

        <Card className="shadow-medium border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Sign in to your account</CardTitle>
            <CardDescription>
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Success Alert from Payment */}
            {location.state?.message && (
              <Alert className="mb-6 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-300">
                  {location.state.message}
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center mb-3">Demo Credentials</p>
              <div className="space-y-2 text-xs">
                {/* Super Admin */}
                <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-3.5 h-3.5 text-purple-500" />
                    <p className="font-medium text-purple-600">Platform Super Admin</p>
                  </div>
                  <p className="text-muted-foreground">superadmin@roburna.com / super123</p>
                </div>
                
                {/* Organization Accounts */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Building2 className="w-3 h-3 text-primary" />
                      <p className="font-medium text-foreground">Roburna Labs</p>
                    </div>
                    <p className="text-muted-foreground">admin@roburna.com</p>
                    <p className="text-muted-foreground">admin123</p>
                  </div>
                </div>
                
                {/* Employee */}
                <div className="p-2.5 rounded-lg bg-muted/50">
                  <p className="font-medium text-foreground">Employee (Roburna Labs)</p>
                  <p className="text-muted-foreground">employee@roburna.com / employee123</p>
                </div>
              </div>
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
