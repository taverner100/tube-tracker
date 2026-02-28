import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "tube-tracker-visited";

export function useVisitedStations() {
  const [visited, setVisited] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        return new Set(parsed);
      }
    } catch {
      // ignore
    }
    return new Set();
  });

  // Persist to localStorage whenever visited changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(visited)));
    } catch {
      // ignore
    }
  }, [visited]);

  const toggleStation = useCallback((stationId: string) => {
    setVisited((prev) => {
      const next = new Set(prev);
      if (next.has(stationId)) {
        next.delete(stationId);
      } else {
        next.add(stationId);
      }
      return next;
    });
  }, []);

  const markAllOnLine = useCallback((stationIds: string[]) => {
    setVisited((prev) => {
      const next = new Set(prev);
      stationIds.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const unmarkAllOnLine = useCallback((stationIds: string[]) => {
    setVisited((prev) => {
      const next = new Set(prev);
      stationIds.forEach((id) => next.delete(id));
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setVisited(new Set());
  }, []);

  return { visited, toggleStation, markAllOnLine, unmarkAllOnLine, resetAll };
}
