<template>
  <n-modal :show="true" @update:show="() => $emit('close')">
    <n-card :title="isEdit ? '编辑任务' : '新建任务'" style="width: 500px" closable @close="$emit('close')">
      <n-form :model="form" label-placement="left" label-width="80">
        <n-form-item label="标题" required>
          <n-input v-model:value="form.title" placeholder="输入任务标题" />
        </n-form-item>
        <n-form-item label="开始时间">
          <n-date-picker v-model:formatted-value="form.planned_date" type="datetime" format="yyyy-MM-dd HH:mm" value-format="yyyy-MM-dd HH:mm" />
        </n-form-item>
        <n-form-item label="优先级">
          <n-select v-model:value="form.priority" :options="priorityOptions" />
        </n-form-item>
        <n-form-item label="分类">
          <n-select v-model:value="form.category" :options="categoryOptions" />
        </n-form-item>
        <n-form-item label="预估耗时">
          <n-input-number v-model:value="form.estimated_min" placeholder="分钟" :min="0" />
        </n-form-item>
        <n-form-item label="截止时间">
          <n-date-picker v-model:formatted-value="form.due_date" type="datetime" format="yyyy-MM-dd HH:mm" value-format="yyyy-MM-dd HH:mm" />
        </n-form-item>
        <n-form-item label="备注">
          <n-input v-model:value="form.note" type="textarea" placeholder="备注" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="$emit('close')">取消</n-button>
          <n-button type="primary" @click="handleSave">保存</n-button>
        </n-space>
      </template>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { NModal, NCard, NForm, NFormItem, NInput, NInputNumber, NDatePicker, NSelect, NSpace, NButton } from 'naive-ui'
import type { Task } from '../types'
import { extractDate } from '../utils/date'

const props = defineProps<{ date: string; task?: Task | null }>()
const emit = defineEmits<{ close: []; save: [data: Record<string, unknown>] }>()

const isEdit = computed(() => !!props.task)

/** Ensure datetime string has time part; old date-only format → append 00:00 */
function ensureTime(val: string | null): string | null {
  if (!val) return val
  return val.length <= 10 ? `${extractDate(val)} 00:00` : val
}

const form = reactive({
  title: props.task?.title || '',
  planned_date: ensureTime(props.task?.planned_date || props.date),
  priority: props.task?.priority || 'medium',
  category: props.task?.category || 'work',
  estimated_min: props.task?.estimated_min ?? null as number | null,
  due_date: ensureTime(props.task?.due_date ?? null),
  note: props.task?.note || ''
})

const priorityOptions = [
  { label: '紧急', value: 'urgent' },
  { label: '高', value: 'high' },
  { label: '中', value: 'medium' },
  { label: '低', value: 'low' },
]
const categoryOptions = [
  { label: '工作', value: 'work' },
  { label: '学习', value: 'study' },
  { label: '生活', value: 'life' },
]

function handleSave() {
  if (!form.title.trim()) return
  const data: Record<string, unknown> = { ...form }
  if (isEdit.value) data.id = props.task!.id
  emit('save', data)
}
</script>
