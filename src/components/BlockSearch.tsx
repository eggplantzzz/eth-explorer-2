import { useState, type FormEvent } from 'react';

interface Props {
  onSearch: (blockNumber: number) => void;
}

export function BlockSearch({ onSearch }: Props) {
  const [value, setValue] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const n = Number(value.replace(/,/g, '').trim());
    if (Number.isInteger(n) && n >= 0) onSearch(n);
  }

  return (
    <form className="search" onSubmit={handleSubmit}>
      <input
        type="text"
        inputMode="numeric"
        placeholder="Look up block number…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit">Go</button>
    </form>
  );
}
