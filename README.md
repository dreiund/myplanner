# MyPlanner

MyPlanner 是一个本地优先的个人效率管理桌面应用。它把「日历任务」「每日复盘」「统计报表」和「AI 汇报」放在同一个工作流里，适合用来记录每天做了什么、完成得怎么样，以及下一步该怎么调整。


## 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [环境要求](#环境要求)
- [从源码运行](#从源码运行)
- [使用指南](#使用指南)
- [本地构建与打包](#本地构建与打包)
- [GitHub Actions 发布](#github-actions-发布)
- [数据与隐私](#数据与隐私)
- [项目结构](#项目结构)
- [常见问题](#常见问题)

## 功能特性

- **日历式任务管理**：按日期查看、创建、编辑和删除任务，支持开始时间、截止时间、优先级、分类、预估耗时和备注。
- **完成反馈沉淀**：任务完成时记录遇到的问题和可优化项，这些反馈会进入后续 AI 汇报上下文。
- **每日复盘**：按日期保存复盘内容，并结合当天任务展示完成率、任务数和耗时。
- **统计报表**：支持日报、周报、月报，展示任务完成率、预估/实际耗时、分类耗时、趋势图和环比数据。
- **图表导出**：报表页中的 ECharts 图表可以导出为 PNG。
- **AI 摘要与汇报**：接入 DeepSeek API 后，可生成报表摘要，以及日报、周报、月报、季报、年报形式的 Markdown 汇报。
- **本地数据存储**：任务、复盘、设置和完成反馈保存在本机 SQLite 数据库中。

## 技术栈

| 模块 | 技术 |
| --- | --- |
| 桌面端 | Electron 33 |
| 前端 | Vue 3、Vite 6、TypeScript |
| 状态管理 | Pinia |
| UI 组件 | Naive UI、Ionicons |
| 图表 | ECharts、vue-echarts |
| 数据库 | SQLite、better-sqlite3 |
| 打包发布 | electron-builder、GitHub Actions |

## 环境要求

- Node.js 20.x 或更新版本，推荐 Node.js 20 LTS。
- npm，建议使用随 Node.js 安装的版本。
- Git。
- DeepSeek API Key，仅 AI 摘要和 AI 汇报功能需要。

如果你只想体验基础的任务、复盘和报表功能，可以不配置 DeepSeek API Key。

## 从源码运行

```bash
git clone https://github.com/dreiund/myplanner.git
cd myplanner
npm ci
npm run dev
```

启动成功后会打开 MyPlanner 桌面窗口。

首次安装依赖时会执行 `npm run postinstall`，用于把 `better-sqlite3` 重新编译到当前 Electron 版本可用的原生模块。

## 使用指南

### 1. 创建任务

打开左侧「日历」页面：

1. 点击日期查看当天任务。
2. 点击「新建任务」，或双击日历中的某一天创建任务。
3. 填写标题、开始时间、优先级、分类、预估耗时、截止时间和备注。
4. 点击任务右侧按钮可以编辑或删除任务。

### 2. 完成任务并记录反馈

在任务列表中点击任务左侧的完成按钮：

1. 如果任务尚未完成，会弹出「任务完成反馈」窗口。
2. 填写遇到的问题和可以优化的地方。
3. 点击「确认完成」后，任务会被标记为已完成。
4. 已完成任务再次点击完成按钮，可以回退为未完成。

### 3. 写每日复盘

打开左侧「复盘」页面：

1. 使用「昨天」「明天」切换日期。
2. 查看当天任务、完成状态、预估耗时和实际耗时。
3. 在「今日复盘」中写当天总结。
4. 点击「保存复盘」保存到本地数据库。

### 4. 查看报表

打开左侧「报表」页面：

- **日报**：查看当天任务清单、完成率、预估/实际耗时和分类耗时。
- **周报**：查看每日任务数、每日完成率和分类耗时占比。
- **月报**：查看月度完成率趋势、分类占比，以及与上月的完成率对比。
- **导出图片**：点击「导出图片」可以把当前图表保存为 PNG。
- **AI 摘要**：配置 DeepSeek API Key 后，点击「AI 摘要」生成当前报表的简短总结。

### 5. 配置 AI 汇报

打开左侧底部「设置」：

1. 填入 DeepSeek API Key。
2. 点击「测试连接」确认可用。测试会发起一次简短的 AI 请求。
3. 点击「保存」。

配置完成后，打开左侧「AI 汇报」页面：

1. 选择日报、周报、月报、季报或年报。
2. 选择对应的日期、周、月份、季度或年份。
3. 点击「生成汇报」。
4. 生成结果会以 Markdown 渲染展示。
5. 点击「导出文本」可以保存为 `.md` 或 `.txt` 文件。

当前 AI 模型固定使用 `deepseek-chat`，接口地址为 `https://api.deepseek.com/chat/completions`。

## 本地构建与打包

只构建应用代码：

```bash
npm run build
```

构建并打包桌面安装包：

```bash
npm run build:pkg
```

打包产物会输出到 `release/` 目录。

当前 `electron-builder.yml` 配置的目标产物如下：

| 平台 | 产物 |
| --- | --- |
| macOS | `dmg`、`zip` |
| Windows | `nsis` 安装包 |
| Linux | `AppImage`、`deb` |

`electron-builder.yml` 中也配置了应用图标路径：

- macOS：`build/icon.icns`
- Windows：`build/icon.ico`
- Linux：`build/icons`

如果本地打包时报图标文件不存在，请先补充这些图标文件，或临时移除对应平台的 `icon` 配置。

## GitHub Actions 发布

仓库包含 `.github/workflows/build.yml`，支持两种发布方式。

### 手动构建

1. 打开 GitHub 仓库的 `Actions` 页面。
2. 选择 `Build & Release`。
3. 点击 `Run workflow`。
4. 构建完成后，在 workflow artifacts 中下载 macOS、Windows 或 Linux 产物。

### tag 发布 Release

```bash
git tag v1.1.1
git push origin v1.1.1
```

推送 `v*` 格式的 tag 后，GitHub Actions 会在 macOS、Windows、Linux 三个平台分别构建，并创建 GitHub Release。

## 数据与隐私

MyPlanner 是本地优先应用，默认不会把任务和复盘数据上传到服务器。

应用数据保存在 Electron 的 `userData` 目录下，数据库文件名为 `myplanner.db`。数据库中包含：

- 任务数据。
- 每日复盘。
- DeepSeek API Key 设置。
- 任务完成反馈。

需要注意：

- DeepSeek API Key 会保存在本机 SQLite 数据库中，请不要把数据库文件上传到公开仓库。
- 使用 AI 摘要或 AI 汇报时，当前选择范围内的任务、复盘、统计和反馈数据会发送给 DeepSeek API。
- 仓库已在 `.gitignore` 中忽略 `*.db`、`.env`、`dist/`、`release/` 和 `node_modules/`。

## 项目结构

```text
.
|-- src/main                 # Electron 主进程、SQLite 初始化、IPC 处理、AI 请求
|   |-- db                   # tasks、reviews、settings、feedback 等数据库访问层
|   |-- ai.ts                # DeepSeek 汇报生成逻辑
|   |-- database.ts          # SQLite 数据库初始化
|   `-- ipc-handlers.ts      # 主进程 IPC API
|-- src/preload              # preload 脚本，向渲染进程暴露安全 API
|-- src/renderer             # Vue 渲染进程
|   |-- index.html
|   `-- src
|       |-- components       # 通用组件和弹窗
|       |-- stores           # Pinia 状态管理
|       |-- styles           # 全局样式与设计 token
|       |-- utils            # 日期、格式化、Markdown 等工具
|       `-- views            # 日历、复盘、报表、AI 汇报页面
|-- .github/workflows        # GitHub Actions 构建与发布流程
|-- electron-builder.yml     # 桌面端打包配置
|-- package.json             # 依赖和 npm scripts
|-- vite.config.ts           # Vite + Electron 构建配置
`-- README.md
```

## 开发脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动 Vite + Electron 开发环境 |
| `npm run build` | 执行 `vue-tsc` 类型检查并构建生产代码 |
| `npm run build:pkg` | 构建生产代码并调用 `electron-builder` 打包 |
| `npm run postinstall` | 为 Electron 重新编译 `better-sqlite3` 原生模块 |

## 常见问题

### `better-sqlite3` 安装或启动失败

先确认 Node.js 版本符合要求：

```bash
node -v
```

然后重新安装依赖并重编译原生模块：

```bash
rm -rf node_modules
npm ci
npm run postinstall
```

macOS 可能还需要安装 Xcode Command Line Tools：

```bash
xcode-select --install
```

### AI 汇报提示未配置或请求失败

- 确认已在「设置」中保存 DeepSeek API Key。
- 确认 API Key 有效，并且账户额度可用。
- 确认当前网络可以访问 `https://api.deepseek.com`。
- 如果「测试连接」失败，可以先在 DeepSeek 控制台确认 Key 是否仍然可用。

### 本地打包提示缺少图标

`electron-builder.yml` 默认引用了 `build/icon.icns`、`build/icon.ico` 和 `build/icons`。如果你还没有准备图标，可以先补齐这些文件，或临时删除对应平台的 `icon` 配置再打包。

### macOS 提示应用来自身份不明开发者

本地或 GitHub Actions 构建出的应用默认没有 Apple 开发者签名和公证。自己测试时可以右键应用选择「打开」。如果要公开分发给更多用户，建议补充签名和 notarize 流程。

### Vite 提示 chunk 体积超过 500 kB

这是构建警告，不影响运行。后续可以通过动态导入或手动拆分 chunk 优化打包体积。

## 许可证

当前仓库还未声明开源许可证。如果准备开放给他人使用或协作开发，建议补充 `LICENSE` 文件。
