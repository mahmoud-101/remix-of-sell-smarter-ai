type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();

export function getCached<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value as T;
}

export function setCached<T>(key: string, value: T, ttlMs: number) {
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

export function stableStringify(value: unknown): string {
  // Stable stringify for objects (deterministic key ordering)
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
}

export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  if (!timeoutMs || timeoutMs <= 0) return promise;
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        reject(new Error(message));
      }, timeoutMs);
    }),
  ]);
}
