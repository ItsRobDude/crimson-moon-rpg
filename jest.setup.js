import { afterEach, beforeEach, jest } from '@jest/globals';
import { clearAllScheduledTimeouts } from './timers.js';

class MemoryStorage {
  constructor() {
    this.store = new Map();
  }

  clear() {
    this.store.clear();
  }

  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  key(index) {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key) {
    this.store.delete(key);
  }

  setItem(key, value) {
    this.store.set(String(key), String(value));
  }

  get length() {
    return this.store.size;
  }
}

const memoryStorage = new MemoryStorage();

if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: memoryStorage
  });
}

beforeEach(() => {
  globalThis.localStorage.clear();
});

afterEach(() => {
  clearAllScheduledTimeouts();
  globalThis.localStorage.clear();
  jest.restoreAllMocks();
});
