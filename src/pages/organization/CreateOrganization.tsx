import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Check, ArrowRight, Timer, Users, Clock, FileBarChart, CreditCard, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrganization, OrganizationPlan } from '@/contexts/OrganizationContext';
import { useToast } from '@/hooks/use-toast';
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
    description: 'Perfect for small teams getting started',
    monthlyPrice: 29,
    yearlyPrice: 290, // ~$24/month
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
    yearlyPrice: 790, // ~$66/month
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
    yearlyPrice: 1990, // ~$166/month
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
      'Dedicated account manager',
    ],
  },
];

export default function CreateOrganization() {
  const navigate = useNavigate();
  const { createOrganization, organizations } = useOrganization();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1); // Start directly with plan selection
  const [isLoading, setIsLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<OrganizationPlan>('professional');
  const [formData, setFormData] = useState({
    // Organization details
    name: '',
    slug: '',
    // User account details
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const validateAccountDetails = () => {
    if (!formData.email || !formData.email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }
    if (formData.password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords match.",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.firstName || !formData.lastName) {
      toast({
        title: "Name Required",
        description: "Please enter your first and last name.",
        variant: "destructive",
      });
      return false;
    }
    if (!formData.name.trim()) {
      toast({
        title: "Organization Name Required",
        description: "Please enter your organization name.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateAccountDetails()) {
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Process payment
      // In a real app, this would integrate with Stripe, PayPal, etc.
      toast({
        title: "Processing Payment",
        description: "Please wait while we process your payment...",
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 2: ONLY after successful payment, create user account
      // This would be a real API call to create the user
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 3: Create organization with paid plan
      await createOrganization(formData.name, formData.slug, selectedPlan);
      
      toast({
        title: "Success! 🎉",
        description: `Payment successful! Your account and organization have been created.`,
      });
      
      // Step 4: User can now login
      navigate('/login', { 
        state: { 
          email: formData.email,
          message: 'Your account has been created. Please login to continue.' 
        } 
      });
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an issue processing your payment. No charges were made.",
        variant: "destructive",
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

  const features = [
    { icon: Clock, title: 'Time Tracking', description: 'Track work hours with detailed descriptions' },
    { icon: Users, title: 'Team Management', description: 'Manage employees, roles, and permissions' },
    { icon: FileBarChart, title: 'Reports & Analytics', description: 'Generate payroll and attendance reports' },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Step 1: Plan Selection (shown immediately) */}
        {step === 1 && (
          <Card className="border-border/50">
            <CardHeader>
              <div className="text-center mb-4">
              <Link to="/" className='flex justify-center items-center mb-4'>
            <img src="/roburna_labs.jpg" alt="Roburna" className="w-16 h-16 rounded-lg" />
          </Link>
              </div>
              <CardTitle>Choose Your Plan</CardTitle>
              <CardDescription>
                Select a subscription plan to get started
              </CardDescription>
              
              <div className="flex items-center justify-center gap-4 mt-4">
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
                  <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                    Save {Math.round((savings / (selectedPlanDetails?.monthlyPrice! * 12)) * 100)}%
                  </span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {SUBSCRIPTION_PLANS.map((plan) => {
                  const planPrice = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
                  const monthlyEquivalent = billingCycle === 'yearly' ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;
                  
                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "relative p-6 rounded-lg border-2 cursor-pointer transition-all",
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
                      
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{plan.name}</h3>
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">${monthlyEquivalent}</div>
                          <div className="text-xs text-muted-foreground">per month</div>
                          {billingCycle === 'yearly' && (
                            <div className="text-xs text-green-600 font-medium">
                              ${planPrice} billed yearly
                            </div>
                          )}
                        </div>
                      </div>

                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
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
                    </motion.div>
                  );
                })}
              </div>

              <Button 
                onClick={() => setStep(2)}
                className="w-full gap-2"
                size="lg"
              >
                Continue with {selectedPlanDetails?.name}
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="text-center">
                <Button variant="link" onClick={() => navigate('/')}>
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Account & Organization Details */}
        {step === 2 && (
          <Card className="border-border/50">
            <CardHeader>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-12 h-12 rounded-xl bg-primary/10 mb-4 flex items-center justify-center"
              >
                <Building2 className="w-6 h-6 text-primary" />
              </motion.div>
              <CardTitle>Create Your Organization</CardTitle>
              <CardDescription>
                Enter your company or team name to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* Account Details */}
                <div className="space-y-4 pb-4 border-b">
                  <h3 className="font-medium text-sm text-muted-foreground">Your Account</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min. 6 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>

                {/* Organization Details */}
                <div className="space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground">Your Organization</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Organization Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Roburna Labs"
                      value={formData.name}
                      onChange={handleNameChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Organization URL</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">tracker.roburna.com/</span>
                      <Input
                        id="slug"
                        placeholder="your-org"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  disabled={!formData.name.trim() || !formData.email || !formData.password}
                  className="flex-1 gap-2"
                >
                  Continue to Payment
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Payment & Confirmation */}
        {step === 3 && selectedPlanDetails && (
          <Card className="border-border/50">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 mb-4 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Complete Your Payment</CardTitle>
              <CardDescription>
                Review your subscription and complete payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Summary */}
              <div className="rounded-lg bg-muted/50 p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{formData.name}</div>
                    <div className="text-sm text-muted-foreground">Organization Name</div>
                  </div>
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
                      <div className="font-semibold text-lg">
                        ${price}
                      </div>
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
                    In production, this would integrate with Stripe, PayPal, or your preferred payment processor
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(2)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handlePayment}
                  disabled={isLoading}
                  className="flex-1 gap-2"
                  size="lg"
                >
                  {isLoading ? (
                    'Processing Payment...'
                  ) : (
                    <>
                      Complete Payment & Create Account
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                By completing this purchase, you agree to our Terms of Service and Privacy Policy.
                Your account will be created and subscription will auto-renew {billingCycle === 'monthly' ? 'monthly' : 'yearly'}.
              </p>
              
              <p className="text-xs text-center text-green-600 font-medium">
                ✓ No charges until payment is successful
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
