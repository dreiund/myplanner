import type { ElectronAPI } from './types'

export const api = (window as unknown as { electronAPI: ElectronAPI }).electronAPI
