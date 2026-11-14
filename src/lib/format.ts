export function formatUnits(value: bigint, decimals: number, precision = 4): string {
  const negative = value < 0n;
  const v = negative ? -value : value;
  const base = 10n ** BigInt(decimals);
  const whole = v / base;
  const frac = (v % base)
    .toString()
    .padStart(decimals, "0")
    .slice(0, precision)
    .replace(/0+$/, "");
  return `${negative ? "-" : ""}${whole.toLocaleString()}${frac ? `.${frac}` : ""}`;
}

export const formatEth = (wei: bigint, precision = 4) => `${formatUnits(wei, 18, precision)} ETH`;
export const formatGwei = (wei: bigint, precision = 2) => `${formatUnits(wei, 9, precision)} Gwei`;

export function shortHash(hash: string, chars = 6): string {
  if (hash.length <= chars * 2 + 2) return hash;
  return `${hash.slice(0, chars + 2)}…${hash.slice(-chars)}`;
}

export function timeAgo(unixSeconds: number, nowMs = Date.now()): string {
  const diff = Math.max(0, Math.floor(nowMs / 1000) - unixSeconds);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function percent(numerator: bigint, denominator: bigint, decimals = 1): number {
  if (denominator === 0n) return 0;
  const scale = 10 ** decimals;
  return Number((numerator * 100n * BigInt(scale)) / denominator) / scale;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/** Tries to decode a block's extraData as UTF-8 (builders often tag blocks this way). */
export function decodeExtraData(hex: string): string {
  try {
    const bytes = new Uint8Array((hex.slice(2).match(/.{2}/g) ?? []).map((b) => parseInt(b, 16)));
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return /^[\x20-\x7E]*$/.test(text) && text.length > 0 ? text : hex;
  } catch {
    return hex;
  }
}

export const TX_TYPES: Record<number, string> = {
  0: "Legacy",
  1: "Access List",
  2: "EIP-1559",
  3: "Blob",
  4: "EIP-7702",
};
