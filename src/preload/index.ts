import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  tasks: {
    getByDate: (date: string) => ipcRenderer.invoke('tasks:getByDate', date),
    getByMonth: (year: number, month: number) => ipcRenderer.invoke('tasks:getByMonth', year, month),
    create: (task: Record<string, unknown>) => ipcRenderer.invoke('tasks:create', task),
    update: (id: number, data: Record<string, unknown>) => ipcRenderer.invoke('tasks:update', id, data),
    remove: (id: number) => ipcRenderer.invoke('tasks:remove', id),
    toggleComplete: (id: number) => ipcRenderer.invoke('tasks:toggleComplete', id)
  },
  subtasks: {
    getByTask: (taskId: number) => ipcRenderer.invoke('subtasks:getByTask', taskId),
    create: (subtask: Record<string, unknown>) => ipcRenderer.invoke('subtasks:create', subtask),
    update: (id: number, data: Record<string, unknown>) => ipcRenderer.invoke('subtasks:update', id, data),
    remove: (id: number) => ipcRenderer.invoke('subtasks:remove', id)
  },
  reviews: {
    getByDate: (date: string) => ipcRenderer.invoke('reviews:getByDate', date),
    save: (date: string, content: string) => ipcRenderer.invoke('reviews:save', date, content)
  },
  stats: {
    getDaily: (date: string) => ipcRenderer.invoke('stats:getDaily', date),
    getWeekly: (startDate: string, endDate: string) => ipcRenderer.invoke('stats:getWeekly', startDate, endDate),
    getMonthly: (year: number, month: number) => ipcRenderer.invoke('stats:getMonthly', year, month)
  },
  settings: {
    hasApiKey: () => ipcRenderer.invoke('settings:hasApiKey'),
    set: (key: string, value: string) => ipcRenderer.invoke('settings:set', key, value)
  },
  app: {
    exportImage: (dataUrl: string) => ipcRenderer.invoke('app:exportImage', dataUrl),
    exportText: (content: string, defaultName: string) => ipcRenderer.invoke('app:exportText', content, defaultName)
  },
  ai: {
    generateReport: (input: Record<string, unknown>) => ipcRenderer.invoke('ai:generateReport', input)
  },
  feedback: {
    save: (taskId: number, problems: string, optimizations: string) => ipcRenderer.invoke('feedback:save', taskId, problems, optimizations),
    getByTask: (taskId: number) => ipcRenderer.invoke('feedback:getByTask', taskId),
    getByDate: (date: string) => ipcRenderer.invoke('feedback:getByDate', date),
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
