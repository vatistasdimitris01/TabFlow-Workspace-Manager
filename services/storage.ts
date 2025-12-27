import { Session } from '../types.ts';

const STORAGE_KEY = 'tabflow_sessions';

export const storage = {
  getSessions: (): Session[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveSessions: (sessions: Session[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  },
  exportData: () => {
    const data = localStorage.getItem(STORAGE_KEY);
    const blob = new Blob([data || '[]'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tabflow_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  },
  importData: (json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
};