export interface Task {
  id: number
  title: string
  status: 'pending' | 'in_progress' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'work' | 'study' | 'life'
  planned_date: string
  due_date: string | null
  note: string | null
  estimated_min: number | null
  actual_min: number | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface Subtask {
  id: number
  task_id: number
  title: string
  status: string
  sort_order: number
}

export interface Review {
  id: number
  date: string
  content: string | null
  created_at: string
  updated_at: string
}

export interface DailyStats {
  total: number
  done: number
  rate: number
  totalEstimated: number
  totalActual: number
  byCategory: Record<string, number>
}

export interface MonthlyStats {
  total: number
  done: number
  rate: number
  totalEstimatedMin: number
  totalActualMin: number
  byCategory: Record<string, number>
  days: { date: string; total: number; done: number; rate: number }[]
  prevTotal: number
  prevDone: number
  prevRate: number
}

export interface WeeklyStats {
  days: { date: string; total: number; done: number; rate: number; totalEstimated: number; totalActual: number }[]
  totalEstimated: number
  totalActual: number
  byCategory: Record<string, number>
}

export interface TaskFeedback {
  id: number
  task_id: number
  problems: string | null
  optimizations: string | null
  created_at: string
}

export interface FeedbackWithTask extends TaskFeedback {
  task_title: string
  planned_date: string
}

export interface GenerateReportInput {
  granularity: string
  dateRange: { start: string; end: string }
  tasks: string
  reviewContent: string
  stats: string
  feedback?: string
}

export interface ElectronAPI {
  tasks: {
    getByDate: (date: string) => Promise<Task[]>
    getByMonth: (year: number, month: number) => Promise<Task[]>
    getByDateRange: (startDate: string, endDate: string) => Promise<Task[]>
    create: (data: Partial<Task>) => Promise<Task>
    update: (id: number, data: Partial<Task>) => Promise<Task>
    remove: (id: number) => Promise<void>
    toggleComplete: (id: number, actualMin?: number) => Promise<Task>
  }
  subtasks: {
    getByTask: (taskId: number) => Promise<Subtask[]>
    create: (data: Partial<Subtask>) => Promise<Subtask>
    update: (id: number, data: Partial<Subtask>) => Promise<Subtask>
    remove: (id: number) => Promise<void>
  }
  reviews: {
    getByDate: (date: string) => Promise<Review | undefined>
    getByDateRange: (startDate: string, endDate: string) => Promise<Review[]>
    save: (date: string, content: string) => Promise<Review>
  }
  stats: {
    getDaily: (date: string) => Promise<DailyStats>
    getWeekly: (startDate: string, endDate: string) => Promise<WeeklyStats>
    getMonthly: (year: number, month: number) => Promise<MonthlyStats>
  }
  settings: {
    get: (key: string) => Promise<string | null>
    hasApiKey: () => Promise<boolean>
    set: (key: string, value: string) => Promise<void>
  }
  ai: {
    generateReport: (input: GenerateReportInput) => Promise<{ content: string }>
  }
  app: {
    exportImage: (dataUrl: string) => Promise<{ success: boolean; filePath?: string }>
    exportText: (content: string, defaultName: string) => Promise<{ success: boolean; filePath?: string }>
  }
  feedback: {
    save: (taskId: number, problems: string, optimizations: string) => Promise<TaskFeedback>
    getByTask: (taskId: number) => Promise<TaskFeedback | undefined>
    getByDate: (date: string) => Promise<TaskFeedback[]>
    getByDateRange: (startDate: string, endDate: string) => Promise<FeedbackWithTask[]>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
