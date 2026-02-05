'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout, PageHeader } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  DollarSign, 
  CreditCard,
  TrendingUp,
  Download,
  Search,
  MoreVertical,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';

interface Subscription {
  id: string;
  organizationName: string;
  organizationId: string;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  price: number;
  seats: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  mrr: number;
}

const MOCK_SUBSCRIPTIONS: Subscription[] = [
  { id: 'sub-1', organizationName: 'Roburna Labs', organizationId: 'org-1', plan: 'professional', status: 'active', price: 79, seats: 12, billingCycle: 'monthly', nextBillingDate: '2026-03-01', mrr: 79 },
  { id: 'sub-3', organizationName: 'Quantum Labs', organizationId: 'org-3', plan: 'professional', status: 'trialing', price: 79, seats: 8, billingCycle: 'monthly', nextBillingDate: '2026-02-16', mrr: 0 },
  { id: 'sub-4', organizationName: 'MegaCorp Inc', organizationId: 'org-4', plan: 'enterprise', status: 'active', price: 299, seats: 45, billingCycle: 'yearly', nextBillingDate: '2027-01-30', mrr: 299 },
  { id: 'sub-5', organizationName: 'StartupXYZ', organizationId: 'org-5', plan: 'starter', status: 'past_due', price: 29, seats: 3, billingCycle: 'monthly', nextBillingDate: '2026-01-15', mrr: 29 },
];

export default function BillingSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(MOCK_SUBSCRIPTIONS);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const totalMRR = subscriptions.filter(s => s.status === 'active').reduce((acc, s) => acc + s.mrr, 0);
  const totalARR = totalMRR * 12;
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active' || s.status === 'trialing').length;
  const pastDueCount = subscriptions.filter(s => s.status === 'past_due').length;

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.organizationName.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = filterPlan === 'all' || sub.plan === filterPlan;
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleViewSubscription = (sub: Subscription) => {
    setSelectedSub(sub);
    setDetailDialogOpen(true);
  };

  const handleChangePlan = (subId: string, newPlan: string) => {
    setSubscriptions(subscriptions.map(s => 
      s.id === subId ? { ...s, plan: newPlan as any } : s
    ));
    toast.success('Plan updated successfully');
  };

  const handleCancelSubscription = (subId: string, orgName: string) => {
    setSubscriptions(subscriptions.map(s => 
      s.id === subId ? { ...s, status: 'cancelled' as const } : s
    ));
    toast.success(`Subscription cancelled for ${orgName}`);
  };

  const handleRetryPayment = (subId: string, orgName: string) => {
    setSubscriptions(subscriptions.map(s => 
      s.id === subId ? { ...s, status: 'active' as const } : s
    ));
    toast.success(`Payment retry initiated for ${orgName}`);
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'professional': return 'bg-primary/10 text-primary border-primary/20';
      case 'starter': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success border-success/20';
      case 'trialing': return 'bg-primary/10 text-primary border-primary/20';
      case 'past_due': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'cancelled': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Billing & Subscriptions"
        description="Manage platform billing and subscription plans"
      >
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </PageHeader>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Monthly Recurring Revenue"
          value={`$${totalMRR.toLocaleString()}`}
          trend={{ value: 8, isPositive: true }}
          icon={DollarSign}
          delay={0}
        />
        <StatCard
          title="Annual Recurring Revenue"
          value={`$${totalARR.toLocaleString()}`}
          icon={TrendingUp}
          variant="accent"
          delay={0.1}
        />
        <StatCard
          title="Active Subscriptions"
          value={activeSubscriptions}
          subtitle={`${subscriptions.length} total`}
          icon={CheckCircle}
          variant="success"
          delay={0.2}
        />
        <StatCard
          title="Past Due"
          value={pastDueCount}
          subtitle="Requires attention"
          icon={AlertCircle}
          variant="warning"
          delay={0.3}
        />
      </div>

      <Tabs defaultValue="subscriptions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="subscriptions" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Subscriptions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search organizations..."
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={filterPlan} onValueChange={setFilterPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trialing">Trialing</SelectItem>
                    <SelectItem value="past_due">Past Due</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Subscriptions Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  All Subscriptions ({filteredSubscriptions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Organization</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Plan</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Price</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Seats</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Next Billing</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">MRR</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubscriptions.map((sub) => (
                        <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{sub.organizationName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className={getPlanBadgeColor(sub.plan)}>
                              {sub.plan}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className={getStatusBadgeColor(sub.status)}>
                              {sub.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 font-medium">
                            ${sub.price}/{sub.billingCycle === 'monthly' ? 'mo' : 'yr'}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {sub.seats} users
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {new Date(sub.nextBillingDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-medium">
                            ${sub.mrr}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewSubscription(sub)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {sub.status === 'past_due' && (
                                  <DropdownMenuItem onClick={() => handleRetryPayment(sub.id, sub.organizationName)}>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Retry Payment
                                  </DropdownMenuItem>
                                )}
                                {sub.status !== 'cancelled' && (
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => handleCancelSubscription(sub.id, sub.organizationName)}
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancel Subscription
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Subscription Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Building2 className="w-6 h-6" />
              {selectedSub?.organizationName}
            </DialogTitle>
            <DialogDescription>Subscription Details</DialogDescription>
          </DialogHeader>
          {selectedSub && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="font-medium capitalize">{selectedSub.plan}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{selectedSub.status}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium">${selectedSub.price}/{selectedSub.billingCycle === 'monthly' ? 'month' : 'year'}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Seats</p>
                  <p className="font-medium">{selectedSub.seats} users</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Next Billing Date</p>
                  <p className="font-medium">{new Date(selectedSub.nextBillingDate).toLocaleDateString()}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">MRR Contribution</p>
                  <p className="font-medium">${selectedSub.mrr}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
