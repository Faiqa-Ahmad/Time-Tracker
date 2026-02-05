'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout, PageHeader } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp,
  Download,
  Calendar,
  Users,
  Clock,
  DollarSign,
  Building2,
  Activity,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

export default function GlobalReports() {
  const [dateRange, setDateRange] = useState('30days');
  const [reportType, setReportType] = useState('overview');

  const handleExport = (format: string) => {
    toast.success(`Exporting report as ${format.toUpperCase()}...`);
  };

  // Mock data
  const stats = {
    totalHours: 48523,
    totalRevenue: 37890,
    activeOrgs: 156,
    totalUsers: 2847,
    hoursGrowth: 15.3,
    revenueGrowth: 12.8,
    orgsGrowth: 8.2,
    usersGrowth: 10.5,
  };

  const topOrganizations = [
    { name: 'MegaCorp Inc', hours: 8234, users: 45, revenue: 299 },
    { name: 'Roburna Labs', hours: 5632, users: 12, revenue: 79 },
    { name: 'Quantum Labs', hours: 3421, users: 8, revenue: 79 },
    { name: 'StartupXYZ', hours: 1543, users: 3, revenue: 29 },
  ];

  const hoursByDepartment = [
    { department: 'Engineering', hours: 18432, percentage: 38 },
    { department: 'Design', hours: 9705, percentage: 20 },
    { department: 'Marketing', hours: 7278, percentage: 15 },
    { department: 'Sales', hours: 6308, percentage: 13 },
    { department: 'Operations', hours: 4852, percentage: 10 },
    { department: 'Other', hours: 1948, percentage: 4 },
  ];

  return (
    <AppLayout>
      <PageHeader 
        title="Global Reports & Analytics"
        description="Platform-wide reporting and insights"
      >
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExport('pdf')} className="gap-2">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
          <Button onClick={() => handleExport('csv')} className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </PageHeader>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Hours Logged"
          value={stats.totalHours.toLocaleString()}
          trend={{ value: stats.hoursGrowth, isPositive: true }}
          icon={Clock}
          delay={0}
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          trend={{ value: stats.revenueGrowth, isPositive: true }}
          icon={DollarSign}
          variant="accent"
          delay={0.1}
        />
        <StatCard
          title="Active Organizations"
          value={stats.activeOrgs}
          trend={{ value: stats.orgsGrowth, isPositive: true }}
          icon={Building2}
          variant="success"
          delay={0.2}
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          trend={{ value: stats.usersGrowth, isPositive: true }}
          icon={Users}
          delay={0.3}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="organizations" className="gap-2">
            <Building2 className="w-4 h-4" />
            Organizations
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="time" className="gap-2">
            <Clock className="w-4 h-4" />
            Time Tracking
          </TabsTrigger>
          <TabsTrigger value="revenue" className="gap-2">
            <DollarSign className="w-4 h-4" />
            Revenue
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6">
            {/* Growth Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Growth Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-muted-foreground">Hour Growth</p>
                        <span className="text-success text-sm font-medium">+{stats.hoursGrowth}%</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Last Month</span>
                          <span className="font-medium">42,134h</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>This Month</span>
                          <span className="font-medium text-primary">48,523h</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-muted-foreground">Revenue Growth</p>
                        <span className="text-success text-sm font-medium">+{stats.revenueGrowth}%</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Last Month</span>
                          <span className="font-medium">$33,580</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>This Month</span>
                          <span className="font-medium text-primary">$37,890</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Top Organizations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Organizations by Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topOrganizations.map((org, index) => (
                      <div key={org.name} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{org.name}</p>
                            <p className="text-sm text-muted-foreground">{org.users} users</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{org.hours.toLocaleString()}h</p>
                          <p className="text-sm text-muted-foreground">${org.revenue}/mo</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Hours by Department */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Hours by Department</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {hoursByDepartment.map((dept) => (
                      <div key={dept.department} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{dept.department}</span>
                          <span className="text-muted-foreground">{dept.hours.toLocaleString()}h ({dept.percentage}%)</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{ width: `${dept.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="organizations">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Organization Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="p-6 rounded-lg bg-muted/50 text-center">
                    <p className="text-3xl font-bold text-primary">{stats.activeOrgs}</p>
                    <p className="text-sm text-muted-foreground mt-1">Total Organizations</p>
                    <p className="text-xs text-success mt-2">+{stats.orgsGrowth}% from last month</p>
                  </div>
                  <div className="p-6 rounded-lg bg-muted/50 text-center">
                    <p className="text-3xl font-bold">18.3</p>
                    <p className="text-sm text-muted-foreground mt-1">Avg Users per Org</p>
                    <p className="text-xs text-success mt-2">+2.4% from last month</p>
                  </div>
                  <div className="p-6 rounded-lg bg-muted/50 text-center">
                    <p className="text-3xl font-bold">$242</p>
                    <p className="text-sm text-muted-foreground mt-1">Avg Revenue per Org</p>
                    <p className="text-xs text-success mt-2">+5.1% from last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="users">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="p-6 rounded-lg bg-muted/50 text-center">
                    <p className="text-3xl font-bold text-primary">{stats.totalUsers.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground mt-1">Total Users</p>
                    <p className="text-xs text-success mt-2">+{stats.usersGrowth}% growth</p>
                  </div>
                  <div className="p-6 rounded-lg bg-muted/50 text-center">
                    <p className="text-3xl font-bold">423</p>
                    <p className="text-sm text-muted-foreground mt-1">Active Today</p>
                    <p className="text-xs text-muted-foreground mt-2">14.9% of total</p>
                  </div>
                  <div className="p-6 rounded-lg bg-muted/50 text-center">
                    <p className="text-3xl font-bold">17.1h</p>
                    <p className="text-sm text-muted-foreground mt-1">Avg Hours per User</p>
                    <p className="text-xs text-success mt-2">This month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="time">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Time Tracking Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="p-6 rounded-lg bg-muted/50 text-center">
                    <p className="text-3xl font-bold text-primary">{stats.totalHours.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground mt-1">Total Hours Logged</p>
                    <p className="text-xs text-success mt-2">+{stats.hoursGrowth}% increase</p>
                  </div>
                  <div className="p-6 rounded-lg bg-muted/50 text-center">
                    <p className="text-3xl font-bold">1,614</p>
                    <p className="text-sm text-muted-foreground mt-1">Hours Per Day</p>
                    <p className="text-xs text-muted-foreground mt-2">Platform average</p>
                  </div>
                  <div className="p-6 rounded-lg bg-muted/50 text-center">
                    <p className="text-3xl font-bold">8.2h</p>
                    <p className="text-sm text-muted-foreground mt-1">Peak Hour Window</p>
                    <p className="text-xs text-muted-foreground mt-2">9 AM - 5 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="revenue">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="p-6 rounded-lg bg-muted/50 text-center">
                    <p className="text-3xl font-bold text-primary">${stats.totalRevenue.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground mt-1">Monthly Recurring Revenue</p>
                    <p className="text-xs text-success mt-2">+{stats.revenueGrowth}% growth</p>
                  </div>
                  <div className="p-6 rounded-lg bg-muted/50 text-center">
                    <p className="text-3xl font-bold">${(stats.totalRevenue * 12).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground mt-1">Annual Recurring Revenue</p>
                    <p className="text-xs text-success mt-2">Projected</p>
                  </div>
                  <div className="p-6 rounded-lg bg-muted/50 text-center">
                    <p className="text-3xl font-bold">98.8%</p>
                    <p className="text-sm text-muted-foreground mt-1">Retention Rate</p>
                    <p className="text-xs text-success mt-2">Last 90 days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
