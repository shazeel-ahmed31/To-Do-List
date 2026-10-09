// Task Manager JavaScript

class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.editingTaskId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
    }

    bindEvents() {
        // Form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        document.getElementById('taskInput').addEventListener('input', e => e.target.setCustomValidity(''));
        document.getElementById('editTaskInput').addEventListener('input', e => e.target.setCustomValidity(''));
        document.getElementById('editModal').addEventListener('shown.bs.modal', () => document.getElementById('editTaskInput').focus());
        document.getElementById('editModal').addEventListener('hidden.bs.modal', () => { this.editingTaskId = null; document.getElementById('taskInput').focus(); });
        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.currentSearch = e.target.value.toLowerCase();
            this.renderTasks();
        });

        // Filter functionality
        document.getElementById('filterSelect').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.renderTasks();
        });

        // Clear all tasks
        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.clearAllTasks();
        });

        // Edit form submission
        document.getElementById('editForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEdit();
        });

        // Save edit button
        document.getElementById('saveEditBtn').addEventListener('click', () => {
            this.saveEdit();
        });
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const taskText = taskInput.value.trim();

        taskInput.setCustomValidity(taskText && taskText.length <= 500 ? '' : 'Enter a task of 1 to 500 characters.');
        if (!taskInput.reportValidity()) return;

        const newTask = {
            id: TaskData.nextId(this.tasks),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString(),
            priority: 'medium'
        };

        this.tasks.unshift(newTask);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        
        taskInput.value = '';
        
        // Add animation class to new task
        setTimeout(() => {
            const newTaskElement = document.querySelector(`[data-task-id="${newTask.id}"]`);
            if (newTaskElement) {
                newTaskElement.classList.add('new-task');
            }
        }, 100);
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    toggleTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            this.editingTaskId = taskId;
            document.getElementById('editTaskInput').value = task.text;
            const editModal = new bootstrap.Modal(document.getElementById('editModal'));
            editModal.show();
        }
    }

    saveEdit() {
        const newText = document.getElementById('editTaskInput').value.trim();
        const input = document.getElementById('editTaskInput');
        input.setCustomValidity(newText && newText.length <= 500 ? '' : 'Enter a task of 1 to 500 characters.');
        if (!input.reportValidity() || this.editingTaskId === null) return;

        const task = this.tasks.find(task => task.id === this.editingTaskId);
        if (task) {
            task.text = newText;
            task.updatedAt = new Date().toISOString();
            this.saveTasks();
            this.renderTasks();
            
            const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
            editModal.hide();
            this.editingTaskId = null;
        }
    }

    clearAllTasks() {
        if (confirm('Are you sure you want to delete all tasks? This action cannot be undone.')) {
            this.tasks = [];
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    getFilteredTasks() {
        return TaskData.filterTasks(this.tasks, this.currentSearch, this.currentFilter);
    }

    renderTasks() {
        const focused = document.activeElement;
        const row = focused.closest?.('[data-task-id]');
        const focusId = row?.dataset.taskId;
        const focusKind = focused.matches?.('.task-checkbox') ? '.task-checkbox' : focused.matches?.('.btn-warning') ? '.btn-warning' : '.btn-danger';
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            taskList.innerHTML = '';
            emptyState.classList.remove('d-none');
            if (focusId) document.getElementById('taskInput').focus();
            emptyState.querySelector('p').textContent = this.tasks.length ? 'Try another search or task filter.' : 'Add a new task to get started!';
            return;
        }

        emptyState.classList.add('d-none');

        const tasksHTML = filteredTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''} ${task.priority}-priority" data-task-id="${task.id}">
                <div class="task-content">
                    <div class="task-left">
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                               aria-label="Mark ${this.escapeHtml(task.text)} ${task.completed ? 'active' : 'completed'}" onchange="taskManager.toggleTask(${task.id})">
                        <p class="task-text">${this.escapeHtml(task.text)}</p>
                    </div>
                    <div class="task-actions">
                        <button class="btn btn-warning btn-sm" onclick="taskManager.editTask(${task.id})" 
                                aria-label="Edit ${this.escapeHtml(task.text)}" title="Edit task">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="taskManager.deleteTask(${task.id})" 
                                aria-label="Delete ${this.escapeHtml(task.text)}" title="Delete task">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <small class="text-muted mt-2 d-block">
                    Created: ${this.formatDate(task.createdAt)}
                    ${task.completedAt ? ` • Completed: ${this.formatDate(task.completedAt)}` : ''}
                    ${task.updatedAt ? ` • Updated: ${this.formatDate(task.updatedAt)}` : ''}
                </small>
            </div>
        `).join('');

        taskList.innerHTML = tasksHTML;
        if (focusId) (taskList.querySelector(`[data-task-id="${focusId}"] ${focusKind}`) || document.getElementById('taskInput')).focus();
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const activeTasks = totalTasks - completedTasks;

        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('activeTasks').textContent = activeTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
    }

    loadTasks() {
        try {
            const tasks = localStorage.getItem('taskManagerTasks');
            return tasks ? TaskData.validateTasks(JSON.parse(tasks)) : [];
        } catch (error) {
            document.getElementById('storageStatus').textContent = 'Saved tasks could not be read. Original storage has been kept; adding tasks will replace it.';
            return [];
        }
    }

    saveTasks() {
        try {
            localStorage.setItem('taskManagerTasks', JSON.stringify(this.tasks));
            document.getElementById('storageStatus').textContent = '';
        } catch (error) {
            console.error('Error saving tasks to localStorage:', error);
            document.getElementById('storageStatus').textContent = 'Changes are only in memory: browser storage is unavailable or full.';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replaceAll('"', '&quot;').replaceAll("'", '&#39;');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }


}

// Initialize the task manager when the page loads
let taskManager;
document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to add task
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const taskInput = document.getElementById('taskInput');
        if (document.activeElement === taskInput && taskInput.value.trim()) {
            taskManager.addTask();
        }
    }
    
    // Escape to clear search
    if (e.key === 'Escape') {
        const searchInput = document.getElementById('searchInput');
        if (document.activeElement === searchInput) {
            searchInput.value = '';
            taskManager.currentSearch = '';
            taskManager.renderTasks();
        }
    }
});