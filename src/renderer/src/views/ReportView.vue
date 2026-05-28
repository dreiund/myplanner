<template>
  <div>
    <div class="report-header">
      <div class="segmented-control">
        <button
          v-for="opt in segOptions"
          :key="opt.value"
          class="seg-btn"
          :class="{ active: granularity === opt.value }"
          @click="granularity = opt.value; loadStats()"
        >{{ opt.label }}</button>
      </div>
      <template v-if="granularity === 'daily'">
        <n-date-picker v-model:formatted-value="selectedDate" type="date" @update:formatted-value="loadStats" />
      </template>
      <template v-if="granularity === 'weekly'">
        <n-button @click="navigateWeek(-1)" size="small">◀ 上周</n-button>
        <span>{{ weekLabel }}</span>
        <n-button @click="navigateWeek(1)" size="small">下周 ▶</n-button>
      </template>
      <template v-if="granularity === 'monthly'">
        <n-button @click="navigateMonth(-1)" size="small">◀ 上月</n-button>
        <span>{{ monthLabel }}</span>
        <n-button @click="navigateMonth(1)" size="small">下月 ▶</n-button>
      </template>
      <n-button @click="exportCharts" size="small">导出图片</n-button>
    </div>

    <p v-if="loadError" style="color:#d03050;margin-top:8px">{{ loadError }}</p>

    <!-- Daily stats -->
    <template v-if="granularity === 'daily' && dailyStats">
      <n-card title="概览" style="margin-top: 12px">
        <StatsCards :stats="dailyStats" />
      </n-card>
      <n-card title="分类耗时" style="margin-top: 12px">
        <div v-for="(min, cat) in dailyStats.byCategory" :key="cat" class="cat-row">
          <span>{{ categoryLabel(cat) }}</span>
          <n-progress :percentage="min ? Math.round(min / maxCatMin * 100) : 0" :color="categoryColor(cat)" style="flex:1;margin:0 12px" />
          <span>{{ fmtMin(min) }}</span>
        </div>
        <div v-if="!hasCatData" style="color:#999">暂无完成任务的耗时记录</div>
      </n-card>
      <n-card title="任务清单" style="margin-top:12px">
        <div v-if="todayTasks.length === 0" style="color:#999">当天无任务</div>
        <div v-for="t in todayTasks" :key="t.id" class="review-task">
          <span>{{ t.status === 'done' ? '●' : '○' }}</span>
          <span>{{ t.title }}</span>
          <span style="color:#888;font-size:13px">⏱{{ fmtMin(t.actual_min) }}</span>
          <span :style="{ color: t.status === 'done' ? '#18a058' : '#f0a020' }">{{ t.status === 'done' ? '✅' : '⚠' }}</span>
        </div>
      </n-card>
    </template>

    <!-- Weekly stats -->
    <template v-if="granularity === 'weekly' && weeklyData">
      <n-card title="概览" style="margin-top: 12px">
        <div class="week-summary">
          <span>总任务: {{ weeklySummary.total }} | 完成率: {{ weeklySummary.rate }}%</span>
          <span>预估 {{ fmtMin(weeklyData.totalEstimated) }} / 实际 {{ fmtMin(weeklyData.totalActual) }}</span>
        </div>
      </n-card>
      <div class="chart-row">
        <ReportChart ref="chartRef1" v-if="taskCountOption" :option="taskCountOption" style="flex:1;height:300px" />
        <ReportChart ref="chartRef2" v-if="rateOption" :option="rateOption" style="flex:1;height:300px" />
        <ReportChart ref="chartRef3" v-if="pieOption" :option="pieOption" style="flex:1;height:300px" />
      </div>
    </template>

    <!-- Monthly stats -->
    <template v-if="granularity === 'monthly' && monthlyData">
      <n-card title="概览" style="margin-top: 12px">
        <div class="month-compare">
          <div>
            <div class="stat-num">{{ monthlyData.done }}/{{ monthlyData.total }}</div>
            <div class="stat-label">完成率 {{ monthlyData.rate }}%</div>
          </div>
          <div>
            <div class="stat-num">{{ monthlyData.prevDone }}/{{ monthlyData.prevTotal }}</div>
            <div class="stat-label">上月完成率 {{ monthlyData.prevRate }}%</div>
          </div>
          <div>
            <span :style="{ color: rateDiff >= 0 ? '#18a058' : '#d03050' }">
              {{ rateDiff >= 0 ? '↑' : '↓' }}{{ Math.abs(rateDiff) }}%
            </span>
            <div class="stat-label">环比变化</div>
          </div>
        </div>
      </n-card>
      <div class="chart-row">
        <ReportChart ref="chartRef1" v-if="trendOption" :option="trendOption" style="flex:3;height:300px" />
        <ReportChart ref="chartRef2" v-if="pieOption" :option="pieOption" style="flex:1;height:300px" />
      </div>
    </template>

    <!-- AI Summary -->
    <div style="margin-top:12px">
      <n-button @click="generateAiSummary()" :loading="aiLoading" size="small">🤖 AI 摘要</n-button>
      <n-card v-if="aiContent" style="margin-top:8px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="color:#888;font-size:12px">AI 摘要 · {{ aiGeneratedAt }}</span>
          <n-button @click="generateAiSummary()" size="tiny" :loading="aiLoading">重新生成</n-button>
        </div>
        <div class="ai-markdown" v-html="renderMarkdown(aiContent)"></div>
      </n-card>
      <p v-if="aiError" style="color:#d03050;margin-top:4px">{{ aiError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { NDatePicker, NButton, NCard, NProgress, useMessage } from 'naive-ui'
import StatsCards from '../components/StatsCards.vue'
import ReportChart from '../components/ReportChart.vue'
import { api } from '../api'
import { formatDate, getWeekRange } from '../utils/date'
import { renderMarkdown } from '../utils/markdown'
import { fmtMin, categoryLabel, categoryColor } from '../utils/format'
import type { DailyStats, WeeklyStats, MonthlyStats, Task } from '../types'

const granularity = ref<'daily' | 'weekly' | 'monthly'>('weekly')
const loadError = ref('')
const segOptions = [
  { label: '日报', value: 'daily' },
  { label: '周报', value: 'weekly' },
  { label: '月报', value: 'monthly' },
]
const selectedDate = ref(formatDate(new Date()))
const dailyStats = ref<DailyStats | null>(null)
const todayTasks = ref<Task[]>([])
const weeklyData = ref<WeeklyStats | null>(null)
const monthlyData = ref<MonthlyStats | null>(null)
const trendOption = ref<any>(null)
const taskCountOption = ref<any>(null)
const rateOption = ref<any>(null)
const pieOption = ref<any>(null)
const referenceDate = ref(new Date())
const chartRef1 = ref<InstanceType<typeof ReportChart> | null>(null)
const chartRef2 = ref<InstanceType<typeof ReportChart> | null>(null)
const chartRef3 = ref<InstanceType<typeof ReportChart> | null>(null)
const message = useMessage()

const aiLoading = ref(false)
const aiContent = ref('')
const aiError = ref('')
const aiGeneratedAt = ref('')

// Week/Month labels
const weekLabel = computed(() => {
  const { start, end } = getWeekRange(referenceDate.value)
  return `${start} ~ ${end}`
})
const monthLabel = computed(() => {
  const y = referenceDate.value.getFullYear()
  const m = referenceDate.value.getMonth() + 1
  return `${y}年 ${m}月`
})

// Weekly summary aggregation
const weeklySummary = computed(() => {
  if (!weeklyData.value) return { total: 0, rate: 0 }
  const days = weeklyData.value.days
  const total = days.reduce((s, d) => s + d.total, 0)
  const done = days.reduce((s, d) => s + d.done, 0)
  return { total, rate: total > 0 ? Math.round((done / total) * 100) : 0 }
})

// Monthly rate diff
const rateDiff = computed(() => {
  if (!monthlyData.value) return 0
  return monthlyData.value.rate - monthlyData.value.prevRate
})

// Daily category helpers
const hasCatData = computed(() => {
  if (!dailyStats.value) return false
  return Object.values(dailyStats.value.byCategory).some(v => v > 0)
})
const maxCatMin = computed(() => {
  if (!dailyStats.value) return 1
  return Math.max(...Object.values(dailyStats.value.byCategory), 1)
})

// Navigation
function navigateWeek(dir: number) {
  const d = new Date(referenceDate.value)
  d.setDate(d.getDate() + dir * 7)
  referenceDate.value = d
  loadStats()
}
function navigateMonth(dir: number) {
  const d = new Date(referenceDate.value)
  d.setMonth(d.getMonth() + dir)
  referenceDate.value = d
  loadStats()
}

// Build ECharts options
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

function buildTaskCountOption(days: { date: string; total: number }[]) {
  return {
    title: { text: '每日任务数', textStyle: { color: '#333', fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: days.map(d => d.date.slice(5)), axisLabel: { color: '#7a7a7a' } },
    yAxis: { type: 'value', max: 10, min: 0, interval: 2, axisLabel: { color: '#7a7a7a' }, splitLine: { lineStyle: { color: '#f0f0f0' } } },
    series: [
      { name: '任务数', type: 'bar', data: days.map(d => d.total), itemStyle: { color: '#0066cc' } }
    ]
  }
}

function buildRateOption(days: { date: string; rate: number }[]) {
  return {
    title: { text: '每日完成率', textStyle: { color: '#333', fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: days.map(d => d.date.slice(5)), axisLabel: { color: '#7a7a7a' } },
    yAxis: { type: 'value', max: 100, axisLabel: { color: '#7a7a7a', formatter: '{value}%' }, splitLine: { lineStyle: { color: '#f0f0f0' } } },
    series: [
      { name: '完成率%', type: 'line', data: days.map(d => d.rate), smooth: true, itemStyle: { color: '#18a058' }, areaStyle: { color: 'rgba(24,160,88,0.1)' } }
    ]
  }
}

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

// Load data
async function loadStats() {
  trendOption.value = null
  taskCountOption.value = null
  rateOption.value = null
  pieOption.value = null
  aiContent.value = ''
  aiError.value = ''
  loadError.value = ''

  try {
    if (granularity.value === 'daily') {
      dailyStats.value = await api.stats.getDaily(selectedDate.value)
      todayTasks.value = await api.tasks.getByDate(selectedDate.value)
      weeklyData.value = null
      monthlyData.value = null
    } else if (granularity.value === 'weekly') {
      const { start, end } = getWeekRange(referenceDate.value)
      weeklyData.value = await api.stats.getWeekly(start, end)
      dailyStats.value = null
      monthlyData.value = null
      const days = weeklyData.value.days
      if (days.length > 0) {
        taskCountOption.value = buildTaskCountOption(days)
        rateOption.value = buildRateOption(days)
        pieOption.value = buildPieOption(weeklyData.value.byCategory)
      }
    } else {
      const y = referenceDate.value.getFullYear()
      const m = referenceDate.value.getMonth() + 1
      monthlyData.value = await api.stats.getMonthly(y, m)
      dailyStats.value = null
      weeklyData.value = null
      const days = monthlyData.value.days
      if (days.length > 0) {
        trendOption.value = buildTrendOption(days)
        pieOption.value = buildPieOption(monthlyData.value.byCategory)
      }
    }
  } catch (e: unknown) {
    loadError.value = (e as Error).message || '加载失败'
  }
}

// Export
async function exportCharts() {
  const charts = [chartRef1.value?.getChart(), chartRef2.value?.getChart(), chartRef3.value?.getChart()].filter(Boolean)
  for (const chart of charts) {
    if (!chart) continue
    const dataUrl = chart!.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#ffffff' })
    await api.app.exportImage(dataUrl)
  }
  if (charts.length > 0) message.success('导出完成')
}

// AI Summary
async function generateAiSummary() {
  aiLoading.value = true
  aiError.value = ''
  aiContent.value = ''
  try {
    let dateRange: { start: string; end: string }
    let reviewContent = ''
    if (granularity.value === 'daily') {
      dateRange = { start: selectedDate.value, end: selectedDate.value }
      const r = await api.reviews.getByDate(selectedDate.value)
      reviewContent = r?.content || ''
    } else if (granularity.value === 'weekly') {
      dateRange = getWeekRange(referenceDate.value)
    } else {
      const y = referenceDate.value.getFullYear()
      const m = referenceDate.value.getMonth() + 1
      dateRange = { start: `${y}-${String(m).padStart(2,'0')}-01`, end: `${y}-${String(m).padStart(2,'0')}-${new Date(y,m,0).getDate()}` }
    }
    let tasks = ''
    let statsText = ''
    if (granularity.value === 'daily') {
      tasks = todayTasks.value.length > 0
        ? todayTasks.value.map(t => `- [${t.status === 'done' ? 'x' : ' '}] ${t.title} (${t.category}, ${t.priority})`).join('\n')
        : ''
      statsText = dailyStats.value
        ? `完成率 ${dailyStats.value.rate}%, 预估 ${fmtMin(dailyStats.value.totalEstimated)}, 实际 ${fmtMin(dailyStats.value.totalActual)}`
        : ''
      const fbList = await api.feedback.getByDate(selectedDate.value)
      const fbText = fbList.map(f => `- 问题：${f.problems || '无'} / 优化：${f.optimizations || '无'}`).join('\n')
      const result = await api.ai.generateReport({
        granularity: 'daily',
        dateRange,
        tasks,
        reviewContent,
        stats: statsText,
        feedback: fbText
      })
      aiContent.value = result.content
      aiGeneratedAt.value = new Date().toLocaleString('zh-CN')
      aiLoading.value = false
      return
    } else if (granularity.value === 'weekly' && weeklyData.value) {
      const allTasks = await api.tasks.getByDateRange(dateRange.start, dateRange.end)
      const byDate = new Map<string, typeof allTasks>()
      for (const t of allTasks) {
        const arr = byDate.get(t.planned_date) || []
        arr.push(t)
        byDate.set(t.planned_date, arr)
      }
      const sortedDates = [...byDate.keys()].sort()
      tasks = sortedDates.map(date => {
        const dayTasks = byDate.get(date)!
        return `\n## ${date}\n` + dayTasks.map(t =>
          `- [${t.status === 'done' ? 'x' : ' '}] ${t.title} (${t.category}, ${t.priority}, 估${t.estimated_min || 0}min/实${t.actual_min || 0}min)`
        ).join('\n')
      }).join('\n')

      const reviews = await api.reviews.getByDateRange(dateRange.start, dateRange.end)
      reviewContent = reviews.filter(r => r.content).map(r => `### ${r.date}\n${r.content}`).join('\n\n')

      const fbList = await api.feedback.getByDateRange(dateRange.start, dateRange.end)
      const fbText = fbList.map(f =>
        `- [${f.planned_date}] 任务「${f.task_title}」: 问题：${f.problems || '无'} / 优化：${f.optimizations || '无'}`
      ).join('\n')

      const doneCount = allTasks.filter(t => t.status === 'done').length
      const doneRate = allTasks.length > 0 ? Math.round(doneCount / allTasks.length * 100) : 0
      const perDayStats = sortedDates.map(date => {
        const dayTasks = byDate.get(date)!
        const dayDone = dayTasks.filter(t => t.status === 'done').length
        const dayRate = dayTasks.length > 0 ? Math.round(dayDone / dayTasks.length * 100) : 0
        return `- ${date}: 任务数 ${dayTasks.length} 个 | 完成率 ${dayRate}%`
      }).join('\n')
      statsText = `${perDayStats}\n\n本周汇总:\n- 任务总数: ${allTasks.length} 个\n- 已完成: ${doneCount} 个\n- 完成率: ${doneRate}%\n- 预估耗时: ${weeklyData.value.totalEstimated}min\n- 实际耗时: ${weeklyData.value.totalActual}min`

      const result = await api.ai.generateReport({
        granularity: 'weekly',
        dateRange,
        tasks,
        reviewContent,
        stats: statsText,
        feedback: fbText
      })
      aiContent.value = result.content
      aiGeneratedAt.value = new Date().toLocaleString('zh-CN')
      return
    } else if (granularity.value === 'monthly' && monthlyData.value) {
      tasks = monthlyData.value.days.map(d => `- ${d.date}: ${d.done}/${d.total} 完成, 完成率 ${d.rate}%`).join('\n')
      statsText = `总任务 ${monthlyData.value.total}, 完成 ${monthlyData.value.done}, 完成率 ${monthlyData.value.rate}%`
    }
    const result = await api.ai.generateReport({
      granularity: granularity.value === 'monthly' ? 'monthly' : granularity.value === 'weekly' ? 'weekly' : 'daily',
      dateRange,
      tasks,
      reviewContent,
      stats: statsText
    })
    aiContent.value = result.content
    aiGeneratedAt.value = new Date().toLocaleString('zh-CN')
  } catch (e: unknown) {
    aiError.value = (e as Error).message || '生成失败'
  } finally {
    aiLoading.value = false
  }
}

onMounted(() => loadStats())
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
