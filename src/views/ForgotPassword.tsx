'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer, Mail, ArrowRight, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setEmailSent(true);
      toast.success('Reset link sent!', {
        description: 'Check your email for the password reset link.',
      });
    } catch (error) {
      toast.error('Failed to send reset link', {
        description: 'Please try again or contact support.',
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
          <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
          <p className="text-muted-foreground mt-1">
            {emailSent ? 'Check your email' : 'Enter your email to receive a reset link'}
          </p>
        </div>

        <Card className="shadow-medium border-0">
          {!emailSent ? (
            <>
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl">Forgot your password?</CardTitle>
                <CardDescription>
                  No worries! Enter your email and we'll send you a link to reset your password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
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
                        autoFocus
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
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Reset Link
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Back to Login */}
                <div className="mt-6 pt-6 border-t border-border text-center">
                  <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4" />
                    Back to sign in
                  </Link>
                </div>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="space-y-1 pb-4">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <CardTitle className="text-xl text-center">Check your email</CardTitle>
                <CardDescription className="text-center">
                  We've sent a password reset link to <strong>{email}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                    <p className="mb-2">Didn't receive the email?</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Check your spam or junk folder</li>
                      <li>Make sure the email address is correct</li>
                      <li>Wait a few minutes and check again</li>
                    </ul>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setEmailSent(false);
                      setEmail('');
                    }}
                  >
                    Try another email
                  </Button>

                  <div className="text-center">
                    <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                      <ArrowLeft className="w-4 h-4" />
                      Back to sign in
                    </Link>
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 Roburna Tracker. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
