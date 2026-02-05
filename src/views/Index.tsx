'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Timer, 
  ArrowRight, 
  Clock, 
  Users, 
  BarChart3, 
  Shield,
  Zap,
  Globe,
  CheckCircle,
  Star,
  Menu,
  X,
  MessageSquare,
  Mail,
  Building2,
  TrendingUp,
  Award,
  Smartphone,
  Lock,
  Briefcase,
} from 'lucide-react';

const features = [
  {
    icon: Clock,
    title: 'Easy Time Tracking',
    description: 'Clock in and out with one click. Track time for specific projects and tasks effortlessly.',
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Manage your entire team, assign roles, and monitor productivity across departments.',
  },
  {
    icon: BarChart3,
    title: 'Detailed Reports',
    description: 'Generate comprehensive reports for payroll, billing, and productivity analysis.',
  },
  {
    icon: Briefcase,
    title: 'Project Tracking',
    description: 'Organize work by projects and track time spent on each task and deliverable.',
  },
  {
    icon: Globe,
    title: 'Multi-Organization',
    description: 'Perfect for agencies and enterprises managing multiple clients or business units.',
  },
  {
    icon: Smartphone,
    title: 'Mobile Friendly',
    description: 'Track time on the go with our responsive design that works on any device.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Enterprise-grade security with data isolation and encrypted storage.',
  },
  {
    icon: Zap,
    title: 'Real-time Updates',
    description: 'See team activity in real-time with instant synchronization across all devices.',
  },
];

const pricingPlans = [
  {
    name: 'Free Trial',
    price: '0',
    period: '14 days',
    description: 'Perfect for testing',
    features: [
      'Up to 5 users',
      'Basic time tracking',
      'Simple reports',
      'Email support',
      'Mobile access',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Starter',
    price: '29',
    period: 'per month',
    description: 'For small teams',
    features: [
      'Up to 10 users',
      'Advanced time tracking',
      'Project management',
      'Custom reports',
      'Priority support',
      'Time off management',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Professional',
    price: '79',
    period: 'per month',
    description: 'For growing businesses',
    features: [
      'Up to 50 users',
      'All Starter features',
      'Advanced analytics',
      'API access',
      'Custom integrations',
      'Dedicated support',
      'Audit logs',
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For large organizations',
    features: [
      'Unlimited users',
      'All Professional features',
      'Custom deployment',
      'SSO & SAML',
      'SLA guarantee',
      'Account manager',
      'Custom training',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'CEO, TechStart Inc',
    content: 'Roburna has transformed how we track time and manage projects. Our billing accuracy improved by 40%!',
    avatar: 'SJ',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Operations Manager, Digital Agency',
    content: 'The multi-organization feature is perfect for managing our diverse client base. Highly recommended!',
    avatar: 'MC',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'HR Director, Global Corp',
    content: 'Managing PTO and tracking employee hours has never been easier. The reports are incredibly detailed.',
    avatar: 'ER',
    rating: 5,
  },
];

const faqs = [
  {
    question: 'How does the free trial work?',
    answer: 'Start with a 14-day free trial with full access to all Professional features. No credit card required. Cancel anytime.',
  },
  {
    question: 'Can I switch plans later?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we will prorate the billing.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use enterprise-grade encryption, regular security audits, and complete data isolation between organizations.',
  },
  {
    question: 'Do you offer support?',
    answer: 'Yes! All plans include email support. Professional and Enterprise plans get priority support and dedicated account managers.',
  },
  {
    question: 'Can I export my data?',
    answer: 'Yes, you can export all your data at any time in CSV, Excel, or PDF format. Your data always belongs to you.',
  },
  {
    question: 'What happens after the trial?',
    answer: 'You can choose a paid plan to continue, or your account will be paused. No charges unless you subscribe.',
  },
];

export default function Index() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');

  const handleGetStarted = () => {
    // Will navigate to signup
    window.location.href = '/signup';
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
            <div className='flex justify-center items-center '>
            <img src="/roburna_labs.jpg" alt="Roburna" className="w-16 h-16 rounded-lg" />
          </div>
              <span className="text-xl font-bold">Roburna</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
              <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</a>
              <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">Testimonials</a>
              <a href="#faq" className="text-sm font-medium hover:text-primary transition-colors">FAQ</a>
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="gap-2">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <a href="#features" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#pricing" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <a href="#testimonials" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Testimonials</a>
              <a href="#faq" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">Sign In</Button>
              </Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full gap-2">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge variant="outline" className="mb-6">
              <Zap className="w-3 h-3 mr-1" />
              Trusted by 1000+ organizations worldwide
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Track Your Team's Time Effortlessly
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The complete time tracking solution for modern teams. Manage projects, track hours, and generate reports—all in one beautiful platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/signup">
                <Button size="lg" className="gap-2 text-lg px-8 h-14">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 max-w-6xl mx-auto"
          >
            <div className="rounded-2xl border-2 border-border shadow-2xl overflow-hidden bg-card">
              <div className="bg-muted/30 px-4 py-3 flex items-center gap-2 border-b border-border">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="aspect-video bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
                <div className="text-center p-8">
                <div className='flex justify-center items-center mb-4'>
            <img src="/roburna_labs.jpg" alt="Roburna" className="w-16 h-16 rounded-lg" />
          </div>
                  <p className="text-lg text-muted-foreground">Beautiful Dashboard Preview</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-4xl font-bold mb-4">Everything you need to track time</h2>
            <p className="text-lg text-muted-foreground">
              Powerful features designed for teams of all sizes, from startups to enterprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary mb-2">1000+</p>
              <p className="text-muted-foreground">Organizations</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary mb-2">50K+</p>
              <p className="text-muted-foreground">Active Users</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary mb-2">10M+</p>
              <p className="text-muted-foreground">Hours Tracked</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary mb-2">99.9%</p>
              <p className="text-muted-foreground">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">Pricing</Badge>
            <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-muted-foreground">
              Choose the plan that's right for your team. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`h-full ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
                  <CardHeader>
                    {plan.popular && (
                      <Badge className="w-fit mb-2">Most Popular</Badge>
                    )}
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.price === 'Custom' ? '' : '$'}{plan.price}</span>
                      {plan.price !== 'Custom' && <span className="text-muted-foreground">/{plan.period}</span>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/signup">
                      <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-4">Testimonials</Badge>
            <h2 className="text-4xl font-bold mb-4">Loved by teams worldwide</h2>
            <p className="text-lg text-muted-foreground">
              See what our customers have to say about Roburna.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm mb-6 italic">"{testimonial.content}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">{testimonial.avatar}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">FAQ</Badge>
            <h2 className="text-4xl font-bold mb-4">Frequently asked questions</h2>
            <p className="text-lg text-muted-foreground">
              Have questions? We've got answers.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <Card className="bg-primary text-primary-foreground border-0">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to get started?
              </h2>
              <p className="text-lg mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
                Join thousands of teams already tracking time with Roburna. Start your free 14-day trial today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup">
                  <Button size="lg" variant="secondary" className="gap-2 text-lg px-8 h-14">
                    Start Free Trial
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8 h-14 bg-transparent text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10">
                  <MessageSquare className="w-5 h-5" />
                  Contact Sales
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground">Integrations</a></li>
                <li><a href="#" className="hover:text-foreground">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Careers</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground">Community</a></li>
                <li><a href="#" className="hover:text-foreground">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms</a></li>
                <li><a href="#" className="hover:text-foreground">Security</a></li>
                <li><a href="#" className="hover:text-foreground">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className='flex justify-center items-center mb-4'>
            <img src="/roburna_labs.jpg" alt="Roburna" className="w-16 h-16 rounded-lg" />
          </div>
              <span className="font-semibold">Roburna</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Roburna Tracker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
