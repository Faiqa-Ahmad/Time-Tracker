import { useState } from 'react';
import { motion } from 'framer-motion';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useOrganization, OrganizationPlan } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Timer, Mail, Lock, ArrowRight, Loader2, Building2, CheckCircle, Check, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type BillingCycle = 'monthly' | 'yearly';

interface SubscriptionPlan {
  id: OrganizationPlan;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxMembers: number;
  features: string[];
  popular?: boolean;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small teams',
    monthlyPrice: 29,
    yearlyPrice: 290,
    maxMembers: 10,
    features: [
      'Up to 10 team members',
      'Basic time tracking',
      'Simple reports',
      'Email support',
      'Mobile app access',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Best for growing businesses',
    monthlyPrice: 79,
    yearlyPrice: 790,
    maxMembers: 50,
    features: [
      'Up to 50 team members',
      'Advanced time tracking',
      'Detailed reports & analytics',
      'Priority support',
      'API access',
      'Custom integrations',
      'Time off management',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    monthlyPrice: 199,
    yearlyPrice: 1990,
    maxMembers: 999,
    features: [
      'Unlimited team members',
      'Enterprise time tracking',
      'Custom reports',
      '24/7 dedicated support',
      'Advanced API access',
      'SSO & SAML',
      'Audit logs',
      'Custom contracts',
    ],
  },
];

const industryOptions = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Consulting',
  'Marketing',
  'Real Estate',
  'Other',
];

const companySizes = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '500+ employees',
];

export default function Signup() {
  const navigate = useNavigate();
  const { createOrganization, setCurrentOrganization } = useOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Account, 2: Organization, 3: Plan, 4: Payment
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<OrganizationPlan>('professional');

  // Form state
  const [formData, setFormData] = useState({
    // Admin/User details
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Organization details
    orgName: '',
    orgSlug: '',
    industry: '',
    companySize: '',
    // Terms
    acceptTerms: false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleOrgNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      orgName: name,
      orgSlug: generateSlug(name),
    }));
  };

  // Step 1: Account Details Validation
  const validateStep1 = () => {
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
    if (!formData.acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return false;
    }
    return true;
  };

  // Step 2: Organization Details Validation
  const validateStep2 = () => {
    if (!formData.orgName.trim()) {
      toast.error('Organization name is required');
      return false;
    }
    if (!formData.industry) {
      toast.error('Please select an industry');
      return false;
    }
    if (!formData.companySize) {
      toast.error('Please select company size');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      // Step 1: Process payment
      toast.success('Processing Payment...', {
        description: 'Please wait while we process your payment.',
      });
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 2: After successful payment, create user account
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 3: Create organization with selected plan
      const newOrg = await createOrganization(formData.orgName, formData.orgSlug, selectedPlan);
      setCurrentOrganization(newOrg);
      
      toast.success('Success! 🎉', {
        description: 'Your account and organization have been created.',
      });
      
      // Step 4: Redirect to login
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            email: formData.email,
            message: 'Your account has been created successfully. Please sign in to continue.' 
          } 
        });
      }, 1500);
      
    } catch (error) {
      toast.error('Payment Failed', {
        description: 'There was an issue processing your payment. No charges were made.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPlanDetails = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan);
  const price = billingCycle === 'monthly' 
    ? selectedPlanDetails?.monthlyPrice 
    : selectedPlanDetails?.yearlyPrice;
  const savings = selectedPlanDetails 
    ? (selectedPlanDetails.monthlyPrice * 12 - selectedPlanDetails.yearlyPrice)
    : 0;

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
        className="w-full max-w-2xl relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
          <div className='flex justify-center items-center mb-4'>
            <img src="/roburna_labs.jpg" alt="Roburna" className="w-16 h-16 rounded-lg" />
          </div>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Create Your Account</h1>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[
            { num: 1, label: 'Account' },
            { num: 2, label: 'Organization' },
            { num: 3, label: 'Plan' },
            { num: 4, label: 'Payment' },
          ].map((step, idx) => (
            <React.Fragment key={step.num}>
              {idx > 0 && (
                <div className={`h-0.5 w-8 sm:w-12 ${currentStep > step.num - 1 ? 'bg-primary' : 'bg-muted'}`} />
              )}
              <div className={`flex items-center ${currentStep >= step.num ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                  currentStep > step.num ? 'bg-primary text-primary-foreground' : 
                  currentStep === step.num ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {currentStep > step.num ? <CheckCircle className="w-5 h-5" /> : step.num}
                </div>
                <span className="ml-2 text-xs font-medium hidden md:inline">{step.label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        <Card className="shadow-medium border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">
              {currentStep === 1 && 'Create Your Account'}
              {currentStep === 2 && 'Organization Details'}
              {currentStep === 3 && 'Choose Your Plan'}
              {currentStep === 4 && 'Payment Details'}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Enter your personal information to get started'}
              {currentStep === 2 && 'Tell us about your organization'}
              {currentStep === 3 && 'Select a subscription plan that fits your needs'}
              {currentStep === 4 && 'Review and complete your payment'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Step 1: Account Details */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min. 6 characters"
                      className="pl-10"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter password"
                      className="pl-10"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleInputChange('acceptTerms', checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
                    I accept the{' '}
                    <Link to="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full gap-2"
                  size="lg"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}

            {/* Step 2: Organization Details */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="orgName"
                      placeholder="e.g., Roburna Labs"
                      className="pl-10"
                      value={formData.orgName}
                      onChange={handleOrgNameChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orgSlug">Organization URL</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">tracker.roburna.com/</span>
                    <Input
                      id="orgSlug"
                      placeholder="your-org"
                      value={formData.orgSlug}
                      onChange={(e) => handleInputChange('orgSlug', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry *</Label>
                    <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industryOptions.map((industry) => (
                          <SelectItem key={industry} value={industry.toLowerCase()}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companySize">Company Size *</Label>
                    <Select value={formData.companySize} onValueChange={(value) => handleInputChange('companySize', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {companySizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Plan Selection */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant={billingCycle === 'monthly' ? 'default' : 'outline'}
                    onClick={() => setBillingCycle('monthly')}
                    className="min-w-[120px]"
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={billingCycle === 'yearly' ? 'default' : 'outline'}
                    onClick={() => setBillingCycle('yearly')}
                    className="min-w-[120px]"
                  >
                    Yearly
                    {selectedPlanDetails && (
                      <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                        Save {Math.round((savings / (selectedPlanDetails.monthlyPrice * 12)) * 100)}%
                      </span>
                    )}
                  </Button>
                </div>

                <div className="grid gap-4">
                  {SUBSCRIPTION_PLANS.map((plan) => {
                    const planPrice = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
                    const monthlyEquivalent = billingCycle === 'yearly' ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;
                    
                    return (
                      <div
                        key={plan.id}
                        className={cn(
                          "relative p-4 rounded-lg border-2 cursor-pointer transition-all",
                          selectedPlan === plan.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50",
                          plan.popular && "ring-2 ring-primary/20"
                        )}
                        onClick={() => setSelectedPlan(plan.id)}
                      >
                        {plan.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                              Most Popular
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{plan.name}</h3>
                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold">${monthlyEquivalent}</div>
                            <div className="text-xs text-muted-foreground">per month</div>
                          </div>
                        </div>

                        <ul className="space-y-1.5">
                          {plan.features.slice(0, 3).map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {selectedPlan === plan.id && (
                          <div className="absolute top-4 right-4">
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-4 h-4 text-primary-foreground" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    Continue to Payment
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Payment */}
            {currentStep === 4 && selectedPlanDetails && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Order Summary */}
                <div className="rounded-lg bg-muted/50 p-6 space-y-4">
                  <div>
                    <div className="font-medium text-lg">{formData.orgName}</div>
                    <div className="text-sm text-muted-foreground">{formData.email}</div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{selectedPlanDetails.name} Plan</div>
                        <div className="text-sm text-muted-foreground">
                          Billed {billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-lg">${price}</div>
                        <div className="text-xs text-muted-foreground">
                          {billingCycle === 'monthly' ? '/month' : '/year'}
                        </div>
                      </div>
                    </div>
                    
                    {billingCycle === 'yearly' && (
                      <div className="text-sm text-green-600 font-medium">
                        You're saving ${savings} per year!
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Due Today</span>
                      <span>${price}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Form Placeholder */}
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground text-center p-4 border rounded-lg bg-background">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-medium mb-1">Secure Payment Processing</p>
                    <p className="text-xs">
                      In production, this would integrate with Stripe or PayPal
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(3)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handlePayment}
                    disabled={isLoading}
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Complete Payment
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-center text-muted-foreground">
                    By completing this purchase, you agree to our Terms of Service and Privacy Policy.
                  </p>
                  <p className="text-xs text-center text-green-600 font-medium">
                    ✓ No charges until payment is successful
                  </p>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
