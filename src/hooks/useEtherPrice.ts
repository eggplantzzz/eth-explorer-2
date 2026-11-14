import type { Dispatch, SetStateAction } from "react";
const ETHER_PRICE_ENDPOINT = "https://api.coinbase.com/v2/prices/ETH-USD/spot";

export async function useEtherPrice(setEtherPrice: Dispatch<SetStateAction<number | undefined>>) {
  const res = await fetch(ETHER_PRICE_ENDPOINT);
  if (!res.ok) {
    console.error("An error occurred.");
    return;
  }
  const priceData = await res.json();
  setEtherPrice(priceData.data.amount);
}
