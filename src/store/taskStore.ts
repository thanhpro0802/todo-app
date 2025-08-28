import { create } from 'zustand';
import { Task, Category, Tag, FilterOptions, SortOptions, LegacyTask, migrateLegacyTask } from '../types';

interface TaskStore {
  // State
  tasks: Task[];
  categories: Category[];
  tags: Tag[];
  filter: FilterOptions;
  sort: SortOptions;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  clearCompleted: () => void;
  
  // Category actions
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  // Tag actions
  addTag: (tag: Omit<Tag, 'id'>) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  
  // Filter and search actions
  setFilter: (filter: Partial<FilterOptions>) => void;
  setSort: (sort: SortOptions) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  
  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Data persistence
  loadFromLocalStorage: () => void;
  saveToLocalStorage: () => void;
  
  // Migration
  migrateLegacyData: () => void;
}

const defaultSort: SortOptions = {
  field: 'createdAt',
  direction: 'desc'
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  // Initial state
  tasks: [],
  categories: [],
  tags: [],
  filter: {},
  sort: defaultSort,
  searchQuery: '',
  isLoading: false,
  error: null,

  // Task actions
  addTask: (taskData) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state) => ({
      tasks: [...state.tasks, newTask],
      error: null
    }));
    
    get().saveToLocalStorage();
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      ),
      error: null
    }));
    
    get().saveToLocalStorage();
  },

  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
      error: null
    }));
    
    get().saveToLocalStorage();
  },

  toggleTask: (id) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed, updatedAt: new Date() }
          : task
      ),
      error: null
    }));
    
    get().saveToLocalStorage();
  },

  clearCompleted: () => {
    set((state) => ({
      tasks: state.tasks.filter((task) => !task.completed),
      error: null
    }));
    
    get().saveToLocalStorage();
  },

  // Category actions
  addCategory: (categoryData) => {
    const newCategory: Category = {
      ...categoryData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    set((state) => ({
      categories: [...state.categories, newCategory],
      error: null
    }));
    
    get().saveToLocalStorage();
  },

  updateCategory: (id, updates) => {
    set((state) => ({
      categories: state.categories.map((category) =>
        category.id === id ? { ...category, ...updates } : category
      ),
      error: null
    }));
    
    get().saveToLocalStorage();
  },

  deleteCategory: (id) => {
    set((state) => ({
      categories: state.categories.filter((category) => category.id !== id),
      // Remove category from tasks
      tasks: state.tasks.map((task) =>
        task.categoryId === id ? { ...task, categoryId: undefined } : task
      ),
      error: null
    }));
    
    get().saveToLocalStorage();
  },

  // Tag actions
  addTag: (tagData) => {
    const newTag: Tag = {
      ...tagData,
      id: Date.now().toString(),
    };
    
    set((state) => ({
      tags: [...state.tags, newTag],
      error: null
    }));
    
    get().saveToLocalStorage();
  },

  updateTag: (id, updates) => {
    set((state) => ({
      tags: state.tags.map((tag) =>
        tag.id === id ? { ...tag, ...updates } : tag
      ),
      error: null
    }));
    
    get().saveToLocalStorage();
  },

  deleteTag: (id) => {
    set((state) => ({
      tags: state.tags.filter((tag) => tag.id !== id),
      // Remove tag from tasks
      tasks: state.tasks.map((task) => ({
        ...task,
        tags: task.tags.filter((tag) => tag.id !== id)
      })),
      error: null
    }));
    
    get().saveToLocalStorage();
  },

  // Filter and search actions
  setFilter: (filter) => {
    set((state) => ({
      filter: { ...state.filter, ...filter }
    }));
  },

  setSort: (sort) => {
    set({ sort });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  clearFilters: () => {
    set({
      filter: {},
      searchQuery: '',
      sort: defaultSort
    });
  },

  // Utility actions
  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  // Data persistence
  loadFromLocalStorage: () => {
    try {
      get().setLoading(true);
      
      const tasksData = localStorage.getItem('todo-tasks');
      const categoriesData = localStorage.getItem('todo-categories');
      const tagsData = localStorage.getItem('todo-tags');

      if (tasksData) {
        const tasks = JSON.parse(tasksData);
        set({ tasks: tasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined
        })) });
      }

      if (categoriesData) {
        const categories = JSON.parse(categoriesData);
        set({ categories: categories.map((cat: any) => ({
          ...cat,
          createdAt: new Date(cat.createdAt)
        })) });
      }

      if (tagsData) {
        const tags = JSON.parse(tagsData);
        set({ tags });
      }

      get().setError(null);
    } catch (error) {
      get().setError('Failed to load data from localStorage');
      console.error('Error loading from localStorage:', error);
    } finally {
      get().setLoading(false);
    }
  },

  saveToLocalStorage: () => {
    try {
      const { tasks, categories, tags } = get();
      
      localStorage.setItem('todo-tasks', JSON.stringify(tasks));
      localStorage.setItem('todo-categories', JSON.stringify(categories));
      localStorage.setItem('todo-tags', JSON.stringify(tags));
    } catch (error) {
      get().setError('Failed to save data to localStorage');
      console.error('Error saving to localStorage:', error);
    }
  },

  // Migration from legacy format
  migrateLegacyData: () => {
    try {
      const legacyData = localStorage.getItem('todo-tasks');
      if (!legacyData) return;

      const legacyTasks: LegacyTask[] = JSON.parse(legacyData);
      
      // Check if data is already in new format
      if (legacyTasks.length > 0 && 'priority' in legacyTasks[0]) {
        return; // Already migrated
      }

      const migratedTasks = legacyTasks.map(migrateLegacyTask);
      
      set({ tasks: migratedTasks });
      get().saveToLocalStorage();
      
      console.log('Successfully migrated legacy task data');
    } catch (error) {
      console.error('Error migrating legacy data:', error);
    }
  }
}));