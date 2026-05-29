<template>
  <n-modal v-model:show="showModal">
    <n-card title="设置" style="width: 420px" closable @close="showModal = false">
      <n-form label-placement="left" label-width="100">
        <n-form-item label="DeepSeek API Key">
          <n-input
            v-model:value="apiKey"
            type="password"
            :placeholder="hasKey ? '●●●●●●●● (已保存)' : '输入 API Key'"
            show-password-on="click"
          />
        </n-form-item>
        <n-form-item label="汇报人名称">
          <n-input
            v-model:value="reporterName"
            :placeholder="reporterName || '输入你的名字'"
          />
        </n-form-item>
      </n-form>
      <p style="color:#888;font-size:12px;margin-top:4px">
        状态：{{ statusText }}
      </p>
      <template #footer>
        <n-space justify="end">
          <n-button @click="handleTest" :loading="testing" size="small">测试连接</n-button>
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSave" :loading="saving">保存</n-button>
        </n-space>
      </template>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { NModal, NCard, NForm, NFormItem, NInput, NSpace, NButton } from 'naive-ui'
import { api } from '../api'

const emit = defineEmits<{ close: [] }>()
const showModal = ref(true)

watch(showModal, (val) => {
  if (!val) emit('close')
})
const apiKey = ref('')
const reporterName = ref('')
const hasKey = ref(false)
const saving = ref(false)
const testing = ref(false)
const statusText = ref('加载中...')

onMounted(async () => {
  try {
    hasKey.value = await api.settings.hasApiKey()
    statusText.value = hasKey.value ? '已配置' : '未配置'
    reporterName.value = (await api.settings.get('reporter_name')) || ''
  } catch {
    statusText.value = '加载失败'
  }
})

async function handleSave() {
  if (!apiKey.value.trim() && !reporterName.value.trim()) return
  saving.value = true
  try {
    if (apiKey.value.trim()) {
      await api.settings.set('deepseek_api_key', apiKey.value.trim())
      hasKey.value = true
      statusText.value = '已配置'
    }
    if (reporterName.value.trim()) {
      await api.settings.set('reporter_name', reporterName.value.trim())
    }
    statusText.value = hasKey.value ? '已配置' : '名称已保存'
  } catch {
    statusText.value = '保存失败'
  } finally {
    saving.value = false
  }
}

async function handleTest() {
  testing.value = true
  statusText.value = '测试中...'
  try {
    await api.ai.generateReport({
      granularity: 'daily',
      dateRange: { start: '', end: '' },
      tasks: '测试任务',
      reviewContent: '',
      stats: ''
    })
    statusText.value = '连接成功'
  } catch {
    statusText.value = '连接失败'
  } finally {
    testing.value = false
  }
}
</script>
