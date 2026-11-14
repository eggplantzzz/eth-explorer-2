import { useState } from "react";
import { useBlock } from "../hooks/useBlock";
import { EXPLORER_URL, NETWORK } from "../lib/rpc";
import {
  TX_TYPES,
  decodeExtraData,
  formatBytes,
  formatEth,
  formatGwei,
  percent,
  shortHash,
} from "../lib/format";

interface Props {
  blockNumber: number | null;
}

const TX_PAGE_SIZE = 25;
const explorer = EXPLORER_URL[NETWORK] ?? EXPLORER_URL.mainnet;

export function BlockDetails({ blockNumber }: Props) {
  const { block, loading, error } = useBlock(blockNumber);
  const [txLimit, setTxLimit] = useState(TX_PAGE_SIZE);

  if (blockNumber === null) {
    return <section className="panel muted">Select a block to see its details.</section>;
  }
  if (loading) return <section className="panel">Loading block #{blockNumber}…</section>;
  if (error) return <section className="panel error">{error}</section>;
  if (!block) return null;

  const burned = block.baseFeePerGas !== null ? block.baseFeePerGas * block.gasUsed : null;
  const totalValue = block.transactions.reduce((sum, tx) => sum + tx.value, 0n);
  const contractCreations = block.transactions.filter((tx) => tx.to === null).length;

  const fields: [string, React.ReactNode][] = [
    ["Hash", <span className="mono">{block.hash}</span>],
    ["Parent Hash", <span className="mono">{block.parentHash}</span>],
    ["Timestamp", `${new Date(block.timestamp * 1000).toLocaleString()} (${block.timestamp})`],
    ["Fee Recipient", <a className="mono" href={`${explorer}/address/${block.miner}`} target="_blank" rel="noreferrer">{block.miner}</a>],
    ["Transactions", `${block.transactionCount} (${contractCreations} contract creations)`],
    ["Total ETH Transferred", formatEth(totalValue)],
    ["Gas Used", `${block.gasUsed.toLocaleString()} (${percent(block.gasUsed, block.gasLimit)}%)`],
    ["Gas Limit", block.gasLimit.toLocaleString()],
    ["Base Fee", block.baseFeePerGas !== null ? formatGwei(block.baseFeePerGas, 4) : "—"],
    ["Burned Fees", burned !== null ? formatEth(burned, 6) : "—"],
    ["Blob Gas Used", block.blobGasUsed !== null ? block.blobGasUsed.toLocaleString() : "—"],
    ["Withdrawals", block.withdrawalCount],
    ["Size", formatBytes(block.size)],
    ["Extra Data", <span className="mono">{decodeExtraData(block.extraData)}</span>],
  ];

  return (
    <section className="panel">
      <h2>
        Block #{block.number.toLocaleString()}{" "}
        <a className="small" href={`${explorer}/block/${block.number}`} target="_blank" rel="noreferrer">
          view on explorer ↗
        </a>
      </h2>

      <dl className="details">
        {fields.map(([label, value]) => (
          <div key={label} className="detail-row">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <h3>Transactions</h3>
      <table className="table compact">
        <thead>
          <tr>
            <th>#</th>
            <th>Hash</th>
            <th>From</th>
            <th>To</th>
            <th>Value</th>
            <th>Type</th>
            <th>Max Fee / Gas Price</th>
          </tr>
        </thead>
        <tbody>
          {block.transactions.slice(0, txLimit).map((tx) => (
            <tr key={tx.hash}>
              <td>{tx.index}</td>
              <td className="mono">
                <a href={`${explorer}/tx/${tx.hash}`} target="_blank" rel="noreferrer">
                  {shortHash(tx.hash, 4)}
                </a>
              </td>
              <td className="mono">{shortHash(tx.from, 4)}</td>
              <td className="mono">{tx.to ? shortHash(tx.to, 4) : <em>contract creation</em>}</td>
              <td>{formatEth(tx.value)}</td>
              <td>{TX_TYPES[tx.type] ?? `Type ${tx.type}`}</td>
              <td>
                {tx.maxFeePerGas !== null
                  ? formatGwei(tx.maxFeePerGas)
                  : tx.gasPrice !== null
                    ? formatGwei(tx.gasPrice)
                    : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {block.transactions.length > txLimit && (
        <button className="link-button" onClick={() => setTxLimit((n) => n + TX_PAGE_SIZE)}>
          Show more ({block.transactions.length - txLimit} remaining)
        </button>
      )}
    </section>
  );
}
