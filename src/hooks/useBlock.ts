import { useEffect, useState } from "react";
import { getBlock } from "../lib/rpc";
import type { Block } from "../lib/types";

/** Fetches a single block including full transaction objects. */
export function useBlock(blockNumber: number | null) {
  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (blockNumber === null) {
      setBlock(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    getBlock(blockNumber, true)
      .then((b) => {
        if (cancelled) return;
        if (!b) setError(`Block ${blockNumber} not found`);
        setBlock(b);
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : String(err)))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [blockNumber]);

  return { block, loading, error };
}
