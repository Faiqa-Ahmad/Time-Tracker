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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  FolderKanban, 
  Plus, 
  Clock, 
  Users, 
  Calendar,
  MoreVertical,
  Edit,
  Archive,
  Trash2,
  UserPlus,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold' | 'archived';
  totalHours: number;
  budget: number;
  deadline: string;
  team: { id: string; name: string; avatar: string }[];
  createdAt: string;
}

const DUMMY_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website with modern design and improved UX',
    status: 'active',
    totalHours: 245,
    budget: 50000,
    deadline: '2026-03-15',
    team: [
      { id: '2', name: 'Sarah Miller', avatar: 'S' },
      { id: '3', name: 'John Smith', avatar: 'J' },
    ],
    createdAt: '2025-12-01',
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Cross-platform mobile application for iOS and Android',
    status: 'active',
    totalHours: 520,
    budget: 120000,
    deadline: '2026-06-30',
    team: [
      { id: '2', name: 'Sarah Miller', avatar: 'S' },
      { id: '3', name: 'John Smith', avatar: 'J' },
      { id: '6', name: 'Jessica Taylor', avatar: 'J' },
    ],
    createdAt: '2025-10-01',
  },
  {
    id: '3',
    name: 'Internal Tools Suite',
    description: 'Building productivity tools for internal team use',
    status: 'on-hold',
    totalHours: 89,
    budget: 25000,
    deadline: '2026-08-01',
    team: [
      { id: '2', name: 'Sarah Miller', avatar: 'S' },
    ],
    createdAt: '2026-01-15',
  },
  {
    id: '4',
    name: 'API Integration Platform',
    description: 'Third-party API integrations for payments and analytics',
    status: 'completed',
    totalHours: 180,
    budget: 35000,
    deadline: '2026-01-20',
    team: [
      { id: '3', name: 'John Smith', avatar: 'J' },
    ],
    createdAt: '2025-09-01',
  },
];

// Mock available team members (in real app, fetch from organization)
const AVAILABLE_TEAM_MEMBERS = [
  { id: '1', name: 'Alex Johnson', avatar: 'A', department: 'Management' },
  { id: '2', name: 'Sarah Miller', avatar: 'S', department: 'Engineering' },
  { id: '3', name: 'John Smith', avatar: 'J', department: 'Design' },
  { id: '6', name: 'Jessica Taylor', avatar: 'J', department: 'Sales' },
  { id: '4', name: 'Emily Brown', avatar: 'E', department: 'Marketing' },
  { id: '5', name: 'Michael Lee', avatar: 'M', department: 'Engineering' },
];

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>(DUMMY_PROJECTS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({ name: '', description: '', budget: '', deadline: '', teamIds: [] as string[] });
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    budget: '',
    deadline: '',
    status: 'active' as Project['status'],
  });
  const { toast } = useToast();
  const { currentOrganization } = useOrganization();

  const handleCreateProject = () => {
    if (newProject.name.trim()) {
      // Get selected team members
      const teamMembers = AVAILABLE_TEAM_MEMBERS
        .filter(m => newProject.teamIds.includes(m.id))
        .map(m => ({ id: m.id, name: m.name, avatar: m.avatar }));
      
      const project: Project = {
        id: Date.now().toString(),
        name: newProject.name,
        description: newProject.description,
        status: 'active',
        totalHours: 0,
        budget: parseInt(newProject.budget) || 0,
        deadline: newProject.deadline || '2026-12-31',
        team: teamMembers,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setProjects([project, ...projects]);
      setNewProject({ name: '', description: '', budget: '', deadline: '', teamIds: [] });
      setIsDialogOpen(false);
      toast({
        title: "Project Created",
        description: `${project.name} has been created and assigned to ${teamMembers.length} team member(s).`,
      });
    }
  };

  const handleArchive = (project: Project) => {
    setProjects(projects.map(p => 
      p.id === project.id ? { ...p, status: 'archived' as const } : p
    ));
    toast({
      title: "Project Archived",
      description: `${project.name} has been archived.`,
    });
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setEditFormData({
      name: project.name,
      description: project.description,
      budget: project.budget.toString(),
      deadline: project.deadline,
      status: project.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedProject) {
      setProjects(projects.map(p => 
        p.id === selectedProject.id 
          ? {
              ...p,
              name: editFormData.name,
              description: editFormData.description,
              budget: parseInt(editFormData.budget) || p.budget,
              deadline: editFormData.deadline,
              status: editFormData.status,
            }
          : p
      ));
      toast({
        title: "Project Updated",
        description: `${editFormData.name} has been updated successfully.`,
      });
      setIsEditDialogOpen(false);
      setSelectedProject(null);
    }
  };

  const handleManageTeam = (project: Project) => {
    setSelectedProject(project);
    setIsTeamDialogOpen(true);
  };

  const handleAddTeamMember = (memberId: string) => {
    if (selectedProject) {
      const member = AVAILABLE_TEAM_MEMBERS.find(m => m.id === memberId);
      if (member && !selectedProject.team.find(t => t.id === memberId)) {
        const updatedTeam = [...selectedProject.team, { id: member.id, name: member.name, avatar: member.avatar }];
        setProjects(projects.map(p => 
          p.id === selectedProject.id ? { ...p, team: updatedTeam } : p
        ));
        setSelectedProject({ ...selectedProject, team: updatedTeam });
        toast({
          title: "Team Member Added",
          description: `${member.name} has been added to the project.`,
        });
      }
    }
  };

  const handleRemoveTeamMember = (memberId: string) => {
    if (selectedProject) {
      const member = selectedProject.team.find(t => t.id === memberId);
      const updatedTeam = selectedProject.team.filter(t => t.id !== memberId);
      setProjects(projects.map(p => 
        p.id === selectedProject.id ? { ...p, team: updatedTeam } : p
      ));
      setSelectedProject({ ...selectedProject, team: updatedTeam });
      toast({
        title: "Team Member Removed",
        description: `${member?.name} has been removed from the project.`,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-success text-white">Active</Badge>;
      case 'completed': return <Badge className="bg-primary">Completed</Badge>;
      case 'on-hold': return <Badge className="bg-warning text-white">On Hold</Badge>;
      case 'archived': return <Badge variant="secondary">Archived</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalHours = projects.reduce((sum, p) => sum + p.totalHours, 0);

  return (
    <AppLayout>
      <PageHeader 
        title={`Project Management - ${currentOrganization?.name || 'Organization'}`}
        description="Create projects and assign them to team members"
      >
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Add a new project for the team to work on.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  placeholder="Enter project name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the project"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget ($)</Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="50000"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newProject.deadline}
                    onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                  />
                </div>
              </div>
              
              {/* Team Assignment */}
              <div className="space-y-2">
                <Label>Assign Team Members</Label>
                <div className="border rounded-lg p-3 max-h-[200px] overflow-y-auto space-y-2">
                  {AVAILABLE_TEAM_MEMBERS.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 transition-colors">
                      <Checkbox
                        checked={newProject.teamIds.includes(member.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewProject({ ...newProject, teamIds: [...newProject.teamIds, member.id] });
                          } else {
                            setNewProject({ ...newProject, teamIds: newProject.teamIds.filter(id => id !== member.id) });
                          }
                        }}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{member.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.department}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {newProject.teamIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {newProject.teamIds.length} member(s) selected
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject}>Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total Projects</span>
            </div>
            <div className="text-2xl font-bold mt-1">{projects.length}</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Active</div>
            <div className="text-2xl font-bold text-success">{projects.filter(p => p.status === 'active').length}</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Total Hours</div>
            <div className="text-2xl font-bold">{totalHours}h</div>
          </CardContent>
        </Card>
        <Card className="card-modern">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Total Budget</div>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Table */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Team</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">Budget</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                        {project.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(project.status)}</TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {project.team.slice(0, 3).map((member) => (
                        <Avatar key={member.id} className="h-7 w-7 border-2 border-background">
                          <AvatarFallback className="text-xs">{member.avatar}</AvatarFallback>
                        </Avatar>
                      ))}
                      {project.team.length > 3 && (
                        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                          +{project.team.length - 3}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{project.totalHours}h</TableCell>
                  <TableCell className="text-right">${project.budget.toLocaleString()}</TableCell>
                  <TableCell>{project.deadline}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditProject(project)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleManageTeam(project)}>
                          <Users className="w-4 h-4 mr-2" />
                          Manage Team
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleArchive(project)}>
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update project information and details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Project Name</Label>
              <Input
                id="editName"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Enter project name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Describe the project"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editBudget">Budget ($)</Label>
                <Input
                  id="editBudget"
                  type="number"
                  value={editFormData.budget}
                  onChange={(e) => setEditFormData({ ...editFormData, budget: e.target.value })}
                  placeholder="50000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDeadline">Deadline</Label>
                <Input
                  id="editDeadline"
                  type="date"
                  value={editFormData.deadline}
                  onChange={(e) => setEditFormData({ ...editFormData, deadline: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editStatus">Status</Label>
              <Select 
                value={editFormData.status} 
                onValueChange={(value: Project['status']) => 
                  setEditFormData({ ...editFormData, status: value })
                }
              >
                <SelectTrigger id="editStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Team Dialog */}
      <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[600px]">
          <DialogHeader>
            <DialogTitle>Manage Team - {selectedProject?.name}</DialogTitle>
            <DialogDescription>
              Add or remove team members from this project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4 overflow-y-auto">
            {/* Current Team Members */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Current Team ({selectedProject?.team.length || 0})</h4>
              </div>
              {selectedProject && selectedProject.team.length > 0 ? (
                <div className="space-y-2">
                  {selectedProject.team.map((member) => (
                    <div 
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{member.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {AVAILABLE_TEAM_MEMBERS.find(m => m.id === member.id)?.department}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTeamMember(member.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No team members assigned yet</p>
                </div>
              )}
            </div>

            {/* Available Team Members */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Available Team Members</h4>
              </div>
              <div className="space-y-2 max-h-[250px] overflow-y-auto">
                {AVAILABLE_TEAM_MEMBERS.filter(
                  member => !selectedProject?.team.find(t => t.id === member.id)
                ).map((member) => (
                  <div 
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{member.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.department}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTeamMember(member.id)}
                      className="gap-1"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsTeamDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
