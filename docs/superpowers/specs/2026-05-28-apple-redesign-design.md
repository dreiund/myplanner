# Apple Design Language Redesign — MyPlanner

## Overview

Redesign MyPlanner's UI from Naive UI dark theme to an Apple-inspired light design language based on DESIGN.md. Strategy: keep Naive UI components with deep theme customization + a CSS token layer for what Naive UI can't reach.

**Key decisions:**
- Layout: slim 72px icon sidebar + Apple-token content area
- Theme: light only (dark mode not in scope)
- Naive UI: retained, customized via `themeOverrides`
- CSS tokens: `--app-*` variables map all DESIGN.md values

## File Changes

```
New:
  src/renderer/src/styles/tokens.css      — CSS custom properties from DESIGN.md
  src/renderer/src/styles/global.css      — body baseline, typography reset

Modified:
  src/main.ts                             — import tokens.css
  src/renderer/src/components/AppLayout.vue     — light theme, custom sidebar
  src/renderer/src/components/TaskItem.vue      — card-style redesign
  src/renderer/src/components/TaskFormDialog.vue — theme adaptation
  src/renderer/src/components/StatsCards.vue     — Apple stat cards
  src/renderer/src/components/CalendarGrid.vue  — color/radius adaptation
  src/renderer/src/components/DateCell.vue      — color/radius adaptation
  src/renderer/src/components/SettingsModal.vue — theme adaptation
  src/renderer/src/views/CalendarView.vue       — layout restructure
  src/renderer/src/views/ReviewView.vue         — card-based daily review
  src/renderer/src/views/ReportView.vue         — theme adaptation, ECharts light bg
  src/renderer/src/views/AIReportView.vue       — theme adaptation
  src/renderer/src/utils/colors.ts              — color map update

Unchanged:
  src/renderer/src/components/ReportChart.vue   — ECharts wrapper, no DOM changes
  src/main/*                                   — backend, no UI
  src/preload/*                                — IPC bridge, no UI
```

## Design Tokens (tokens.css)

### Colors
```css
--app-blue: #0066cc;        /* primary action */
--app-blue-focus: #0071e3;  /* focus ring */
--app-blue-on-dark: #2997ff;
--app-ink: #1d1d1f;         /* all text on light */
--app-canvas: #ffffff;
--app-parchment: #f5f5f7;   /* page background */
--app-surface-pearl: #fafafc;
--app-hairline: #e0e0e0;    /* card borders */
--app-divider-soft: #f0f0f0;
--app-muted: #7a7a7a;       /* secondary text */
--app-muted-80: #333333;
```

### Typography
```css
--app-font-display: "SF Pro Display", system-ui, -apple-system, sans-serif;
--app-font-text: "SF Pro Text", system-ui, -apple-system, sans-serif;
--app-fs-hero: 40px;        /* page titles, weight 600, tracking -0.02em */
--app-fs-lead: 28px;        /* subtitles, weight 400 */
--app-fs-tagline: 21px;     /* section heads, weight 600 */
--app-fs-body: 17px;        /* body copy, weight 400, line-height 1.47 */
--app-fs-caption: 14px;     /* secondary, weight 400 */
--app-fs-fine: 12px;        /* fine print */
```

### Spacing
```css
--app-space-section: 80px;  --app-space-xl: 32px;  --app-space-lg: 24px;
--app-space-md: 17px;       --app-space-sm: 12px;   --app-space-xs: 8px;
```

### Radius
```css
--app-radius-pill: 9999px;  /* CTAs, inputs, chips */
--app-radius-lg: 18px;      /* cards */
--app-radius-md: 11px;      /* pearl buttons */
--app-radius-sm: 8px;       /* utility buttons */
--app-radius-xs: 5px;       /* subtle */
```

### Shadow
```css
--app-shadow-product: 3px 5px 30px rgba(0, 0, 0, 0.22);  /* modals only */
```

## Naive UI Theme Override

In `AppLayout.vue`, `NConfigProvider` gets a custom theme object:

| Category | Key | Value |
|----------|-----|-------|
| common | primaryColor | #0066cc |
| common | primaryColorHover | #0071e3 |
| common | borderRadius | 18px |
| common | fontFamily | SF Pro Text... |
| common | fontSize | 17px |
| common | textColorBase | #1d1d1f |
| common | textColor2 | #7a7a7a |
| common | bodyColor | #f5f5f7 |
| common | dividerColor | #f0f0f0 |
| Button | borderRadiusMedium | 9999px |
| Button | paddingMedium | 11px 22px |
| Card | borderRadius | 18px |
| Card | paddingMedium | 24px |
| Tag | borderRadius | 9999px |
| Input | borderRadius | 9999px |
| Input | heightMedium | 44px |
| Layout | headerColor | #fafafc |

## Layout: AppLayout.vue

Replace `n-layout-sider` + `n-menu` with custom slim sidebar:

- Width: 72px, background: `#fafafc`, border-right: 1px solid `#e0e0e0`
- Logo: "MP" text, 10px/700, letter-spacing -0.02em
- Nav icons: 44×44px, radius 11px
  - Active: background `#e8e8ed`, full opacity
  - Inactive: opacity 0.4, no background
- Content area: flex:1, padding 40px 48px, background `#f5f5f7`
- Remove footer entirely

## Component Changes

### CalendarView
- Calendar grid: white cells on `#f5f5f7` background, 5px radius
- Month header: 21px tagline weight 600
- Nav buttons: pearl capsule style (`#fafafc` bg, 8px radius)
- Today button: ghost pill (outlined Action Blue)
- Task panel: white card container, 18px radius, 1px hairline border
- New task button: primary pill

### TaskItem
- Card-style: white background rows with hairline separators
- Checkbox: 22px circle, 1.5px border. Done state: Action Blue fill + white check
- Priority tag: pill shape, `#f0f0f0` background, 11px font
- Title: 15px/500. Done: line-through + `#999`
- Time meta: 12px `#999` below title

### StatsCards
- White cards, 18px radius, 1px hairline border
- Number: 24px/600
- Label: 12px `#7a7a7a`

### ReviewView
- Date nav: pearl buttons (◀/▶) + 17px date text
- Review textarea: white card, 11px radius, 1px hairline border
- Save button: primary pill
- Collapsed state: dashed border → simple text link in Action Blue

### ReportView
- Segmented control: iOS-style pill group (`#f0f0f0` track, white active segment with subtle shadow)
- Cards: 18px radius, 1px hairline border
- ECharts: backgroundColor `#ffffff`, textStyle `#1d1d1f`, legend `#7a7a7a`
- AI button: dark utility style (`#1d1d1f` bg, 8px radius)

### AIReportView
- Same segmented control + primary pill generate button
- Result card: white 18px radius, typography at 15px/1.8 line-height

### TaskFormDialog / SettingsModal
- Modal card: white 18px radius, product shadow
- Title: 17px/600, no icon/emoji
- Inputs: pill shape, 1px hairline border, 15px font
- Primary action: pill button (`#0066cc`, 9999px)
- Cancel: pearl capsule (`#fafafc`, 11px radius)
- Test button: dark utility (`#1d1d1f`, 8px radius)

## ECharts Adaptation
- `backgroundColor`: `#1e1e1e` → `#ffffff`
- `textStyle.color`: `#aaa` → `#7a7a7a`
- `legend.textStyle.color`: `#aaa` → `#7a7a7a`
- Bar color: `#2080f0` → `#0066cc`
- Export background: `#1e1e1e` → `#ffffff`

## What Stays the Same
- All IPC handlers and main process code
- Database schema and queries
- Pinia store logic
- Vue Router (already not used, views switch via v-if)
- ECharts wrapper component structure
- AI integration (DeepSeek API)

## Out of Scope
- Dark mode
- Responsive/mobile (desktop-only Electron app)
- New features
- Backend changes
