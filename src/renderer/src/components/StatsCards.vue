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

<script setup lang="ts">
import type { DailyStats } from '../types'

defineProps<{ stats: DailyStats }>()

function fmtMin(m: number): string {
  if (m >= 60) return `${Math.floor(m / 60)}h${m % 60 ? `${m % 60}m` : ''}`
  return `${m}m`
}
</script>

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
