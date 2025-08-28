import React, { useState } from 'react';
import { Task } from '../types/Task';
import { PriorityBadge, PrioritySelect } from './PriorityBadge';
import {
  CheckIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface EnhancedTaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEditTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
}

export const EnhancedTaskItem: React.FC<EnhancedTaskItemProps> = ({
  task,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [editDescription, setEditDescription] = useState(task.description || '');

  const handleEditSubmit = () => {
    if (editText.trim()) {
      onEditTask(task.id, {
        text: editText.trim(),
        description: editDescription.trim() || undefined
      });
      setIsEditing(false);
    }
  };

  const handleEditCancel = () => {
    setEditText(task.text);
    setEditDescription(task.description || '');
    setIsEditing(false);
  };

  const handlePriorityChange = (priority: typeof task.priority) => {
    onEditTask(task.id, { priority });
  };

  const isOverdue = task.dueDate && task.dueDate < new Date() && !task.completed;

  return (
    <div 
      className={`p-4 border rounded-lg transition-all duration-200 ${
        task.completed 
          ? 'bg-gray-50 border-gray-200' 
          : isOverdue
          ? 'bg-red-50 border-red-200'
          : 'bg-white border-gray-300 hover:border-gray-400'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggleComplete(task.id)}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 mt-1 ${
            task.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-green-400'
          }`}
        >
          {task.completed && <CheckIcon className="w-4 h-4" />}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEditSubmit();
                  if (e.key === 'Escape') handleEditCancel();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                autoFocus
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Add description..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleEditSubmit}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                >
                  <CheckIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={handleEditCancel}
                  className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Title */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`flex-1 ${
                    task.completed
                      ? 'line-through text-gray-500'
                      : 'text-gray-800'
                  }`}
                >
                  {task.text}
                </span>
                <PriorityBadge priority={task.priority} />
              </div>

              {/* Description */}
              {task.description && (
                <p className={`text-sm ${
                  task.completed ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {task.description}
                </p>
              )}

              {/* Due Date */}
              {task.dueDate && (
                <div className={`flex items-center gap-1 text-sm ${
                  isOverdue ? 'text-red-600' : 'text-gray-500'
                }`}>
                  <CalendarIcon className="w-4 h-4" />
                  <span>
                    Due: {format(task.dueDate, 'MMM d, yyyy')}
                    {isOverdue && ' (Overdue)'}
                  </span>
                </div>
              )}

              {/* Time Tracking */}
              {task.timeTracking.estimatedTime && (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <ClockIcon className="w-4 h-4" />
                  <span>Est: {task.timeTracking.estimatedTime}m</span>
                  {task.timeTracking.actualTime && (
                    <span>| Actual: {task.timeTracking.actualTime}m</span>
                  )}
                </div>
              )}

              {/* Subtasks */}
              {task.subtasks.length > 0 && (
                <div className="text-sm text-gray-500">
                  {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks completed
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="flex items-center gap-1">
            <div className="mr-2">
              <PrioritySelect
                value={task.priority}
                onChange={handlePriorityChange}
                disabled={task.completed}
              />
            </div>
            
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
              title="Edit task"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onDeleteTask(task.id)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Delete task"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};