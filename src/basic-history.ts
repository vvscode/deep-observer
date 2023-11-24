import type { History, HistoryItem } from './types';

export class BasicHistory implements History {
  private history: HistoryItem[] = [];

  put(item: HistoryItem): void {
    this.history.push(item);
  }

  getAll(): HistoryItem[] {
    return structuredClone(this.history);
  }
}
