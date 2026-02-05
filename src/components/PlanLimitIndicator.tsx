import { useOrganization } from '@/contexts/OrganizationContext';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function PlanLimitIndicator() {
  const { currentOrganization } = useOrganization();

  if (!currentOrganization) return null;

  const { memberCount, maxMembers, plan } = currentOrganization;
  const usagePercentage = (memberCount / maxMembers) * 100;
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = memberCount >= maxMembers;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Team Members</span>
        </div>
        <span className="font-medium">
          {memberCount} / {maxMembers === 999 ? 'Unlimited' : maxMembers}
        </span>
      </div>

      {maxMembers !== 999 && (
        <>
          <Progress value={usagePercentage} className="h-2" />

          {isAtLimit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>You've reached your member limit.</span>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/organization/settings">Upgrade Plan</Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {isNearLimit && !isAtLimit && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>You're approaching your member limit.</span>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/organization/settings">Upgrade Plan</Link>
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}
