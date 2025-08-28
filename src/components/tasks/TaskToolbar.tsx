import React, { useState } from 'react';
import { SearchBar } from '../ui/SearchBar';
import { FilterPanel } from '../ui/FilterPanel';
import { SortSelector } from '../ui/SortSelector';

interface TaskToolbarProps {
  className?: string;
}

export const TaskToolbar: React.FC<TaskToolbarProps> = ({ className = '' }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <SearchBar />

      {/* Filter and Sort Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative">
          <FilterPanel
            isOpen={isFilterOpen}
            onToggle={() => setIsFilterOpen(!isFilterOpen)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sắp xếp:</span>
          <SortSelector />
        </div>
      </div>
    </div>
  );
};