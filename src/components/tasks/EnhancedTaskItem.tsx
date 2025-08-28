import React, { useState } from 'react';
import {
  CheckIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  ClockIcon,
  DocumentTextIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { Task } from '../../types/Task';
import { PriorityBadge } from '../ui/PriorityBadge';
import { DueDateBadge } from '../ui/DueDateBadge';
import { TagBadge } from '../ui/TagBadge';
import { formatTime } from '../../utils/dateUtils';
import { useTaskStore } from '../../store/taskStore';

interface EnhancedTaskItemProps {
  task: Task;
  onToggleComplete?: (id: string) => void;
  onEditTask?: (id: string, newText: string) => void;
  onDeleteTask?: (id: string) => void;
}

export const EnhancedTaskItem: React.FC<EnhancedTaskItemProps> = ({
  task,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
}) => {
  const { updateTask, deleteTask: storeDeleteTask, toggleTaskComplete, categories } = useTaskStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleEditSubmit = () => {
    if (editText.trim() && editText !== task.text) {
      if (onEditTask) {
        onEditTask(task.id, editText.trim());
      } else {
        updateTask(task.id, { text: editText.trim() });
      }
    }
    setIsEditing(false);
    setEditText(task.text);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditText(task.text);
  };

  const handleDelete = () => {
    if (onDeleteTask) {
      onDeleteTask(task.id);
    } else {
      storeDeleteTask(task.id);
    }
    setShowDeleteConfirm(false);
  };

  const handleToggleComplete = () => {
    if (onToggleComplete) {
      onToggleComplete(task.id);
    } else {
      toggleTaskComplete(task.id);
    }
  };

  const categoryInfo = categories.find(cat => cat.id === task.category);
  const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
  const hasSubtasks = task.subtasks.length > 0;

  return (
    <div className={`p-4 border rounded-xl transition-all duration-200 ${
      task.completed 
        ? 'bg-gray-50 border-gray-200 opacity-75' 
        : 'bg-white border-gray-300 hover:border-gray-400 hover:shadow-md'
    }`}>
      {/* Main Content */}
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggleComplete}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 mt-1 ${
            task.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-green-400'
          }`}
        >
          {task.completed && <CheckIcon className="w-4 h-4" />}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {/* Text and Priority */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              {isEditing ? (
                <div className="flex gap-2 mb-2">
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
                <div>
                  <h3
                    className={`text-lg font-medium cursor-pointer transition-all duration-200 ${
                      task.completed
                        ? 'line-through text-gray-500'
                        : 'text-gray-800 hover:text-blue-600'
                    }`}
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {task.text}
                  </h3>
                  
                  {/* Badges Row */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <PriorityBadge priority={task.priority} />
                    
                    {task.dueDate && (
                      <DueDateBadge dueDate={task.dueDate} />
                    )}
                    
                    {categoryInfo && (
                      <span 
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
                        style={{ backgroundColor: `${categoryInfo.color}20`, borderColor: `${categoryInfo.color}40`, color: categoryInfo.color }}
                      >
                        {categoryInfo.name}
                      </span>
                    )}
                    
                    {task.timeEstimation && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        <ClockIcon className="w-3 h-3" />
                        {formatTime(task.timeEstimation)}
                      </span>
                    )}
                    
                    {hasSubtasks && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                        <ListBulletIcon className="w-3 h-3" />
                        {completedSubtasks}/{task.subtasks.length}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.tags.map((tag) => (
                        <TagBadge key={tag} tag={tag} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {!isEditing && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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

          {/* Expanded Details */}
          {showDetails && (
            <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
              {/* Description */}
              {task.description && (
                <div className="flex gap-2">
                  <DocumentTextIcon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">{task.description}</p>
                </div>
              )}

              {/* Subtasks */}
              {hasSubtasks && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <ListBulletIcon className="w-4 h-4" />
                    Subtasks ({completedSubtasks}/{task.subtasks.length})
                  </h4>
                  <div className="space-y-1 pl-5">
                    {task.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={subtask.completed}
                          onChange={() => {
                            const updatedSubtasks = task.subtasks.map(st =>
                              st.id === subtask.id ? { ...st, completed: !st.completed } : st
                            );
                            updateTask(task.id, { subtasks: updatedSubtasks });
                          }}
                          className="w-3 h-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className={`text-sm ${subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                          {subtask.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-xs text-gray-500 flex flex-wrap gap-4">
                <span>Tạo lúc: {task.createdAt.toLocaleString('vi-VN')}</span>
                <span>• Cập nhật: {task.updatedAt.toLocaleString('vi-VN')}</span>
                {task.completedAt && (
                  <span>• Hoàn thành: {task.completedAt.toLocaleString('vi-VN')}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 mb-3">
            Bạn có chắc chắn muốn xóa task này không?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
            >
              Xóa
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};