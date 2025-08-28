import { Task, Priority } from '../types';

export interface CreateTaskData {
  text: string;
  description?: string;
  priority?: Priority;
  categoryId?: string;
  dueDate?: Date;
}

export function createTask(data: CreateTaskData): Task {
  return {
    id: Date.now().toString(),
    text: data.text,
    description: data.description,
    completed: false,
    priority: data.priority || 'medium',
    categoryId: data.categoryId,
    tags: [],
    dueDate: data.dueDate,
    timeTracking: {},
    subtasks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function createQuickTask(text: string): Task {
  return createTask({ text });
}