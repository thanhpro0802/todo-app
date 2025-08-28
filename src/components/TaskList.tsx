import React from 'react';
import { Task } from '../types/Task';
import { TaskItem } from './TaskItem.tsx';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface TaskListProps {
    tasks: Task[];
    onToggleComplete: (id: string) => void;
    onEditTask: (id: string, newText: string) => void;
    onDeleteTask: (id: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
                                                      tasks,
                                                      onToggleComplete,
                                                      onEditTask,
                                                      onDeleteTask,
                                                  }) => {
    const completedTasks = tasks.filter(task => task.completed);
    const pendingTasks = tasks.filter(task => !task.completed);

    if (tasks.length === 0) {
        return (
            <div className="text-center py-12">
                <CheckCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Chưa có task nào</p>
                <p className="text-gray-400 text-sm">Thêm task đầu tiên của bạn!</p>
            </div>
        );
    }

    return (
        <div>
            {/* Statistics */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <ClockIcon className="w-5 h-5 text-orange-500" />
                            <span className="text-sm font-medium text-gray-700">
                Đang làm: {pendingTasks.length}
              </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-medium text-gray-700">
                Hoàn thành: {completedTasks.length}
              </span>
                        </div>
                    </div>
                    <div className="text-sm text-gray-600">
                        Tổng: {tasks.length} task
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Tiến độ</span>
                        <span>{tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-300"
                            style={{
                                width: tasks.length > 0 ? `${(completedTasks.length / tasks.length) * 100}%` : '0%'
                            }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <ClockIcon className="w-5 h-5 text-orange-500" />
                        Đang làm ({pendingTasks.length})
                    </h3>
                    <div className="space-y-3">
                        {pendingTasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onToggleComplete={onToggleComplete}
                                onEditTask={onEditTask}
                                onDeleteTask={onDeleteTask}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        Hoàn thành ({completedTasks.length})
                    </h3>
                    <div className="space-y-3">
                        {completedTasks.map((task) => (
                            <TaskItem
                                key={task.id}
                                task={task}
                                onToggleComplete={onToggleComplete}
                                onEditTask={onEditTask}
                                onDeleteTask={onDeleteTask}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};