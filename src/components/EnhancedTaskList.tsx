import React, { useMemo } from 'react';
import { Task, Priority, FilterOptions, SortOptions } from '../types';
import { EnhancedTaskItem } from './EnhancedTaskItem';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  FunnelIcon,
  Bars3BottomLeftIcon
} from '@heroicons/react/24/outline';

interface EnhancedTaskListProps {
  tasks: Task[];
  filter: FilterOptions;
  sort: SortOptions;
  searchQuery: string;
  onToggleComplete: (id: string) => void;
  onEditTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onUpdateFilter: (filter: Partial<FilterOptions>) => void;
  onUpdateSort: (sort: SortOptions) => void;
}

export const EnhancedTaskList: React.FC<EnhancedTaskListProps> = ({
  tasks,
  filter,
  sort,
  searchQuery,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onUpdateFilter,
  onUpdateSort,
}) => {
  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks;

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.text.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (filter.priority) {
      filtered = filtered.filter(task => task.priority === filter.priority);
    }

    if (filter.completed !== undefined) {
      filtered = filtered.filter(task => task.completed === filter.completed);
    }

    if (filter.overdue) {
      filtered = filtered.filter(task => 
        task.dueDate && 
        task.dueDate < new Date() && 
        !task.completed
      );
    }

    if (filter.dueDateRange) {
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = task.dueDate;
        const { start, end } = filter.dueDateRange!;
        
        if (start && dueDate < start) return false;
        if (end && dueDate > end) return false;
        
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sort.field) {
        case 'priority':
          const priorityOrder: Record<Priority, number> = {
            urgent: 4,
            high: 3,
            medium: 2,
            low: 1
          };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else comparison = a.dueDate.getTime() - b.dueDate.getTime();
          break;
        case 'text':
          comparison = a.text.localeCompare(b.text);
          break;
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'updatedAt':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
      }
      
      return sort.direction === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [tasks, filter, sort, searchQuery]);

  const completedTasks = filteredAndSortedTasks.filter(task => task.completed);
  const pendingTasks = filteredAndSortedTasks.filter(task => !task.completed);
  const overdueTasks = pendingTasks.filter(task => 
    task.dueDate && task.dueDate < new Date()
  );

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No tasks yet</p>
        <p className="text-gray-400 text-sm">Add your first task above!</p>
      </div>
    );
  }

  if (filteredAndSortedTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <FunnelIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No tasks match your filters</p>
        <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
        <button
          onClick={() => {
            onUpdateFilter({});
            onUpdateSort({ field: 'createdAt', direction: 'desc' });
          }}
          className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600">{pendingTasks.length}</div>
          <div className="text-sm text-blue-700">Pending</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
          <div className="text-sm text-green-700">Completed</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
          <div className="text-sm text-red-700">Overdue</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-purple-600">
            {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
          </div>
          <div className="text-sm text-purple-700">Complete</div>
        </div>
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-4 h-4 text-gray-500" />
            <select
              value={filter.priority || ''}
              onChange={(e) => onUpdateFilter({ 
                priority: e.target.value as Priority || undefined 
              })}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={filter.completed === undefined ? '' : filter.completed.toString()}
            onChange={(e) => onUpdateFilter({ 
              completed: e.target.value === '' ? undefined : e.target.value === 'true'
            })}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="">All Status</option>
            <option value="false">Pending</option>
            <option value="true">Completed</option>
          </select>

          {/* Overdue Filter */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filter.overdue || false}
              onChange={(e) => onUpdateFilter({ overdue: e.target.checked || undefined })}
              className="rounded border-gray-300"
            />
            Show Overdue
          </label>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <Bars3BottomLeftIcon className="w-4 h-4 text-gray-500" />
          <select
            value={sort.field}
            onChange={(e) => onUpdateSort({
              ...sort,
              field: e.target.value as SortOptions['field']
            })}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="createdAt">Date Created</option>
            <option value="updatedAt">Date Modified</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="text">Title</option>
          </select>
          
          <button
            onClick={() => onUpdateSort({
              ...sort,
              direction: sort.direction === 'asc' ? 'desc' : 'asc'
            })}
            className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
          >
            {sort.direction === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && !filter.completed && (
        <div>
          <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
            <ClockIcon className="w-5 h-5" />
            Overdue ({overdueTasks.length})
          </h3>
          <div className="space-y-3">
            {overdueTasks.map((task) => (
              <EnhancedTaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pending Tasks */}
      {pendingTasks.filter(task => !overdueTasks.includes(task)).length > 0 && !filter.completed && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-blue-500" />
            Pending ({pendingTasks.filter(task => !overdueTasks.includes(task)).length})
          </h3>
          <div className="space-y-3">
            {pendingTasks
              .filter(task => !overdueTasks.includes(task))
              .map((task) => (
                <EnhancedTaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onEditTask={onEditTask}
                  onDeleteTask={onDeleteTask}
                />
              ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && filter.completed !== false && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            Completed ({completedTasks.length})
          </h3>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <EnhancedTaskItem
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};