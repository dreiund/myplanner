import { ipcMain, dialog, BrowserWindow } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import * as taskDb from './db/tasks'
import * as subtaskDb from './db/subtasks'
import * as reviewDb from './db/reviews'
import * as settingsDb from './db/settings'
import * as feedbackDb from './db/feedback'
import * as ai from './ai'

export function registerIpcHandlers(): void {
  // Tasks
  ipcMain.handle('tasks:getByDate', (_e, date: string) => taskDb.getTasksByDate(date))
  ipcMain.handle('tasks:getByMonth', (_e, year: number, month: number) => taskDb.getTasksByMonth(year, month))
  ipcMain.handle('tasks:getByDateRange', (_e, startDate: string, endDate: string) =>
    taskDb.getTasksByDateRange(startDate, endDate))
  ipcMain.handle('tasks:create', (_e, data) => taskDb.createTask(data))
  ipcMain.handle('tasks:update', (_e, id: number, data) => taskDb.updateTask(id, data))
  ipcMain.handle('tasks:remove', (_e, id: number) => taskDb.removeTask(id))
  ipcMain.handle('tasks:toggleComplete', (_e, id: number) => taskDb.toggleTaskComplete(id))

  // Subtasks
  ipcMain.handle('subtasks:getByTask', (_e, taskId: number) => subtaskDb.getSubtasksByTask(taskId))
  ipcMain.handle('subtasks:create', (_e, data) => subtaskDb.createSubtask(data))
  ipcMain.handle('subtasks:update', (_e, id: number, data) => subtaskDb.updateSubtask(id, data))
  ipcMain.handle('subtasks:remove', (_e, id: number) => subtaskDb.removeSubtask(id))

  // Reviews
  ipcMain.handle('reviews:getByDate', (_e, date: string) => reviewDb.getReviewByDate(date))
  ipcMain.handle('reviews:getByDateRange', (_e, startDate: string, endDate: string) =>
    reviewDb.getReviewsByDateRange(startDate, endDate))
  ipcMain.handle('reviews:save', (_e, date: string, content: string) => reviewDb.saveReview(date, content))

  // Feedback
  ipcMain.handle('feedback:save', (_e, taskId: number, problems: string, optimizations: string) =>
    feedbackDb.saveFeedback(taskId, problems, optimizations))
  ipcMain.handle('feedback:getByTask', (_e, taskId: number) => feedbackDb.getFeedbackByTask(taskId))
  ipcMain.handle('feedback:getByDate', (_e, date: string) => feedbackDb.getFeedbackByDate(date))
  ipcMain.handle('feedback:getByDateRange', (_e, startDate: string, endDate: string) =>
    feedbackDb.getFeedbackByDateRange(startDate, endDate))

  // Settings
  ipcMain.handle('settings:hasApiKey', () => settingsDb.hasApiKey())
  ipcMain.handle('settings:set', (_e, key: string, value: string) => settingsDb.setSetting(key, value))
  ipcMain.handle('settings:get', (_e, key: string) => settingsDb.getSetting(key))

  // AI
  ipcMain.handle('ai:generateReport', async (_e, input: Parameters<typeof ai.generateReport>[0]) => {
    return { content: await ai.generateReport(input) }
  })

  // Stats
  ipcMain.handle('stats:getDaily', (_e, date: string) => {
    const tasks = taskDb.getTasksByDate(date)
    const done = tasks.filter(t => t.status === 'done')
    return {
      total: tasks.length,
      done: done.length,
      rate: tasks.length > 0 ? Math.round((done.length / tasks.length) * 100) : 0,
      totalEstimated: tasks.reduce((s, t) => s + (t.estimated_min || 0), 0),
      totalActual: tasks.reduce((s, t) => s + (t.actual_min || 0), 0),
      byCategory: computeByCategory(tasks)
    }
  })

  ipcMain.handle('stats:getWeekly', (_e, startDate: string, endDate: string) => {
    const tasks = taskDb.getTasksByDateRange(startDate, endDate)
    const byDate = new Map<string, taskDb.TaskRow[]>()
    for (const t of tasks) {
      const dateKey = t.planned_date.substring(0, 10)
      const arr = byDate.get(dateKey) || []
      arr.push(t)
      byDate.set(dateKey, arr)
    }
    const days: Record<string, unknown>[] = []
    const allTasks: taskDb.TaskRow[] = []
    byDate.forEach((dayTasks, date) => {
      allTasks.push(...dayTasks)
      const done = dayTasks.filter(t => t.status === 'done')
      days.push({
        date,
        total: dayTasks.length,
        done: done.length,
        rate: Math.round((done.length / dayTasks.length) * 100),
        totalEstimated: dayTasks.reduce((s, t) => s + (t.estimated_min || 0), 0),
        totalActual: dayTasks.reduce((s, t) => s + (t.actual_min || 0), 0)
      })
    })
    days.sort((a, b) => String(a.date).localeCompare(String(b.date)))
    const totalEstimated = allTasks.reduce((s, t) => s + (t.estimated_min || 0), 0)
    const totalActual = allTasks.reduce((s, t) => s + (t.actual_min || 0), 0)
    return { days, totalEstimated, totalActual, byCategory: computeByCategory(allTasks) }
  })

  // Export
  ipcMain.handle('app:exportImage', async (_e, dataUrl: string) => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return { success: false }
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: '导出报表图片',
      defaultPath: `报表_${new Date().toISOString().slice(0, 10)}.png`,
      filters: [{ name: 'PNG 图片', extensions: ['png'] }]
    })
    if (canceled || !filePath) return { success: false }
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, '')
    fs.writeFileSync(filePath, Buffer.from(base64, 'base64'))
    return { success: true, filePath }
  })

  ipcMain.handle('app:exportText', async (_e, content: string, defaultName: string) => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return { success: false }
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: '导出文本',
      defaultPath: defaultName,
      filters: [{ name: '文本文件', extensions: ['txt', 'md'] }]
    })
    if (canceled || !filePath) return { success: false }
    fs.writeFileSync(filePath, content, 'utf-8')
    return { success: true, filePath }
  })

  ipcMain.handle('stats:getMonthly', (_e, year: number, month: number) => {
    const tasks = taskDb.getTasksByMonth(year, month)
    const done = tasks.filter(t => t.status === 'done')

    // Daily breakdown for trend chart
    const byDate = new Map<string, taskDb.TaskRow[]>()
    for (const t of tasks) {
      const dateKey = t.planned_date.substring(0, 10)
      const arr = byDate.get(dateKey) || []
      arr.push(t)
      byDate.set(dateKey, arr)
    }
    const days: Record<string, unknown>[] = []
    byDate.forEach((dayTasks, date) => {
      const dayDone = dayTasks.filter(t => t.status === 'done')
      days.push({
        date,
        total: dayTasks.length,
        done: dayDone.length,
        rate: Math.round((dayDone.length / dayTasks.length) * 100)
      })
    })
    days.sort((a, b) => String(a.date).localeCompare(String(b.date)))

    // Previous month for comparison
    let prevTotal = 0, prevDone = 0
    if (month === 1) {
      const prevTasks = taskDb.getTasksByMonth(year - 1, 12)
      prevTotal = prevTasks.length
      prevDone = prevTasks.filter(t => t.status === 'done').length
    } else {
      const prevTasks = taskDb.getTasksByMonth(year, month - 1)
      prevTotal = prevTasks.length
      prevDone = prevTasks.filter(t => t.status === 'done').length
    }

    return {
      total: tasks.length,
      done: done.length,
      rate: tasks.length > 0 ? Math.round((done.length / tasks.length) * 100) : 0,
      totalEstimatedMin: tasks.reduce((s, t) => s + (t.estimated_min || 0), 0),
      totalActualMin: tasks.reduce((s, t) => s + (t.actual_min || 0), 0),
      byCategory: computeByCategory(tasks),
      days,
      prevTotal,
      prevDone,
      prevRate: prevTotal > 0 ? Math.round((prevDone / prevTotal) * 100) : 0
    }
  })
}

function computeByCategory(tasks: taskDb.TaskRow[]): Record<string, number> {
  const result: Record<string, number> = { work: 0, study: 0, life: 0 }
  for (const t of tasks) {
    if (t.status === 'done') {
      result[t.category] = (result[t.category] || 0) + (t.actual_min || 0)
    }
  }
  return result
}
