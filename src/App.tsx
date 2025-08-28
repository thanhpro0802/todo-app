
import { useTaskStore } from './store/taskStore';
import { EnhancedAddTaskForm } from './components/tasks/EnhancedAddTaskForm';
import { DraggableTaskList } from './components/tasks/DraggableTaskList';
import { TaskToolbar } from './components/tasks/TaskToolbar';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

function App() {
    const {
        updateTask,
        deleteTask: storeDeleteTask,
        toggleTaskComplete,
        clearCompleted: storeClearCompleted,
        getTaskStats,
        getFilteredTasks
    } = useTaskStore();

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

    const stats = getTaskStats();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Header */}
                <header className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <ClipboardDocumentListIcon className="w-8 h-8 text-blue-500" />
                        <h1 className="text-3xl font-bold text-gray-800">
                            Todo App
                        </h1>
                    </div>
                    <p className="text-gray-600">
                        Quản lý công việc hàng ngày một cách hiệu quả
                    </p>
                </header>

                {/* Main Content */}
                <main className="bg-white rounded-xl shadow-lg p-6">
                    <EnhancedAddTaskForm />

                    <TaskToolbar className="mb-6" />

                    <DraggableTaskList
                        tasks={tasks}
                        onToggleComplete={toggleComplete}
                        onEditTask={editTask}
                        onDeleteTask={deleteTask}
                    />

                    {/* Clear Completed Button */}
                    {stats.completed > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <button
                                onClick={clearCompleted}
                                className="w-full py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
                            >
                                Xóa tất cả task đã hoàn thành ({stats.completed})
                            </button>
                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer className="text-center mt-8 text-gray-500 text-sm">
                    <p>© 2024 Todo App - Made with ❤️ using React + TypeScript + Tailwind</p>
                </footer>
            </div>
        </div>
    );
}

export default App;