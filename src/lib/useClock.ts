import { useEffect, useState } from "react";
import { vehiclesAt } from "./transit";

/** Saniyede bir ilerleyen saat (sn). Testlerde sabitlemek için web'de globalThis.__rotaTime kullanılabilir. */
export function useClock(intervalMs = 1000) {
  const read = () => (globalThis as unknown as { __rotaTime?: number }).__rotaTime ?? Date.now() / 1000;
  const [t, setT] = useState(read);
  useEffect(() => { const i = setInterval(() => setT(read()), intervalMs); return () => clearInterval(i); }, [intervalMs]);
  return t;
}
export function useVehicles(intervalMs = 1000) { const t = useClock(intervalMs); return { t, vehicles: vehiclesAt(t) }; }
