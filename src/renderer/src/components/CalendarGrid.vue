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

<script setup lang="ts">
import { computed } from 'vue'
import DateCell from './DateCell.vue'
import { getCalendarGrid, formatDate } from '../utils/date'
import type { Task } from '../types'

const props = defineProps<{ currentYear: number; currentMonth: number; selectedDate: string; monthTasks: Task[] }>()
defineEmits<{ prev: []; next: []; today: []; selectDate: [date: string]; dblclickDate: [date: string] }>()

const weeks = computed(() => getCalendarGrid(props.currentYear, props.currentMonth))
</script>

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
