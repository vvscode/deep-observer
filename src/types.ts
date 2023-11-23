export type HistoryItem = {
  type: 'get' | 'set' | 'call';
  key: string | symbol;
  value?: unknown;
  args?: unknown[];
};

export interface History {
  put(item: HistoryItem): void;
  getAll(): HistoryItem[];
}
