
export interface Tab {
  id: string;
  title: string;
  url: string;
  favIconUrl?: string;
}

export interface Session {
  id: string;
  name: string;
  tabs: Tab[];
  createdAt: number;
  tags: string[];
  x?: number; // Canvas positioning
  y?: number;
}

export type ViewType = 'workspace' | 'import-export';
