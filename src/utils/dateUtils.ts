import { format, isToday, isTomorrow, isYesterday, isPast } from 'date-fns';

export const formatDate = (date: Date): string => {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM dd, yyyy');
};

export const formatTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const isOverdue = (date: Date): boolean => {
  return isPast(date) && !isToday(date);
};

export const getDueDateStatus = (date: Date | undefined) => {
  if (!date) return null;
  
  if (isOverdue(date)) return 'overdue';
  if (isToday(date)) return 'today';
  if (isTomorrow(date)) return 'tomorrow';
  return 'future';
};