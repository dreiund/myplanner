# MyPlanner

MyPlanner 是一个本地优先的个人效率管理桌面应用，用来管理每日任务、记录复盘、查看统计报表，并通过 DeepSeek 生成日报、周报、月报、季报和年报。

项目地址：[https://github.com/dreiund/myplanner](https://github.com/dreiund/myplanner)

## 功能亮点

- 日历式任务管理：按日期创建任务，支持优先级、分类、预估耗时、截止日期和备注。
- 任务完成反馈：完成任务时记录遇到的问题和后续优化建议，后续可用于 AI 汇报。
- 每日复盘：按日期保存复盘内容，结合当天任务自动展示完成情况。
- 统计报表：支持日报、周报、月报，展示完成率、预估/实际耗时、分类耗时、趋势图和占比图。
- AI 汇报：接入 DeepSeek API 后，可生成 Markdown 格式的日报、周报、月报、季报和年报。
- 本地数据存储：任务、复盘、设置和反馈数据保存在本机 SQLite 数据库中。

## 技术栈

| 模块 | 技术 |
| --- | --- |
| 桌面应用 | Electron |
| 前端 | Vue 3、Vite、TypeScript |
| 状态管理 | Pinia |
| UI | Naive UI、Ionicons |
| 图表 | ECharts、vue-echarts |
| 数据库 | better-sqlite3 |
| 打包 | electron-builder |

## 环境要求

- Node.js 20.x 或更新版本，推荐使用 Node.js 20。
- npm。
- Git。
- DeepSeek API Key，仅 AI 汇报功能需要。

## 快速开始

```bash
git clone https://github.com/dreiund/myplanner.git
cd myplanner
npm ci
npm run dev
```

运行成功后会打开 MyPlanner 桌面窗口。首次安装依赖时会执行 `electron-rebuild`，用于编译 `better-sqlite3` 的 Electron 原生模块。

## 使用说明

### 1. 创建和管理任务

进入左侧「日历」页面：

- 点击日期查看当天任务。
- 点击「新建任务」或双击日期创建任务。
- 任务可填写标题、日期、优先级、分类、预估耗时、截止日期和备注。
- 点击任务左侧状态按钮可标记完成；完成时会弹出反馈窗口，用来记录问题和优化建议。
- 已完成任务再次点击可回退为未完成。

### 2. 记录每日复盘

进入「复盘」页面：

- 使用「昨天」「明天」切换日期。
- 查看当天任务、完成率、预估耗时和实际耗时。
- 在「今日复盘」中记录当天总结，并点击「保存复盘」。

### 3. 查看统计报表

进入「报表」页面：

- 支持日报、周报、月报三种粒度。
- 日报展示当天任务清单、完成率和分类耗时。
- 周报展示一周趋势、分类占比和预估/实际耗时。
- 月报展示月度完成情况、趋势和与上月的环比对比。
- 点击「导出图片」可将图表保存为 PNG。
- 点击「AI 摘要」可根据当前报表数据生成摘要。

### 4. 生成 AI 汇报

进入「AI 汇报」页面前，先点击左侧底部「设置」：

1. 填入 DeepSeek API Key。
2. 点击「测试连接」确认可用。
3. 点击「保存」。

配置完成后，在「AI 汇报」页面选择日报、周报、月报、季报或年报，再点击「生成汇报」。生成结果为 Markdown 内容，可点击「导出文本」保存为 `.md` 或 `.txt` 文件。

## 本地构建

只构建应用代码：

```bash
npm run build
```

构建并打包桌面安装包：

```bash
npm run build:pkg
```

打包产物会输出到 `release/` 目录。当前 `electron-builder.yml` 中配置了应用图标路径：

- macOS：`build/icon.icns`
- Windows：`build/icon.ico`
- Linux：`build/icons`

如果本地打包时报图标文件不存在，请先补充这些图标文件，或临时移除 `electron-builder.yml` 中对应平台的 `icon` 配置。

## GitHub Actions 发布

仓库已包含 `.github/workflows/build.yml`，支持手动构建和 tag 发布。

手动触发：

1. 打开 GitHub 仓库的 `Actions` 页面。
2. 选择 `Build & Release`。
3. 点击 `Run workflow`。

发布版本：

```bash
git tag v1.0.0
git push origin v1.0.0
```

推送 `v*` 格式的 tag 后，GitHub Actions 会分别构建 macOS、Windows 和 Linux 产物，并创建 GitHub Release。

## 数据存储

应用数据保存在 Electron 的 `userData` 目录下，数据库文件名为 `myplanner.db`。数据库中包含：

- 任务数据。
- 子任务数据。
- 每日复盘。
- DeepSeek API Key 设置。
- 任务完成反馈。

数据库文件只保存在本机，且仓库的 `.gitignore` 已忽略 `*.db`。不要把本地数据库或 API Key 上传到公开仓库。

## 项目结构

```text
.
|-- src/main               # Electron 主进程、数据库和 IPC 处理
|-- src/preload            # preload 脚本，向渲染进程暴露安全 API
|-- src/renderer           # Vue 前端应用
|   `-- src
|       |-- components     # 通用组件
|       |-- stores         # Pinia 状态管理
|       |-- utils          # 日期、格式化、Markdown 等工具
|       `-- views          # 日历、复盘、报表、AI 汇报页面
|-- electron-builder.yml   # 桌面端打包配置
|-- package.json           # 依赖和脚本
`-- .github/workflows      # GitHub Actions 构建发布流程
```

## 常见问题

### `better-sqlite3` 安装或启动失败

优先确认 Node.js 版本为 20.x 或更新版本，然后重新安装依赖：

```bash
rm -rf node_modules
npm ci
npm run postinstall
```

macOS 可能需要安装 Xcode Command Line Tools：

```bash
xcode-select --install
```

### AI 汇报提示未配置或请求失败

- 确认已在「设置」中保存 DeepSeek API Key。
- 确认 API Key 有效且账户额度可用。
- 确认当前网络可以访问 `https://api.deepseek.com`。

### macOS 提示应用来自身份不明开发者

本地或 GitHub Actions 构建出的应用默认没有 Apple 开发者签名和公证。自己测试时可以右键应用选择「打开」。如果要公开分发，建议补充签名和 notarize 流程。

### Vite 提示 chunk 体积超过 500 kB

这是构建警告，不影响运行。后续可以通过动态导入或手动拆分 chunk 优化打包体积。

## 开发脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发环境 |
| `npm run build` | 类型检查并构建生产代码 |
| `npm run build:pkg` | 构建并用 electron-builder 打包 |
| `npm run postinstall` | 重新编译 `better-sqlite3` 的 Electron 原生模块 |

## 许可证

当前仓库还未声明开源许可证。如果准备开放给他人使用或协作开发，建议补充 `LICENSE` 文件。
