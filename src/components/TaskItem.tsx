import React, { useState } from 'react';
import { Task } from '../types/Task';
import {
  CheckIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEditTask: (id: string, newText: string) => void;
  onDeleteTask: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEditSubmit = () => {
    if (editText.trim() && editText !== task.text) {
      onEditTask(task.id, editText.trim());
    }
    setIsEditing(false);
    setEditText(task.text);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditText(task.text);
  };

  const handleDelete = () => {
    onDeleteTask(task.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div className={`p-4 border rounded-lg transition-all duration-200 ${
      task.completed 
        ? 'bg-gray-50 border-gray-200' 
        : 'bg-white border-gray-300 hover:border-gray-400'
    }`}>
      <div className="flex items-center gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggleComplete(task.id)}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            task.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-green-400'
          }`}
        >
          {task.completed && <CheckIcon className="w-4 h-4" />}
        </button>

        {/* Task Text */}
        <div className="flex-1">
          {isEditing ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEditSubmit();
                  if (e.key === 'Escape') handleEditCancel();
                }}
                className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                autoFocus
              />
              <button
                onClick={handleEditSubmit}
                className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                <CheckIcon className="w-4 h-4" />
              </button>
              <button
                onClick={handleEditCancel}
                className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <span
              className={`${
                task.completed
                  ? 'line-through text-gray-500'
                  : 'text-gray-800'
              } transition-all duration-200`}
            >
              {task.text}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        {!isEditing && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded transition-all duration-200"
              title="Chỉnh sửa"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-all duration-200"
              title="Xóa"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 mb-3">
            Bạn có chắc chắn muốn xóa task này?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
            >
              Xóa
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Task Info */}
      <div className="mt-2 text-xs text-gray-400">
        Tạo lúc: {new Date(task.createdAt).toLocaleString('vi-VN')}
        {task.updatedAt !== task.createdAt && (
          <span className="ml-2">
            • Cập nhật: {new Date(task.updatedAt).toLocaleString('vi-VN')}
          </span>
        )}
      </div>
    </div>
  );
};