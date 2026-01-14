export class CircularBuffer<T> {
  private buffer: (T | undefined)[];
  private head: number = 0;
  private tail: number = 0;
  private _size: number = 0;
  private _capacity: number;

  constructor(capacity: number) {
    this._capacity = capacity;
    this.buffer = new Array(capacity);
  }

  get size(): number {
    return this._size;
  }

  get capacity(): number {
    return this._capacity;
  }

  get isFull(): boolean {
    return this._size === this._capacity;
  }

  push(item: T): T | undefined {
    let evicted: T | undefined;

    if (this._size === this._capacity) {
      evicted = this.buffer[this.tail];
      this.tail = (this.tail + 1) % this._capacity;
    } else {
      this._size++;
    }

    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this._capacity;

    return evicted;
  }

  pushMany(items: T[]): T[] {
    const evicted: T[] = [];
    for (const item of items) {
      const ev = this.push(item);
      if (ev !== undefined) {
        evicted.push(ev);
      }
    }
    return evicted;
  }

  toArray(): T[] {
    if (this._size === 0) return [];

    const result: T[] = new Array(this._size);
    for (let i = 0; i < this._size; i++) {
      const index = (this.tail + i) % this._capacity;
      result[i] = this.buffer[index] as T;
    }
    return result;
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined;
    const actualIndex = (this.tail + index) % this._capacity;
    return this.buffer[actualIndex];
  }

  clear(): void {
    this.buffer = new Array(this._capacity);
    this.head = 0;
    this.tail = 0;
    this._size = 0;
  }

  slice(start: number, end: number): T[] {
    const clampedStart = Math.max(0, start);
    const clampedEnd = Math.min(this._size, end);

    if (clampedStart >= clampedEnd) return [];

    const result: T[] = [];
    for (let i = clampedStart; i < clampedEnd; i++) {
      const item = this.get(i);
      if (item !== undefined) {
        result.push(item);
      }
    }
    return result;
  }
}
