import type { History, HistoryItem } from './types';

export class BasicHistory implements History {
  private history: Record<string, HistoryItem[]> = {};

  put(key: string, item: HistoryItem): void {
    if (!this.history[key]) {
      this.history[key] = [];
    }
    this.history[key].push(item);
  }

  getAll(): Record<string, HistoryItem[]> {
    return { ...this.history };
  }
}
