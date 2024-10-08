import type { DeepPartial, History, HistoryItem } from './types';
import { customStructuredClone } from './utils/custom-structured-clone';
import { deepPartiallyMatch } from './utils/deep-partially-match';

export class BasicHistory implements History {
  private history: HistoryItem[] = [];

  put(item: HistoryItem): void {
    this.history.push(item);
  }

  getAll(): HistoryItem[] {
    return customStructuredClone(this.history);
  }

  async reset(): Promise<void> {
    this.history = [];
  }

  has(match: DeepPartial<HistoryItem>): boolean {
    for (const item of this.history) {
      if (deepPartiallyMatch(item, match)) {
        return true;
      }
    }

    return false;
  }
}
