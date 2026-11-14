import type { Block, BlockTag, RawBlock, RawTransaction, Transaction } from "./types";

const API_KEY = import.meta.env.VITE_INFURA_API_KEY;
export const NETWORK = import.meta.env.VITE_INFURA_NETWORK ?? "mainnet";
const RPC_URL = `https://${NETWORK}.infura.io/v3/${API_KEY}`;

export const EXPLORER_URL: Record<string, string> = {
  mainnet: "https://etherscan.io",
  sepolia: "https://sepolia.etherscan.io",
  holesky: "https://holesky.etherscan.io",
};

interface JsonRpcResponse<T> {
  jsonrpc: "2.0";
  id: number;
  result?: T;
  error?: { code: number; message: string };
}

interface RpcCall {
  method: string;
  params: unknown[];
}

let nextId = 1;

function assertConfigured() {
  if (!API_KEY) {
    throw new Error("Missing VITE_INFURA_API_KEY. Add it to .env.local and restart the dev server.");
  }
}

export async function rpc<T>(method: string, params: unknown[] = []): Promise<T> {
  assertConfigured();
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: nextId++, method, params }),
  });
  if (!res.ok) throw new Error(`RPC HTTP ${res.status}: ${res.statusText}`);

  const json = (await res.json()) as JsonRpcResponse<T>;
  if (json.error) throw new Error(`RPC error ${json.error.code}: ${json.error.message}`);
  return json.result as T;
}

/** Sends many calls in a single HTTP request. Results are returned in call order. */
export async function rpcBatch<T>(calls: RpcCall[]): Promise<T[]> {
  assertConfigured();
  if (calls.length === 0) return [];

  const payload = calls.map((c, i) => ({ jsonrpc: "2.0", id: i, method: c.method, params: c.params }));
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`RPC HTTP ${res.status}: ${res.statusText}`);

  const json = (await res.json()) as JsonRpcResponse<T>[];
  // Batch responses are not guaranteed to come back in order.
  return json
    .sort((a, b) => a.id - b.id)
    .map((r) => {
      if (r.error) throw new Error(`RPC error ${r.error.code}: ${r.error.message}`);
      return r.result as T;
    });
}

// ---- Parsing helpers ----

const toHex = (n: number) => `0x${n.toString(16)}`;
const hexToNumber = (h: string) => Number.parseInt(h, 16);
const hexToBigInt = (h?: string | null) => (h == null ? null : BigInt(h));
const tagParam = (tag: BlockTag) => (typeof tag === "number" ? toHex(tag) : tag);

function parseTransaction(tx: RawTransaction): Transaction {
  return {
    hash: tx.hash,
    index: hexToNumber(tx.transactionIndex),
    from: tx.from,
    to: tx.to,
    value: BigInt(tx.value),
    gasLimit: BigInt(tx.gas),
    gasPrice: hexToBigInt(tx.gasPrice),
    maxFeePerGas: hexToBigInt(tx.maxFeePerGas),
    maxPriorityFeePerGas: hexToBigInt(tx.maxPriorityFeePerGas),
    nonce: hexToNumber(tx.nonce),
    type: hexToNumber(tx.type),
    inputSize: Math.max(0, (tx.input.length - 2) / 2),
  };
}

function parseBlock(raw: RawBlock): Block {
  const fullTxs = raw.transactions.length > 0 && typeof raw.transactions[0] === "object";
  return {
    number: hexToNumber(raw.number),
    hash: raw.hash,
    parentHash: raw.parentHash,
    timestamp: hexToNumber(raw.timestamp),
    miner: raw.miner,
    gasUsed: BigInt(raw.gasUsed),
    gasLimit: BigInt(raw.gasLimit),
    baseFeePerGas: hexToBigInt(raw.baseFeePerGas),
    size: hexToNumber(raw.size),
    extraData: raw.extraData,
    transactionCount: raw.transactions.length,
    transactions: fullTxs ? (raw.transactions as RawTransaction[]).map(parseTransaction) : [],
    withdrawalCount: raw.withdrawals?.length ?? 0,
    blobGasUsed: hexToBigInt(raw.blobGasUsed),
  };
}

// ---- Public API ----

export async function getLatestBlockNumber(): Promise<number> {
  return hexToNumber(await rpc<string>("eth_blockNumber"));
}

export async function getGasPrice(): Promise<bigint> {
  return BigInt(await rpc<string>("eth_gasPrice"));
}

export async function getBlock(tag: BlockTag, fullTransactions = false): Promise<Block | null> {
  const raw = await rpc<RawBlock | null>("eth_getBlockByNumber", [tagParam(tag), fullTransactions]);
  return raw ? parseBlock(raw) : null;
}

/** Fetch several blocks (header + tx hashes only) in one batched request. */
export async function getBlocks(numbers: number[]): Promise<Block[]> {
  const raws = await rpcBatch<RawBlock | null>(
    numbers.map((n) => ({ method: "eth_getBlockByNumber", params: [toHex(n), false] })),
  );
  return raws.filter((b): b is RawBlock => b !== null).map(parseBlock);
}
