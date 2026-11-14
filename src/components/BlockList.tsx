import type { Block } from "../lib/types";
import { formatEth, formatGwei, percent, shortHash, timeAgo } from "../lib/format";
import { useNow } from "../hooks/useNow";

interface Props {
  blocks: Block[];
  selected: number | null;
  onSelect: (blockNumber: number) => void;
}

export function BlockList({ blocks, selected, onSelect }: Props) {
  const now = useNow();

  return (
    <section className="panel">
      <h2>Latest Blocks</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Block</th>
            <th>Age</th>
            <th>Txs</th>
            <th>Gas Used</th>
            <th>Base Fee</th>
            <th>Burned</th>
            <th>Fee Recipient</th>
          </tr>
        </thead>
        <tbody>
          {blocks.map((b) => {
            const util = percent(b.gasUsed, b.gasLimit);
            return (
              <tr
                key={b.number}
                className={b.number === selected ? "selected" : undefined}
                onClick={() => onSelect(b.number)}
              >
                <td className="mono">{b.number.toLocaleString()}</td>
                <td>{timeAgo(b.timestamp, now)}</td>
                <td>{b.transactionCount}</td>
                <td>
                  <div className="gas-bar" title={`${b.gasUsed.toLocaleString()} / ${b.gasLimit.toLocaleString()}`}>
                    <div
                      className={`gas-fill ${util > 50 ? "high" : "low"}`}
                      style={{ width: `${Math.min(util, 100)}%` }}
                    />
                    <span>{util}%</span>
                  </div>
                </td>
                <td>{b.baseFeePerGas !== null ? formatGwei(b.baseFeePerGas) : "—"}</td>
                <td>{b.baseFeePerGas !== null ? formatEth(b.baseFeePerGas * b.gasUsed) : "—"}</td>
                <td className="mono">{shortHash(b.miner, 4)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
