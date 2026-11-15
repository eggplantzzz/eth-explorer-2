import { useState } from "react";
import { useEtherPrice } from "../hooks/useEtherPrice";

export function EtherPrice() {
  const [etherPrice, setEtherPrice] = useState<number>();
  useEtherPrice(setEtherPrice);

  if (etherPrice === undefined) {
    return null;
  } else {
    return (
      <section className="stats">
        <div className="stat-card">
          <div className="stat-label">Current ether price:</div>
          <div className="stat-value">${etherPrice}</div>
        </div>
      </section>
    )
  }
}
