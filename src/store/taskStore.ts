import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Category, FilterPreset, Priority } from '../types/Task';
import { LOCAL_STORAGE_KEYS, DEFAULT_CATEGORIES } from '../constants/app';

interface TaskStore {
  // State
  tasks: Task[];
  categories: Category[];
  filterPresets: FilterPreset[];
  searchQuery: string;
  selectedCategory: string | null;
  selectedPriority: Priority | null;
  sortBy: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'text';
  sortDirection: 'asc' | 'desc';
  currentUserId: string | null; // Track current user
  
  // Actions
  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>, userId: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  clearCompleted: () => void;
  
  addCategory: (name: string, color: string) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  setSelectedPriority: (priority: Priority | null) => void;
  setSorting: (sortBy: string, direction: 'asc' | 'desc') => void;
  setCurrentUser: (userId: string | null) => void; // Set current user
  clearUserData: () => void; // Clear data when user logs out
  
  // Computed
  getFilteredTasks: () => Task[];
  getTasksByCategory: (categoryId: string) => Task[];
  getTaskStats: () => {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    today: number;
    urgent: number;
  };
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      // Initial state
      tasks: [],
      categories: DEFAULT_CATEGORIES.map(cat => ({
        ...cat,
        createdAt: new Date(),
      })),
      filterPresets: [],
      searchQuery: '',
      selectedCategory: null,
      selectedPriority: null,
      sortBy: 'createdAt',
      sortDirection: 'desc',
      currentUserId: null,

      // Actions
      addTask: (taskData, userId) => {
        const tasks = get().tasks.filter(t => t.userId === userId);
        const newTask: Task = {
          ...taskData,
          id: Date.now().toString(),
          userId,
          order: tasks.filter(t => !t.completed).length, // Add to end of pending tasks
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { 
                  ...task, 
                  ...updates, 
                  updatedAt: new Date(),
                  ...(updates.completed && !task.completed ? { completedAt: new Date() } : {}),
                  ...(updates.completed === false ? { completedAt: undefined } : {}),
                }
              : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      toggleTaskComplete: (id) => {
        const task = get().tasks.find(t => t.id === id);
        if (task) {
          get().updateTask(id, { completed: !task.completed });
        }
      },

      clearCompleted: () => {
        const { currentUserId } = get();
        set((state) => ({
          tasks: state.tasks.filter((task) => 
            task.completed ? task.userId !== currentUserId : true
          ),
        }));
      },

      addCategory: (name, color) => {
        const newCategory: Category = {
          id: Date.now().toString(),
          name,
          color,
          createdAt: new Date(),
        };
        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id ? { ...category, ...updates } : category
          ),
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((category) => category.id !== id),
          tasks: state.tasks.map((task) =>
            task.category === id ? { ...task, category: undefined } : task
          ),
        }));
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      setSelectedCategory: (categoryId) => {
        set({ selectedCategory: categoryId });
      },

      setSelectedPriority: (priority) => {
        set({ selectedPriority: priority });
      },

      setSorting: (sortBy, direction) => {
        set({ sortBy: sortBy as any, sortDirection: direction });
      },

      setCurrentUser: (userId) => {
        set({ currentUserId: userId });
      },

      clearUserData: () => {
        set({
          searchQuery: '',
          selectedCategory: null,
          selectedPriority: null,
          currentUserId: null,
        });
      },

      // Computed
      getFilteredTasks: () => {
        const state = get();
        // Only show tasks for current user
        let filtered = state.tasks.filter(task => task.userId === state.currentUserId);

        // Apply search filter
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase();
          filtered = filtered.filter((task) =>
            task.text.toLowerCase().includes(query) ||
            task.description?.toLowerCase().includes(query) ||
            task.tags.some(tag => tag.toLowerCase().includes(query))
          );
        }

        // Apply category filter
        if (state.selectedCategory) {
          filtered = filtered.filter((task) => task.category === state.selectedCategory);
        }

        // Apply priority filter
        if (state.selectedPriority) {
          filtered = filtered.filter((task) => task.priority === state.selectedPriority);
        }

        // Apply sorting
        filtered.sort((a, b) => {
          let aValue: any;
          let bValue: any;

          switch (state.sortBy) {
            case 'priority':
              const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
              aValue = priorityOrder[a.priority];
              bValue = priorityOrder[b.priority];
              break;
            case 'dueDate':
              aValue = a.dueDate?.getTime() || Infinity;
              bValue = b.dueDate?.getTime() || Infinity;
              break;
            case 'text':
              aValue = a.text.toLowerCase();
              bValue = b.text.toLowerCase();
              break;
            default:
              // For createdAt and updatedAt, use order if available, otherwise use the date
              if (state.sortBy === 'createdAt' && (a.order !== undefined || b.order !== undefined)) {
                aValue = a.order ?? 9999;
                bValue = b.order ?? 9999;
              } else {
                aValue = a[state.sortBy];
                bValue = b[state.sortBy];
              }
          }

          if (aValue < bValue) return state.sortDirection === 'asc' ? -1 : 1;
          if (aValue > bValue) return state.sortDirection === 'asc' ? 1 : -1;
          return 0;
        });

        return filtered;
      },

      getTasksByCategory: (categoryId) => {
        const { currentUserId } = get();
        return get().tasks.filter((task) => 
          task.category === categoryId && task.userId === currentUserId
        );
      },

      getTaskStats: () => {
        const { tasks, currentUserId } = get();
        const userTasks = tasks.filter(task => task.userId === currentUserId);
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        const overdue = userTasks.filter(
          (task) => !task.completed && task.dueDate && task.dueDate < now
        ).length;
        
        const todayTasks = userTasks.filter(
          (task) => !task.completed && task.dueDate && 
          task.dueDate >= today && task.dueDate < tomorrow
        ).length;
        
        const urgentTasks = userTasks.filter(
          (task) => !task.completed && task.priority === 'urgent'
        ).length;

        return {
          total: userTasks.length,
          completed: userTasks.filter((task) => task.completed).length,
          pending: userTasks.filter((task) => !task.completed).length,
          overdue,
          today: todayTasks,
          urgent: urgentTasks,
        };
      },
    }),
    {
      name: LOCAL_STORAGE_KEYS.TASKS,
      partialize: (state) => ({
        tasks: state.tasks,
        categories: state.categories,
        filterPresets: state.filterPresets,
      }),
    }
  )
);