import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimeTracking } from '@/contexts/TimeTrackingContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { Play, Square, Coffee, FileText, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Mock projects
const MOCK_PROJECTS = [
  { id: '1', name: 'Website Redesign' },
  { id: '2', name: 'Mobile App Development' },
  { id: '3', name: 'API Integration' },
  { id: '4', name: 'Client Support' },
];

export function TimeTracker() {
  const { currentSession, isTracking, elapsedSeconds, startSession, stopSession } = useTimeTracking();
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [showBreakDialog, setShowBreakDialog] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [isBillable, setIsBillable] = useState(false);
  const [endNote, setEndNote] = useState('');
  const [breakNote, setBreakNote] = useState('');
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartClick = () => {
    setDescription('');
    setSelectedProject('');
    setIsBillable(false);
    setShowStartDialog(true);
  };

  const handleStartSession = () => {
    if (description.trim().length < 10) {
      toast.error('Please provide a description with at least 10 characters');
      return;
    }
    
    const project = MOCK_PROJECTS.find(p => p.id === selectedProject);
    startSession(description.trim(), selectedProject || undefined, project?.name, isBillable);
    setShowStartDialog(false);
    toast.success('Timer started! Happy working 🚀');
  };

  const handleBreakClick = () => {
    setBreakNote('');
    setShowBreakDialog(true);
  };

  const handleStartBreak = () => {
    setIsOnBreak(true);
    setBreakStartTime(new Date());
    setShowBreakDialog(false);
    toast.info(`Break started${breakNote ? `: ${breakNote}` : ''}. Take your time! ☕`);
  };

  const handleEndBreak = () => {
    if (breakStartTime) {
      const breakDuration = Math.floor((new Date().getTime() - breakStartTime.getTime()) / 60000);
      toast.success(`Break ended. You were away for ${breakDuration} minutes.`);
    }
    setIsOnBreak(false);
    setBreakStartTime(null);
  };

  const handleStopClick = () => {
    if (isOnBreak) {
      handleEndBreak();
    }
    setEndNote('');
    setShowStopDialog(true);
  };

  const handleStopSession = () => {
    stopSession(endNote.trim() || undefined);
    setShowStopDialog(false);
    setIsOnBreak(false);
    setBreakStartTime(null);
    toast.success('Session saved successfully!');
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "rounded-2xl p-6 transition-all duration-300",
          isOnBreak
            ? "bg-gradient-to-br from-warning/10 via-warning/5 to-transparent border-2 border-warning/30"
            : isTracking 
              ? "bg-gradient-to-br from-success/10 via-success/5 to-transparent border-2 border-success/30 shadow-timer" 
              : "bg-card border shadow-soft"
        )}
      >
        {/* Timer Display */}
        <div className="text-center mb-6">
          <motion.div
            key={isTracking ? 'active' : 'idle'}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className={cn(
              "text-5xl md:text-6xl font-mono font-bold timer-display",
              isOnBreak ? "text-warning" : isTracking ? "text-success" : "text-muted-foreground"
            )}
          >
            {formatTime(elapsedSeconds)}
          </motion.div>
          
          <AnimatePresence mode="wait">
            {isTracking && currentSession && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 space-y-2"
              >
                <div className="flex items-center justify-center gap-2">
                  {isOnBreak ? (
                    <>
                      <Coffee className="w-4 h-4 text-warning" />
                      <span className="text-sm font-medium text-warning">On Break</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <span className="text-sm font-medium text-success">Currently Working</span>
                    </>
                  )}
                </div>
                <div className="max-w-md mx-auto">
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    {currentSession.description}
                  </p>
                  {currentSession.projectName && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Project: {currentSession.projectName}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4">
          {!isTracking ? (
            <Button
              size="lg"
              onClick={handleStartClick}
              className="gap-2 px-8 bg-accent hover:bg-accent/90 text-accent-foreground shadow-glow"
            >
              <Play className="w-5 h-5" />
              Clock In
            </Button>
          ) : (
            <>
              {isOnBreak ? (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleEndBreak}
                  className="gap-2 border-warning text-warning hover:bg-warning/10"
                >
                  <Play className="w-5 h-5" />
                  Resume Work
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleBreakClick}
                  className="gap-2"
                >
                  <Coffee className="w-5 h-5" />
                  Take Break
                </Button>
              )}
              <Button
                size="lg"
                onClick={handleStopClick}
                className="gap-2 px-8 bg-destructive hover:bg-destructive/90"
              >
                <Square className="w-5 h-5" />
                Clock Out
              </Button>
            </>
          )}
        </div>
      </motion.div>

      {/* Start Session Dialog */}
      <Dialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-accent" />
              Start Working
            </DialogTitle>
            <DialogDescription>
              What will you be working on? This helps track productivity.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">
                Work Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="e.g., Fixing login page bugs, Designing new dashboard..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 10 characters ({description.length}/10)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Project (Optional)</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_PROJECTS.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label htmlFor="billable">Billable Time</Label>
                <p className="text-xs text-muted-foreground">Mark as billable for payroll</p>
              </div>
              <Switch
                id="billable"
                checked={isBillable}
                onCheckedChange={setIsBillable}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStartDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleStartSession}
              disabled={description.trim().length < 10}
              className="gap-2 bg-accent hover:bg-accent/90"
            >
              <Play className="w-4 h-4" />
              Start Timer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Break Dialog */}
      <Dialog open={showBreakDialog} onOpenChange={setShowBreakDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coffee className="w-5 h-5 text-warning" />
              Take a Break
            </DialogTitle>
            <DialogDescription>
              Taking a break? Your timer will stay running but we'll note you're away.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="breakNote">Break Note (Optional)</Label>
              <Textarea
                id="breakNote"
                placeholder="e.g., Lunch break, Coffee run, Quick walk..."
                value={breakNote}
                onChange={(e) => setBreakNote(e.target.value)}
                className="min-h-[60px] resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBreakDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleStartBreak}
              className="gap-2 bg-warning hover:bg-warning/90 text-warning-foreground"
            >
              <Coffee className="w-4 h-4" />
              Start Break
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stop Session Dialog */}
      <Dialog open={showStopDialog} onOpenChange={setShowStopDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Square className="w-5 h-5 text-destructive" />
              End Session
            </DialogTitle>
            <DialogDescription>
              Add any final notes about what you accomplished.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-mono font-bold">{formatTime(elapsedSeconds)}</span>
              </div>
              {currentSession && (
                <div className="mt-2 pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground">{currentSession.description}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endNote">Additional Notes (Optional)</Label>
              <Textarea
                id="endNote"
                placeholder="Any final notes or accomplishments..."
                value={endNote}
                onChange={(e) => setEndNote(e.target.value)}
                className="min-h-[60px] resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStopDialog(false)}>
              Keep Working
            </Button>
            <Button 
              onClick={handleStopSession}
              className="gap-2 bg-destructive hover:bg-destructive/90"
            >
              <Square className="w-4 h-4" />
              Save & Stop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
