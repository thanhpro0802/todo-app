
import React, { useRef } from 'react';
import { useTaskStore } from './store/taskStore';
import { EnhancedAddTaskForm } from './components/tasks/EnhancedAddTaskForm';
import { DraggableTaskList } from './components/tasks/DraggableTaskList';
import { TaskToolbar } from './components/tasks/TaskToolbar';
import { KeyboardShortcuts } from './components/ui/KeyboardShortcuts';
import { QuickStats } from './components/dashboard/QuickStats';
import { AnimatedContainer } from './components/ui/Animations';
import { ClipboardDocumentListIcon, CommandLineIcon } from '@heroicons/react/24/outline';

function App() {
    const {
        updateTask,
        deleteTask: storeDeleteTask,
        toggleTaskComplete,
        clearCompleted: storeClearCompleted,
        getTaskStats,
        getFilteredTasks
    } = useTaskStore();

    const addTaskFormRef = useRef<HTMLDivElement>(null);
    const [showKeyboardHelp, setShowKeyboardHelp] = React.useState(false);

    const tasks = getFilteredTasks();

    const toggleComplete = (id: string) => {
        toggleTaskComplete(id);
    };

    const editTask = (id: string, newText: string) => {
        updateTask(id, { text: newText });
    };

    const deleteTask = (id: string) => {
        storeDeleteTask(id);
    };

    const clearCompleted = () => {
        storeClearCompleted();
    };

    const handleAddTaskFocus = () => {
        const addTaskInput = document.querySelector('input[placeholder="Thêm task mới..."]') as HTMLInputElement;
        addTaskInput?.focus();
    };

    const stats = getTaskStats();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <KeyboardShortcuts onAddTaskFocus={handleAddTaskFocus} />
            
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <AnimatedContainer>
                    <header className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <ClipboardDocumentListIcon className="w-8 h-8 text-blue-500" />
                            <h1 className="text-3xl font-bold text-gray-800">
                                Todo App Pro
                            </h1>
                        </div>
                        <p className="text-gray-600 mb-4">
                            Quản lý công việc hàng ngày một cách hiệu quả và chuyên nghiệp
                        </p>
                        
                        {/* Keyboard shortcuts help */}
                        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                            <button
                                onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
                                className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                            >
                                <CommandLineIcon className="w-4 h-4" />
                                Phím tắt
                            </button>
                        </div>
                        
                        {showKeyboardHelp && (
                            <div className="mt-4 p-4 bg-white rounded-lg shadow border text-left max-w-md mx-auto">
                                <h3 className="font-semibold mb-2">Phím tắt hữu ích:</h3>
                                <div className="space-y-1 text-xs">
                                    <div><kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl/Cmd + N</kbd> - Thêm task mới</div>
                                    <div><kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl/Cmd + F</kbd> - Tìm kiếm</div>
                                    <div><kbd className="px-1 py-0.5 bg-gray-100 rounded">Ctrl/Cmd + Shift + D</kbd> - Xóa hoàn thành</div>
                                    <div><kbd className="px-1 py-0.5 bg-gray-100 rounded">Esc</kbd> - Xóa tìm kiếm</div>
                                </div>
                            </div>
                        )}
                    </header>
                </AnimatedContainer>

                {/* Quick Stats */}
                <AnimatedContainer delay={0.1} className="mb-8">
                    <QuickStats />
                </AnimatedContainer>

                {/* Main Content */}
                <AnimatedContainer delay={0.2}>
                    <main className="bg-white rounded-xl shadow-lg p-6">
                        <div ref={addTaskFormRef}>
                            <EnhancedAddTaskForm />
                        </div>

                        <TaskToolbar className="mb-6" />

                        <DraggableTaskList
                            tasks={tasks}
                            onToggleComplete={toggleComplete}
                            onEditTask={editTask}
                            onDeleteTask={deleteTask}
                        />

                        {/* Clear Completed Button */}
                        {stats.completed > 0 && (
                            <AnimatedContainer delay={0.3} className="mt-6 pt-6 border-t border-gray-200">
                                <button
                                    onClick={clearCompleted}
                                    className="w-full py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
                                >
                                    Xóa tất cả task đã hoàn thành ({stats.completed})
                                </button>
                            </AnimatedContainer>
                        )}
                    </main>
                </AnimatedContainer>

                {/* Footer */}
                <AnimatedContainer delay={0.4}>
                    <footer className="text-center mt-8 text-gray-500 text-sm">
                        <p>© 2024 Todo App Pro - Made with ❤️ using React + TypeScript + Tailwind</p>
                        <p className="mt-1">Tích hợp Drag & Drop • Tìm kiếm thông minh • Phím tắt</p>
                    </footer>
                </AnimatedContainer>
            </div>
        </div>
    );
}

export default App;