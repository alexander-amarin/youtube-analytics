/**
 * Coerce a possibly-undefined string/number (e.g. YouTube stat counts, which
 * arrive as strings) into a finite number, defaulting to 0.
 */
export function toNumber(value: string | number | undefined): number {
  if (value == null) return 0
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}
