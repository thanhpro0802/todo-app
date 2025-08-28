import React from 'react';
import { CalendarIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { formatDate, getDueDateStatus } from '../../utils/dateUtils';

interface DueDateBadgeProps {
  dueDate: Date;
  className?: string;
}

export const DueDateBadge: React.FC<DueDateBadgeProps> = ({ dueDate, className = '' }) => {
  const status = getDueDateStatus(dueDate);
  
  const getStatusStyles = () => {
    switch (status) {
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'today':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'tomorrow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'overdue':
        return <ExclamationTriangleIcon className="w-3 h-3" />;
      case 'today':
        return <ClockIcon className="w-3 h-3" />;
      default:
        return <CalendarIcon className="w-3 h-3" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusStyles()} ${className}`}
    >
      {getIcon()}
      {formatDate(dueDate)}
    </span>
  );
};