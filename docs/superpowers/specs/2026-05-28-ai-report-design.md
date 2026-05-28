# MyPlanner — AI 汇报 & 复盘优化 设计规格

## 概述

在现有 MyPlanner 基础上新增三个功能：
1. **DeepSeek AI 汇报**：调用 DeepSeek API 自动生成日报/周报/月报/季报/年报的文字总结
2. **复盘抽屉**：保存复盘后复盘区域折叠为蓝色提示条
3. **保存提示**：复盘保存成功后弹出消息确认

---

## 1. 数据库

新增 `settings` 表：

```sql
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

存储 `deepseek_api_key`，由 main process 管理，渲染层不暴露原始值。

---

## 2. IPC 通道

| 通道 | 方向 | 参数 | 返回 | 说明 |
|------|------|------|------|------|
| `settings:get` | renderer→main | `key: string` | `{ value: string \| null }` | API Key 不返回原始值，只返回是否存在 |
| `settings:set` | renderer→main | `key: string, value: string` | `void` | 保存配置 |
| `settings:hasApiKey` | renderer→main | — | `boolean` | 检查是否已配置 Key |
| `ai:generateReport` | renderer→main | `{ granularity, date, tasks, reviewContent, stats }` | `{ content: string }` | 调用 DeepSeek，返回 Markdown |

### ai:generateReport 实现细节

- main process 从 `settings` 表读取 `deepseek_api_key`
- 调用 `https://api.deepseek.com/chat/completions`
- 使用 `fetch` (Node.js 18+ 内置)，30s 超时
- prompt 包含：任务列表、完成状态、耗时、复盘内容、统计数字
- 根据粒度控制字数：日报 100-200 字、周报 300-400 字、月报 ~500 字、季报/年报深度长篇
- 返回 Markdown 格式文本
- 错误时透传错误信息（网络错误、API Key 无效等）

---

## 3. 设置页面

### 入口

AppLayout header 右侧增加 ⚙ 齿轮图标按钮。

### 组件：`SettingsModal.vue`

- `n-modal` 弹窗
- API Key 输入框（`type="password"`）
- 已配置时显示占位符 `●●●●●●●●`，清空后可重新输入
- 「保存」按钮 → 调用 `settings:set`
- 「测试连接」按钮 → 发送一个简单请求验证 Key 有效性
- 状态提示文字：「未配置」/「已配置」/「测试中...」/「连接成功」/「连接失败」

---

## 4. AI 汇报 — 报表页嵌入

### 改动 `ReportView.vue`

每天/周/月粒度下方增加：
- 「🤖 AI 摘要」按钮
- 点击后调用 `ai:generateReport`，传入当前粒度的任务+复盘+统计
- 展示区域：`n-card` 包裹 Markdown 文本，标题带生成时间戳
- 「重新生成」按钮

---

## 5. AI 汇报 — 独立页面

### 导航

侧边栏增加「🤖 AI 汇报」导航项（第四个）。

### 组件：`AIReportView.vue`

- **粒度切换**：`n-radio-group` — 日报 / 周报 / 月报 / 季报 / 年报
- **日期选择**：
  - 日报：`n-date-picker` 选单日
  - 周报：`n-date-picker` 选周（或上一周/下一周导航）
  - 月报：月份选择器 + 上一月/下一月
  - 季报：季度选择（Q1/Q2/Q3/Q4）+ 年份
  - 年报：年份选择器
- **「生成汇报」按钮**：loading 状态，生成中显示骨架
- **结果展示**：Markdown 渲染文本（使用 `markdown-it` 或简单文本），滚动查看
- **「导出 Word/TXT」按钮**：导出为文本文件（通过 IPC 保存对话框）

### 数据获取逻辑

根据粒度查询对应时间范围的任务和复盘：
- 日报：当天任务 + 当天复盘
- 周报：当周每天的任务 + 每天的复盘（如果有）
- 月报：当月聚合数据（复用 stats:getMonthly）
- 季报：三个月聚合
- 年报：十二个月聚合

---

## 6. 复盘抽屉

### 改动 `ReviewView.vue`

复盘区域行为：
- 新增 `reviewExpanded` ref，默认 `true`
- 保存后自动设为 `false`（折叠）
- 加载已有复盘时设为 `false`（已保存过 → 折叠显示）
- 新建日期无复盘时设为 `true`（展开编辑）

### 折叠状态 UI

```
┌─────────────────────────────────────────┐
│ 📝 已保存复盘内容      [点击展开]        │
└─────────────────────────────────────────┘
```

- 蓝色提示条，`color: #2080f0`
- 点击展开 → 显示 textarea + 保存按钮

### 展开状态 UI

- 现有 textarea + 保存按钮（不变）

---

## 7. 保存确认提示

### 改动 `ReviewView.vue`

`handleSave` 成功后：
```ts
await reviewStore.saveReview(...)
message.success('保存成功')
expanded.value = false
```

---

## 8. 交互细节

- 设置页 API Key 不显示明文（password 输入框 + 占位符）
- AI 生成中按钮显示 loading spinner
- AI 生成失败显示红色错误提示
- 粒度切换时自动清除上一次生成结果
- 季报和年报的「上一期/下一期」导航同周报月报模式
