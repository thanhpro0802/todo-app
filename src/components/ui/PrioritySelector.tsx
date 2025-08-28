import React from 'react';
import { Priority } from '../../types/Task';

interface PrioritySelectorProps {
  value: Priority;
  onChange: (priority: Priority) => void;
  className?: string;
}

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({ value, onChange, className = '' }) => {
  const priorities: { value: Priority; label: string; color: string }[] = [
    { value: 'low', label: 'Thấp', color: 'text-blue-600' },
    { value: 'medium', label: 'Trung bình', color: 'text-yellow-600' },
    { value: 'high', label: 'Cao', color: 'text-orange-600' },
    { value: 'urgent', label: 'Khẩn cấp', color: 'text-red-600' },
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Priority)}
      className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 ${className}`}
    >
      {priorities.map((priority) => (
        <option key={priority.value} value={priority.value}>
          {priority.label}
        </option>
      ))}
    </select>
  );
};