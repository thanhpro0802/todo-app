import React from 'react';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { useTaskStore } from '../../store/taskStore';

interface SortSelectorProps {
  className?: string;
}

type SortField = 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'text';

export const SortSelector: React.FC<SortSelectorProps> = ({ className = '' }) => {
  const { sortBy, sortDirection, setSorting } = useTaskStore();

  const sortOptions: { value: SortField; label: string }[] = [
    { value: 'createdAt', label: 'Ngày tạo' },
    { value: 'updatedAt', label: 'Ngày cập nhật' },
    { value: 'dueDate', label: 'Hạn chót' },
    { value: 'priority', label: 'Độ ưu tiên' },
    { value: 'text', label: 'Tên task' },
  ];

  const handleSortChange = (field: SortField) => {
    if (field === sortBy) {
      // Toggle direction if same field
      setSorting(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default direction
      setSorting(field, field === 'text' ? 'asc' : 'desc');
    }
  };

  return (
    <div className={`relative ${className}`}>
      <select
        value={sortBy}
        onChange={(e) => handleSortChange(e.target.value as SortField)}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <ChevronUpDownIcon className="w-4 h-4 text-gray-400" />
      </div>
      
      {/* Direction Indicator */}
      <button
        onClick={() => setSorting(sortBy, sortDirection === 'asc' ? 'desc' : 'asc')}
        className="ml-2 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        title={`Sắp xếp ${sortDirection === 'asc' ? 'tăng dần' : 'giảm dần'}`}
      >
        {sortDirection === 'asc' ? '↑' : '↓'}
      </button>
    </div>
  );
};