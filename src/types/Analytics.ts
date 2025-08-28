export interface TimeTracking {
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  startTime?: Date;
  endTime?: Date;
}

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export interface TaskAnalytics {
  completionRate: number;
  averageCompletionTime: number;
  totalTasksCompleted: number;
  streak: number;
  productivityScore: number;
}