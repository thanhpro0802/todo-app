import React from 'react';
import { Priority, PRIORITY_CONFIG } from '../types/Priority';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ 
  priority, 
  size = 'sm' 
}) => {
  const config = PRIORITY_CONFIG[priority];
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-1 text-xs' 
    : 'px-3 py-1 text-sm';

  return (
    <span 
      className={`inline-flex items-center rounded-full font-medium ${config.color} ${sizeClasses}`}
    >
      {config.label}
    </span>
  );
};

interface PrioritySelectProps {
  value: Priority;
  onChange: (priority: Priority) => void;
  disabled?: boolean;
}

export const PrioritySelect: React.FC<PrioritySelectProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Priority)}
      disabled={disabled}
      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
        <option key={key} value={key}>
          {config.label}
        </option>
      ))}
    </select>
  );
};