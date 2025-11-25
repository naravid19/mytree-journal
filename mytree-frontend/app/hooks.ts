import { useRef } from "react";

export function useDebouncedSearch(callback: (s: string) => void, delay = 300) {
  const timer = useRef<NodeJS.Timeout | null>(null);
  return (val: string) => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => callback(val), delay) as unknown as NodeJS.Timeout;
  };
}
