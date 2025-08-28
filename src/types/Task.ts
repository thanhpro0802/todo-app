import { Priority } from './Priority';
import { Tag } from './Category';
import { TimeTracking, Subtask } from './Analytics';

export interface Task {
    id: string;
    text: string;
    description?: string;
    completed: boolean;
    priority: Priority;
    categoryId?: string;
    tags: Tag[];
    dueDate?: Date;
    timeTracking: TimeTracking;
    subtasks: Subtask[];
    createdAt: Date;
    updatedAt: Date;
}

// Keep backward compatibility with existing data
export interface LegacyTask {
    id: string;
    text: string;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Migration utility to convert legacy tasks to new format
export function migrateLegacyTask(legacyTask: LegacyTask): Task {
    return {
        ...legacyTask,
        description: undefined,
        priority: 'medium' as Priority,
        categoryId: undefined,
        tags: [],
        dueDate: undefined,
        timeTracking: {},
        subtasks: []
    };
}