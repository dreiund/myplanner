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
