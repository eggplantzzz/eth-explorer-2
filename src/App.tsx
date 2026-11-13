import { useState } from 'react';
import { useLatestBlocks } from './hooks/useLatestBlocks';
import { NetworkStats } from './components/NetworkStats';
import { BlockList } from './components/BlockList';
import { BlockDetails } from './components/BlockDetails';
import { BlockSearch } from './components/BlockSearch';
import { NETWORK } from './lib/rpc';
import './App.css';

const BLOCK_COUNT = 15;
const POLL_MS = 12_000; // ~1 Ethereum slot

export default function App() {
  const { blocks, loading, error, lastUpdated } = useLatestBlocks(BLOCK_COUNT, POLL_MS);
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>⛓️ Block Explorer</h1>
          <span className="badge">{NETWORK}</span>
          {lastUpdated && (
            <span className="muted small"> updated {new Date(lastUpdated).toLocaleTimeString()}</span>
          )}
        </div>
        <BlockSearch onSearch={setSelected} />
      </header>

      {error && <div className="panel error">⚠️ {error}</div>}
      {loading && blocks.length === 0 ? (
        <div className="panel">Loading latest blocks…</div>
      ) : (
        <>
          <NetworkStats blocks={blocks} />
          <main className="grid">
            <BlockList blocks={blocks} selected={selected} onSelect={setSelected} />
            <BlockDetails blockNumber={selected} />
          </main>
        </>
      )}
    </div>
  );
}
