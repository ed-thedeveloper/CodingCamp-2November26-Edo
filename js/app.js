// To-Do List Life Dashboard - Main Application

// ============================================
// Greeting Widget Component
// ============================================
class GreetingWidget {
    constructor() {
        this.greetingElement = document.querySelector('.greeting-text');
        this.timeElement = document.querySelector('.time-display');
        this.dateElement = document.querySelector('.date-display');
        this.nameInput = document.querySelector('.name-input');
        this.currentTime = new Date();
        this.greeting = '';
        this.timerInterval = null;
        this.userName = '';
        this.LS_KEY_NAME = 'todo-dashboard-username';
    }

    init() {
        this.loadUserName();
        this.update();
        this.timerInterval = setInterval(() => this.update(), 1000);
        
        this.nameInput.addEventListener('change', () => {
            this.saveUserName();
            this.updateGreeting();
            this.resetNameInput();
        });
        this.nameInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.saveUserName();
                this.updateGreeting();
                this.resetNameInput();
            }
        });
    }

    update() {
        this.currentTime = new Date();
        this.updateGreeting();
        this.updateTimeDisplay();
        this.updateDateDisplay();
    }

    getGreeting(hour) {
        if (hour >= 4 && hour <= 11) return 'Good Morning';
        if (hour >= 12 && hour <= 15) return 'Good Day';
        if (hour >= 16 && hour <= 19) return 'Good Afternoon';
        return 'Good Night';
    }

    updateGreeting() {
        const hour = this.currentTime.getHours();
        const newGreeting = this.getGreeting(hour);
        if (this.greeting !== newGreeting || this.greeting === '') {
            this.greeting = newGreeting;
        }
        const greetingText = this.userName ? this.greeting + ', ' + this.userName + '!' : this.greeting;
        this.greetingElement.textContent = greetingText;
    }

    resetNameInput() {
        this.nameInput.value = '';
    }

    updateTimeDisplay() {
        const hours = String(this.currentTime.getHours()).padStart(2, '0');
        const minutes = String(this.currentTime.getMinutes()).padStart(2, '0');
        const seconds = String(this.currentTime.getSeconds()).padStart(2, '0');
        this.timeElement.textContent = hours + ':' + minutes + ':' + seconds;
    }

    updateDateDisplay() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        this.dateElement.textContent = this.currentTime.toLocaleDateString(undefined, options);
    }

    saveUserName() {
        const name = this.nameInput.value.trim();
        if (name) {
            this.userName = name;
            localStorage.setItem(this.LS_KEY_NAME, this.userName);
        }
    }

    loadUserName() {
        const saved = localStorage.getItem(this.LS_KEY_NAME);
        if (saved) {
            this.userName = saved;
            this.nameInput.value = saved;
            this.updateGreeting();
        }
    }
}

// ============================================
// Dark Mode Component
// ============================================
class DarkMode {
    constructor() {
        this.toggleBtn = document.querySelector('.theme-toggle');
        this.LS_KEY = 'todo-dashboard-theme';
        this.darkMode = localStorage.getItem(this.LS_KEY) === 'dark';
    }

    init() {
        this.applyTheme(this.darkMode);
        
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => {
                this.darkMode = !this.darkMode;
                this.applyTheme(this.darkMode);
                localStorage.setItem(this.LS_KEY, this.darkMode ? 'dark' : 'light');
            });
        }
    }

    applyTheme(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }
}

// ============================================
// Focus Timer Component
// ============================================
class FocusTimer {
    constructor() {
        this.displayElement = document.querySelector('.timer-display');
        this.startButton = document.querySelector('button[data-action="start"]');
        this.stopButton = document.querySelector('button[data-action="stop"]');
        this.resetButton = document.querySelector('button[data-action="reset"]');
        this.duration = 25 * 60;
        this.remaining = this.duration;
        this.isRunning = false;
        this.timerInterval = null;
    }

    init() {
        this.startButton.addEventListener('click', () => this.start());
        this.stopButton.addEventListener('click', () => this.stop());
        this.resetButton.addEventListener('click', () => this.reset());
        this.render();
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.timerInterval = setInterval(() => {
            if (this.remaining > 0) {
                this.remaining--;
                this.render();
            } else {
                this.stop();
            }
        }, 1000);
    }

    stop() {
        this.isRunning = false;
        clearInterval(this.timerInterval);
    }

    reset() {
        this.stop();
        this.remaining = this.duration;
        this.render();
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return String(minutes).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
    }

    render() {
        this.displayElement.textContent = this.formatTime(this.remaining);
    }
}

// ============================================
// Task List Component
// ============================================
class TaskList {
    constructor() {
        this.form = document.querySelector('.task-form');
        this.input = document.querySelector('.task-input');
        this.container = document.querySelector('.task-list-container');
        this.emptyState = document.querySelector('[data-empty-message]');
        this.tasks = [];
        this.nextId = 1;
        this.LS_KEY = 'todo-dashboard-tasks';
        this.load();
    }

    init() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask(this.input.value.trim());
            this.input.value = '';
        });
        this.render();
    }

    addTask(text) {
        if (!text) return;
        const existingTask = this.tasks.find(t => t.text.toLowerCase() === text.toLowerCase());
        if (existingTask) {
            this.input.value = '';
            return;
        }
        const task = { id: this.nextId++, text: text, completed: false };
        this.tasks.push(task);
        this.save();
        this.render();
    }

    editTask(id, newText) {
        const task = this.tasks.find(t => t.id === id);
        if (task && newText.trim()) {
            const existingTask = this.tasks.find(t => t.id !== id && t.text.toLowerCase() === newText.toLowerCase());
            if (existingTask) return;
            task.text = newText.trim();
            this.save();
            this.render();
        }
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.save();
            this.render();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.save();
        this.render();
    }

    save() {
        localStorage.setItem(this.LS_KEY, JSON.stringify(this.tasks));
    }

    load() {
        const saved = localStorage.getItem(this.LS_KEY);
        if (saved) {
            try {
                this.tasks = JSON.parse(saved);
                this.nextId = this.tasks.length > 0 ? Math.max(...this.tasks.map(t => t.id)) + 1 : 1;
            } catch (e) {
                this.tasks = [];
                this.nextId = 1;
            }
        }
    }

    render() {
        this.container.innerHTML = '';
        if (this.tasks.length === 0) {
            this.emptyState.textContent = this.emptyState.dataset.emptyMessage;
            this.emptyState.style.display = 'block';
            return;
        }
        this.emptyState.style.display = 'none';
        this.tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item' + (task.completed ? ' completed' : '');
            li.dataset.id = task.id;
            li.innerHTML = '<input type="checkbox" class="task-checkbox"' + (task.completed ? ' checked' : '') + '><span class="task-text">' + this.escapeHtml(task.text) + '</span><div class="task-actions"><button class="task-edit">Edit</button><button class="task-delete">Delete</button></div>';
            this.container.appendChild(li);
        });

        this.container.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = parseInt(e.target.closest('li').dataset.id);
                this.toggleTask(id);
            });
        });

        this.container.querySelectorAll('.task-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.closest('li').dataset.id);
                this.deleteTask(id);
            });
        });

        this.container.querySelectorAll('.task-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const li = e.target.closest('li');
                const id = parseInt(li.dataset.id);
                const task = this.tasks.find(t => t.id === id);
                if (task && !task.completed) {
                    li.innerHTML = '<input type="text" class="task-edit-input" value="' + this.escapeHtml(task.text) + '" autofocus><button class="task-edit">Save</button>';
                    const saveBtn = li.querySelector('.task-edit');
                    saveBtn.addEventListener('click', () => {
                        const input = li.querySelector('.task-edit-input');
                        this.editTask(id, input.value);
                    });
                }
            });
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ============================================
// Quick Links Widget Component
// ============================================
class QuickLinksWidget {
    constructor() {
        this.form = document.querySelector('.link-form');
        this.nameInput = document.querySelector('.link-name');
        this.urlInput = document.querySelector('.link-url');
        this.container = document.querySelector('.links-container');
        this.emptyState = document.querySelector('[data-empty-message]');
        this.links = [];
        this.nextId = 1;
        this.LS_KEY = 'todo-dashboard-links';
        this.load();
    }

    init() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addLink(this.nameInput.value.trim(), this.urlInput.value.trim());
            this.nameInput.value = '';
            this.urlInput.value = '';
        });
        this.render();
    }

    addLink(name, url) {
        if (!name || !url) return;
        const link = { id: this.nextId++, name: name, url: url };
        this.links.push(link);
        this.save();
        this.render();
    }

    deleteLink(id) {
        this.links = this.links.filter(l => l.id !== id);
        this.save();
        this.render();
    }

    save() {
        localStorage.setItem(this.LS_KEY, JSON.stringify(this.links));
    }

    load() {
        const saved = localStorage.getItem(this.LS_KEY);
        if (saved) {
            try {
                this.links = JSON.parse(saved);
                this.nextId = this.links.length > 0 ? Math.max(...this.links.map(l => l.id)) + 1 : 1;
            } catch (e) {
                this.links = [];
                this.nextId = 1;
            }
        }
    }

    render() {
        this.container.innerHTML = '';
        if (this.links.length === 0) {
            this.emptyState.textContent = this.emptyState.dataset.emptyMessage;
            this.emptyState.style.display = 'block';
            return;
        }
        this.emptyState.style.display = 'none';
        this.links.forEach(link => {
            const a = document.createElement('a');
            a.href = link.url.startsWith('http') ? link.url : 'https://' + link.url;
            a.className = 'quick-link-btn';
            a.textContent = link.name;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            
            const delBtn = document.createElement('button');
            delBtn.className = 'quick-link-delete';
            delBtn.textContent = '×';
            delBtn.title = 'Delete link';
            delBtn.addEventListener('click', () => this.deleteLink(link.id));
            
            const div = document.createElement('div');
            div.appendChild(a);
            div.appendChild(delBtn);
            this.container.appendChild(div);
        });
    }
}

// ============================================
// Main Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const greetingWidget = new GreetingWidget();
    const darkMode = new DarkMode();
    const focusTimer = new FocusTimer();
    const taskList = new TaskList();
    const quickLinksWidget = new QuickLinksWidget();

    greetingWidget.init();
    darkMode.init();
    focusTimer.init();
    taskList.init();
    quickLinksWidget.init();
});
