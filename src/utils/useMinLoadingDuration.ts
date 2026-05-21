import { useEffect, useRef, useState } from 'react';

const DEFAULT_MIN_MS = 400;

/**
 * Keeps loading UI visible for at least `minMs` to avoid skeleton/content flicker.
 */
export function useMinLoadingDuration(isLoading: boolean, minMs = DEFAULT_MIN_MS): boolean {
  const [showLoading, setShowLoading] = useState(isLoading);
  const loadingStartedAtRef = useRef<number | null>(isLoading ? Date.now() : null);

  useEffect(() => {
    if (isLoading) {
      loadingStartedAtRef.current = Date.now();
      setShowLoading(true);
      return;
    }

    if (loadingStartedAtRef.current === null) {
      setShowLoading(false);
      return;
    }

    const elapsed = Date.now() - loadingStartedAtRef.current;
    const remaining = minMs - elapsed;

    if (remaining <= 0) {
      loadingStartedAtRef.current = null;
      setShowLoading(false);
      return;
    }

    const timer = window.setTimeout(() => {
      loadingStartedAtRef.current = null;
      setShowLoading(false);
    }, remaining);

    return () => window.clearTimeout(timer);
  }, [isLoading, minMs]);

  return showLoading;
}
