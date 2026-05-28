# Apple Design Language Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign MyPlanner's UI from Naive UI dark theme to an Apple-inspired light design language based on DESIGN.md tokens.

**Architecture:** Two-layer approach — CSS custom properties (`tokens.css`) as the single source of truth for all DESIGN.md values, feeding both custom CSS and Naive UI's `themeOverrides`. Layout shifts from 160px dark sidebar to 72px slim icon sidebar. Strategy: keep Naive UI, deeply customize via `NConfigProvider`.

**Tech Stack:** Vue 3, Naive UI, Pinia, ECharts, TypeScript, CSS custom properties

---

### Task 1: Create CSS Token Foundation (tokens.css)

**Files:**
- Create: `src/renderer/src/styles/tokens.css`

- [ ] **Step 1: Create tokens.css with all DESIGN.md values as CSS custom properties**

```css
/* === MyPlanner Design Tokens ===
   Single source of truth — maps DESIGN.md to CSS custom properties.
   All components reference these variables; never inline hex values. */

:root {
  /* --- Colors --- */
  --app-blue: #0066cc;
  --app-blue-focus: #0071e3;
  --app-blue-on-dark: #2997ff;
  --app-ink: #1d1d1f;
  --app-canvas: #ffffff;
  --app-parchment: #f5f5f7;
  --app-surface-pearl: #fafafc;
  --app-surface-tile-1: #272729;
  --app-hairline: #e0e0e0;
  --app-divider-soft: #f0f0f0;
  --app-muted: #7a7a7a;
  --app-muted-80: #333333;
  --app-muted-48: #7a7a7a;

  /* --- Typography --- */
  --app-font-display: "SF Pro Display", system-ui, -apple-system, sans-serif;
  --app-font-text: "SF Pro Text", system-ui, -apple-system, sans-serif;
  --app-fs-hero: 40px;
  --app-fs-lead: 28px;
  --app-fs-tagline: 21px;
  --app-fs-body: 17px;
  --app-fs-caption: 14px;
  --app-fs-fine: 12px;
  --app-fs-micro: 10px;
  --app-fw-light: 300;
  --app-fw-regular: 400;
  --app-fw-semibold: 600;
  --app-lh-tight: 1.1;
  --app-lh-body: 1.47;
  --app-ls-display: -0.02em;
  --app-ls-body: -0.022em;

  /* --- Spacing --- */
  --app-space-section: 80px;
  --app-space-xxl: 48px;
  --app-space-xl: 32px;
  --app-space-lg: 24px;
  --app-space-md: 17px;
  --app-space-sm: 12px;
  --app-space-xs: 8px;
  --app-space-xxs: 4px;

  /* --- Radius --- */
  --app-radius-pill: 9999px;
  --app-radius-lg: 18px;
  --app-radius-md: 11px;
  --app-radius-sm: 8px;
  --app-radius-xs: 5px;

  /* --- Shadow (product imagery / modals only) --- */
  --app-shadow-product: 3px 5px 30px rgba(0, 0, 0, 0.22);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/src/styles/tokens.css
git commit -m "feat: add Apple design tokens as CSS custom properties"
```

---

### Task 2: Create Global Baseline Styles (global.css)

**Files:**
- Create: `src/renderer/src/styles/global.css`

- [ ] **Step 1: Create global.css setting body typography and background**

```css
/* === MyPlanner Global Baseline ===
   Sets the typographic foundation. Tokens come from tokens.css. */

@import './tokens.css';

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, #app {
  height: 100%;
  overflow: hidden;
}

body {
  font-family: var(--app-font-text);
  font-size: var(--app-fs-body);
  font-weight: var(--app-fw-regular);
  line-height: var(--app-lh-body);
  letter-spacing: var(--app-ls-body);
  color: var(--app-ink);
  background: var(--app-parchment);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Utility: Apple-style section heading */
.app-section-heading {
  font-family: var(--app-font-display);
  font-size: var(--app-fs-tagline);
  font-weight: var(--app-fw-semibold);
  line-height: 1.19;
  color: var(--app-ink);
}

/* Utility: Apple-style page title */
.app-page-title {
  font-family: var(--app-font-display);
  font-size: var(--app-fs-hero);
  font-weight: var(--app-fw-semibold);
  line-height: var(--app-lh-tight);
  letter-spacing: var(--app-ls-display);
  color: var(--app-ink);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/src/styles/global.css
git commit -m "feat: add global baseline styles with Apple typography"
```

---

### Task 3: Import Styles in Entry Point

**Files:**
- Modify: `src/renderer/src/main.ts`

- [ ] **Step 1: Import global.css before app creation**

Replace the entire file:

```typescript
import './styles/global.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/src/main.ts
git commit -m "feat: import global CSS baseline in entry point"
```

---

### Task 4: Redesign AppLayout — Light Theme + Slim Sidebar

**Files:**
- Modify: `src/renderer/src/components/AppLayout.vue`

- [ ] **Step 1: Replace template with custom slim sidebar + Apple layout**

```vue
<template>
  <n-config-provider :locale="zhCN" :theme-overrides="appleTheme">
    <div class="app-shell">
      <nav class="slim-sidebar">
        <div class="sidebar-logo">MP</div>
        <button
          v-for="item in navItems"
          :key="item.key"
          class="sidebar-btn"
          :class="{ active: activeKey === item.key }"
          :title="item.label"
          @click="activeKey = item.key"
        >
          <component :is="item.icon" :size="22" />
        </button>
        <button class="sidebar-btn sidebar-bottom" title="设置" @click="showSettings = true">
          <SettingsOutline :size="22" />
        </button>
      </nav>
      <main class="app-content">
        <CalendarView v-if="activeKey === 'calendar'" />
        <ReviewView v-if="activeKey === 'review'" />
        <ReportView v-if="activeKey === 'report'" />
        <AIReportView v-if="activeKey === 'aireport'" />
      </main>
    </div>
    <SettingsModal v-if="showSettings" @close="showSettings = false" />
  </n-config-provider>
</template>
```

- [ ] **Step 2: Replace script with Apple theme config and icon imports**

```typescript
<script setup lang="ts">
import { ref, h } from 'vue'
import { NConfigProvider } from 'naive-ui'
import { zhCN } from 'naive-ui'
import { CalendarOutline, BookOutline, BarChartOutline, SparklesOutline, SettingsOutline } from '@vicons/ionicons5'
import CalendarView from '../views/CalendarView.vue'
import ReviewView from '../views/ReviewView.vue'
import ReportView from '../views/ReportView.vue'
import AIReportView from '../views/AIReportView.vue'
import SettingsModal from './SettingsModal.vue'

const activeKey = ref('calendar')
const showSettings = ref(false)

const navItems = [
  { label: '日历', key: 'calendar', icon: CalendarOutline },
  { label: '复盘', key: 'review', icon: BookOutline },
  { label: '报表', key: 'report', icon: BarChartOutline },
  { label: 'AI 汇报', key: 'aireport', icon: SparklesOutline },
]

const appleTheme = {
  common: {
    primaryColor: '#0066cc',
    primaryColorHover: '#0071e3',
    primaryColorPressed: '#0066cc',
    borderRadius: '18px',
    fontFamily: '"SF Pro Text", system-ui, -apple-system, sans-serif',
    fontSize: '17px',
    textColorBase: '#1d1d1f',
    textColor1: '#1d1d1f',
    textColor2: '#7a7a7a',
    textColor3: '#999999',
    dividerColor: '#f0f0f0',
    borderColor: '#e0e0e0',
    bodyColor: '#f5f5f7',
    cardColor: '#ffffff',
    modalColor: '#ffffff',
    popoverColor: '#ffffff',
    inputColor: '#ffffff',
  },
  Button: {
    borderRadiusMedium: '9999px',
    borderRadiusSmall: '9999px',
    borderRadiusLarge: '9999px',
    paddingMedium: '11px 22px',
    fontSizeMedium: '17px',
    heightMedium: '44px',
  },
  Card: {
    borderRadius: '18px',
    paddingMedium: '24px',
    titleFontSizeMedium: '17px',
    titleFontWeight: '600',
  },
  Tag: {
    borderRadius: '9999px',
  },
  Input: {
    borderRadius: '9999px',
    heightMedium: '44px',
    paddingMedium: '10px 16px',
    fontSizeMedium: '15px',
  },
  Layout: {
    headerColor: '#fafafc',
    siderColor: '#fafafc',
    footerColor: '#f5f5f7',
  },
  Progress: {
    fillColor: '#0066cc',
  },
  Modal: {
    borderRadius: '18px',
  },
}
</script>
```

- [ ] **Step 3: Replace styles with slim sidebar layout CSS**

```css
<style>
.app-shell {
  display: flex;
  height: 100vh;
  background: var(--app-parchment);
}

.slim-sidebar {
  width: 72px;
  min-width: 72px;
  background: var(--app-surface-pearl);
  border-right: 1px solid var(--app-hairline);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  gap: 16px;
}

.sidebar-logo {
  font-family: var(--app-font-display);
  font-size: 10px;
  font-weight: 700;
  color: var(--app-ink);
  letter-spacing: var(--app-ls-display);
  margin-bottom: 8px;
  user-select: none;
}

.sidebar-btn {
  width: 44px;
  height: 44px;
  border-radius: var(--app-radius-md);
  border: none;
  background: transparent;
  color: var(--app-ink);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.4;
  transition: opacity 0.15s, background 0.15s;
}

.sidebar-btn:hover {
  opacity: 0.7;
  background: var(--app-divider-soft);
}

.sidebar-btn.active {
  opacity: 1;
  background: #e8e8ed;
}

.sidebar-bottom {
  margin-top: auto;
}

.app-content {
  flex: 1;
  overflow-y: auto;
  padding: 40px 48px;
}
</style>
```

- [ ] **Step 4: Commit**

```bash
git add src/renderer/src/components/AppLayout.vue
git commit -m "feat: redesign layout with Apple theme and slim sidebar"
```

---

### Task 5: Update Color Utility

**Files:**
- Modify: `src/renderer/src/utils/colors.ts`

- [ ] **Step 1: Update color values to work with light theme**

Replace the entire file:

```typescript
export type DotColor = 'red' | 'yellow' | 'green' | 'gray' | null

export function getDateDotColor(tasks: { status: string; priority: string }[], hasEdited: boolean): DotColor {
  if (tasks.length === 0) return hasEdited ? 'gray' : null
  const allDone = tasks.every(t => t.status === 'done')
  if (allDone) return 'green'
  const hasHigh = tasks.some(t => t.status !== 'done' && (t.priority === 'high' || t.priority === 'urgent'))
  if (hasHigh) return 'red'
  const hasMedium = tasks.some(t => t.status !== 'done' && t.priority === 'medium')
  if (hasMedium) return 'yellow'
  return null
}

export function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    urgent: '#d03050',
    high: '#f0a020',
    medium: '#0066cc',
    low: '#18a058'
  }
  return map[priority] || '#999'
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    done: '#18a058',
    in_progress: '#0066cc',
    pending: '#999',
    cancelled: '#ccc'
  }
  return map[status] || '#999'
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/src/utils/colors.ts
git commit -m "feat: update color utility for light theme"
```

---

### Task 6: Redesign DateCell

**Files:**
- Modify: `src/renderer/src/components/DateCell.vue`

- [ ] **Step 1: Replace template with Apple-style date cell**

```vue
<template>
  <div
    class="date-cell"
    :class="{ selected: isSelected, today: isToday }"
    @click="$emit('select')"
    @dblclick="$emit('dblclick')"
  >
    <span class="date-num">{{ day?.getDate() }}</span>
    <span v-if="dotColor" class="dot" :style="{ background: dotColor }"></span>
  </div>
</template>
```

- [ ] **Step 2: Replace script (keep logic, clean up unused props)**

```typescript
<script setup lang="ts">
import { computed } from 'vue'
import { formatDate, today as todayStr } from '../utils/date'

const props = defineProps<{ day: Date | null; tasks: { planned_date: string; status: string; priority: string }[]; selectedDate: string }>()
defineEmits<{ select: []; dblclick: [] }>()

const isSelected = computed(() => props.day ? formatDate(props.day) === props.selectedDate : false)
const isToday = computed(() => props.day ? formatDate(props.day) === todayStr() : false)

const dotColor = computed(() => {
  if (!props.day) return null
  const date = formatDate(props.day)
  const dayTasks = props.tasks.filter(t => t.planned_date === date)
  if (dayTasks.length === 0) return null
  const allDone = dayTasks.every(t => t.status === 'done')
  if (allDone) return '#18a058'
  return dayTasks.some(t => t.priority === 'high' || t.priority === 'urgent') ? '#d03050' : '#0066cc'
})
</script>
```

- [ ] **Step 3: Replace styles with Apple light tokens**

```css
<style scoped>
.date-cell {
  height: 64px;
  border-radius: var(--app-radius-xs);
  padding: 6px 4px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: var(--app-canvas);
  transition: background 0.15s;
}

.date-cell:hover {
  background: var(--app-divider-soft);
}

.date-cell.selected {
  outline: 2px solid var(--app-blue);
  outline-offset: -2px;
  background: rgba(0, 102, 204, 0.06);
}

.date-cell.today .date-num {
  color: var(--app-blue);
  font-weight: var(--app-fw-semibold);
}

.date-num {
  font-size: var(--app-fs-caption);
  color: var(--app-ink);
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}
</style>
```

- [ ] **Step 4: Commit**

```bash
git add src/renderer/src/components/DateCell.vue
git commit -m "feat: redesign date cell with Apple light styling"
```

---

### Task 7: Redesign CalendarGrid Header

**Files:**
- Modify: `src/renderer/src/components/CalendarGrid.vue`

- [ ] **Step 1: Replace template with Apple-style month navigation**

```vue
<template>
  <div>
    <div class="calendar-header">
      <span class="month-label">{{ currentYear }}年 {{ currentMonth }}月</span>
      <div class="nav-btns">
        <button class="pearl-btn" @click="$emit('prev')">◀</button>
        <button class="pearl-btn" @click="$emit('next')">▶</button>
      </div>
      <button class="ghost-pill-btn" @click="$emit('today')">今天</button>
    </div>
    <div class="weekday-row">
      <div v-for="d in ['一','二','三','四','五','六','日']" :key="d" class="weekday">{{ d }}</div>
    </div>
    <div class="grid">
      <div v-for="(row, ri) in weeks" :key="ri" class="week-row">
        <DateCell
          v-for="(day, di) in row" :key="`${ri}-${di}`"
          :day="day" :tasks="monthTasks" :selectedDate="selectedDate"
          @select="$emit('selectDate', day ? formatDate(day) : '')"
          @dblclick="$emit('dblclickDate', day ? formatDate(day) : '')"
        />
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Replace script (remove NButton import, keep logic)**

```typescript
<script setup lang="ts">
import { computed } from 'vue'
import DateCell from './DateCell.vue'
import { getCalendarGrid, formatDate } from '../utils/date'
import type { Task } from '../types'

const props = defineProps<{ currentYear: number; currentMonth: number; selectedDate: string; monthTasks: Task[] }>()
defineEmits<{ prev: []; next: []; today: []; selectDate: [date: string]; dblclickDate: [date: string] }>()

const weeks = computed(() => getCalendarGrid(props.currentYear, props.currentMonth))
</script>
```

- [ ] **Step 3: Replace styles**

```css
<style scoped>
.calendar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.month-label {
  font-family: var(--app-font-display);
  font-size: var(--app-fs-tagline);
  font-weight: var(--app-fw-semibold);
  color: var(--app-ink);
}

.nav-btns {
  display: flex;
  gap: 2px;
}

.pearl-btn {
  background: var(--app-surface-pearl);
  border: 1px solid var(--app-divider-soft);
  border-radius: var(--app-radius-sm);
  padding: 4px 10px;
  font-size: var(--app-fs-fine);
  color: var(--app-muted-80);
  cursor: pointer;
}

.pearl-btn:hover {
  background: var(--app-divider-soft);
}

.ghost-pill-btn {
  background: transparent;
  color: var(--app-blue);
  border: 1px solid var(--app-blue);
  border-radius: var(--app-radius-pill);
  padding: 4px 14px;
  font-size: var(--app-fs-fine);
  cursor: pointer;
}

.ghost-pill-btn:hover {
  background: rgba(0, 102, 204, 0.06);
}

.weekday-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  padding: 6px 0;
}

.weekday {
  font-size: var(--app-fs-fine);
  color: var(--app-muted);
}

.week-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
</style>
```

- [ ] **Step 4: Commit**

```bash
git add src/renderer/src/components/CalendarGrid.vue
git commit -m "feat: redesign calendar grid with Apple navigation style"
```

---

### Task 8: Redesign TaskItem as Card

**Files:**
- Modify: `src/renderer/src/components/TaskItem.vue`

- [ ] **Step 1: Replace template with card-style task row**

```vue
<template>
  <div class="task-item" :class="{ done: task.status === 'done' }">
    <div class="task-row">
      <button class="check-circle" :class="{ checked: task.status === 'done' }" @click="$emit('toggle')">
        <span v-if="task.status === 'done'" class="check-mark">✓</span>
      </button>
      <span class="title">{{ task.title }}</span>
      <span class="priority-tag">{{ priorityLabel }}</span>
      <button class="action-btn" @click="$emit('edit')" title="编辑">✎</button>
      <button class="action-btn danger" @click="$emit('delete')" title="删除">×</button>
    </div>
    <div class="task-meta">
      <span>{{ estimatedStr }}</span>
      <span v-if="task.due_date"> · 截止 {{ task.due_date }}</span>
    </div>
    <div v-if="subtasks.length" class="subtasks">
      <div v-for="s in subtasks" :key="s.id" class="subtask-row">
        <button
          class="mini-check"
          :class="{ checked: s.status === 'done' }"
          @click="$emit('toggleSub', s.id)"
        >
          <span v-if="s.status === 'done'" class="mini-mark">✓</span>
        </button>
        <span :class="{ 'line-through': s.status === 'done' }">{{ s.title }}</span>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Replace script (remove Naive UI component imports)**

```typescript
<script setup lang="ts">
import { computed } from 'vue'
import type { Task, Subtask } from '../types'

const props = defineProps<{ task: Task; subtasks: Subtask[] }>()
defineEmits<{ toggle: []; edit: []; delete: []; toggleSub: [sid: number] }>()

const priorityLabel = computed(() => {
  return { urgent: '紧急', high: '高', medium: '中', low: '低' }[props.task.priority] || ''
})

const estimatedStr = computed(() => {
  const e = props.task.estimated_min
  const a = props.task.actual_min
  const fmt = (m: number | null) => {
    if (!m) return '--'
    return m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? `${m % 60}m` : ''}` : `${m}m`
  }
  return `估 ${fmt(e)} / 实 ${fmt(a)}`
})
</script>
```

- [ ] **Step 3: Replace styles with Apple card styling**

```css
<style scoped>
.task-item {
  padding: 12px 16px;
  border-bottom: 1px solid var(--app-divider-soft);
  background: var(--app-canvas);
}

.task-item:first-child {
  border-radius: var(--app-radius-lg) var(--app-radius-lg) 0 0;
}

.task-item:last-child {
  border-radius: 0 0 var(--app-radius-lg) var(--app-radius-lg);
  border-bottom: none;
}

.task-item:only-child {
  border-radius: var(--app-radius-lg);
  border-bottom: none;
}

.task-item.done .title {
  text-decoration: line-through;
  color: var(--app-muted);
}

.task-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.check-circle {
  width: 22px;
  height: 22px;
  min-width: 22px;
  border-radius: 50%;
  border: 1.5px solid #ccc;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.15s;
}

.check-circle.checked {
  background: var(--app-blue);
  border-color: var(--app-blue);
}

.check-mark {
  color: #fff;
  font-size: 12px;
  line-height: 1;
}

.title {
  font-size: 15px;
  font-weight: 500;
  color: var(--app-ink);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.priority-tag {
  background: var(--app-divider-soft);
  color: var(--app-ink);
  padding: 2px 10px;
  border-radius: var(--app-radius-pill);
  font-size: 11px;
  white-space: nowrap;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--app-muted);
  padding: 2px 4px;
  border-radius: 4px;
}

.action-btn:hover {
  color: var(--app-ink);
  background: var(--app-divider-soft);
}

.action-btn.danger:hover {
  color: #d03050;
}

.task-meta {
  margin-left: 32px;
  margin-top: 3px;
  font-size: var(--app-fs-fine);
  color: var(--app-muted);
}

.subtasks {
  margin-left: 32px;
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.subtask-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--app-muted-80);
}

.mini-check {
  width: 16px;
  height: 16px;
  min-width: 16px;
  border-radius: 50%;
  border: 1px solid #ccc;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.mini-check.checked {
  background: var(--app-blue);
  border-color: var(--app-blue);
}

.mini-mark {
  color: #fff;
  font-size: 9px;
  line-height: 1;
}

.line-through {
  text-decoration: line-through;
  color: var(--app-muted);
}
</style>
```

- [ ] **Step 4: Commit**

```bash
git add src/renderer/src/components/TaskItem.vue
git commit -m "feat: redesign task item with Apple card styling"
```

---

### Task 9: Redesign StatsCards

**Files:**
- Modify: `src/renderer/src/components/StatsCards.vue`

- [ ] **Step 1: Replace template with Apple stat cards (no n-card)**

```vue
<template>
  <div class="stats-cards">
    <div class="stat-card">
      <div class="stat-num">{{ stats.done }}</div>
      <div class="stat-label">已完成</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">{{ stats.rate }}%</div>
      <div class="stat-label">完成率</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">{{ fmtMin(stats.totalEstimated) }}</div>
      <div class="stat-label">预估</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">{{ fmtMin(stats.totalActual) }}</div>
      <div class="stat-label">实际</div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Replace script (remove NCard import)**

```typescript
<script setup lang="ts">
import type { DailyStats } from '../types'

defineProps<{ stats: DailyStats }>()

function fmtMin(m: number): string {
  if (m >= 60) return `${Math.floor(m / 60)}h${m % 60 ? `${m % 60}m` : ''}`
  return `${m}m`
}
</script>
```

- [ ] **Step 3: Replace styles**

```css
<style scoped>
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--app-space-sm);
  margin: var(--app-space-md) 0;
}

.stat-card {
  background: var(--app-canvas);
  border: 1px solid var(--app-hairline);
  border-radius: var(--app-radius-lg);
  padding: 16px;
}

.stat-num {
  font-family: var(--app-font-display);
  font-size: 24px;
  font-weight: var(--app-fw-semibold);
  color: var(--app-ink);
  margin-bottom: 2px;
}

.stat-label {
  font-size: var(--app-fs-fine);
  color: var(--app-muted);
}
</style>
```

- [ ] **Step 4: Commit**

```bash
git add src/renderer/src/components/StatsCards.vue
git commit -m "feat: redesign stat cards with Apple card styling"
```

---

### Task 10: Restructure CalendarView

**Files:**
- Modify: `src/renderer/src/components/CalendarView.vue` → becomes `src/renderer/src/views/CalendarView.vue`
  Wait, it's already at `src/renderer/src/views/CalendarView.vue`. Let me fix:

**Files:**
- Modify: `src/renderer/src/views/CalendarView.vue`

- [ ] **Step 1: Replace template**

```vue
<template>
  <div class="calendar-page">
    <div class="calendar-layout">
      <div class="calendar-pane">
        <CalendarGrid
          :currentYear="cal.currentYear" :currentMonth="cal.currentMonth"
          :selectedDate="cal.selectedDate" :monthTasks="taskStore.monthTasks"
          @prev="cal.prevMonth()" @next="cal.nextMonth()" @today="cal.goToday()"
          @selectDate="(d: string) => { cal.setSelectedDate(d); taskStore.fetchByDate(d) }"
          @dblclickDate="(d: string) => { editingTask = null; newTaskDate = d; showForm = true }"
        />
      </div>
      <div class="task-pane">
        <div class="task-pane-header">
          <h2 class="app-section-heading">{{ cal.selectedDate }} 任务</h2>
          <button class="pill-btn" @click="editingTask = null; newTaskDate = cal.selectedDate; showForm = true">
            + 新建任务
          </button>
        </div>
        <div class="task-list-card">
          <div v-if="taskStore.tasksForDate.length === 0" class="empty-hint">
            暂无任务
          </div>
          <TaskItem
            v-for="t in taskStore.tasksForDate" :key="t.id"
            :task="t" :subtasks="taskStore.subtasksMap[t.id] || []"
            @toggle="taskStore.toggleComplete(t.id)"
            @edit="editingTask = t; showForm = true"
            @delete="taskStore.removeTask(t.id)"
            @toggleSub="(sid: number) => taskStore.toggleSubtask(sid, t.id)"
          />
        </div>
      </div>
    </div>
    <TaskFormDialog
      v-if="showForm"
      :date="newTaskDate"
      :task="editingTask"
      @close="showForm = false; editingTask = null"
      @save="handleSave"
    />
  </div>
</template>
```

- [ ] **Step 2: Replace script (remove NButton import)**

```typescript
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Task } from '../types'
import CalendarGrid from '../components/CalendarGrid.vue'
import TaskItem from '../components/TaskItem.vue'
import TaskFormDialog from '../components/TaskFormDialog.vue'
import { useCalendarStore } from '../stores/calendar'
import { useTaskStore } from '../stores/tasks'

const cal = useCalendarStore()
const taskStore = useTaskStore()
const showForm = ref(false)
const newTaskDate = ref('')
const editingTask = ref<Task | null>(null)

async function handleSave(data: Record<string, unknown>) {
  if (data.id) {
    const { id, ...rest } = data as Record<string, unknown> & { id: number }
    await taskStore.updateTask(id, rest)
  } else {
    await taskStore.createTask(data)
  }
  showForm.value = false
  editingTask.value = null
  taskStore.fetchByMonth(cal.currentYear, cal.currentMonth)
}

onMounted(() => {
  taskStore.fetchByDate(cal.selectedDate)
  taskStore.fetchByMonth(cal.currentYear, cal.currentMonth)
})
</script>
```

- [ ] **Step 3: Replace styles**

```css
<style scoped>
.calendar-page {
  height: 100%;
}

.calendar-layout {
  display: flex;
  gap: var(--app-space-lg);
  height: 100%;
}

.calendar-pane {
  flex: 2;
  min-width: 0;
}

.task-pane {
  flex: 1;
  min-width: 280px;
  max-width: 380px;
}

.task-pane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--app-space-sm);
}

.pill-btn {
  background: var(--app-blue);
  color: #fff;
  border: none;
  border-radius: var(--app-radius-pill);
  padding: 6px 16px;
  font-size: var(--app-fs-fine);
  cursor: pointer;
  transition: transform 0.1s;
}

.pill-btn:active {
  transform: scale(0.95);
}

.task-list-card {
  background: var(--app-canvas);
  border: 1px solid var(--app-hairline);
  border-radius: var(--app-radius-lg);
  overflow: hidden;
}

.empty-hint {
  padding: 24px;
  text-align: center;
  color: var(--app-muted);
  font-size: var(--app-fs-caption);
}
</style>
```

- [ ] **Step 4: Commit**

```bash
git add src/renderer/src/views/CalendarView.vue
git commit -m "feat: restructure calendar view with Apple layout"
```

---

### Task 11: Redesign ReviewView

**Files:**
- Modify: `src/renderer/src/views/ReviewView.vue`

- [ ] **Step 1: Replace template with Apple-style daily review**

```vue
<template>
  <div class="review-page">
    <div class="review-nav">
      <button class="pearl-btn" @click="prevDay">◀ 昨天</button>
      <span class="review-date">{{ currentDate }}</span>
      <button class="pearl-btn" @click="nextDay">明天 ▶</button>
    </div>

    <StatsCards v-if="reviewStore.stats" :stats="reviewStore.stats" />

    <div v-if="reviewStore.stats && taskStore.tasksForDate.length > 0" class="review-section">
      <h3 class="app-section-heading">今日任务</h3>
      <div class="task-list-card">
        <div v-for="t in taskStore.tasksForDate" :key="t.id" class="review-task">
          <span class="task-dot" :class="{ done: t.status === 'done' }">{{ t.status === 'done' ? '●' : '○' }}</span>
          <span class="task-cat">{{ categoryLabel(t.category) }}</span>
          <span class="task-title" :class="{ done: t.status === 'done' }">{{ t.title }}</span>
          <span class="task-time">⏱ {{ fmtMin(t.estimated_min) }} / {{ fmtMin(t.actual_min) }}</span>
          <span class="task-status" :class="t.status === 'done' ? 'ok' : 'warn'">
            {{ t.status === 'done' ? '✅' : '⚠ 未完成' }}
          </span>
        </div>
      </div>
    </div>

    <div class="review-section">
      <h3 class="app-section-heading">今日复盘</h3>
      <div v-if="!reviewExpanded" class="collapsed-review" @click="reviewExpanded = true">
        <span>已保存复盘内容</span>
        <span class="collapsed-hint">点击展开</span>
      </div>
      <div v-else class="review-card">
        <textarea
          v-model="reviewText"
          class="review-textarea"
          rows="6"
          placeholder="记录今天的收获和思考..."
        ></textarea>
        <button class="pill-btn" @click="handleSave">保存复盘</button>
      </div>
    </div>
  </div>
</template>
```

- [ ] **Step 2: Replace script (remove Naive UI imports, keep logic)**

```typescript
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StatsCards from '../components/StatsCards.vue'
import { useTaskStore } from '../stores/tasks'
import { useReviewStore } from '../stores/reviews'
import { formatDate } from '../utils/date'
import { fmtMin, categoryLabel } from '../utils/format'

const taskStore = useTaskStore()
const reviewStore = useReviewStore()
const currentDate = ref(formatDate(new Date()))
const reviewText = ref('')
const reviewExpanded = ref(true)

async function loadDate(d: string) {
  currentDate.value = d
  taskStore.fetchByDate(d)
  await reviewStore.fetchByDate(d)
  reviewText.value = reviewStore.review?.content || ''
  reviewExpanded.value = !reviewStore.review?.content
}

function prevDay() {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() - 1)
  loadDate(formatDate(d))
}

function nextDay() {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() + 1)
  loadDate(formatDate(d))
}

async function handleSave() {
  await reviewStore.saveReview(currentDate.value, reviewText.value)
  reviewExpanded.value = false
}

onMounted(() => loadDate(currentDate.value))
</script>
```

- [ ] **Step 3: Replace styles**

```css
<style scoped>
.review-page {
  max-width: 720px;
}

.review-nav {
  display: flex;
  align-items: center;
  gap: var(--app-space-sm);
  margin-bottom: var(--app-space-lg);
}

.review-date {
  font-family: var(--app-font-display);
  font-size: var(--app-fs-tagline);
  font-weight: var(--app-fw-semibold);
  color: var(--app-ink);
}

.pearl-btn {
  background: var(--app-surface-pearl);
  border: 1px solid var(--app-divider-soft);
  border-radius: var(--app-radius-sm);
  padding: 6px 14px;
  font-size: var(--app-fs-caption);
  color: var(--app-muted-80);
  cursor: pointer;
}

.pearl-btn:hover {
  background: var(--app-divider-soft);
}

.review-section {
  margin-top: var(--app-space-lg);
}

.task-list-card {
  background: var(--app-canvas);
  border: 1px solid var(--app-hairline);
  border-radius: var(--app-radius-lg);
  overflow: hidden;
  margin-top: var(--app-space-xs);
}

.review-task {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--app-divider-soft);
}

.review-task:last-child {
  border-bottom: none;
}

.task-dot { font-size: 14px; }
.task-dot.done { color: var(--app-blue); }

.task-cat { font-size: var(--app-fs-fine); color: var(--app-muted); }

.task-title { font-size: 15px; color: var(--app-ink); flex: 1; }
.task-title.done { text-decoration: line-through; color: var(--app-muted); }

.task-time { font-size: var(--app-fs-fine); color: var(--app-muted); }

.task-status { font-size: 11px; }
.task-status.ok { color: #18a058; }
.task-status.warn { color: #f0a020; }

.review-card {
  background: var(--app-canvas);
  border: 1px solid var(--app-hairline);
  border-radius: var(--app-radius-lg);
  padding: 16px;
  margin-top: var(--app-space-xs);
}

.review-textarea {
  width: 100%;
  border: 1px solid var(--app-hairline);
  border-radius: var(--app-radius-md);
  padding: 12px;
  font-size: var(--app-fs-body);
  font-family: var(--app-font-text);
  color: var(--app-ink);
  background: var(--app-canvas);
  resize: vertical;
  box-sizing: border-box;
}

.review-textarea::placeholder {
  color: var(--app-muted);
}

.pill-btn {
  margin-top: var(--app-space-xs);
  background: var(--app-blue);
  color: #fff;
  border: none;
  border-radius: var(--app-radius-pill);
  padding: 11px 22px;
  font-size: var(--app-fs-body);
  cursor: pointer;
  transition: transform 0.1s;
}

.pill-btn:active {
  transform: scale(0.95);
}

.collapsed-review {
  padding: 12px 16px;
  border: 1px solid var(--app-blue);
  border-radius: var(--app-radius-md);
  color: var(--app-blue);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--app-space-xs);
  font-size: var(--app-fs-caption);
}

.collapsed-review:hover {
  background: rgba(0, 102, 204, 0.04);
}

.collapsed-hint {
  font-size: var(--app-fs-fine);
  color: var(--app-muted);
}
</style>
```

- [ ] **Step 4: Commit**

```bash
git add src/renderer/src/views/ReviewView.vue
git commit -m "feat: redesign review view with Apple styling"
```

---

### Task 12: Update ReportView for Light Theme + ECharts

**Files:**
- Modify: `src/renderer/src/views/ReportView.vue`

- [ ] **Step 1: Replace Naive UI segmented control with custom pill segment**

In the template, replace:
```html
<n-radio-group v-model:value="granularity" @update:value="loadStats">
  <n-radio-button value="daily">日报</n-radio-button>
  <n-radio-button value="weekly">周报</n-radio-button>
  <n-radio-button value="monthly">月报</n-radio-button>
</n-radio-group>
```
with:
```html
<div class="segmented-control">
  <button
    v-for="opt in segOptions"
    :key="opt.value"
    class="seg-btn"
    :class="{ active: granularity === opt.value }"
    @click="granularity = opt.value; loadStats()"
  >{{ opt.label }}</button>
</div>
```

- [ ] **Step 2: In script, add segOptions and update imports**

Remove `NRadioGroup, NRadioButton` from the import. Add:
```typescript
const segOptions = [
  { label: '日报', value: 'daily' },
  { label: '周报', value: 'weekly' },
  { label: '月报', value: 'monthly' },
]
```

- [ ] **Step 3: Update buildTrendOption colors for light theme**

Replace `buildTrendOption`:
```typescript
function buildTrendOption(days: { date: string; total: number; rate: number }[]) {
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['任务数', '完成率%'], textStyle: { color: '#7a7a7a' } },
    xAxis: { type: 'category', data: days.map(d => d.date.slice(5)), axisLabel: { color: '#7a7a7a' } },
    yAxis: { type: 'value', axisLabel: { color: '#7a7a7a' }, splitLine: { lineStyle: { color: '#f0f0f0' } } },
    series: [
      { name: '任务数', type: 'bar', data: days.map(d => d.total), itemStyle: { color: '#0066cc' } },
      { name: '完成率%', type: 'line', data: days.map(d => d.rate), smooth: true, itemStyle: { color: '#18a058' } }
    ]
  }
}
```

- [ ] **Step 4: Update buildPieOption for light theme**

Replace `buildPieOption`:
```typescript
function buildPieOption(byCategory: Record<string, number>) {
  const data = Object.entries(byCategory)
    .filter(([_, v]) => v > 0)
    .map(([k, v]) => ({ name: categoryLabel(k), value: v, itemStyle: { color: categoryColor(k) } }))
  if (data.length === 0) return null
  return {
    tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
    legend: { textStyle: { color: '#7a7a7a' } },
    series: [{
      type: 'pie', radius: ['40%', '70%'], center: ['50%', '50%'],
      data,
      label: { color: '#7a7a7a' }
    }]
  }
}
```

- [ ] **Step 5: Update exportCharts backgroundColor**

In `exportCharts`, change:
```typescript
const dataUrl = chart!.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#1e1e1e' })
```
to:
```typescript
const dataUrl = chart!.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#ffffff' })
```

- [ ] **Step 6: Replace the AI section styles and clean up inline dark-theme values**

Update the n-card with AI content to remove dark color references. The scoped style:
```css
<style scoped>
.report-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: var(--app-space-sm);
}

.segmented-control {
  display: flex;
  background: var(--app-divider-soft);
  border-radius: var(--app-radius-pill);
  padding: 3px;
}

.seg-btn {
  background: transparent;
  border: none;
  border-radius: var(--app-radius-pill);
  padding: 6px 18px;
  font-size: var(--app-fs-caption);
  color: var(--app-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.seg-btn.active {
  background: var(--app-canvas);
  color: var(--app-ink);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.chart-row {
  display: flex;
  gap: 16px;
  margin-top: var(--app-space-sm);
}

.week-summary {
  display: flex;
  gap: 24px;
  color: var(--app-muted);
  font-size: var(--app-fs-caption);
}

.month-compare {
  display: flex;
  gap: 32px;
}

.month-compare .stat-num {
  font-size: 22px;
  font-weight: var(--app-fw-semibold);
  color: var(--app-ink);
}

.month-compare .stat-label {
  font-size: var(--app-fs-fine);
  color: var(--app-muted);
}

.cat-row {
  display: flex;
  align-items: center;
  padding: 4px 0;
}

.review-task {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: var(--app-fs-caption);
}

.ai-markdown {
  line-height: 1.8;
  color: var(--app-muted-80);
  font-size: var(--app-fs-body);
}

.ai-markdown :deep(h3) {
  font-family: var(--app-font-display);
  font-size: var(--app-fs-tagline);
  font-weight: var(--app-fw-semibold);
  color: var(--app-ink);
  margin: 12px 0 4px;
}

.ai-markdown :deep(li) {
  margin-left: 16px;
}
</style>
```

- [ ] **Step 7: Commit**

```bash
git add src/renderer/src/views/ReportView.vue
git commit -m "feat: update report view with light theme and Apple ECharts styling"
```

---

### Task 13: Update AIReportView

**Files:**
- Modify: `src/renderer/src/views/AIReportView.vue`

- [ ] **Step 1: Same segmented control replacement as ReportView**

Replace `n-radio-group` + `n-radio-button` with the same custom `.segmented-control` from Task 12.

- [ ] **Step 2: Replace Naive UI button wrappers**

Replace `n-button` elements with custom buttons:
- "生成汇报": `<button class="pill-btn" @click="generate" :disabled="loading">生成汇报</button>`
- "导出文本": `<button class="pearl-btn" @click="exportText">导出文本</button>`

- [ ] **Step 3: Update script imports**

Remove: `NRadioGroup, NRadioButton, NDatePicker, NSelect, NButton, NCard`
Add only: `NDatePicker, NSelect` (keep complex form controls as Naive UI)

- [ ] **Step 4: Update styles**

```css
<style scoped>
.report-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: var(--app-space-sm);
}

.segmented-control {
  display: flex;
  background: var(--app-divider-soft);
  border-radius: var(--app-radius-pill);
  padding: 3px;
}

.seg-btn {
  background: transparent;
  border: none;
  border-radius: var(--app-radius-pill);
  padding: 6px 16px;
  font-size: var(--app-fs-fine);
  color: var(--app-muted);
  cursor: pointer;
  transition: all 0.15s;
}

.seg-btn.active {
  background: var(--app-canvas);
  color: var(--app-ink);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.pill-btn {
  background: var(--app-blue);
  color: #fff;
  border: none;
  border-radius: var(--app-radius-pill);
  padding: 8px 20px;
  font-size: var(--app-fs-caption);
  cursor: pointer;
  transition: transform 0.1s;
}

.pill-btn:active {
  transform: scale(0.95);
}

.pill-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pearl-btn {
  background: var(--app-surface-pearl);
  border: 1px solid var(--app-divider-soft);
  border-radius: var(--app-radius-sm);
  padding: 6px 14px;
  font-size: var(--app-fs-fine);
  color: var(--app-muted-80);
  cursor: pointer;
}

.ai-markdown {
  line-height: 1.8;
  color: var(--app-muted-80);
  font-size: var(--app-fs-body);
}

.ai-markdown :deep(h3) {
  font-family: var(--app-font-display);
  font-size: var(--app-fs-tagline);
  font-weight: var(--app-fw-semibold);
  color: var(--app-ink);
  margin: 12px 0 4px;
}

.ai-markdown :deep(li) {
  margin-left: 16px;
}
</style>
```

- [ ] **Step 5: Commit**

```bash
git add src/renderer/src/views/AIReportView.vue
git commit -m "feat: update AI report view with Apple styling"
```

---

### Task 14: Update TaskFormDialog

**Files:**
- Modify: `src/renderer/src/components/TaskFormDialog.vue`

- [ ] **Step 1: Remove emoji from select options**

Replace the options:
```typescript
const priorityOptions = [
  { label: '紧急', value: 'urgent' },
  { label: '高', value: 'high' },
  { label: '中', value: 'medium' },
  { label: '低', value: 'low' },
]
const categoryOptions = [
  { label: '工作', value: 'work' },
  { label: '学习', value: 'study' },
  { label: '生活', value: 'life' },
]
```

- [ ] **Step 2: No style changes needed** — the Naive UI `themeOverrides` from Task 4 already handle the modal, card, input, button styling. Just the emoji cleanup.

- [ ] **Step 3: Commit**

```bash
git add src/renderer/src/components/TaskFormDialog.vue
git commit -m "feat: clean up task form dialog icons for Apple style"
```

---

### Task 15: Update SettingsModal

**Files:**
- Modify: `src/renderer/src/components/SettingsModal.vue`

- [ ] **Step 1: Remove emoji from card title**

Change `title="⚙ 设置"` to `title="设置"`

- [ ] **Step 2: Remove emoji from status text**

The status text already reads well without icons. No other changes needed — Naive UI theme handles the rest.

- [ ] **Step 3: Commit**

```bash
git add src/renderer/src/components/SettingsModal.vue
git commit -m "feat: clean up settings modal for Apple style"
```

---

### Task 16: Final Verification — Build Check

**Files:**
- No file changes

- [ ] **Step 1: Run build to verify no compilation errors**

```bash
cd "/Users/fengkecheng/Desktop/Agents/实用工具开发/list" && npm run build
```

Expected: Build succeeds, Electron app bundles correctly.

- [ ] **Step 2: Run dev mode for manual visual check**

```bash
cd "/Users/fengkecheng/Desktop/Agents/实用工具开发/list" && npm run dev
```

Expected: Electron window opens with new Apple-style UI. Verify: sidebar renders, calendar grid displays, task items show card styling, modals use Apple theme.

- [ ] **Step 3: Fix any visual issues found, then commit final tweaks**

```bash
git add -A
git commit -m "chore: final visual polish after verification"
```
