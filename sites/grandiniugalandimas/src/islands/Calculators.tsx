// The savings calculator can pick a quantity for the order form further down the page.
import { useEffect, useState } from "react";
import { OrderCalculator } from "../components/OrderCalculator";
import { SavingsCalculator } from "../components/SavingsCalculator";
const EVENT = "gg:apply-quantity";
export function OrderCalculatorIsland() {
  const [selection, setSelection] = useState({ quantity: 4, version: 0 });
  useEffect(() => {
    const on = (e: Event) => setSelection((p) => ({ quantity: (e as CustomEvent<number>).detail, version: p.version + 1 }));
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  return <OrderCalculator initialQuantity={selection.quantity} selectionVersion={selection.version} />;
}
export function SavingsCalculatorIsland() {
  return <SavingsCalculator onApplyQuantity={(qty) => window.dispatchEvent(new CustomEvent(EVENT, { detail: qty }))} />;
}
