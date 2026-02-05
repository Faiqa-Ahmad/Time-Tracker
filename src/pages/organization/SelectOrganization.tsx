import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Users, ChevronRight, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOrganization, Organization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';

export default function SelectOrganization() {
  const navigate = useNavigate();
  const { organizations, setCurrentOrganization, isOrgOwner } = useOrganization();
  const { isAdmin, isSuperAdmin } = useAuth();

  const handleSelectOrg = (org: Organization) => {
    setCurrentOrganization(org);
    navigate(isAdmin ? '/admin' : '/dashboard');
  };

  const getPlanBadgeColor = (plan: Organization['plan']) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'professional': return 'bg-primary/10 text-primary border-primary/20';
      case 'starter': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl"
      >
        <Card className="border-border/50">
          <CardHeader className="text-center">
            <div  className='flex justify-center items-center mb-4'>
            <img src="/roburna_labs.jpg" alt="Roburna" className="w-16 h-16 rounded-lg" />
          </div>
            <CardTitle className="text-xl">Select Organization</CardTitle>
            <CardDescription>
              {isOrgOwner || isSuperAdmin 
                ? 'Choose an organization to continue or create a new one'
                : 'Choose an organization to continue'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {organizations.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No organizations yet</p>
                <p className="text-sm text-muted-foreground">Create your first organization to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {organizations.map((org, index) => (
                  <motion.button
                    key={org.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelectOrg(org)}
                    className="w-full p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {org.logo ? (
                          <img src={org.logo} alt={org.name} className="w-8 h-8 rounded" />
                        ) : (
                          <Building2 className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{org.name}</h3>
                          <Badge variant="outline" className={getPlanBadgeColor(org.plan)}>
                            {org.plan}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {org.memberCount} members
                          </span>
                          <span>•</span>
                          <span>{org.slug}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Only owners and super admins can create organizations */}
            {(isOrgOwner || isSuperAdmin) && (
              <div className="pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => navigate('/create-organization')}
                >
                  <Plus className="w-4 h-4" />
                  Create New Organization
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
