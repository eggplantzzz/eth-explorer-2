import { useEffect, useRef, useState } from "react";
import { getBlocks, getLatestBlockNumber } from "../lib/rpc";
import type { Block } from "../lib/types";

interface State {
  blocks: Block[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

/**
 * Keeps a rolling window of the latest `count` blocks.
 * Polls eth_blockNumber and only fetches blocks we haven't seen yet.
 */
export function useLatestBlocks(count = 10, pollMs = 12_000, pollingEnabled: boolean): State {
  const [state, setState] = useState<State>({
    blocks: [],
    loading: false,
    error: null,
    lastUpdated: null,
  });
  const headRef = useRef<number | null>(null);

  useEffect(() => {
    if (!pollingEnabled) return;
    setState((s) => ({
      ...s,
      loading: true
    }));
    let cancelled = false;
    let inFlight = false;
    headRef.current = null;

    async function tick() {
      if (inFlight) return;
      inFlight = true;
      try {
        const head = await getLatestBlockNumber();
        if (cancelled) return;

        const prevHead = headRef.current;
        if (prevHead !== null && head <= prevHead) {
          setState((s) => ({ ...s, lastUpdated: Date.now(), error: null }));
          return;
        }

        const from = Math.max(head - count + 1, prevHead === null ? 0 : prevHead + 1);
        const numbers = Array.from({ length: head - from + 1 }, (_, i) => from + i);
        const fetched = await getBlocks(numbers);
        if (cancelled) return;

        headRef.current = head;
        setState((s) => {
          const byNumber = new Map<number, Block>();
          for (const b of [...s.blocks, ...fetched]) byNumber.set(b.number, b);
          const blocks = [...byNumber.values()]
            .sort((a, b) => b.number - a.number)
            .slice(0, count);
          return { blocks, loading: false, error: null, lastUpdated: Date.now() };
        });
      } catch (err) {
        if (!cancelled) {
          setState((s) => ({
            ...s,
            loading: false,
            error: err instanceof Error ? err.message : String(err),
          }));
        }
      } finally {
        inFlight = false;
      }
    }

    tick();
    const id = setInterval(tick, pollMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [count, pollMs, pollingEnabled]);

  return state;
}
