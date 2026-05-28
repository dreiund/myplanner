# MyPlanner — 个人效率管理桌面应用 设计规格

## 概述

MyPlanner 是一个基于 Electron 的本地桌面应用，帮助用户管理日常工作和学习任务。核心功能：日历式任务管理、一键完成激活、手写复盘总结、多维度统计分析报表。

---

## 技术栈

| 层 | 技术 |
|---|---|
| 桌面壳 | Electron + electron-builder 打包 |
| 前端框架 | Vue 3 + Composition API + Vite |
| 状态管理 | Pinia |
| UI 组件库 | Naive UI |
| 图表 | ECharts |
| 数据库 | better-sqlite3（主进程同步 API） |

**IPC 通信模式**：渲染进程通过 preload 暴露的 API 调用主进程，主进程操作 SQLite 并返回结果。渲染层不直接接触数据库。

---

## 数据库设计

```sql
CREATE TABLE tasks (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  title         TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',  -- pending | in_progress | done | cancelled
  priority      TEXT NOT NULL DEFAULT 'medium',   -- low | medium | high | urgent
  category      TEXT NOT NULL DEFAULT 'work',     -- work | study | life
  planned_date  TEXT NOT NULL,                    -- YYYY-MM-DD
  due_date      TEXT,
  note          TEXT,
  estimated_min INTEGER,
  actual_min    INTEGER,
  completed_at  TEXT,                             -- ISO 8601, NULL 表示未完成
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE TABLE subtasks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id     INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending',
  sort_order  INTEGER DEFAULT 0
);

CREATE TABLE daily_reviews (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  date        TEXT NOT NULL UNIQUE,              -- YYYY-MM-DD
  content     TEXT,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
```

---

## 应用布局

```
┌──────────────────────────────────────────────────┐
│  ⚡ MyPlanner                ─ □ ×               │
├──────────┬───────────────────────────────────────┤
│  📅 日历  │         主内容区                       │
│  📊 总结  │                                       │
│  📈 报表  │                                       │
├──────────┴───────────────────────────────────────┤
│  状态栏                                            │
└──────────────────────────────────────────────────┘
```

三个导航项对应三个视图。单窗口，无多窗口设计。

---

## 视图 1：日历（任务管理主界面）

- 顶部分月/周/日三种视图模式切换
- 日期格根据当天任务状态显示彩色标记点
- 点击某一天：右侧展开该日任务列表
- 双击某一天：直接弹出新建任务对话框
- 任务列表支持筛选：按状态、标签、优先级

### 颜色标记规则

| 颜色 | 含义 |
|---|---|
| 🔴 红点 | 当天有未完成的高优先级任务 |
| 🟡 黄点 | 当天有未完成的中优先级任务 |
| 🟢 绿点 | 当天任务全部完成 |
| 蓝色背景 | 当前选中日期 |
| 灰色标记 | 当天有编辑记录（新建/修改过任务）|

### 任务列表项结构

```
○ 📁工作  完成项目报告
  🔴 高优先级  截止: 5/30  ⏱估2h / 实--
  ├ ☐ 收集数据
  └ ☐ 撰写初稿
```

- 左侧空心圆 `○` 点击 → 状态变为 `done`，记录 `completed_at`
- 左侧实心勾 `●` 点击 → 回退为 `pending`，清空 `completed_at`
- 子任务 checkbox 可直接勾选完成

---

## 视图 2：总结

- 可切换日期查看任意一天
- 自动拉取当日已完成/未完成任务列表
- 统计卡片：完成率、预估耗时、实际耗时
- 分类耗时进度条
- 富文本复盘输入框，可保存到 `daily_reviews` 表

---

## 视图 3：报表

三层粒度，支持导出：

| 粒度 | 默认范围 | 展示内容 |
|---|---|---|
| 日报 | 选定单日 | 完成清单 + 完成率 + 分类耗时 |
| 周报 | 本周 | 7日趋势折线 + 总览统计 + 分类饼图 + 预估/实际耗时柱状图 |
| 月报 | 本月 | 30日趋势折线 + 月度总览 + 分类占比 + 与上月环比对比 |

图表使用 ECharts 渲染，支持导出为图片。

---

## 字段填充逻辑

- `actual_min`：任务完成时自动计算 `completed_at - created_at` 的时间差（分钟），如果用户手动填写了则以手动值为准
- `created_at` / `updated_at`：由主进程在写入时自动生成当前时间戳

## 周起止约定

- 周报：周一至周日，与日历视图保持一致
- 月报：自然月（1号至月底）

## 导出格式

- 报表导出为 PNG 图片（通过 ECharts 的 `getDataURL` + Electron 原生保存对话框）
- 未来可扩展 PDF 导出

## 交互细节

- 所有增删改操作即时写入 SQLite，无需手动保存
- 日历视图切换日期时自动刷新任务列表
- 总结页复盘内容需手动点击保存
- 应用启动时默认显示今天日历视图
