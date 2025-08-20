export const fmtMoney = (n: number | string) =>
    `$${Number(n ?? 0).toFixed(2)}`;
  
  export const shortId = (id: string) => id?.slice(0, 8);
  
  export function toExclusiveEnd(dateStr: string | null | undefined) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    // exclusive end = next day @ 00:00
    d.setDate(d.getDate() + 1);
    d.setHours(0,0,0,0);
    return d.toISOString();
  }
  
  export function toISOStart(dateStr: string | null | undefined) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    d.setHours(0,0,0,0);
    return d.toISOString();
  }
  