import { OrganizationPlan } from '@/contexts/OrganizationContext';
import { cn } from '@/lib/utils';
import { Crown, Zap, TrendingUp, Gift } from 'lucide-react';

interface PlanBadgeProps {
  plan: OrganizationPlan;
  className?: string;
  showIcon?: boolean;
}

const planConfig = {
  free: {
    label: 'Free',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    icon: Gift,
  },
  starter: {
    label: 'Starter',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    icon: Zap,
  },
  professional: {
    label: 'Professional',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    icon: TrendingUp,
  },
  enterprise: {
    label: 'Enterprise',
    color: 'bg-amber-100 text-amber-700 border-amber-300',
    icon: Crown,
  },
};

export function PlanBadge({ plan, className, showIcon = true }: PlanBadgeProps) {
  const config = planConfig[plan];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border',
        config.color,
        className
      )}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      {config.label}
    </span>
  );
}
