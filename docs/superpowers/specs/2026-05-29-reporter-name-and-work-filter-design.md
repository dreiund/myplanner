# 汇报人名称 & 工作报告过滤 — 设计文档

**日期**: 2026-05-29  
**目标**: 将硬编码的「冯可成」替换为可自定义的汇报人名称（设置中配置），且在生成报告时仅展示「工作」类任务，统计数据按分类拆分。

## 1. 改动清单

### 1.1 设置 — 汇报人名称

| 文件 | 改动 |
|------|------|
| `src/main/db/settings.ts` | 新增 `REPORTER_NAME` 常量，复用已有 `getSetting`/`setSetting` |
| `src/main/ipc-handlers.ts` | 新增 `settings:get` handler，返回任意 key 的值 |
| `src/renderer/src/types.ts` | `ElectronAPI.settings` 新增 `get` 方法签名 |
| `src/renderer/src/components/SettingsModal.vue` | 在 API Key 输入框下方新增「汇报人名称」输入框 |
| `src/main/ai.ts` | `buildPrompt` 从 settings 读取 `reporter_name`，注入到所有报告模板 |

### 1.2 报告仅展示「工作」类任务

| 文件 | 改动 |
|------|------|
| `src/renderer/src/views/AIReportView.vue` | 在 `generate()` 中对所有粒度过滤 `t.category === 'work'` |
| `src/main/ai.ts` | 月报/季报/年报模板增加汇报人和任务详情占位 |

### 1.3 统计数据按分类拆分

| 文件 | 改动 |
|------|------|
| `src/renderer/src/views/AIReportView.vue` | 日报/周报/月报构造 `statsText` 时使用 `byCategory` 按 work/study/life 分组 |

## 2. 兼容性

- 如果未设置 `reporter_name`，回退为空字符串（报告中 `**汇报人：** ` 空白）
- 如果某天没有任何工作类任务，`tasksText` 显示「无工作任务」
- 所有现有 API 接口不变，只新增 `settings:get`
