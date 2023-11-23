export type HistoryItem = {
  type: 'get' | 'set' | 'call';
  key: string | symbol;
  value?: any;
  args?: any[];
};

export interface History {
  put(key: string, item: HistoryItem): void;
  getAll(): Record<string, HistoryItem[]>;
}
