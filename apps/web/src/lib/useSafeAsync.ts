import { useEffect } from 'react';

/** Runs an async effect with an isActive guard to avoid state updates after unmount. */
export function useSafeAsyncEffect(
  effect: (isActive: () => boolean) => void | Promise<void>,
  deps: unknown[],
) {
  useEffect(() => {
    let active = true;
    const isActive = () => active;
    void effect(isActive);
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
