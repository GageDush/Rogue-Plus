export interface RawSave {
  gameVersion: string;
  timestamp: number;
  starterData: Record<string, Record<string, unknown>>;
  dexData: Record<string, Record<string, unknown>>;
  gameStats: Record<string, unknown>;
  voucherCounts: Record<string, unknown>;
  achvUnlocks: Record<string, unknown>;
  voucherUnlocks: Record<string, unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) throw new Error('Required PokéRogue save section "' + label + '" was missing or invalid.');
  return value;
}

function recordOfRecords(value: unknown, label: string): Record<string, Record<string, unknown>> {
  const record = requireRecord(value, label);
  const result: Record<string, Record<string, unknown>> = {};
  for (const [key, entry] of Object.entries(record)) {
    if (isRecord(entry)) result[key] = entry;
  }
  return result;
}

export function parseRawSaveJson(plain: string): RawSave {
  let parsed: unknown;
  try {
    parsed = JSON.parse(plain);
  } catch {
    throw new Error('Decryption completed, but the payload was not valid PokéRogue JSON.');
  }
  const root = requireRecord(parsed, 'root');
  const gameVersion = typeof root.gameVersion === 'string' ? root.gameVersion : '';
  const timestamp = Number(root.timestamp);
  if (!gameVersion) throw new Error('The save is missing its gameVersion.');
  if (!Number.isFinite(timestamp) || timestamp <= 0) throw new Error('The save is missing a valid timestamp.');

  // Deliberately construct only the sections the companion app consumes.
  // Account identity fields such as trainerId and secretId are not retained.
  return {
    gameVersion,
    timestamp,
    starterData: recordOfRecords(root.starterData, 'starterData'),
    dexData: recordOfRecords(root.dexData, 'dexData'),
    gameStats: requireRecord(root.gameStats, 'gameStats'),
    voucherCounts: isRecord(root.voucherCounts) ? root.voucherCounts : {},
    achvUnlocks: isRecord(root.achvUnlocks) ? root.achvUnlocks : {},
    voucherUnlocks: isRecord(root.voucherUnlocks) ? root.voucherUnlocks : {},
  };
}
