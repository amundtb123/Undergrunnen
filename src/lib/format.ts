const nf = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 })

export const num = (n: number) => nf.format(n).replace('-', '−')
export const kr = (n: number) => `${num(n)} kr`

/** Compact for tight spaces: 12,3k / 1,2 mill. */
export function krShort(n: number): string {
  const a = Math.abs(n)
  const sign = n < 0 ? '−' : ''
  if (a >= 1_000_000) return `${sign}${(a / 1_000_000).toLocaleString('nb-NO', { maximumFractionDigits: 1 })} mill`
  if (a >= 10_000) return `${sign}${Math.round(a / 1000)}k`
  return `${sign}${nf.format(a)}`
}

export function haptic(ms = 8): void {
  try {
    navigator.vibrate?.(ms)
  } catch {
    /* unsupported */
  }
}
