import React from 'react';
import { Priority } from '../../types/Task';
import { PRIORITY_COLORS } from '../../constants/colors';

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const colors = PRIORITY_COLORS[priority];
  
  const priorityLabels = {
    low: 'Thấp',
    medium: 'Trung bình',
    high: 'Cao',
    urgent: 'Khẩn cấp',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border ${className}`}
    >
      <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
      {priorityLabels[priority]}
    </span>
  );
};