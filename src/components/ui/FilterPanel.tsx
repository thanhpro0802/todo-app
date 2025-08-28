import React from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Priority } from '../../types/Task';
import { useTaskStore } from '../../store/taskStore';
import { PriorityBadge } from './PriorityBadge';

interface FilterPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onToggle, className = '' }) => {
  const {
    categories,
    selectedCategory,
    selectedPriority,
    setSelectedCategory,
    setSelectedPriority,
    getTaskStats,
  } = useTaskStore();

  const stats = getTaskStats();
  const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedPriority(null);
  };

  const hasActiveFilters = selectedCategory || selectedPriority;

  return (
    <div className={className}>
      {/* Filter Toggle Button */}
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
          hasActiveFilters
            ? 'bg-blue-500 text-white border-blue-500'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
      >
        <FunnelIcon className="w-4 h-4" />
        Bộ lọc
        {hasActiveFilters && (
          <span className="ml-1 px-2 py-0.5 bg-white text-blue-500 rounded-full text-xs font-medium">
            {(selectedCategory ? 1 : 0) + (selectedPriority ? 1 : 0)}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Bộ lọc</h3>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-red-600 hover:text-red-800 transition-colors"
                >
                  Xóa tất cả
                </button>
              )}
              <button
                onClick={onToggle}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-2">Trạng thái</h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span>Tất cả</span>
                <span className="font-medium">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-orange-50 rounded">
                <span>Đang làm</span>
                <span className="font-medium text-orange-600">{stats.pending}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span>Hoàn thành</span>
                <span className="font-medium text-green-600">{stats.completed}</span>
              </div>
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-2">Độ ưu tiên</h4>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedPriority(null)}
                className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                  !selectedPriority
                    ? 'bg-blue-100 text-blue-800'
                    : 'hover:bg-gray-100'
                }`}
              >
                Tất cả
              </button>
              {priorities.map((priority) => (
                <button
                  key={priority}
                  onClick={() => setSelectedPriority(priority === selectedPriority ? null : priority)}
                  className={`w-full text-left px-2 py-1 rounded transition-colors ${
                    selectedPriority === priority
                      ? 'bg-blue-100 text-blue-800'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <PriorityBadge priority={priority} className="text-xs" />
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-2">Danh mục</h4>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                  !selectedCategory
                    ? 'bg-blue-100 text-blue-800'
                    : 'hover:bg-gray-100'
                }`}
              >
                Tất cả
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id === selectedCategory ? null : category.id)}
                  className={`w-full text-left px-2 py-1 rounded transition-colors flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-800'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-xs">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};