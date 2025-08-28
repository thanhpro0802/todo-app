export * from './Task';
export * from './Priority';
export * from './Category';
export * from './Analytics';

// Import types for use in this file
import { Priority } from './Priority';
import { Task } from './Task';
import { Category } from './Category';

// Common types
export interface FilterOptions {
  priority?: Priority;
  categoryId?: string;
  tagId?: string;
  completed?: boolean;
  dueDateRange?: {
    start?: Date;
    end?: Date;
  };
  overdue?: boolean;
}

export interface SortOptions {
  field: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'text';
  direction: 'asc' | 'desc';
}

export interface SearchOptions {
  query: string;
  includeDescription: boolean;
  includeTags: boolean;
}

// Theme types
export type Theme = 'light' | 'dark' | 'auto';

export interface ThemeConfig {
  theme: Theme;
  primaryColor: string;
  accentColor: string;
}

// Export/Import types
export interface ExportData {
  tasks: Task[];
  categories: Category[];
  exportDate: Date;
  version: string;
}

// Settings types
export interface AppSettings {
  theme: ThemeConfig;
  notifications: {
    enabled: boolean;
    dueDateReminders: boolean;
    dailyReminders: boolean;
  };
  productivity: {
    enableTimeTracking: boolean;
    enableAnalytics: boolean;
    workingHours: {
      start: string;
      end: string;
    };
  };
  display: {
    showSubtasks: boolean;
    showCategories: boolean;
    showPriorities: boolean;
    compactMode: boolean;
  };
}