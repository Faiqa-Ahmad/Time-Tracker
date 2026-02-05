import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout, PageHeader } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FolderKanban, Clock, Calendar, Eye, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold';
  totalHours: number;
  targetHours: number;
  deadline: string;
  color: string;
}

const DUMMY_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website with modern design',
    status: 'active',
    totalHours: 45.5,
    targetHours: 80,
    deadline: '2026-03-15',
    color: 'hsl(var(--primary))',
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Cross-platform mobile application for customer engagement',
    status: 'active',
    totalHours: 120,
    targetHours: 200,
    deadline: '2026-04-30',
    color: 'hsl(var(--success))',
  },
  {
    id: '3',
    name: 'Internal Tools',
    description: 'Building internal productivity and management tools',
    status: 'on-hold',
    totalHours: 32,
    targetHours: 60,
    deadline: '2026-05-01',
    color: 'hsl(var(--warning))',
  },
  {
    id: '4',
    name: 'API Integration',
    description: 'Third-party API integrations for payment and analytics',
    status: 'completed',
    totalHours: 55,
    targetHours: 50,
    deadline: '2026-01-20',
    color: 'hsl(var(--accent))',
  },
];

export default function Projects() {
  const { user } = useAuth();
  // In a real app, filter projects assigned to the current user
  // For now, showing all projects as demo data
  const [projects] = useState<Project[]>(DUMMY_PROJECTS);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { toast } = useToast();

  const handleViewClick = (project: Project) => {
    setSelectedProject(project);
    setIsViewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'on-hold': return 'outline';
      default: return 'default';
    }
  };

  return (
    <AppLayout>
      <PageHeader 
        title="My Projects" 
        description="View projects assigned to you by your organization"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Total Projects</div>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Active</div>
            <div className="text-2xl font-bold">{projects.filter(p => p.status === 'active').length}</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Completed</div>
            <div className="text-2xl font-bold">{projects.filter(p => p.status === 'completed').length}</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Total Hours</div>
            <div className="text-2xl font-bold">{projects.reduce((sum, p) => sum + p.totalHours, 0).toFixed(1)}h</div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="card-modern h-full">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${project.color}20` }}
                  >
                    <FolderKanban className="w-5 h-5" style={{ color: project.color }} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{project.name}</CardTitle>
                    <Badge variant={getStatusColor(project.status)} className="mt-1 capitalize">
                      {project.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => handleViewClick(project)}
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {project.description}
                </p>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {project.totalHours}h / {project.targetHours}h
                      </span>
                    </div>
                    <Progress 
                      value={Math.min((project.totalHours / project.targetHours) * 100, 100)} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {project.totalHours}h logged
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {project.deadline}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* View Dialog - Read-only for employees */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${selectedProject?.color}20` }}
              >
                <FolderKanban className="w-5 h-5" style={{ color: selectedProject?.color }} />
              </div>
              <div>
                <DialogTitle>{selectedProject?.name}</DialogTitle>
                <DialogDescription>
                  Assigned project - View only
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-6 py-4">
              {/* Info Banner */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Info className="w-4 h-4 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-primary">Read-only Access</p>
                  <p className="text-muted-foreground">This project was assigned to you by your organization. Contact your admin to request changes.</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">Description</p>
                <p className="text-foreground">{selectedProject.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">Status</p>
                  <Badge variant={getStatusColor(selectedProject.status)} className="capitalize">
                    {selectedProject.status.replace('-', ' ')}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground font-medium">Deadline</p>
                  <p className="font-medium">{selectedProject.deadline}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Progress</span>
                  <span className="font-medium">
                    {Math.round((selectedProject.totalHours / selectedProject.targetHours) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={Math.min((selectedProject.totalHours / selectedProject.targetHours) * 100, 100)} 
                  className="h-3"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-success/5 border-success/20">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">Hours Logged</span>
                    </div>
                    <p className="text-2xl font-bold text-success">{selectedProject.totalHours}h</p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">Target Hours</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">{selectedProject.targetHours}h</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
