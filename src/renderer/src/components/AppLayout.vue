<template>
  <n-config-provider :locale="zhCN" :theme-overrides="appleTheme">
    <div class="app-shell">
      <nav class="slim-sidebar">
        <div class="sidebar-logo">MP</div>
        <button
          v-for="item in navItems"
          :key="item.key"
          class="sidebar-btn"
          :class="{ active: activeKey === item.key }"
          :title="item.label"
          @click="activeKey = item.key"
        >
          <span class="sidebar-icon">
            <component :is="item.icon" />
          </span>
        </button>
        <button class="sidebar-btn sidebar-bottom" title="设置" @click="showSettings = true">
          <span class="sidebar-icon">
            <SettingsOutline />
          </span>
        </button>
      </nav>
      <main class="app-content">
        <n-message-provider>
          <CalendarView v-if="activeKey === 'calendar'" />
          <ReviewView v-if="activeKey === 'review'" />
          <ReportView v-if="activeKey === 'report'" />
          <AIReportView v-if="activeKey === 'aireport'" />
        </n-message-provider>
      </main>
    </div>
    <SettingsModal v-if="showSettings" @close="showSettings = false" />
  </n-config-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import { zhCN } from 'naive-ui'
import { CalendarOutline, BookOutline, BarChartOutline, SparklesOutline, SettingsOutline } from '@vicons/ionicons5'
import CalendarView from '../views/CalendarView.vue'
import ReviewView from '../views/ReviewView.vue'
import ReportView from '../views/ReportView.vue'
import AIReportView from '../views/AIReportView.vue'
import SettingsModal from './SettingsModal.vue'

const activeKey = ref('calendar')
const showSettings = ref(false)

const navItems = [
  { label: '日历', key: 'calendar', icon: CalendarOutline },
  { label: '复盘', key: 'review', icon: BookOutline },
  { label: '报表', key: 'report', icon: BarChartOutline },
  { label: 'AI 汇报', key: 'aireport', icon: SparklesOutline },
]

const appleTheme = {
  common: {
    primaryColor: '#0066cc',
    primaryColorHover: '#0071e3',
    primaryColorPressed: '#0066cc',
    borderRadius: '18px',
    fontFamily: '"SF Pro Text", system-ui, -apple-system, sans-serif',
    fontSize: '17px',
    textColorBase: '#1d1d1f',
    textColor1: '#1d1d1f',
    textColor2: '#7a7a7a',
    textColor3: '#999999',
    dividerColor: '#f0f0f0',
    borderColor: '#e0e0e0',
    bodyColor: '#f5f5f7',
    cardColor: '#ffffff',
    modalColor: '#ffffff',
    popoverColor: '#ffffff',
    inputColor: '#ffffff',
  },
  Button: {
    borderRadiusMedium: '9999px',
    borderRadiusSmall: '9999px',
    borderRadiusLarge: '9999px',
    paddingMedium: '11px 22px',
    fontSizeMedium: '17px',
    heightMedium: '44px',
  },
  Card: {
    borderRadius: '18px',
    paddingMedium: '24px',
    titleFontSizeMedium: '17px',
    titleFontWeight: '600',
  },
  Tag: {
    borderRadius: '9999px',
  },
  Input: {
    borderRadius: '9999px',
    heightMedium: '44px',
    paddingMedium: '10px 16px',
    fontSizeMedium: '15px',
  },
  Layout: {
    headerColor: '#fafafc',
    siderColor: '#fafafc',
    footerColor: '#f5f5f7',
  },
  Progress: {
    fillColor: '#0066cc',
  },
  Modal: {
    borderRadius: '18px',
  },
}
</script>

<style>
.app-shell {
  display: flex;
  height: 100vh;
  background: var(--app-parchment);
}

.slim-sidebar {
  width: 72px;
  min-width: 72px;
  background: var(--app-surface-pearl);
  border-right: 1px solid var(--app-hairline);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  gap: 16px;
}

.sidebar-logo {
  font-family: var(--app-font-display);
  font-size: 10px;
  font-weight: 700;
  color: var(--app-ink);
  letter-spacing: var(--app-ls-display);
  margin-bottom: 8px;
  user-select: none;
}

.sidebar-btn {
  width: 44px;
  height: 44px;
  border-radius: var(--app-radius-md);
  border: none;
  background: transparent;
  color: var(--app-ink);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.4;
  transition: opacity 0.15s, background 0.15s;
}

.sidebar-icon {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.sidebar-icon :deep(svg) {
  width: 18px;
  height: 18px;
}

.sidebar-btn:hover {
  opacity: 0.7;
  background: var(--app-divider-soft);
}

.sidebar-btn.active {
  opacity: 1;
  background: #e8e8ed;
}

.sidebar-bottom {
  margin-top: auto;
}

.app-content {
  flex: 1;
  overflow-y: auto;
  padding: 40px 48px;
}
</style>
