import { useCallback, useRef, useEffect, useState } from "react";

// Debounce hook for performance
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttle hook for performance
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef(0);
  const lastResult = useRef<ReturnType<T>>();

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        lastResult.current = callback(...args) as ReturnType<T>;
      }
      return lastResult.current;
    }) as T,
    [callback, delay]
  );
}

// Lazy loading hook
export function useLazyLoad(threshold: number = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

// Memory cache for API responses
class MemoryCache<T> {
  private cache: Map<string, { data: T; expiry: number }> = new Map();

  set(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const apiCache = new MemoryCache<unknown>();

// Performance metrics
export function usePerformanceMetrics() {
  useEffect(() => {
    if (typeof window !== "undefined" && "performance" in window) {
      const logMetrics = () => {
        const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          const metrics = {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.startTime,
            loadComplete: navigation.loadEventEnd - navigation.startTime,
            firstByte: navigation.responseStart - navigation.requestStart,
          };
          
          console.log("Performance Metrics:", metrics);
        }
      };

      if (document.readyState === "complete") {
        logMetrics();
      } else {
        window.addEventListener("load", logMetrics);
        return () => window.removeEventListener("load", logMetrics);
      }
    }
  }, []);
}
