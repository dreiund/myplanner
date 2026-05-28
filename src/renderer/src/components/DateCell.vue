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