export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface PriorityConfig {
  label: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export const PRIORITY_CONFIG: Record<Priority, PriorityConfig> = {
  low: {
    label: 'Low',
    color: 'bg-gray-100 text-gray-700',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700'
  },
  medium: {
    label: 'Medium',
    color: 'bg-blue-100 text-blue-700',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700'
  },
  high: {
    label: 'High',
    color: 'bg-orange-100 text-orange-700',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700'
  },
  urgent: {
    label: 'Urgent',
    color: 'bg-red-100 text-red-700',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700'
  }
};