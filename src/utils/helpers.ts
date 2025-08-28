import { Task } from '../types/Task';

export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), wait);
    }
  };
};

export const exportTasksToJSON = (tasks: Task[]): string => {
  return JSON.stringify(tasks, null, 2);
};

export const exportTasksToCSV = (tasks: Task[]): string => {
  const headers = [
    'ID',
    'Text',
    'Description',
    'Completed',
    'Priority',
    'Category',
    'Tags',
    'Due Date',
    'Time Estimation',
    'Time Spent',
    'Created At',
    'Updated At',
  ];

  const csvData = tasks.map(task => [
    task.id,
    task.text,
    task.description || '',
    task.completed.toString(),
    task.priority,
    task.category || '',
    task.tags.join('; '),
    task.dueDate ? task.dueDate.toISOString() : '',
    task.timeEstimation?.toString() || '',
    task.timeSpent?.toString() || '',
    task.createdAt.toISOString(),
    task.updatedAt.toISOString(),
  ]);

  return [headers, ...csvData]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
};

export const downloadFile = (content: string, filename: string, type: string): void => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};