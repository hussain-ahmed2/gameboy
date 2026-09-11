import { useSyncExternalStore, useCallback, useMemo } from "react";

// The 'storage' event only triggers when other tabs change localStorage.
// We use this Set to notify the current tab of changes we make locally.
const subscribers = new Set<() => void>();

function emitChange() {
  subscribers.forEach((callback) => callback());
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  subscribers.add(callback);
  return () => {
    window.removeEventListener("storage", callback);
    subscribers.delete(callback);
  };
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const getSnapshot = useCallback(() => window.localStorage.getItem(key), [key]);
  const getServerSnapshot = useCallback(() => null, []);

  const storeValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const parsedValue = useMemo(() => {
    if (storeValue === null) return initialValue;
    try {
      return JSON.parse(storeValue);
    } catch {
      // Fallback for legacy values that were saved as raw strings
      return storeValue as unknown as T;
    }
  }, [storeValue, initialValue]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(parsedValue) : value;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          emitChange(); // Trigger re-render in current tab
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, parsedValue]
  );

  return [parsedValue, setValue];
}
