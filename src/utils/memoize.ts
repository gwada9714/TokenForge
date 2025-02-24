interface Cache<T> {
  [key: string]: {
    value: T;
    timestamp: number;
  };
}

interface MemoizeOptions {
  maxSize?: number;
  ttl?: number; // Time to live in milliseconds
}

const DEFAULT_OPTIONS: Required<MemoizeOptions> = {
  maxSize: 1000,
  ttl: 5 * 60 * 1000, // 5 minutes
};

export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: MemoizeOptions = {}
): T {
  const { maxSize, ttl } = { ...DEFAULT_OPTIONS, ...options };
  const cache: Cache<ReturnType<T>> = {};
  const keys: string[] = [];

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    const now = Date.now();

    // Check if cached and not expired
    if (
      cache[key] &&
      (!ttl || now - cache[key].timestamp < ttl)
    ) {
      return cache[key].value;
    }

    // Calculate new value
    const result = fn(...args);

    // Manage cache size
    if (keys.length >= maxSize) {
      const oldestKey = keys.shift();
      if (oldestKey) delete cache[oldestKey];
    }

    // Store new value
    cache[key] = {
      value: result,
      timestamp: now,
    };
    keys.push(key);

    return result;
  }) as T;
}
