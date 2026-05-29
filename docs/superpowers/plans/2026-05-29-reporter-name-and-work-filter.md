# 汇报人名称 & 工作报告过滤 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将硬编码的「冯可成」替换为可自定义的汇报人名称，生成报告时仅展示「工作」类任务，统计数据按分类拆分。

**Architecture:** 6 个文件改动，无新文件。后端新增 `settings:get` IPC handler 和 `REPORTER_NAME` 常量；前端设置页新增名称输入框；报告生成时在前端过滤工作类任务并构造分类统计文本。

**Tech Stack:** Electron + Vue 3 + Naive UI + better-sqlite3 + DeepSeek API

---

### Task 1: 后端 — 新增 REPORTER_NAME 常量

**Files:**
- Modify: `src/main/db/settings.ts:3-3`

- [ ] **Step 1: 添加常量**

```typescript
export const REPORTER_NAME = 'reporter_name'
```

就插在 `DEEPSEEK_API_KEY` 常量下一行即可。

- [ ] **Step 2: 验证**

```bash
grep -n "REPORTER_NAME" src/main/db/settings.ts
```

预期输出：一行，显示该常量定义。

- [ ] **Step 3: Commit**

```bash
git add src/main/db/settings.ts
git commit -m "feat(settings): add REPORTER_NAME constant"
```

---

### Task 2: 后端 — 新增 settings:get IPC handler

**Files:**
- Modify: `src/main/ipc-handlers.ts:43-44`

- [ ] **Step 1: 添加 handler**

```typescript
ipcMain.handle('settings:get', (_e, key: string) => settingsDb.getSetting(key))
```

插在 `settings:set` handler (第 44 行) 之后。

- [ ] **Step 2: Commit**

```bash
git add src/main/ipc-handlers.ts
git commit -m "feat(ipc): add settings:get handler"
```

---

### Task 3: 前端类型 — ElectronAPI.settings 新增 get 方法签名

**Files:**
- Modify: `src/renderer/src/types.ts:110-113`

- [ ] **Step 1: 在 settings 接口中添加 get**

将 `ElectronAPI` 的 `settings` 块从：

```typescript
settings: {
  hasApiKey: () => Promise<boolean>
  set: (key: string, value: string) => Promise<void>
}
```

改为：

```typescript
settings: {
  get: (key: string) => Promise<string>
  hasApiKey: () => Promise<boolean>
  set: (key: string, value: string) => Promise<void>
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer/src/types.ts
git commit -m "feat(types): add settings.get method signature"
```

---

### Task 4: 设置 UI — 新增「汇报人名称」输入框

**Files:**
- Modify: `src/renderer/src/components/SettingsModal.vue`

- [ ] **Step 1: 模板 — 在 API Key 输入框后新增名称输入框**

在 `<n-form-item label="DeepSeek API Key">` 闭合 `</n-form-item>` 之后、状态提示 `<p>` 之前，插入：

```vue
<n-form-item label="汇报人名称">
  <n-input
    v-model:value="reporterName"
    :placeholder="reporterName || '输入你的名字'"
  />
</n-form-item>
```

- [ ] **Step 2: 脚本 — 新增 reporterName 响应式变量和加载逻辑**

在 `const apiKey = ref('')` 之后添加：

```typescript
const reporterName = ref('')
```

在 `onMounted` 里追加加载名称的逻辑。当前 `onMounted` 是这样的：

```typescript
onMounted(async () => {
  try {
    hasKey.value = await api.settings.hasApiKey()
    statusText.value = hasKey.value ? '已配置' : '未配置'
  } catch {
    statusText.value = '加载失败'
  }
})
```

改为：

```typescript
onMounted(async () => {
  try {
    hasKey.value = await api.settings.hasApiKey()
    statusText.value = hasKey.value ? '已配置' : '未配置'
    reporterName.value = (await api.settings.get('reporter_name')) || ''
  } catch {
    statusText.value = '加载失败'
  }
})
```

- [ ] **Step 3: 脚本 — handleSave 中保存名称**

在 `handleSave()` 函数中，保存 API Key 之后添加：

```typescript
if (reporterName.value.trim()) {
  await api.settings.set('reporter_name', reporterName.value.trim())
}
```

完整的 `handleSave` 变为：

```typescript
async function handleSave() {
  if (!apiKey.value.trim()) return
  saving.value = true
  try {
    await api.settings.set('deepseek_api_key', apiKey.value.trim())
    hasKey.value = true
    statusText.value = '已配置'
    if (reporterName.value.trim()) {
      await api.settings.set('reporter_name', reporterName.value.trim())
    }
  } catch {
    statusText.value = '保存失败'
  } finally {
    saving.value = false
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/renderer/src/components/SettingsModal.vue
git commit -m "feat(settings): add reporter name input in settings modal"
```

---

### Task 5: 后端 — ai.ts 使用自定义汇报人名称

**Files:**
- Modify: `src/main/ai.ts:1-182`

- [ ] **Step 1: 修改 import，引入 REPORTER_NAME 和 getSetting**

当前第 1 行：

```typescript
import { getSetting, DEEPSEEK_API_KEY } from './db/settings'
```

改为：

```typescript
import { getSetting, DEEPSEEK_API_KEY, REPORTER_NAME } from './db/settings'
```

- [ ] **Step 2: 在 buildPrompt 函数顶部读取汇报人名称**

在 `buildPrompt` 函数开头（`const label = ...` 之前）添加：

```typescript
const reporter = getSetting(REPORTER_NAME) || ''
```

- [ ] **Step 3: 替换周报(weekly)模板中的硬编码名称**

第 43 行，将：

```
**汇报人：** 冯可成
```

改为：

```
**汇报人：** ${reporter}
```

- [ ] **Step 4: 替换日报(daily)模板中的硬编码名称**

第 94 行，将：

```
**汇报人：** 冯可成
```

改为：

```
**汇报人：** ${reporter}
```

- [ ] **Step 5: 改进月报/季报/年报模板，增加汇报人和任务详情**

当前第 117-136 行的通用模板（月报/季报/年报使用）没有汇报人信息。替换整个 return 块：

当前代码 (117-136 行)：

```typescript
return `你是一个个人效率助手，请根据以下数据生成一份${label}。
时间范围：${input.dateRange.start} 至 ${input.dateRange.end}
字数要求：${WORD_LIMITS[input.granularity] || '500字左右'}

【任务数据】
${input.tasks || '无任务数据'}

【复盘总结】
${input.reviewContent || '无复盘内容'}

【统计数据】
${input.stats || '无统计数据'}

请以 Markdown 格式输出，包含：
- 总体概述
- 关键成果/亮点
- 待改进之处
- 下一步计划

要求简洁有力，用数据和事实说话。`
```

改为：

```typescript
return `你是一个个人效率助手，请根据以下数据生成一份${label}。
时间范围：${input.dateRange.start} 至 ${input.dateRange.end}
字数要求：${WORD_LIMITS[input.granularity] || '500字左右'}

【任务数据】
${input.tasks || '无任务数据'}

【复盘总结】
${input.reviewContent || '无复盘内容'}

【任务反馈】（完成每个任务时填写的问题和优化建议）
${input.feedback || '无反馈数据'}

【统计数据】
${input.stats || '无统计数据'}

请严格按以下 Markdown 格式输出${label}：

# ${label} - ${input.dateRange.start} ~ ${input.dateRange.end}
**汇报人：** ${reporter}

## 一、总体概述
（根据任务完成情况概述本周期进展）

## 二、关键成果/亮点
- （列出主要完成的事项和成果）

## 三、待改进之处
- （根据任务反馈和完成任务中存在的问题提炼）

## 四、下一步计划
- （合理推断下一周期应推进的事项）

要求：
- 简洁有力，用数据和事实说话
- 如果用到的数据不足，相关部分可以简写`
```

- [ ] **Step 6: Commit**

```bash
git add src/main/ai.ts
git commit -m "fix(report): use custom reporter name from settings instead of hardcoded value"
```

---

### Task 6: 前端 — AIReportView 过滤工作类任务 & 拆分分类统计

**Files:**
- Modify: `src/renderer/src/views/AIReportView.vue`

这就是最核心的前端改动，分 3 个子步骤：

- [ ] **Step 1: 日报 — 过滤工作类任务 + 添加分类统计**

当前日报的 `generate()` 中 (134-151 行)：

```typescript
if (granularity.value === 'daily') {
  const tasks = await api.tasks.getByDate(range.start)
  tasksText = tasks.map(t => `- [${t.status === 'done' ? 'x' : ' '}] ${t.title} (${t.category}, ${t.priority}, 估${t.estimated_min || 0}min/实${t.actual_min || 0}min)`).join('\n')
  const r = await api.reviews.getByDate(range.start)
  reviewText = r?.content || ''
  const fbList = await api.feedback.getByDate(range.start)
  const fbText = fbList.map(f => `- 问题：${f.problems || '无'} / 优化：${f.optimizations || '无'}`).join('\n')
  const result = await api.ai.generateReport({
    granularity: granularity.value,
    dateRange: range,
    tasks: tasksText,
    reviewContent: reviewText,
    stats: tasksText,
    feedback: fbText
  })
  content.value = result.content
  generatedAt.value = new Date().toLocaleString('zh-CN')
  return
}
```

改为：

```typescript
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
}
```

- [ ] **Step 2: 周报 — 过滤工作类任务 + 添加分类统计**

当前周报的 generate 中 (152-197 行)。在 `const allTasks = await api.tasks.getByDateRange(range.start, range.end)` 之后，对所有使用 `allTasks` 做过滤：

```typescript
const allTasks = await api.tasks.getByDateRange(range.start, range.end)
const workTasks = allTasks.filter(t => t.category === 'work')
```

然后将后续所有 `allTasks` 引用替换为 `workTasks`：

- `byDate` 的填充用 `workTasks`
- `sortedDates` 推导用 `byDate`
- `doneCount` 计算用 `workTasks`
- `perDayStats` 中的 `dayTasks` 来自 `byDate`，已经过滤过了
- `statsText` 中的 `allTasks.length` 改为 `workTasks.length`

统计部分，在 `const raw = await api.stats.getWeekly(range.start, range.end)` 后，`raw` 有 `byCategory`，`statsText` 末尾追加分类统计：

完整的周报块改为：

```typescript
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
  const statsText = `${perDayStats}\n\n本周汇总（仅工作类任务）:\n- 任务总数: ${workTasks.length} 个\n- 已完成: ${doneCount} 个\n- 完成率: ${doneRate}%\n- 预估耗时: ${raw.totalEstimated}min\n- 实际耗时: ${raw.totalActual}min\n\n按分类耗时:\n- 工作：${formatMinutes(catStats.work || 0)}\n- 学习：${formatMinutes(catStats.study || 0)}\n- 生活：${formatMinutes(catStats.life || 0)}`

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
```

- [ ] **Step 3: 月报/季报/年报 — 添加分类统计和任务详情**

当前月报块 (198-203 行)：

```typescript
} else if (granularity.value === 'monthly') {
  const y = referenceDate.value.getFullYear(); const m = referenceDate.value.getMonth() + 1
  const raw = await api.stats.getMonthly(y, m)
  tasksText = `总计 ${raw.total} 个任务, 完成 ${raw.done} 个, 完成率 ${raw.rate}%`
} else if (granularity.value === 'quarterly' || granularity.value === 'annual') {
  tasksText = `时间范围: ${range.start} 至 ${range.end}`
}
```

改为：

```typescript
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

  const result = await api.ai.generateReport({
    granularity: granularity.value,
    dateRange: range,
    tasks: tasksText,
    reviewContent: reviewText,
    stats: statsText
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

  const result = await api.ai.generateReport({
    granularity: granularity.value,
    dateRange: range,
    tasks: tasksText,
    reviewContent: reviewText,
    stats: statsText
  })
  content.value = result.content
  generatedAt.value = new Date().toLocaleString('zh-CN')
  return
}
```

> **注意：** 月报和季报/年报的 `generateReport` 调用后也需要加上 `return` 防止 fall-through 到统一的 `generateReport` 调用（第 205-213 行）。原代码中月报没有 `return`，会再走一次 `generateReport`，这是一个已有的 bug，本次一并修复。

- [ ] **Step 4: 添加 formatMinutes 辅助函数**

在 `<script setup>` 中现有 import 之后添加：

```typescript
function formatMinutes(min: number): string {
  if (min >= 60) {
    const h = Math.floor(min / 60)
    const m = min % 60
    return m > 0 ? `${h}h${m}m` : `${h}h`
  }
  return `${min}m`
}
```

- [ ] **Step 5: Commit**

```bash
git add src/renderer/src/views/AIReportView.vue
git commit -m "feat(report): filter work tasks only and split stats by category"
```

---

### 改动文件总览

| 文件 | 改动类型 |
|------|----------|
| `src/main/db/settings.ts` | 新增 1 行常量 |
| `src/main/ipc-handlers.ts` | 新增 1 行 handler |
| `src/renderer/src/types.ts` | 新增 1 行类型 |
| `src/renderer/src/components/SettingsModal.vue` | 新增 UI + 逻辑 (约 15 行) |
| `src/main/ai.ts` | 修改提示词模板 (~30 行变更) |
| `src/renderer/src/views/AIReportView.vue` | 核心逻辑重构 (~80 行变更) |
