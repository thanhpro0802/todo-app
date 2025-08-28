import React, { useState } from 'react';
import { Priority } from '../types/Priority';
import { PrioritySelect } from './PriorityBadge';
import { 
  PlusIcon, 
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon 
} from '@heroicons/react/24/outline';

interface EnhancedAddTaskFormProps {
  onAddTask: (data: {
    text: string;
    description?: string;
    priority?: Priority;
    dueDate?: Date;
  }) => void;
}

export const EnhancedAddTaskForm: React.FC<EnhancedAddTaskFormProps> = ({ onAddTask }) => {
  const [taskText, setTaskText] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskText.trim()) {
      onAddTask({
        text: taskText.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });
      
      // Reset form
      setTaskText('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setShowAdvanced(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      {/* Main input */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
        />
        <button
          type="submit"
          disabled={!taskText.trim()}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add
        </button>
      </div>

      {/* Toggle advanced options */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
      >
        {showAdvanced ? (
          <ChevronUpIcon className="w-4 h-4" />
        ) : (
          <ChevronDownIcon className="w-4 h-4" />
        )}
        {showAdvanced ? 'Hide' : 'Show'} advanced options
      </button>

      {/* Advanced options */}
      {showAdvanced && (
        <div className="mt-4 space-y-4 pt-4 border-t border-gray-200">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about this task..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <PrioritySelect
                value={priority}
                onChange={setPriority}
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none pl-10"
                />
                <CalendarIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};