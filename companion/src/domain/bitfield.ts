export function toBigInt(value: unknown, label = 'packed value'): bigint {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || !Number.isInteger(value)) {
      throw new Error(label + ' must be an integer.');
    }
    if (!Number.isSafeInteger(value)) {
      throw new Error(label + ' exceeded JavaScript safe integer precision before normalization.');
    }
    return BigInt(value);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return 0n;
    if (!/^-?\d+$/.test(trimmed)) throw new Error(label + ' was not an integer string.');
    return BigInt(trimmed);
  }
  if (value == null) return 0n;
  throw new Error(label + ' had an unsupported type.');
}

export function toIntegerString(value: unknown, label = 'packed value'): string {
  return toBigInt(value, label).toString();
}

export function hasBit(value: unknown, flag: number): boolean {
  return (toBigInt(value) & BigInt(flag)) !== 0n;
}

export function countBits(value: unknown): number {
  let current = toBigInt(value);
  if (current < 0n) throw new Error('Bitfield values cannot be negative.');
  let count = 0;
  while (current > 0n) {
    count += Number(current & 1n);
    current >>= 1n;
  }
  return count;
}

export function toSmallInt(value: unknown, fallback = 0): number {
  if (value == null || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}
