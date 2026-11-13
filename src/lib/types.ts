// ---- Raw JSON-RPC shapes (all quantities are hex strings) ----

export interface RawTransaction {
  hash: string;
  from: string;
  to: string | null;
  value: string;
  gas: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce: string;
  input: string;
  type: string;
  transactionIndex: string;
}

export interface RawBlock {
  number: string;
  hash: string;
  parentHash: string;
  timestamp: string;
  miner: string;
  gasUsed: string;
  gasLimit: string;
  baseFeePerGas?: string;
  size: string;
  extraData: string;
  transactions: string[] | RawTransaction[];
  withdrawals?: unknown[];
  blobGasUsed?: string;
  excessBlobGas?: string;
}

// ---- Parsed app-level shapes ----

export interface Transaction {
  hash: string;
  index: number;
  from: string;
  to: string | null; // null => contract creation
  value: bigint;
  gasLimit: bigint;
  gasPrice: bigint | null;
  maxFeePerGas: bigint | null;
  maxPriorityFeePerGas: bigint | null;
  nonce: number;
  type: number;
  inputSize: number; // bytes of calldata
}

export interface Block {
  number: number;
  hash: string;
  parentHash: string;
  timestamp: number; // unix seconds
  miner: string; // fee recipient post-merge
  gasUsed: bigint;
  gasLimit: bigint;
  baseFeePerGas: bigint | null;
  size: number;
  extraData: string;
  transactionCount: number;
  transactions: Transaction[]; // only populated when fetched with full=true
  withdrawalCount: number;
  blobGasUsed: bigint | null;
}

export type BlockTag = number | 'latest' | 'finalized' | 'safe';
