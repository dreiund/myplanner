<template>
  <n-modal :show="visible" :mask-closable="false" :closable="false" @update:show="() => {}">
    <div class="feedback-dialog">
      <h2 class="dialog-title">任务完成反馈</h2>
      <p class="dialog-task-name">{{ task?.title }}</p>

      <div class="field-group">
        <label class="field-label">完成该任务遇到了什么问题？</label>
        <textarea
          ref="problemsRef"
          v-model="problems"
          class="field-textarea"
          rows="4"
          placeholder="请描述遇到的问题（必填）"
        ></textarea>
        <span class="field-counter">{{ problems.length }}/500</span>
      </div>

      <div class="field-group">
        <label class="field-label">还有什么可以优化的地方？</label>
        <textarea
          v-model="optimizations"
          class="field-textarea"
          rows="4"
          placeholder="请描述可以改进的地方（必填）"
        ></textarea>
        <span class="field-counter">{{ optimizations.length }}/500</span>
      </div>

      <div class="field-group">
        <label class="field-label">实际耗时（分钟）</label>
        <n-input-number
          v-model:value="actualMin"
          :min="0"
          :placeholder="task?.estimated_min ? `预估 ${task.estimated_min}min` : '实际花费时间'"
          class="field-input-number"
        />
      </div>

      <div class="dialog-actions">
        <button class="cancel-btn" @click="$emit('cancel')">取消</button>
        <button class="confirm-btn" :disabled="!canSubmit" @click="handleSubmit">
          确认完成
        </button>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { NModal, NInputNumber } from 'naive-ui'
import type { Task } from '../types'

const props = defineProps<{
  visible: boolean
  task: Task | null
}>()

const emit = defineEmits<{
  submit: [data: { problems: string; optimizations: string; actualMin?: number }]
  cancel: []
}>()

const problems = ref('')
const optimizations = ref('')
const actualMin = ref<number | null>(null)
const problemsRef = ref<HTMLTextAreaElement | null>(null)

const canSubmit = computed(() => problems.value.trim().length > 0 && optimizations.value.trim().length > 0)

function handleSubmit() {
  if (!canSubmit.value) return
  emit('submit', {
    problems: problems.value.trim(),
    optimizations: optimizations.value.trim(),
    actualMin: actualMin.value ?? undefined
  })
}

watch(() => props.visible, async (v) => {
  if (v) {
    problems.value = ''
    optimizations.value = ''
    actualMin.value = null
    await nextTick()
    problemsRef.value?.focus()
  }
})
</script>

<style scoped>
.feedback-dialog {
  background: var(--app-canvas, #ffffff);
  border-radius: var(--app-radius-lg, 18px);
  padding: 32px;
  max-width: 480px;
  width: 90vw;
  margin: 0 auto;
  box-shadow: rgba(0, 0, 0, 0.22) 3px 5px 30px 0;
}

.dialog-title {
  font-family: var(--app-font-display);
  font-size: var(--app-fs-display-md, 34px);
  font-weight: var(--app-fw-semibold, 600);
  color: var(--app-ink, #1d1d1f);
  letter-spacing: var(--app-ls-display, -0.28px);
  margin: 0 0 4px;
}

.dialog-task-name {
  font-size: var(--app-fs-caption, 14px);
  color: var(--app-muted, #7a7a7a);
  margin: 0 0 24px;
}

.field-group {
  margin-bottom: 20px;
}

.field-label {
  display: block;
  font-size: var(--app-fs-caption, 14px);
  font-weight: var(--app-fw-semibold, 600);
  color: var(--app-ink, #1d1d1f);
  margin-bottom: 8px;
}

.field-textarea {
  width: 100%;
  border: 1px solid var(--app-hairline, #e0e0e0);
  border-radius: var(--app-radius-md, 11px);
  padding: 12px;
  font-size: var(--app-fs-body, 17px);
  font-family: var(--app-font-text);
  color: var(--app-ink, #1d1d1f);
  background: var(--app-canvas, #ffffff);
  resize: vertical;
  box-sizing: border-box;
  line-height: 1.47;
  max-width: 100%;
}

.field-textarea::placeholder {
  color: var(--app-muted, #7a7a7a);
}

.field-textarea:focus {
  outline: 2px solid var(--app-blue, #0066cc);
  outline-offset: -2px;
}

.field-counter {
  display: block;
  text-align: right;
  font-size: var(--app-fs-fine, 12px);
  color: var(--app-muted, #7a7a7a);
  margin-top: 4px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--app-space-sm, 12px);
  margin-top: 24px;
}

.cancel-btn {
  background: var(--app-surface-pearl, #fafafc);
  border: 1px solid var(--app-divider-soft, #f0f0f0);
  border-radius: var(--app-radius-pill, 9999px);
  padding: 11px 22px;
  font-size: var(--app-fs-body, 17px);
  color: var(--app-muted-80, #333333);
  cursor: pointer;
  transition: transform 0.1s;
}

.cancel-btn:active {
  transform: scale(0.95);
}

.confirm-btn {
  background: var(--app-blue, #0066cc);
  color: #fff;
  border: none;
  border-radius: var(--app-radius-pill, 9999px);
  padding: 11px 22px;
  font-size: var(--app-fs-body, 17px);
  cursor: pointer;
  transition: transform 0.1s, opacity 0.15s;
}

.confirm-btn:active {
  transform: scale(0.95);
}

.confirm-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.field-input-number {
  width: 100%;
}
</style>
