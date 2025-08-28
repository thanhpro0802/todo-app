import React, { useState } from 'react';
import { PlusIcon, CalendarIcon, TagIcon } from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import { Priority } from '../../types/Task';
import { PrioritySelector } from '../ui/PrioritySelector';
import { useTaskStore } from '../../store/taskStore';
import 'react-datepicker/dist/react-datepicker.css';

interface EnhancedAddTaskFormProps {
  onAddTask?: (taskData: any) => void;
}

export const EnhancedAddTaskForm: React.FC<EnhancedAddTaskFormProps> = ({ onAddTask }) => {
  const { addTask, categories } = useTaskStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [taskData, setTaskData] = useState({
    text: '',
    description: '',
    priority: 'medium' as Priority,
    category: '',
    dueDate: undefined as Date | undefined,
    tags: [] as string[],
    timeEstimation: '',
  });
  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskData.text.trim()) return;

    const newTask = {
      text: taskData.text.trim(),
      description: taskData.description.trim() || undefined,
      priority: taskData.priority,
      category: taskData.category || undefined,
      dueDate: taskData.dueDate,
      tags: taskData.tags,
      timeEstimation: taskData.timeEstimation ? parseInt(taskData.timeEstimation) : undefined,
      completed: false,
      subtasks: [],
    };

    if (onAddTask) {
      onAddTask(newTask);
    } else {
      addTask(newTask);
    }

    // Reset form
    setTaskData({
      text: '',
      description: '',
      priority: 'medium',
      category: '',
      dueDate: undefined,
      tags: [],
      timeEstimation: '',
    });
    setIsExpanded(false);
  };

  const addTag = () => {
    if (newTag.trim() && !taskData.tags.includes(newTag.trim())) {
      setTaskData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTaskData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-4">
      {/* Main input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={taskData.text}
          onChange={(e) => setTaskData(prev => ({ ...prev, text: e.target.value }))}
          onFocus={() => setIsExpanded(true)}
          placeholder="Thêm task mới..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
        />
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-3 text-gray-500 hover:text-blue-500 transition-colors duration-200"
          title="More options"
        >
          <CalendarIcon className="w-5 h-5" />
        </button>
        <button
          type="submit"
          disabled={!taskData.text.trim()}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Thêm
        </button>
      </div>

      {/* Expanded options */}
      {isExpanded && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả (tùy chọn)
            </label>
            <textarea
              value={taskData.description}
              onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Thêm mô tả chi tiết..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Độ ưu tiên
              </label>
              <PrioritySelector
                value={taskData.priority}
                onChange={(priority) => setTaskData(prev => ({ ...prev, priority }))}
                className="w-full"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <select
                value={taskData.category}
                onChange={(e) => setTaskData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hạn chót
              </label>
              <DatePicker
                selected={taskData.dueDate}
                onChange={(date: Date | null) => setTaskData(prev => ({ ...prev, dueDate: date || undefined }))}
                dateFormat="dd/MM/yyyy"
                placeholderText="Chọn ngày"
                minDate={new Date()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Time Estimation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian ước tính (phút)
            </label>
            <input
              type="number"
              value={taskData.timeEstimation}
              onChange={(e) => setTaskData(prev => ({ ...prev, timeEstimation: e.target.value }))}
              placeholder="Ví dụ: 30"
              min="1"
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {taskData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200"
                >
                  <TagIcon className="w-3 h-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addTag)}
                placeholder="Thêm tag..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              />
              <button
                type="button"
                onClick={addTag}
                disabled={!newTag.trim()}
                className="px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Thêm
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Thu gọn
            </button>
            <button
              type="submit"
              disabled={!taskData.text.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Tạo Task
            </button>
          </div>
        </div>
      )}
    </form>
  );
};