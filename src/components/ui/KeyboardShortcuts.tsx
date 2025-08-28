import React, { useEffect } from 'react';
import { useTaskStore } from '../../store/taskStore';

interface KeyboardShortcutsProps {
  onAddTaskFocus?: () => void;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ onAddTaskFocus }) => {
  const { setSearchQuery, clearCompleted, getTaskStats } = useTaskStore();
  const stats = getTaskStats();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger if not typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Ctrl/Cmd + N: Focus add task input
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        onAddTaskFocus?.();
      }

      // Ctrl/Cmd + F: Focus search
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Tìm kiếm tasks..."]') as HTMLInputElement;
        searchInput?.focus();
      }

      // Ctrl/Cmd + Shift + D: Clear completed tasks
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        if (stats.completed > 0) {
          clearCompleted();
        }
      }

      // Escape: Clear search
      if (event.key === 'Escape') {
        setSearchQuery('');
        const searchInput = document.querySelector('input[placeholder="Tìm kiếm tasks..."]') as HTMLInputElement;
        if (searchInput) {
          searchInput.value = '';
          searchInput.blur();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onAddTaskFocus, setSearchQuery, clearCompleted, stats.completed]);

  return null; // This component only handles keyboard events
};