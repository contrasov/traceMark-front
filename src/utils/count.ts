export function formatCount(n: number): string {
  if (n < 1000) return n.toString()
  const v = n / 1000
  return `${v.toFixed(1).replace('.', ',').replace(',0', '')} mil`
}
