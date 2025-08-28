import { useEffect } from 'react';
import { useTaskStore } from './store';
import { EnhancedAddTaskForm } from './components/EnhancedAddTaskForm';
import { EnhancedTaskList } from './components/EnhancedTaskList';
import { SearchBar } from './components/SearchBar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingOverlay } from './components/LoadingSpinner';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

function EnhancedApp() {
  const {
    tasks,
    filter,
    sort,
    searchQuery,
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    clearCompleted,
    setFilter,
    setSort,
    setSearchQuery,
    clearFilters,
    loadFromLocalStorage,
    migrateLegacyData
  } = useTaskStore();

  // Load data on mount
  useEffect(() => {
    migrateLegacyData();
    loadFromLocalStorage();
  }, [migrateLegacyData, loadFromLocalStorage]);

  const handleAddTask = (taskData: {
    text: string;
    description?: string;
    priority?: any;
    dueDate?: Date;
  }) => {
    addTask({
      text: taskData.text,
      description: taskData.description,
      completed: false,
      priority: taskData.priority || 'medium',
      categoryId: undefined,
      tags: [],
      dueDate: taskData.dueDate,
      timeTracking: {},
      subtasks: []
    });
  };

  const completedCount = tasks.filter(task => task.completed).length;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <header className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <ClipboardDocumentListIcon className="w-8 h-8 text-blue-500" />
              <h1 className="text-3xl font-bold text-gray-800">
                Advanced Todo App
              </h1>
            </div>
            <p className="text-gray-600">
              Professional task management with priorities, categories, and analytics
            </p>
          </header>

          {/* Main Content */}
          <main className="bg-white rounded-xl shadow-lg p-6">
            <LoadingOverlay isLoading={isLoading} message="Loading tasks...">
              {/* Add Task Form */}
              <EnhancedAddTaskForm onAddTask={handleAddTask} />

              {/* Search Bar */}
              <div className="mb-6">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search tasks by title or description..."
                />
              </div>

              {/* Task List */}
              <EnhancedTaskList
                tasks={tasks}
                filter={filter}
                sort={sort}
                searchQuery={searchQuery}
                onToggleComplete={toggleTask}
                onEditTask={updateTask}
                onDeleteTask={deleteTask}
                onUpdateFilter={setFilter}
                onUpdateSort={setSort}
              />

              {/* Clear Completed Button */}
              {completedCount > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="text-sm text-gray-600">
                      {completedCount} completed task{completedCount !== 1 ? 's' : ''}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={clearFilters}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                      >
                        Clear Filters
                      </button>
                      <button
                        onClick={clearCompleted}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                      >
                        Clear Completed ({completedCount})
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </LoadingOverlay>
          </main>

          {/* Footer */}
          <footer className="text-center mt-8 text-gray-500 text-sm">
            <p>© 2024 Advanced Todo App - Built with React + TypeScript + Zustand + Tailwind</p>
          </footer>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default EnhancedApp;