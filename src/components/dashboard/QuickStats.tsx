import React from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '../../store/taskStore';
import { formatTime } from '../../utils/dateUtils';

interface QuickStatsProps {
  className?: string;
}

// Utility function to safely parse dates
const parseDate = (date: string | Date | null | undefined): Date | null => {
  if (!date) return null;

  try {
    const parsedDate = date instanceof Date ? date : new Date(date);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  } catch (error) {
    console.warn('Invalid date format:', date);
    return null;
  }
};

// Utility function to check if two dates are the same day
const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
};

export const QuickStats: React.FC<QuickStatsProps> = ({ className = '' }) => {
  const { tasks, getTaskStats } = useTaskStore();
  const stats = getTaskStats();

  // Calculate additional statistics with proper date handling
  const overdueTasks = tasks.filter(task => {
    if (task.completed || !task.dueDate) return false;

    const dueDate = parseDate(task.dueDate);
    if (!dueDate) return false;

    const today = new Date();
    return dueDate < today;
  }).length;

  const todayTasks = tasks.filter(task => {
    if (!task.dueDate) return false;

    const dueDate = parseDate(task.dueDate);
    if (!dueDate) return false;

    const today = new Date();
    return isSameDay(dueDate, today);
  }).length;

  const totalTimeEstimated = tasks
      .filter(task => !task.completed && task.timeEstimation)
      .reduce((total, task) => total + (task.timeEstimation || 0), 0);

  const urgentTasks = tasks.filter(task =>
      !task.completed && task.priority === 'urgent'
  ).length;

  const statsData = [
    {
      label: 'Tổng nhiệm vụ',
      value: stats.total,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      label: 'Hoàn thành',
      value: stats.completed,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      label: 'Đang làm',
      value: stats.pending,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    {
      label: 'Quá hạn',
      value: overdueTasks,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      label: 'Hôm nay',
      value: todayTasks,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      label: 'Khẩn cấp',
      value: urgentTasks,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
  ];

  return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ${className}`}>
        {statsData.map((stat, index) => (
            <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`${stat.bgColor} ${stat.borderColor} border rounded-lg p-4 text-center`}
            >
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </motion.div>
        ))}

        {totalTimeEstimated > 0 && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center md:col-span-2 lg:col-span-2"
            >
              <div className="text-lg font-bold text-indigo-600 mb-1">
                {formatTime(totalTimeEstimated)}
              </div>
              <div className="text-xs text-gray-600">Thời gian ước tính còn lại</div>
            </motion.div>
        )}

        {stats.total > 0 && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center md:col-span-2 lg:col-span-2"
            >
              <div className="text-lg font-bold text-gray-600 mb-1">
                {Math.round((stats.completed / stats.total) * 100)}%
              </div>
              <div className="text-xs text-gray-600">Tiến độ hoàn thành</div>
            </motion.div>
        )}
      </div>
  );
};