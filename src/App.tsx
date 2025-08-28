import React from 'react';
import { Task } from './types/Task';
import { useLocalStorage } from './hooks/useLocalStorage';
import { AddTaskForm } from './components/AddTaskForm';
import { TaskList } from './components/TaskList';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

function App() {
    const [tasks, setTasks] = useLocalStorage<Task[]>('todo-tasks', []);

    const addTask = (text: string) => {
        const newTask: Task = {
            id: Date.now().toString(),
            text,
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        setTasks([...tasks, newTask]);
    };

    const toggleComplete = (id: string) => {
        setTasks(tasks.map(task =>
            task.id === id
                ? { ...task, completed: !task.completed, updatedAt: new Date() }
                : task
        ));
    };

    const editTask = (id: string, newText: string) => {
        setTasks(tasks.map(task =>
            task.id === id
                ? { ...task, text: newText, updatedAt: new Date() }
                : task
        ));
    };

    const deleteTask = (id: string) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    const clearCompleted = () => {
        setTasks(tasks.filter(task => !task.completed));
    };

    const completedCount = tasks.filter(task => task.completed).length;

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
                    <AddTaskForm onAddTask={addTask} />

                    <TaskList
                        tasks={tasks}
                        onToggleComplete={toggleComplete}
                        onEditTask={editTask}
                        onDeleteTask={deleteTask}
                    />

                    {/* Clear Completed Button */}
                    {completedCount > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <button
                                onClick={clearCompleted}
                                className="w-full py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
                            >
                                Xóa tất cả task đã hoàn thành ({completedCount})
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