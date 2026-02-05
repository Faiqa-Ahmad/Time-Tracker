import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export interface TimeSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  description: string;
  projectId?: string;
  projectName?: string;
  isBillable: boolean;
  isBreak?: boolean;
  breakNote?: string;
}

interface TimeTrackingContextType {
  currentSession: TimeSession | null;
  sessions: TimeSession[];
  isTracking: boolean;
  elapsedSeconds: number;
  startSession: (description: string, projectId?: string, projectName?: string, isBillable?: boolean) => void;
  stopSession: (endNote?: string) => void;
  addBreak: (note?: string) => void;
  getTodayHours: () => number;
  getWeekHours: () => number;
}

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined);

export function TimeTrackingProvider({ children }: { children: ReactNode }) {
  const [currentSession, setCurrentSession] = useState<TimeSession | null>(null);
  const [sessions, setSessions] = useState<TimeSession[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (currentSession && !currentSession.endTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - currentSession.startTime.getTime()) / 1000);
        setElapsedSeconds(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentSession]);

  const startSession = useCallback((
    description: string,
    projectId?: string,
    projectName?: string,
    isBillable: boolean = false
  ) => {
    const newSession: TimeSession = {
      id: Date.now().toString(),
      userId: '1', // Would come from auth context in real app
      startTime: new Date(),
      description,
      projectId,
      projectName,
      isBillable,
    };
    setCurrentSession(newSession);
    setElapsedSeconds(0);
  }, []);

  const stopSession = useCallback((endNote?: string) => {
    if (currentSession) {
      const completedSession: TimeSession = {
        ...currentSession,
        endTime: new Date(),
        description: endNote ? `${currentSession.description} - ${endNote}` : currentSession.description,
      };
      setSessions(prev => [completedSession, ...prev]);
      setCurrentSession(null);
      setElapsedSeconds(0);
    }
  }, [currentSession]);

  const addBreak = useCallback((note?: string) => {
    // For now, just log the break as a note
    if (currentSession) {
      setCurrentSession({
        ...currentSession,
        breakNote: note,
      });
    }
  }, [currentSession]);

  const getTodayHours = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let totalSeconds = 0;
    
    sessions.forEach(session => {
      if (session.startTime >= today && session.endTime) {
        totalSeconds += (session.endTime.getTime() - session.startTime.getTime()) / 1000;
      }
    });
    
    // Add current session if active
    if (currentSession && currentSession.startTime >= today) {
      totalSeconds += elapsedSeconds;
    }
    
    return totalSeconds / 3600;
  }, [sessions, currentSession, elapsedSeconds]);

  const getWeekHours = useCallback(() => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    let totalSeconds = 0;
    
    sessions.forEach(session => {
      if (session.startTime >= weekStart && session.endTime) {
        totalSeconds += (session.endTime.getTime() - session.startTime.getTime()) / 1000;
      }
    });
    
    // Add current session if active
    if (currentSession && currentSession.startTime >= weekStart) {
      totalSeconds += elapsedSeconds;
    }
    
    return totalSeconds / 3600;
  }, [sessions, currentSession, elapsedSeconds]);

  const value: TimeTrackingContextType = {
    currentSession,
    sessions,
    isTracking: !!currentSession,
    elapsedSeconds,
    startSession,
    stopSession,
    addBreak,
    getTodayHours,
    getWeekHours,
  };

  return <TimeTrackingContext.Provider value={value}>{children}</TimeTrackingContext.Provider>;
}

export function useTimeTracking() {
  const context = useContext(TimeTrackingContext);
  if (context === undefined) {
    throw new Error('useTimeTracking must be used within a TimeTrackingProvider');
  }
  return context;
}
