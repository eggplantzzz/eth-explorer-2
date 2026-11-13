import type { Block } from '../lib/types';
import { formatEth, formatGwei, percent } from '../lib/format';

interface Props {
  blocks: Block[];
}

export function NetworkStats({ blocks }: Props) {
  if (blocks.length === 0) return null;

  const latest = blocks[0];
  const oldest = blocks[blocks.length - 1];

  const avgBlockTime =
    blocks.length > 1 ? (latest.timestamp - oldest.timestamp) / (blocks.length - 1) : null;

  const totalGasUsed = blocks.reduce((sum, b) => sum + b.gasUsed, 0n);
  const totalGasLimit = blocks.reduce((sum, b) => sum + b.gasLimit, 0n);
  const totalTxs = blocks.reduce((sum, b) => sum + b.transactionCount, 0);
  const totalBurned = blocks.reduce((sum, b) => sum + (b.baseFeePerGas ?? 0n) * b.gasUsed, 0n);

  const stats = [
    { label: 'Latest Block', value: `#${latest.number.toLocaleString()}` },
    { label: 'Base Fee', value: latest.baseFeePerGas !== null ? formatGwei(latest.baseFeePerGas) : '—' },
    { label: 'Avg Block Time', value: avgBlockTime !== null ? `${avgBlockTime.toFixed(1)}s` : '—' },
    { label: 'Avg Gas Utilization', value: `${percent(totalGasUsed, totalGasLimit)}%` },
    { label: 'Avg Txs / Block', value: (totalTxs / blocks.length).toFixed(0) },
    { label: `ETH Burned (last ${blocks.length})`, value: formatEth(totalBurned, 3) },
  ];

  return (
    <section className="stats">
      {stats.map((s) => (
        <div key={s.label} className="stat-card">
          <div className="stat-label">{s.label}</div>
          <div className="stat-value">{s.value}</div>
        </div>
      ))}
    </section>
  );
}
