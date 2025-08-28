import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Task } from '../../types/Task';
import { DraggableTaskItem } from './DraggableTaskItem';
import { useTaskStore } from '../../store/taskStore';

interface DraggableTaskListProps {
  tasks: Task[];
  onToggleComplete?: (id: string) => void;
  onEditTask?: (id: string, newText: string) => void;
  onDeleteTask?: (id: string) => void;
}

export const DraggableTaskList: React.FC<DraggableTaskListProps> = ({
  tasks,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
}) => {
  const { updateTask } = useTaskStore();
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || active.id === over.id) return;

    const activeTask = tasks.find(t => t.id === active.id);
    const overTask = tasks.find(t => t.id === over.id);

    if (!activeTask || !overTask) return;

    // Only allow reordering within the same completion status
    if (activeTask.completed !== overTask.completed) return;

    const relevantTasks = activeTask.completed ? completedTasks : pendingTasks;
    const oldIndex = relevantTasks.findIndex(t => t.id === active.id);
    const newIndex = relevantTasks.findIndex(t => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedTasks = arrayMove(relevantTasks, oldIndex, newIndex);
      
      // Update the order property for each task
      reorderedTasks.forEach((task, index) => {
        updateTask(task.id, { 
          order: activeTask.completed ? 1000 + index : index 
        });
      });
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Chưa có task nào</p>
        <p className="text-gray-400 text-sm">Thêm task đầu tiên của bạn!</p>
      </div>
    );
  }

  const progressPercentage = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
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
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Tiến độ</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-orange-500" />
              Đang làm ({pendingTasks.length})
              <span className="text-xs text-gray-500 ml-2">Kéo thả để sắp xếp</span>
            </h3>
            <SortableContext items={pendingTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <DraggableTaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onEditTask={onEditTask}
                    onDeleteTask={onDeleteTask}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              Hoàn thành ({completedTasks.length})
              <span className="text-xs text-gray-500 ml-2">Kéo thả để sắp xếp</span>
            </h3>
            <SortableContext items={completedTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {completedTasks.map((task) => (
                  <DraggableTaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onEditTask={onEditTask}
                    onDeleteTask={onDeleteTask}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        )}

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <div className="transform rotate-3 opacity-90">
              <DraggableTaskItem
                task={activeTask}
                onToggleComplete={() => {}}
                onEditTask={() => {}}
                onDeleteTask={() => {}}
                isDragOverlay
              />
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};