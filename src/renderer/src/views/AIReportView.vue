<template>
  <div>
    <div class="report-header">
      <div class="segmented-control">
        <button
          v-for="opt in segOptions"
          :key="opt.value"
          class="seg-btn"
          :class="{ active: granularity === opt.value }"
          @click="granularity = opt.value"
        >{{ opt.label }}</button>
      </div>

      <template v-if="granularity === 'daily'">
        <n-date-picker v-model:formatted-value="selectedDate" type="date" />
      </template>
      <template v-if="granularity === 'weekly'">
        <n-button @click="navigateWeek(-1)" size="small">◀</n-button>
        <span>{{ weekLabel }}</span>
        <n-button @click="navigateWeek(1)" size="small">▶</n-button>
      </template>
      <template v-if="granularity === 'monthly'">
        <n-button @click="navigateMonth(-1)" size="small">◀</n-button>
        <span>{{ monthLabel }}</span>
        <n-button @click="navigateMonth(1)" size="small">▶</n-button>
      </template>
      <template v-if="granularity === 'quarterly'">
        <n-button @click="navigateQuarter(-1)" size="small">◀</n-button>
        <n-select v-model:value="quarter" :options="quarterOptions" style="width:100px" />
        <span>{{ refYear }}</span>
        <n-button @click="navigateQuarter(1)" size="small">▶</n-button>
      </template>
      <template v-if="granularity === 'annual'">
        <n-button @click="refYear--" size="small">◀</n-button>
        <span>{{ refYear }}年</span>
        <n-button @click="refYear++" size="small">▶</n-button>
      </template>

      <n-button type="primary" @click="generate" :loading="loading">生成汇报</n-button>
      <n-button @click="exportText" size="small">导出文本</n-button>
    </div>

    <p v-if="error" style="color:#d03050;margin-top:8px">{{ error }}</p>

    <n-card v-if="content" style="margin-top:12px">
      <div style="color:#888;font-size:12px;margin-bottom:8px">生成于 {{ generatedAt }}</div>
      <div class="ai-markdown" v-html="renderMarkdown(content)"></div>
    </n-card>

    <n-card v-if="!content && !loading" style="margin-top:12px;text-align:center;color:#666">
      选择粒度和日期范围，点击「生成汇报」
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NDatePicker, NSelect, NButton, NCard } from 'naive-ui'
import { api } from '../api'
import { formatDate, getWeekRange } from '../utils/date'
import { renderMarkdown } from '../utils/markdown'

function formatMinutes(min: number): string {
  if (min >= 60) {
    const h = Math.floor(min / 60)
    const m = min % 60
    return m > 0 ? `${h}h${m}m` : `${h}h`
  }
  return `${min}m`
}

const granularity = ref('daily')
const segOptions = [
  { label: '日报', value: 'daily' },
  { label: '周报', value: 'weekly' },
  { label: '月报', value: 'monthly' },
  { label: '季报', value: 'quarterly' },
  { label: '年报', value: 'annual' },
]
const selectedDate = ref(formatDate(new Date()))
const referenceDate = ref(new Date())
const refYear = ref(new Date().getFullYear())
const quarter = ref(Math.ceil((new Date().getMonth() + 1) / 3))
const loading = ref(false)
const content = ref('')
const error = ref('')
const generatedAt = ref('')

const quarterOptions = [
  { label: 'Q1 (1-3月)', value: 1 },
  { label: 'Q2 (4-6月)', value: 2 },
  { label: 'Q3 (7-9月)', value: 3 },
  { label: 'Q4 (10-12月)', value: 4 }
]

const weekLabel = computed(() => {
  const { start, end } = getWeekRange(referenceDate.value)
  return `${start} ~ ${end}`
})
const monthLabel = computed(() => {
  const d = referenceDate.value
  return `${d.getFullYear()}年 ${d.getMonth() + 1}月`
})

function navigateWeek(d: number) {
  const n = new Date(referenceDate.value); n.setDate(n.getDate() + d * 7); referenceDate.value = n
}
function navigateMonth(d: number) {
  const n = new Date(referenceDate.value); n.setMonth(n.getMonth() + d); referenceDate.value = n
}
function navigateQuarter(d: number) {
  let q = quarter.value + d
  if (q < 1) { q = 4; refYear.value-- }
  else if (q > 4) { q = 1; refYear.value++ }
  quarter.value = q
}

function getDateRange(): { start: string; end: string } {
  switch (granularity.value) {
    case 'daily': return { start: selectedDate.value, end: selectedDate.value }
    case 'weekly': return getWeekRange(referenceDate.value)
    case 'monthly': {
      const y = referenceDate.value.getFullYear(); const m = referenceDate.value.getMonth() + 1
      return { start: `${y}-${String(m).padStart(2,'0')}-01`, end: `${y}-${String(m).padStart(2,'0')}-${new Date(y,m,0).getDate()}` }
    }
    case 'quarterly': {
      const q = quarter.value
      const startM = (q - 1) * 3 + 1
      const endM = q * 3
      return { start: `${refYear.value}-${String(startM).padStart(2,'0')}-01`, end: `${refYear.value}-${String(endM).padStart(2,'0')}-${new Date(refYear.value,endM,0).getDate()}` }
    }
    case 'annual': return { start: `${refYear.value}-01-01`, end: `${refYear.value}-12-31` }
    default: return { start: '', end: '' }
  }
}

async function generate() {
  loading.value = true; error.value = ''; content.value = ''
  try {
    const range = getDateRange()
    let tasksText = ''
    let reviewText = ''
    if (granularity.value === 'daily') {
      const tasks = await api.tasks.getByDate(range.start)
      const workTasks = tasks.filter(t => t.category === 'work')
      tasksText = workTasks.map(t => `- [${t.status === 'done' ? 'x' : ' '}] ${t.title} (${t.priority}, 估${t.estimated_min || 0}min/实${t.actual_min || 0}min)`).join('\n')
      const r = await api.reviews.getByDate(range.start)
      reviewText = r?.content || ''
      const fbList = await api.feedback.getByDate(range.start)
      const fbText = fbList.map(f => `- 问题：${f.problems || '无'} / 优化：${f.optimizations || '无'}`).join('\n')

      // 按分类统计
      const dailyStats = await api.stats.getDaily(range.start)
      const catStats = dailyStats.byCategory
      const statsText = [
        `- 工作：${formatMinutes(catStats.work || 0)}`,
        `- 学习：${formatMinutes(catStats.study || 0)}`,
        `- 生活：${formatMinutes(catStats.life || 0)}`
      ].join('\n')

      const result = await api.ai.generateReport({
        granularity: granularity.value,
        dateRange: range,
        tasks: tasksText,
        reviewContent: reviewText,
        stats: statsText,
        feedback: fbText
      })
      content.value = result.content
      generatedAt.value = new Date().toLocaleString('zh-CN')
      return
    } else if (granularity.value === 'weekly') {
      const allTasks = await api.tasks.getByDateRange(range.start, range.end)
      const workTasks = allTasks.filter(t => t.category === 'work')
      const byDate = new Map<string, typeof workTasks>()
      for (const t of workTasks) {
        const arr = byDate.get(t.planned_date) || []
        arr.push(t)
        byDate.set(t.planned_date, arr)
      }
      const sortedDates = [...byDate.keys()].sort()
      tasksText = sortedDates.map(date => {
        const dayTasks = byDate.get(date)!
        return `\n## ${date}\n` + dayTasks.map(t =>
          `- [${t.status === 'done' ? 'x' : ' '}] ${t.title} (${t.priority}, 估${t.estimated_min || 0}min/实${t.actual_min || 0}min)`
        ).join('\n')
      }).join('\n')

      const reviews = await api.reviews.getByDateRange(range.start, range.end)
      reviewText = reviews.filter(r => r.content).map(r => `### ${r.date}\n${r.content}`).join('\n\n')

      const fbList = await api.feedback.getByDateRange(range.start, range.end)
      const fbText = fbList.map(f =>
        `- [${f.planned_date}] 任务「${f.task_title}」: 问题：${f.problems || '无'} / 优化：${f.optimizations || '无'}`
      ).join('\n')

      const raw = await api.stats.getWeekly(range.start, range.end)
      const doneCount = workTasks.filter(t => t.status === 'done').length
      const doneRate = workTasks.length > 0 ? Math.round(doneCount / workTasks.length * 100) : 0
      const perDayStats = sortedDates.map(date => {
        const dayTasks = byDate.get(date)!
        const dayDone = dayTasks.filter(t => t.status === 'done').length
        const dayRate = dayTasks.length > 0 ? Math.round(dayDone / dayTasks.length * 100) : 0
        return `- ${date}: 任务数 ${dayTasks.length} 个 | 完成率 ${dayRate}%`
      }).join('\n')
      const catStats = raw.byCategory
      const wkTotalEstimated = workTasks.reduce((s, t) => s + (t.estimated_min || 0), 0)
      const wkTotalActual = workTasks.reduce((s, t) => s + (t.actual_min || 0), 0)
      const statsText = `${perDayStats}\n\n本周汇总（仅工作类任务）:\n- 任务总数: ${workTasks.length} 个\n- 已完成: ${doneCount} 个\n- 完成率: ${doneRate}%\n- 预估耗时: ${wkTotalEstimated}min\n- 实际耗时: ${wkTotalActual}min\n\n按分类耗时:\n- 工作：${formatMinutes(catStats.work || 0)}\n- 学习：${formatMinutes(catStats.study || 0)}\n- 生活：${formatMinutes(catStats.life || 0)}`

      const result = await api.ai.generateReport({
        granularity: granularity.value,
        dateRange: range,
        tasks: tasksText,
        reviewContent: reviewText,
        stats: statsText,
        feedback: fbText
      })
      content.value = result.content
      generatedAt.value = new Date().toLocaleString('zh-CN')
      return
    } else if (granularity.value === 'monthly') {
      const y = referenceDate.value.getFullYear(); const m = referenceDate.value.getMonth() + 1
      const allTasks = await api.tasks.getByMonth(y, m)
      const workTasks = allTasks.filter(t => t.category === 'work')
      const raw = await api.stats.getMonthly(y, m)
      const catStats = raw.byCategory

      // 按日期组织工作类任务
      const byDate = new Map<string, typeof workTasks>()
      for (const t of workTasks) {
        const arr = byDate.get(t.planned_date) || []
        arr.push(t)
        byDate.set(t.planned_date, arr)
      }
      const sortedDates = [...byDate.keys()].sort()
      tasksText = sortedDates.map(date => {
        const dayTasks = byDate.get(date)!
        return `\n## ${date}\n` + dayTasks.map(t =>
          `- [${t.status === 'done' ? 'x' : ' '}] ${t.title} (${t.priority}, 估${t.estimated_min || 0}min/实${t.actual_min || 0}min)`
        ).join('\n')
      }).join('\n')

      const workDone = workTasks.filter(t => t.status === 'done').length
      const workRate = workTasks.length > 0 ? Math.round(workDone / workTasks.length * 100) : 0
      const statsText = `工作类任务总计: ${workTasks.length} 个, 完成 ${workDone} 个, 完成率 ${workRate}%\n\n按分类耗时:\n- 工作：${formatMinutes(catStats.work || 0)}\n- 学习：${formatMinutes(catStats.study || 0)}\n- 生活：${formatMinutes(catStats.life || 0)}`

      const reviews = await api.reviews.getByDateRange(range.start, range.end)
      reviewText = reviews.filter(r => r.content).map(r => `### ${r.date}\n${r.content}`).join('\n\n')

      const fbList = await api.feedback.getByDateRange(range.start, range.end)
      const fbText = fbList.map(f =>
        `- [${f.planned_date}] 任务「${f.task_title}」: 问题：${f.problems || '无'} / 优化：${f.optimizations || '无'}`
      ).join('\n')

      const result = await api.ai.generateReport({
        granularity: granularity.value,
        dateRange: range,
        tasks: tasksText,
        reviewContent: reviewText,
        stats: statsText,
        feedback: fbText
      })
      content.value = result.content
      generatedAt.value = new Date().toLocaleString('zh-CN')
      return
    } else if (granularity.value === 'quarterly' || granularity.value === 'annual') {
      const allTasks = await api.tasks.getByDateRange(range.start, range.end)
      const workTasks = allTasks.filter(t => t.category === 'work')
      const workDone = workTasks.filter(t => t.status === 'done').length
      const workRate = workTasks.length > 0 ? Math.round(workDone / workTasks.length * 100) : 0

      // 按分类手动统计
      const cat: Record<string, number> = { work: 0, study: 0, life: 0 }
      for (const t of allTasks) {
        if (t.status === 'done') {
          cat[t.category] = (cat[t.category] || 0) + 1
        }
      }
      tasksText = `工作类任务总计: ${workTasks.length} 个, 完成 ${workDone} 个, 完成率 ${workRate}%`
      const statsText = `工作类任务总计: ${workTasks.length} 个, 完成 ${workDone} 个, 完成率 ${workRate}%\n\n各分类完成数:\n- 工作：${cat.work} 个\n- 学习：${cat.study} 个\n- 生活：${cat.life} 个`

      const reviews = await api.reviews.getByDateRange(range.start, range.end)
      reviewText = reviews.filter(r => r.content).map(r => `### ${r.date}\n${r.content}`).join('\n\n')

      const fbList = await api.feedback.getByDateRange(range.start, range.end)
      const fbText = fbList.map(f =>
        `- [${f.planned_date}] 任务「${f.task_title}」: 问题：${f.problems || '无'} / 优化：${f.optimizations || '无'}`
      ).join('\n')

      const result = await api.ai.generateReport({
        granularity: granularity.value,
        dateRange: range,
        tasks: tasksText,
        reviewContent: reviewText,
        stats: statsText,
        feedback: fbText
      })
      content.value = result.content
      generatedAt.value = new Date().toLocaleString('zh-CN')
      return
    }
  } catch (e: unknown) {
    error.value = (e as Error).message || '生成失败'
  } finally {
    loading.value = false
  }
}

async function exportText() {
  if (!content.value) return
  await api.app.exportText(content.value, `汇报_${granularity.value}_${getDateRange().start}.md`)
}
</script>

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
