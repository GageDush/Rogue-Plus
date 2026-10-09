import type { DexReferencePack, DexSpeciesReference, ReferenceValue } from '../reference/dex-contract';
import type { PokemonSourceFields } from './types';

export type OptionAvailability = 'available' | 'locked' | 'unknown';
export interface StarterOption {
  id: number;
  name: string;
  availability: OptionAvailability;
  source: 'level' | 'egg' | 'ability' | 'passive';
  /** Egg slots use the original zero-based reference order. */
  eggSlot?: number;
  abilitySlots?: readonly ('first' | 'second' | 'hidden')[];
  slotAvailability?: Partial<Record<'first' | 'second' | 'hidden', OptionAvailability>>;
  enabled?: boolean | null;
}
export interface StarterFormOptions {
  index: number;
  name: string;
  key: string;
  availability: OptionAvailability | 'ineligible';
  moves: StarterOption[];
  abilities: StarterOption[];
  passive: StarterOption | null;
}
export interface StarterSelection {
  starterId: number;
  isStarter: boolean;
  forms: StarterFormOptions[];
  boundary: string;
  limitation?: string;
}
const value = <T>(fact: ReferenceValue<T>): T | undefined => fact.status === 'known' ? fact.value : undefined;
function mask(input: unknown, max: number): number | undefined {
  return typeof input === 'number' && Number.isInteger(input) && input >= 0 && input <= max ? input : undefined;
}
function caught(input: unknown): bigint | undefined {
  if (typeof input !== 'string' || !/^\d+$/.test(input)) return undefined;
  return BigInt(input);
}
function flag(maskValue: number | undefined, bit: number): OptionAvailability {
  return maskValue === undefined ? 'unknown' : maskValue & bit ? 'available' : 'locked';
}
function withinForm(state: OptionAvailability, form: StarterFormOptions['availability']): OptionAvailability {
  if (form === 'locked') return 'locked';
  if (form !== 'available' || state === 'unknown') return 'unknown';
  return state;
}

/** Standard game selection only. No mutation, saved moveset guessing or challenge simulation. */
export function getStarterSelection(
  species: DexSpeciesReference,
  pack: DexReferencePack,
  ownership?: Partial<PokemonSourceFields> | null,
  compatible = true,
): StarterSelection {
  const rules = value(pack.selectionRules);
  const result: StarterSelection = { starterId: species.id, isStarter: value(species.originalStarterCost) != null,
    forms: [], boundary: rules?.boundary ?? 'Starter selection reference unavailable.' };
  if (!result.isStarter) { result.limitation = 'Reference species; select its associated starter instead.'; return result; }
  if (!rules || species.forms.status !== 'known') { result.limitation = 'Starter form/selection reference unavailable.'; return result; }
  const source = compatible ? ownership : undefined;
  if (!compatible) result.limitation = 'Import/reference revisions differ; availability is unknown.';
  else if (!source) result.limitation = 'No imported ownership for this starter; availability is unknown.';
  const attr = caught(source?.caughtAttr);
  const abilityMask = mask(source?.abilityMask, 7), eggMask = mask(source?.eggMoveMask, 15), passiveMask = mask(source?.passiveMask, 3);
  const moves = new Map(pack.moves.map(move => [move.id, move]));
  const abilities = new Map(pack.abilities.map(ability => [ability.id, ability]));
  for (const form of species.forms.value) {
    const eligible = value(form.starterSelectable), obtainable = value(form.obtainable);
    const formAvailability = eligible === false || obtainable === false ? 'ineligible'
      : eligible === undefined || obtainable === undefined || attr === undefined ? 'unknown'
      : attr & (BigInt(rules.defaultFormBit) << BigInt(form.index)) ? 'available' : 'locked';
    const options: StarterFormOptions = { index: form.index, key: form.key, name: form.name,
      availability: formAvailability, moves: [], abilities: [], passive: null };
    result.forms.push(options);
    if (formAvailability === 'ineligible') continue;
    const addMove = (id: number, availability: OptionAvailability, source: 'level' | 'egg', eggSlot?: number) => {
      const move = moves.get(id);
      if (!move) return; // Missing named coverage is never a invented option.
      const state = withinForm(availability, formAvailability);
      const existing = options.moves.find(option => option.id === id);
      if (existing) {
        if (state === 'available' || existing.availability === 'locked' && state === 'unknown') existing.availability = state;
        return;
      }
      options.moves.push({ id, name: move.name, availability: state, source, ...(eggSlot === undefined ? {} : {eggSlot}) });
    };
    if (form.levelMoves.status === 'known') for (const move of form.levelMoves.value) {
      if (move.level >= rules.minimumLevel && move.level <= rules.maximumLevel) addMove(move.moveId, 'available', 'level');
    }
    // The game uses hasOwn(speciesEggMoves, starterId), not an inherited root's table.
    if (value(species.eggMoveSourceId) === species.id && species.eggMoveIds.status === 'known') {
      species.eggMoveIds.value.forEach((id, slot) => addMove(id, flag(eggMask, 1 << slot), 'egg', slot));
    }
    if (form.abilities.status === 'known') {
      const slots = form.abilities.value;
      for (const [slot,id] of [['first',slots.first],['second',slots.second ?? slots.first],['hidden',slots.hidden]] as const) {
        if (id === null) continue;
        const ability = abilities.get(id); if (!ability) continue;
        const state = withinForm(flag(abilityMask,rules.abilityFlags[slot]),formAvailability);
        const existing = options.abilities.find(option => option.id === id);
        if (existing) {
          existing.abilitySlots = [...(existing.abilitySlots ?? []),slot];
          existing.slotAvailability = {...existing.slotAvailability,[slot]:state};
          if (state === 'available' || existing.availability === 'locked' && state === 'unknown') existing.availability = state;
        } else options.abilities.push({id,name:ability.name,source:'ability',availability:state,abilitySlots:[slot],slotAvailability:{[slot]:state}});
      }
    }
    const passiveId = value(form.passiveAbilityId);
    const passive = passiveId == null ? undefined : abilities.get(passiveId);
    if (passive) options.passive = {id:passive.id,name:passive.name,source:'passive',
      availability:withinForm(flag(passiveMask,rules.passiveFlags.unlocked),formAvailability),
      enabled:passiveMask === undefined ? null : Boolean(passiveMask & rules.passiveFlags.enabled)};
  }
  return result;
}
