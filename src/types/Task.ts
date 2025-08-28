export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
    id: string;
    text: string;
    completed: boolean;
}

export interface Task {
    id: string;
    text: string;
    description?: string;
    completed: boolean;
    priority: Priority;
    category?: string;
    tags: string[];
    dueDate?: Date;
    timeEstimation?: number; // in minutes
    timeSpent?: number; // in minutes
    subtasks: Subtask[];
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
}

export interface Category {
    id: string;
    name: string;
    color: string;
    createdAt: Date;
}

export interface FilterPreset {
    id: string;
    name: string;
    filters: {
        status?: 'all' | 'pending' | 'completed';
        priority?: Priority[];
        category?: string[];
        tags?: string[];
        dueDateRange?: { start?: Date; end?: Date };
    };
    sort?: {
        field: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'text';
        direction: 'asc' | 'desc';
    };
}