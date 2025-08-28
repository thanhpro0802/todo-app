export const DEFAULT_CATEGORIES = [
  { id: 'work', name: 'Work', color: '#3B82F6' },
  { id: 'personal', name: 'Personal', color: '#10B981' },
  { id: 'shopping', name: 'Shopping', color: '#F59E0B' },
  { id: 'health', name: 'Health', color: '#EF4444' },
  { id: 'learning', name: 'Learning', color: '#8B5CF6' },
] as const;

export const KEYBOARD_SHORTCUTS = {
  ADD_TASK: ['cmd+n', 'ctrl+n'],
  SEARCH: ['cmd+f', 'ctrl+f'],
  TOGGLE_THEME: ['cmd+shift+t', 'ctrl+shift+t'],
  DELETE_COMPLETED: ['cmd+shift+d', 'ctrl+shift+d'],
} as const;

export const LOCAL_STORAGE_KEYS = {
  TASKS: 'todo-tasks',
  CATEGORIES: 'todo-categories',
  FILTER_PRESETS: 'todo-filter-presets',
  THEME: 'todo-theme',
  SETTINGS: 'todo-settings',
} as const;