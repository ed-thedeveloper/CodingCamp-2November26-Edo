# Design Document: To-Do List Life Dashboard

## Overview

The To-Do List Life Dashboard is a client-side web application serving as a personal productivity landing page. It combines a live greeting clock, a 25-minute focus (Pomodoro-style) timer, a persistent to-do list, and quick links to favorite websites.

**Technology Stack:** HTML5, CSS3, Vanilla JavaScript (no frameworks or libraries)

**Architecture:** Single-page application with all state managed in memory and persisted to Local Storage API

**Target Environment:** Modern browsers (Chrome, Firefox, Edge, Safari) running as standalone web app or browser extension

### Key Design Principles

1. **Simplicity**: Minimal DOM structure with clear visual hierarchy
2. **Persistence**: All data saved to Local Storage for state retention across sessions
3. **Performance**: Direct DOM manipulation for immediate feedback without framework overhead
4. **Modularity**: Component-based JavaScript structure for maintainability

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Dashboard (index.html)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │  Greeting Widget│  │  Focus Timer    │                   │
│  │  (time/date)    │  │  (25-min timer) │                   │
│  └─────────────────┘  └─────────────────┘                   │
│                                                               │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │  Task List      │  │  Quick Links    │                   │
│  │  (to-do items)  │  │  (bookmarks)    │                   │
│  └─────────────────┘  └─────────────────┘                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Local Storage │
                    └───────────────┘
```

### Component Interaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Event Loop                              │
├─────────────────────────────────────────────────────────────┤
│ 1. User interacts with UI (clicks, typing)                  │
│ 2. Event handlers update in-memory state                    │
│ 3. State changes trigger re-render of affected components   │
│ 4. Local Storage is updated for persistence                 │
│ 5. UI updates to reflect new state                          │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Load Phase** (on page load):
   - Read from Local Storage
   - Parse JSON data
   - Initialize component state
   - Render initial UI

2. **Update Phase** (on user action):
   - Update in-memory state
   - Re-render component UI
   - Save to Local Storage

3. **Timer Phase** (every second):
   - Update current time/date
   - Update Greeting Widget
   - Update Focus Timer countdown
   - Render updates

---

## Components and Interfaces

### Component Breakdown

```
index.html
├── Header (optional)
│   └── Page Title
│
├── Greeting Widget Component
│   ├── Time Display (HH:MM:SS)
│   ├── Date Display (Weekday, Month Day, Year)
│   └── Greeting Text ("Good Morning/Afternoon/Evening/Night")
│
├── Focus Timer Component
│   ├── Timer Display (MM:SS)
│   ├── Start Button
│   ├── Stop Button
│   └── Reset Button
│
├── Task List Component
│   ├── Task Input (text + submit)
│   ├── Task List Container
│   │   ├── Task Item (x N)
│   │   │   ├── Edit Input (optional, hidden by default)
│   │   │   ├── Task Text (display mode)
│   │   │   ├── Completion Toggle Checkbox
│   │   │   └── Delete Button
│   │   └── Empty State Message (shown when no tasks)
│   └── Clear All Button (optional)
│
└── Quick Links Widget Component
    ├── Add Quick Link Form
    │   ├── Name Input
    │   ├── URL Input
    │   └── Add Button
    ├── Quick Links Container
    │   ├── Quick Link Button (x N)
    │   └── Empty State Message (shown when no links)
    └── Delete All Button (optional)
```

### Component Interface Specifications

#### Greeting Widget

**State:**
- `currentTime`: Date object representing current time
- `currentDate`: Formatted date string
- `currentGreeting`: String ("Good Morning" | "Good Afternoon" | "Good Evening" | "Good Night")

**Public Methods:**
- `init()`: Initialize timer interval and render initial state
- `update()`: Update time, date, and greeting based on current time
- `formatTime(date)`: Format Date to HH:MM:SS
- `formatDate(date)`: Format Date to weekday, month day, year
- `getGreeting(hour)`: Determine greeting based on hour (5-11: morning, 12-16: afternoon, 17-20: evening, 21-4: night)

**Event Listeners:**
- None (passive component updated by main timer)

---

#### Focus Timer

**State:**
- `duration`: Total duration in seconds (25 * 60 = 1500)
- `remaining`: Remaining time in seconds
- `isRunning`: Boolean indicating if countdown is active
- `intervalId`: Timer interval reference for cleanup

**Public Methods:**
- `init()`: Initialize timer state and render initial display
- `start()`: Begin countdown interval
- `stop()`: Pause countdown, retain remaining time
- `reset()`: Stop and reset to full 25 minutes
- `tick()`: Decrease remaining time by 1 second
- `formatTime(seconds)`: Format seconds to MM:SS with zero-padding
- `isComplete()`: Check if timer reached zero

**Event Listeners:**
- Start button click → call `start()`
- Stop button click → call `stop()`
- Reset button click → call `reset()`

---

#### Task List

**State:**
- `tasks`: Array of Task objects `{ id, text, completed }`
- `nextId`: Counter for generating unique IDs

**Public Methods:**
- `init()`: Load tasks from Local Storage and render
- `addTask(text)`: Create and add new task
- `editTask(id, newText)`: Update task text
- `toggleTask(id)`: Toggle completed status
- `deleteTask(id)`: Remove task from list
- `clearAllTasks()`: Remove all tasks
- `save()`: Save tasks to Local Storage
- `render()`: Re-render task list UI
- `renderTask(task)`: Render single task item
- `getEmptyStateMessage()`: Return empty state HTML

**Event Listeners:**
- Add task form submit → call `addTask()` with input value
- Task edit click → toggle edit mode for task
- Task edit form submit → call `editTask()`
- Task completion toggle → call `toggleTask()`
- Task delete click → call `deleteTask()`

---

#### Quick Links Widget

**State:**
- `links`: Array of Quick Link objects `{ id, name, url }`
- `nextId`: Counter for generating unique IDs

**Public Methods:**
- `init()`: Load links from Local Storage and render
- `addLink(name, url)`: Create and add new quick link
- `deleteLink(id)`: Remove quick link from list
- `clearAllLinks()`: Remove all links
- `save()`: Save links to Local Storage
- `render()`: Re-render quick links UI
- `renderLink(link)`: Render single quick link button
- `getEmptyStateMessage()`: Return empty state HTML

**Event Listeners:**
- Add link form submit → call `addLink()` with input values
- Link delete click → call `deleteLink()`

---

## Data Models

### Task Data Model

```javascript
{
  id: string,          // Unique identifier (UUID or timestamp-based)
  text: string,        // Task description
  completed: boolean   // Completion status
}
```

**Validation Rules:**
- `id`: Must be non-empty string
- `text`: Must be non-empty string (trimmed), max length 500 characters
- `completed`: Boolean

**Example:**
```json
{
  "id": "task-1704067200000",
  "text": "Complete project documentation",
  "completed": false
}
```

---

### Quick Link Data Model

```javascript
{
  id: string,   // Unique identifier
  name: string, // Display name
  url: string   // Website URL
}
```

**Validation Rules:**
- `id`: Must be non-empty string
- `name`: Must be non-empty string (trimmed), max length 100 characters
- `url`: Must be non-empty string (trimmed), must be valid URL format

**Example:**
```json
{
  "id": "link-1704067200001",
  "name": "GitHub",
  "url": "https://github.com"
}
```

---

### Main Dashboard State

```javascript
{
  greeting: {
    currentTime: Date,
    currentDate: string,
    currentGreeting: string
  },
  timer: {
    duration: number,   // 1500 (25 minutes)
    remaining: number,  // Current countdown value
    isRunning: boolean
  },
  tasks: Array<Task>,
  quickLinks: Array<QuickLink>
}
```

---

## Local Storage Schema

### Storage Keys

| Key Name | Data Type | Description |
|----------|-----------|-------------|
| `todo-dashboard-tasks` | JSON string | Array of Task objects |
| `todo-dashboard-links` | JSON string | Array of Quick Link objects |

### Data Format

#### Tasks Storage
```json
{
  "key": "todo-dashboard-tasks",
  "value": "[{\"id\":\"task-1\",\"text\":\"Example task\",\"completed\":false}]"
}
```

#### Quick Links Storage
```json
{
  "key": "todo-dashboard-links", 
  "value": "[{\"id\":\"link-1\",\"name\":\"Example\",\"url\":\"https://example.com\"}]"
}
```

### Persistence Operations

**Saving Tasks:**
```javascript
localStorage.setItem('todo-dashboard-tasks', JSON.stringify(taskList.tasks));
```

**Loading Tasks:**
```javascript
const savedTasks = localStorage.getItem('todo-dashboard-tasks');
const tasks = savedTasks ? JSON.parse(savedTasks) : [];
```

**Saving Quick Links:**
```javascript
localStorage.setItem('todo-dashboard-links', JSON.stringify(quickLinkList.links));
```

**Loading Quick Links:**
```javascript
const savedLinks = localStorage.getItem('todo-dashboard-links');
const links = savedLinks ? JSON.parse(savedLinks) : [];
```

---

## UI Layout and Visual Hierarchy

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    Dashboard Container                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Greeting Widget Card                     │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │   [Greeting]                                      │  │  │
│  │  │   [Time: 14:30:25]                                │  │  │
│  │  │   [Date: Monday, January 1, 2024]                 │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │               Focus Timer Card                        │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │              [25:00]                              │  │  │
│  │  │  [Start] [Stop] [Reset]                           │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Task List Card                           │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  [Task Input: _____________] [Add]              │  │  │
│  │  │  ─────────────────────────────────────────────   │  │  │
│  │  │  [✓] Task item 1          [Edit] [Delete]        │  │  │
│  │  │  [ ] Task item 2          [Edit] [Delete]        │  │  │
│  │  │  ...                                             │  │  │
│  │  │  (Empty state: "No tasks yet. Add one above!")   │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Quick Links Widget Card                     │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  [Name: ___] [URL: ______] [Add]                │  │  │
│  │  │  ─────────────────────────────────────────────   │  │  │
│  │  │  [GitHub] [LinkedIn] [Stack Overflow]            │  │  │
│  │  │  ...                                             │  │  │
│  │  │  (Empty state: "No quick links yet.")            │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Visual Hierarchy

1. **Primary Section**: Greeting Widget (top, prominent)
2. **Secondary Section**: Focus Timer (below greeting, centered)
3. **Tertiary Section**: Task List (main content area)
4. **Quaternary Section**: Quick Links (bottom, supporting)

### Color Scheme

| Element | Color | Purpose |
|---------|-------|---------|
| Background | `#f5f7fa` | Light, clean background |
| Cards | `#ffffff` | White cards with subtle shadows |
| Text Primary | `#2c3e50` | Main text content |
| Text Secondary | `#7f8c8d` | Secondary information |
| Accent | `#3498db` | Primary actions (buttons, links) |
| Success | `#27ae60` | Completed tasks, success states |
| Warning | `#f39c12` | Timer active state |
| Danger | `#e74c3c` | Delete actions, errors |
| Border | `#ecf0f1` | Card borders |

### Typography

| Element | Font Size | Weight | Spacing |
|---------|-----------|--------|---------|
| Greeting | 24px | 600 | 16px bottom |
| Time | 32px | 400 | 8px bottom |
| Date | 16px | 400 | 24px bottom |
| Timer Display | 48px | 400 | 24px bottom |
| Section Headers | 20px | 600 | 16px top/bottom |
| Task Text | 16px | 400 | 8px bottom |
| Button Text | 14px | 500 | - |
| Input Placeholder | 14px | 400 | - |

### Spacing

- Card padding: 24px
- Card margin: 16px
- Button padding: 8px 16px
- Input padding: 8px 12px
- Task item padding: 12px

---

## Event Handling and State Management

### State Management Approach

**In-Memory State:**
- Single state object for each component
- Direct mutation on updates
- Re-render on state changes

**State Updates:**
1. User triggers event
2. Event handler updates component state
3. Component re-renders based on new state
4. State persists to Local Storage

### Event Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    DOM Events                                │
│         ↓                    ↓                   ↓          │
│    Click Handler      Input Handler        Timer Tick      │
│         ↓                    ↓                   ↓          │
│         └───────────────────┬───────────────────┘          │
│                             ▼                               │
│                      Component Logic                        │
│                             ▼                               │
│                    State Update                             │
│                             ▼                               │
│                    Re-render UI                             │
│                             ▼                               │
│                   Local Storage                             │
└─────────────────────────────────────────────────────────────┘
```

### Timer Implementation

```javascript
// Global timer for Greeting Widget and Focus Timer
let globalTimerInterval;

function startGlobalTimer() {
    // Update time every second
    globalTimerInterval = setInterval(() => {
        greetingWidget.update();
        focusTimer.tick();
    }, 1000);
}

function stopGlobalTimer() {
    clearInterval(globalTimerInterval);
}
```

### Component Communication

**Communication Pattern:** Direct method calls

**Dependencies:**
- Components are independent (no cross-component dependencies)
- Main initialization orchestrates component setup
- Local Storage serves as shared persistence layer

**Initialization Order:**
1. Load saved data from Local Storage
2. Initialize Greeting Widget
3. Initialize Focus Timer
4. Initialize Task List
5. Initialize Quick Links Widget

---

## File Structure

```
project-root/
├── index.html              # Main HTML file
├── css/
│   └── style.css           # Single CSS file (200-300 lines)
├── js/
│   └── app.js              # Single JavaScript file (500-700 lines)
└── README.md               # Project documentation
```

### File Organization

#### index.html
- Document structure
- Semantic HTML5 elements
- Component containers with data attributes
- Meta tags for modern browser compatibility
- Links to CSS and JavaScript files

#### css/style.css
- CSS reset/normalize
- Component styles (cards, buttons, inputs)
- Layout styles (flexbox/grid)
- State styles (hover, focus, active)
- Responsive design (mobile-friendly)
- Animation/keyframes for transitions

#### js/app.js
- Component classes (GreetingWidget, FocusTimer, TaskList, QuickLinksWidget)
- Event handlers
- Local Storage utilities
- Initialization logic
- Utility functions (formatting, validation)

---

## Error Handling

### Input Validation

**Task Text:**
- Trim whitespace before validation
- Reject empty strings after trimming
- Maximum length: 500 characters

**Quick Link Name:**
- Trim whitespace before validation
- Reject empty strings after trimming
- Maximum length: 100 characters

**Quick Link URL:**
- Trim whitespace before validation
- Reject empty strings after trimming
- Basic URL format validation (contains "://" or starts with "www.")

### Error States

**Local Storage Errors:**
- Catch JSON.parse errors on malformed data
- Fall back to empty array on parse failure
- Log errors to console for debugging

**Timer Errors:**
- Clear interval on component destruction
- Handle multiple start calls (ignore if already running)
- Handle missing interval cleanup on page unload

### Graceful Degradation

- Timer continues in background if tab is inactive (modern browsers)
- Data persists even if UI fails to render
- Empty states displayed when no tasks or links exist
- Input validation prevents invalid data

---

## Testing Strategy

### Testing Overview

This feature will be tested using a combination of:

1. **Example-based Unit Tests** (Jest or similar)
2. **Integration Tests** (Local Storage interactions, data flow)
3. **UI Tests** (User interaction patterns)
4. **Snapshot Tests** (Component rendering)

**Note**: Property-based testing (PBT) is **not applicable** for this feature because it involves UI rendering, configuration validation, and simple CRUD operations. PBT works best for pure functions with input/output behavior (parsers, serializers, algorithms, business logic).

### Test Coverage Targets

**Greeting Widget:**
- Time formatting (3 test cases: morning, noon, midnight)
- Date formatting (1 test case)
- Greeting selection (4 test cases for 4 time ranges)
- Timer initialization (1 test case)

**Focus Timer:**
- Initialization (1 test case)
- Start/Stop/Reset behavior (3 test cases)
- Countdown decrement (1 test case)
- Time formatting (3 test cases: 25:00, 00:00, random)

**Task List:**
- Add task with valid input (1 test case)
- Add task with empty input (1 test case)
- Edit task with valid input (1 test case)
- Edit task with empty input (1 test case)
- Toggle completion (2 test cases: incomplete→complete, complete→incomplete)
- Delete task (1 test case)
- Load from Local Storage (1 test case)
- Save to Local Storage (1 test case)

**Quick Links Widget:**
- Add link with valid input (1 test case)
- Add link with empty name (1 test case)
- Add link with empty URL (1 test case)
- Delete link (1 test case)
- Load from Local Storage (1 test case)
- Save to Local Storage (1 test case)

### Test Infrastructure

**Test Framework:** Jest (or Mocha/Chai for simpler setup)

**Test Organization:**
```
tests/
├── unit/
│   ├── greetingWidget.test.js
│   ├── focusTimer.test.js
│   ├── taskList.test.js
│   └── quickLinksWidget.test.js
├── integration/
│   └── persistence.test.js
└── fixtures/
    ├── sampleTasks.json
    └── sampleLinks.json
```

### Manual Testing Checklist

- [ ] Time updates every second
- [ ] Date updates when day changes
- [ ] Greeting changes at correct time boundaries
- [ ] Timer starts, stops, resets correctly
- [ ] Timer counts down by 1 second each second
- [ ] Timer stops at 00:00
- [ ] Tasks can be added, edited, toggled, deleted
- [ ] Empty task input is rejected
- [ ] Tasks persist to Local Storage
- [ ] Quick links can be added and deleted
- [ ] Empty quick link input is rejected
- [ ] Quick links persist to Local Storage
- [ ] Empty states display when no items exist

---

## Future Considerations

### Potential Enhancements

1. **Dark Mode**: Toggle theme for reduced eye strain
2. **Task Categories**: Add labels or categories to tasks
3. **Task Priorities**: Add priority levels (high, medium, low)
4. **Task Due Dates**: Add deadline functionality
5. **Timer Customization**: Allow custom timer durations
6. **Analytics**: Track completed tasks and timer sessions
7. **Backup/Export**: Export data to JSON file

### Performance Optimizations

1. **Debounce Local Storage writes**: For high-frequency operations
2. **Virtual scrolling**: If task list grows very large
3. **Image optimization**: If quick links include favicons

### Accessibility Considerations

1. **Keyboard Navigation**: Ensure all interactive elements are reachable via keyboard
2. **ARIA Labels**: Add labels for screen readers
3. **Focus Indicators**: Clear focus states for all interactive elements
4. **Color Contrast**: Ensure sufficient contrast for text and buttons

---

## Design Decisions and Rationale

### Why No Framework?

**Decision:** Vanilla JavaScript with no UI framework

**Rationale:**
- Lightweight and fast loading
- No build step or dependencies
- Easy to understand and maintain
- Perfect for simple UI with direct DOM manipulation needs
- Browser extension compatibility

### Why Local Storage?

**Decision:** Browser Local Storage for persistence

**Rationale:**
- No backend server required
- Simple API for key-value storage
- Persistent across browser sessions
- Synchronous operations (no async complexity)
- Sufficient for single-user, client-side application

### Why Component-Based Architecture?

**Decision:** Separate components for each dashboard section

**Rationale:**
- Clear separation of concerns
- Easier to test and maintain
- Reusable patterns across components
- Independent state management per component
- Clear API boundaries between components

### Why Single CSS and JS Files?

**Decision:** One CSS file and one JS file for the entire application

**Rationale:**
- Simplicity for small application
- No build process complexity
- Easy to debug and understand
- Minimal HTTP requests
- Appropriate for <1000 lines of code

### Why Timer Reset on Reload?

**Decision:** Timer state is not persisted across page reloads

**Rationale:**
- User expects to start new session on reload
- Reduces complexity of state management
- Focus timer is typically used for single sessions
- Can be enhanced later if needed
