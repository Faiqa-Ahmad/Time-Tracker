'use client';

import { motion } from 'framer-motion';
import { AppLayout, PageHeader } from '@/components/layout/AppLayout';
import { TimeTracker } from '@/components/TimeTracker';
import { useTimeTracking } from '@/contexts/TimeTrackingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, FolderKanban, Calendar } from 'lucide-react';

export default function TimeTracking() {
  const { sessions, currentSession } = useTimeTracking();

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const diffMs = endTime.getTime() - start.getTime();
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Time Tracking"
        description="Clock in, track your work, and manage your sessions"
      />

      {/* Time Tracker */}
      <div className="max-w-2xl mx-auto mb-8">
        <TimeTracker />
      </div>

      {/* Recent Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              Recent Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 && !currentSession ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No sessions yet</p>
                <p className="text-sm">Start tracking time by clicking "Clock In" above</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Current Session */}
                {currentSession && (
                  <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="text-sm font-medium text-success">In Progress</span>
                      </div>
                      <Badge variant="outline" className="text-success border-success/30">
                        {formatDuration(currentSession.startTime)}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-foreground">{currentSession.description}</p>
                      </div>
                      {currentSession.projectName && (
                        <div className="flex items-center gap-2">
                          <FolderKanban className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">{currentSession.projectName}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        Started at {formatTime(currentSession.startTime)}
                        {currentSession.isBillable && (
                          <Badge variant="secondary" className="ml-2 text-xs">Billable</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Completed Sessions */}
                {sessions.map((session) => (
                  <div 
                    key={session.id} 
                    className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {formatTime(session.startTime)} - {session.endTime && formatTime(session.endTime)}
                      </div>
                      <Badge variant="secondary">
                        {formatDuration(session.startTime, session.endTime)}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-foreground">{session.description}</p>
                      </div>
                      {session.projectName && (
                        <div className="flex items-center gap-2">
                          <FolderKanban className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">{session.projectName}</p>
                        </div>
                      )}
                      {session.isBillable && (
                        <Badge variant="outline" className="text-xs">Billable</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AppLayout>
  );
}
