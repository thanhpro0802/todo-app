export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
    id: string;
    text: string;
    completed: boolean;
}

export interface Task {
    id: string;
    userId: string; // Owner of the task
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
    order?: number; // for drag & drop ordering
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    sharedWith?: string[]; // Array of user IDs for shared tasks
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