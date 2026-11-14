/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INFURA_API_KEY: string;
  readonly VITE_INFURA_NETWORK?: "mainnet" | "sepolia" | "holesky";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
