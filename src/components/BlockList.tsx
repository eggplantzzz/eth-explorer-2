import type { Dispatch, SetStateAction } from "react";
import type { Block } from "../lib/types";
import { formatEth, formatGwei, percent, shortHash, timeAgo } from "../lib/format";
import { useNow } from "../hooks/useNow";

interface Props {
  blocks: Block[];
  selected: number | null;
  onSelect: (blockNumber: number) => void;
  pollingEnabled: boolean;
  setPollingEnabled: Dispatch<SetStateAction<boolean>>;
}

export function BlockList({ setPollingEnabled, pollingEnabled, blocks, selected, onSelect }: Props) {
  const now = useNow();

  const togglePollingButton = function () {
    return (
      <div className="toggle">
        <
          button
          onClick={() => setPollingEnabled(!pollingEnabled)}
        >
            {pollingEnabled ? "Disable" : "Enable"} Polling
        </button>
      </div>
    )
  }

  return (
    <section className="panel">
      <div className={"latest-blocks-header"}>
        <h2 className={"latest-blocks-text"}>Latest Blocks</h2>
        {togglePollingButton()}
      </div>
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
