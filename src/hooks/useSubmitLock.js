import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Lets one submit run at a time.
 *
 * `run(work)` calls `work` unless an earlier call is still in flight, in which
 * case it resolves to undefined without calling it. `isLocked` is for the UI
 * (disable the button, show a spinner).
 *
 * The guard is a ref, not the state flag: two clicks in the same tick both see
 * the old state, because React has not re-rendered between them.
 */
export const useSubmitLock = () => {
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async (work) => {
    if (inFlight.current) return undefined;

    inFlight.current = true;
    setIsLocked(true);
    try {
      return await work();
    } finally {
      inFlight.current = false;
      // A successful save navigates away, so the form may be gone by now.
      if (mounted.current) setIsLocked(false);
    }
  }, []);

  return { isLocked, run };
};

export default useSubmitLock;
