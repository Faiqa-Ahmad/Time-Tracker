import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'accent' | 'success' | 'warning';
  delay?: number;
}

const variantStyles = {
  default: {
    icon: 'bg-secondary text-secondary-foreground',
    card: '',
  },
  accent: {
    icon: 'bg-accent/10 text-accent',
    card: 'border-accent/20',
  },
  success: {
    icon: 'bg-success/10 text-success',
    card: 'border-success/20',
  },
  warning: {
    icon: 'bg-warning/10 text-warning',
    card: 'border-warning/20',
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  delay = 0,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        "stat-card rounded-xl bg-card border p-5",
        styles.card
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              "mt-2 inline-flex items-center text-xs font-medium",
              trend.isPositive ? "text-success" : "text-destructive"
            )}>
              <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className="ml-1 text-muted-foreground">vs last week</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", styles.icon)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}
