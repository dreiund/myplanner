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
            @toggle="handleToggle(t)"
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
    <CompletionFeedbackDialog
      :visible="showFeedback"
      :task="completingTask"
      @submit="handleFeedbackSubmit"
      @cancel="showFeedback = false; completingTask = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Task } from '../types'
import CalendarGrid from '../components/CalendarGrid.vue'
import TaskItem from '../components/TaskItem.vue'
import TaskFormDialog from '../components/TaskFormDialog.vue'
import CompletionFeedbackDialog from '../components/CompletionFeedbackDialog.vue'
import { api } from '../api'
import { useCalendarStore } from '../stores/calendar'
import { useTaskStore } from '../stores/tasks'

const cal = useCalendarStore()
const taskStore = useTaskStore()
const showForm = ref(false)
const newTaskDate = ref('')
const editingTask = ref<Task | null>(null)
const showFeedback = ref(false)
const completingTask = ref<Task | null>(null)

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

function handleToggle(task: Task) {
  if (task.status === 'done') {
    // Undo completion — no feedback needed
    taskStore.toggleComplete(task.id)
    taskStore.fetchByMonth(cal.currentYear, cal.currentMonth)
  } else {
    // Completing — show feedback dialog
    completingTask.value = task
    showFeedback.value = true
  }
}

async function handleFeedbackSubmit(data: { problems: string; optimizations: string }) {
  if (!completingTask.value) return
  const taskId = completingTask.value.id
  await api.feedback.save(taskId, data.problems, data.optimizations)
  await taskStore.toggleComplete(taskId)
  taskStore.fetchByMonth(cal.currentYear, cal.currentMonth)
  showFeedback.value = false
  completingTask.value = null
}

onMounted(() => {
  taskStore.fetchByDate(cal.selectedDate)
  taskStore.fetchByMonth(cal.currentYear, cal.currentMonth)
})
</script>

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
