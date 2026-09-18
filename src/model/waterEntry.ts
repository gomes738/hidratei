export type WaterEntry = {
  id: string;
  amount: number;
  date: string;
  createdAt: string;
};

export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createWaterEntry(amount: number): WaterEntry {
  const roundedAmount = Math.round(amount);
  if (!Number.isFinite(amount) || roundedAmount <= 0) {
    throw new Error("Informe uma quantidade maior que zero.");
  }

  const now = new Date();
  return {
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 9)}`,
    amount: roundedAmount,
    date: getLocalDateKey(now),
    createdAt: now.toISOString(),
  };
}
