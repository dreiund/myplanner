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
