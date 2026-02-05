import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTimeTracking } from '@/contexts/TimeTrackingContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import {
  LayoutDashboard,
  Clock,
  Calendar,
  FolderKanban,
  CalendarOff,
  FileBarChart,
  Settings,
  Users,
  ClipboardList,
  LogOut,
  Timer,
  ChevronLeft,
  Menu,
  Building2,
  ChevronDown,
  Check,
  Plus,
  Globe,
  DollarSign,
  HelpCircle,
  BarChart3,
  Eye,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const userNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Clock, label: 'Time Tracking', href: '/time-tracking' },
  { icon: Calendar, label: 'Time Logs', href: '/time-logs' },
  { icon: FolderKanban, label: 'My Projects', href: '/projects' },
  { icon: CalendarOff, label: 'Time Off', href: '/time-off' },
  { icon: FileBarChart, label: 'My Reports', href: '/reports' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

const adminNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Users, label: 'User Management', href: '/admin/users' },
  { icon: Clock, label: 'Time Management', href: '/admin/time' },
  { icon: FolderKanban, label: 'Projects', href: '/admin/projects' },
  { icon: CalendarOff, label: 'Time Off', href: '/admin/time-off' },
  { icon: FileBarChart, label: 'Reports', href: '/admin/reports' },
  { icon: ClipboardList, label: 'Audit Logs', href: '/admin/audit' },
  { icon: Building2, label: 'Organization', href: '/organization/settings' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

const superAdminNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Platform Dashboard', href: '/superadmin' },
  { icon: Users, label: 'Global Users', href: '/superadmin/users' },
  { icon: DollarSign, label: 'Billing & Subscriptions', href: '/superadmin/billing' },
  { icon: BarChart3, label: 'Global Reports', href: '/superadmin/reports' },
  { icon: Settings, label: 'System Settings', href: '/superadmin/settings' },
  { icon: HelpCircle, label: 'Support Tools', href: '/superadmin/support' },
];

export function Sidebar() {
  const { user, logout, isAdmin, isSuperAdmin, currentView, isImpersonating, stopImpersonation } = useAuth();
  const { isTracking, elapsedSeconds } = useTimeTracking();
  const { organizations, currentOrganization, setCurrentOrganization } = useOrganization();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  // Manager-restricted routes (only full admin can access)
  const fullAdminOnlyRoutes = ['/admin/users', '/admin/audit', '/admin/settings', '/organization/settings'];

  // Filter admin nav items for managers
  const getAdminNavItems = () => {
    if (user?.role === 'manager') {
      return adminNavItems.filter(item => !fullAdminOnlyRoutes.includes(item.href));
    }
    return adminNavItems;
  };

  // Determine navItems based on currentView for multi-role users
  const navItems = isSuperAdmin && !isImpersonating
    ? superAdminNavItems 
    : (isAdmin && currentView === 'admin') 
      ? getAdminNavItems() 
      : userNavItems;

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOrgSelect = (org: typeof currentOrganization) => {
    setCurrentOrganization(org);
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar flex flex-col transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-border">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
              <img src="/roburna_labs.jpg" alt="Roburna" className="w-5 h-5" />
            <span className="font-semibold text-sidebar-foreground">Roburna</span>
          </motion.div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
      </div>
      {isImpersonating && !collapsed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-3 mt-3 p-3 rounded-lg bg-warning/10 border-2 border-warning/30"
        >
          <div className="flex items-start gap-2">
            <Eye className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-warning">Impersonation Mode</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Viewing {currentOrganization?.name} as {currentView === 'admin' ? 'Admin' : 'Employee'}
              </p>
              <p className="text-xs text-warning/80 mt-1">Read-Only Access</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2 text-xs h-7 border-warning/30 hover:bg-warning/20"
            onClick={() => {
              stopImpersonation();
              navigate('/superadmin');
            }}
          >
            <X className="w-3 h-3 mr-1" />
            Exit Impersonation
          </Button>
        </motion.div>
      )}

      {/* Organization Display - Only for non-superadmins */}
      {!isSuperAdmin && !collapsed && (
        <div className="px-3 py-3 border-b border-sidebar-border">
          {/* For Admins: Show organization info only (no switcher) */}
          {isAdmin && (
            <div className="w-full h-auto py-2 px-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {currentOrganization?.name || 'Your Organization'}
                  </p>
                  <p className="text-xs text-white truncate">
                    {currentOrganization?.memberCount || 0} members • Admin
                  </p>
                </div>
              </div>
            </div>
          )}
          {!isAdmin && (
            <div className="w-full h-auto py-2 px-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {currentOrganization?.name || 'Your Organization'}
                  </p>
                  <p className="text-xs text-white truncate">
                    {currentOrganization?.memberCount || 0} members • Employee
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Super Admin Badge */}
      {isSuperAdmin && !collapsed && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center gap-2 text-xs text-purple-400">
            <Globe className="w-4 h-4" />
            <span>Platform Administration</span>
          </div>
        </div>
      )}

      {/* Timer Status */}
      {isTracking && !isSuperAdmin && (
        <div className={cn(
          "mx-3 mt-4 rounded-lg bg-success/10 border border-success/20 overflow-hidden",
          collapsed ? "p-2" : "p-3"
        )}>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-success animate-ping opacity-75" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs text-success font-medium">Tracking</p>
                <p className="text-lg font-mono font-bold text-sidebar-foreground timer-display">
                  {formatTime(elapsedSeconds)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.href + item.label}>
                <Link
                  to={item.href}
                  className={cn(
                    "nav-item",
                    isActive && "active",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-sidebar-primary-foreground")} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className={cn(
        "border-t border-sidebar-border p-3",
        collapsed ? "flex justify-center" : ""
      )}>
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "flex-col"
        )}>
          <Avatar className="w-9 h-9 border-2 border-sidebar-border">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-sm">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name}
              </p>
              <p className="text-xs text-sidebar-muted truncate capitalize">
                {user?.role}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-sidebar-muted hover:text-destructive hover:bg-sidebar-accent flex-shrink-0"
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>
    </motion.aside>
  );
}
