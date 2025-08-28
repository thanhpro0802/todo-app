export interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt'>[] = [
  {
    name: 'Work',
    color: '#3B82F6',
    description: 'Work-related tasks'
  },
  {
    name: 'Personal',
    color: '#10B981',
    description: 'Personal tasks and activities'
  },
  {
    name: 'Shopping',
    color: '#F59E0B',
    description: 'Shopping and errands'
  },
  {
    name: 'Health',
    color: '#EF4444',
    description: 'Health and fitness related'
  }
];