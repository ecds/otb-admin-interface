import { useEffect, useRef } from "react";

const DEFAULT_INTERVAL_MS = 1000;
const DEFAULT_MAX_ATTEMPTS = 10;

type UseSyncPollOptions = {
  /** True while the locally-saved value hasn't shown up in the last revalidated (ES-backed) loader data yet. */
  pending: boolean;
  revalidate: () => void;
  /** Called once if `pending` is still true after `maxAttempts` polls. */
  onTimeout?: () => void;
  intervalMs?: number;
  maxAttempts?: number;
};

/**
 * Polls `revalidate` at `intervalMs` while `pending` is true, giving up after
 * `maxAttempts`. Centralizes the "wait for the Elasticsearch-backed read to
 * catch up with a just-written value" pattern instead of each component
 * re-implementing its own interval/timeout.
 */
export const useSyncPoll = ({
  pending,
  revalidate,
  onTimeout,
  intervalMs = DEFAULT_INTERVAL_MS,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
}: UseSyncPollOptions) => {
  const attemptsRef = useRef(0);
  // Keep the latest callbacks in refs so the scheduling effect below doesn't
  // reset its timer just because the caller passed a new closure this render.
  const revalidateRef = useRef(revalidate);
  const onTimeoutRef = useRef(onTimeout);
  useEffect(() => {
    revalidateRef.current = revalidate;
    onTimeoutRef.current = onTimeout;
  });

  useEffect(() => {
    if (!pending) {
      attemptsRef.current = 0;
      return;
    }

    // setInterval keeps ticking on its own clock once started, so it keeps
    // polling for as long as `pending` stays true across renders — a
    // setTimeout here would only ever fire once, since nothing re-runs this
    // effect while `pending`'s boolean value doesn't change between renders.
    const intervalId = setInterval(() => {
      if (attemptsRef.current >= maxAttempts) {
        clearInterval(intervalId);
        onTimeoutRef.current?.();
        return;
      }
      attemptsRef.current += 1;
      revalidateRef.current();
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [pending, intervalMs, maxAttempts]);
};
