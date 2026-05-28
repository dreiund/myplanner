import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Task, Subtask } from '../types'
import { api } from '../api'

export const useTaskStore = defineStore('tasks', () => {
  const tasksForDate = ref<Task[]>([])
  const monthTasks = ref<Task[]>([])
  const subtasksMap = ref<Record<number, Subtask[]>>({})

  async function fetchByDate(date: string) {
    tasksForDate.value = await api.tasks.getByDate(date)
  }

  async function fetchByMonth(year: number, month: number) {
    monthTasks.value = await api.tasks.getByMonth(year, month)
  }

  async function createTask(data: Parameters<typeof api.tasks.create>[0]) {
    const task = await api.tasks.create(data)
    tasksForDate.value.push(task)
    return task
  }

  async function updateTask(id: number, data: Parameters<typeof api.tasks.update>[1]) {
    const task = await api.tasks.update(id, data)
    const idx = tasksForDate.value.findIndex(t => t.id === id)
    if (idx >= 0) tasksForDate.value[idx] = task
    return task
  }

  async function toggleComplete(id: number) {
    const task = await api.tasks.toggleComplete(id)
    const idx = tasksForDate.value.findIndex(t => t.id === id)
    if (idx >= 0) tasksForDate.value[idx] = task
    return task
  }

  async function removeTask(id: number) {
    await api.tasks.remove(id)
    tasksForDate.value = tasksForDate.value.filter(t => t.id !== id)
  }

  async function fetchSubtasks(taskId: number) {
    const subs = await api.subtasks.getByTask(taskId)
    subtasksMap.value[taskId] = subs
  }

  async function createSubtask(data: Parameters<typeof api.subtasks.create>[0]) {
    const sub = await api.subtasks.create(data)
    if (!subtasksMap.value[data.task_id]) subtasksMap.value[data.task_id] = []
    subtasksMap.value[data.task_id].push(sub)
    return sub
  }

  async function toggleSubtask(id: number, taskId: number) {
    const sub = subtasksMap.value[taskId]?.find(s => s.id === id)
    if (sub) {
      const newStatus = sub.status === 'done' ? 'pending' : 'done'
      await api.subtasks.update(id, { status: newStatus })
      sub.status = newStatus
    }
  }

  return { tasksForDate, monthTasks, subtasksMap, fetchByDate, fetchByMonth, createTask, updateTask, toggleComplete, removeTask, fetchSubtasks, createSubtask, toggleSubtask }
})
