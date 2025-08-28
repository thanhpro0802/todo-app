import React from 'react';
import { TagIcon } from '@heroicons/react/24/outline';

interface TagBadgeProps {
  tag: string;
  onRemove?: () => void;
  className?: string;
}

export const TagBadge: React.FC<TagBadgeProps> = ({ tag, onRemove, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200 ${className}`}
    >
      <TagIcon className="w-3 h-3" />
      {tag}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          ×
        </button>
      )}
    </span>
  );
};