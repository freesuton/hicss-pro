import { useCallback, useEffect, useRef, useState } from 'react';

interface UseDebouncedDraftOptions {
  debounceMs?: number;
  throttleMs?: number;
  onSave: (data: any) => Promise<void>;
  enabled?: boolean;
}

export function useDebounced<T>(
  data: T,
  options: UseDebouncedDraftOptions
) {
  const {
    debounceMs = 2000, // 2 seconds like Medium
    throttleMs = 30000, // 30 seconds
    onSave,
    enabled = true
  } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTimeRef = useRef<number>(0);

  const saveDraft = useCallback(async (force = false) => {
    if (!enabled) return;

    const now = Date.now();
    const timeSinceLastSave = now - lastSaveTimeRef.current;

    // Don't save if we just saved recently (unless forced)
    if (!force && timeSinceLastSave < 1000) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(data);
      lastSaveTimeRef.current = now;
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      setIsSaving(false);
    }
  }, [data, onSave, enabled]);

  // Debounced save on data changes
  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      saveDraft();
    }, debounceMs);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [data, debounceMs, saveDraft, enabled]);

  // Throttled periodic save
  useEffect(() => {
    if (!enabled) return;

    const startThrottledSave = () => {
      throttleTimeoutRef.current = setTimeout(() => {
        saveDraft();
        startThrottledSave(); // Schedule next save
      }, throttleMs);
    };

    startThrottledSave();

    return () => {
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, [throttleMs, saveDraft, enabled]);

  // Save on visibility change (user switches tabs)
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveDraft(true); // Force save when user switches away
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveDraft, enabled]);

  // Save on beforeunload (user navigates away)
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => {
      saveDraft(true); // Force save before navigation
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveDraft, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, []);

  return {
    isSaving,
    lastSaved,
    saveDraft: () => saveDraft(true) // Expose manual save function
  };
}

// Generic debounce hook for any value
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
} 