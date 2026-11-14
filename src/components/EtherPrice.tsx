export function EtherPrice({ etherPrice }: { etherPrice?: number }) {
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
