import { getTeamImpactForPokemonName } from './teams';
import type { ChangeRecord, PokemonRecord, Snapshot } from './types';

export function compareSnapshots(previous: Snapshot | null, current: Snapshot): ChangeRecord[] {
  if (!previous || previous.schemaVersion !== 2) return [];
  const old = new Map(previous.pokemon.map(pokemon => [pokemon.id, pokemon]));
  const changes: ChangeRecord[] = [];

  const add = (
    pokemon: PokemonRecord,
    category: string,
    before: unknown,
    after: unknown,
    importance: ChangeRecord['importance']
  ) => {
    const teamImpact = getTeamImpactForPokemonName(pokemon.name);
    changes.push({
      timestamp: current.saveTimestamp,
      importId: current.importId,
      pokemon: pokemon.name,
      pokemonId: pokemon.id,
      category,
      before: String(before),
      after: String(after),
      importance: teamImpact && importance !== 'Major' ? 'Team' : importance,
      teamImpact,
      sourceFile: current.sourceFile,
    });
  };

  current.pokemon.forEach(pokemon => {
    const prior = old.get(pokemon.id);
    if (!prior) return;
    if (!prior.passiveUnlocked && pokemon.passiveUnlocked) {
      add(pokemon, 'Passive', 'Locked', 'Unlocked', 'Major');
    }

    const currentEggs = [pokemon.egg1, pokemon.egg2, pokemon.egg3, pokemon.egg4];
    const priorEggs = [prior.egg1, prior.egg2, prior.egg3, prior.egg4];
    currentEggs.forEach((unlocked, index) => {
      if (!priorEggs[index] && unlocked) {
        add(pokemon, 'Egg Move ' + String(index + 1), 'Locked', 'Unlocked', pokemon.eggCount === 4 ? 'Complete' : 'Improvement');
      }
    });

    const currentIvs = [pokemon.ivHp, pokemon.ivAtk, pokemon.ivDef, pokemon.ivSpa, pokemon.ivSpd, pokemon.ivSpe];
    const priorIvs = [prior.ivHp, prior.ivAtk, prior.ivDef, prior.ivSpa, prior.ivSpd, prior.ivSpe];
    const labels = ['IV HP', 'IV Atk', 'IV Def', 'IV SpA', 'IV SpD', 'IV Spe'];
    currentIvs.forEach((value, index) => {
      if (value > priorIvs[index]) {
        add(pokemon, labels[index], priorIvs[index], value, pokemon.perfectIvs === 6 ? 'Major' : 'Improvement');
      }
    });

    (['t1', 't2', 't3'] as const).forEach(tier => {
      if (!prior[tier] && pokemon[tier]) {
        add(pokemon, 'Shiny ' + tier.toUpperCase(), 'Locked', 'Unlocked', tier === 't3' ? 'Major' : 'Improvement');
      }
    });

    if (pokemon.costReductions > prior.costReductions) {
      add(pokemon, 'Cost Reduction', prior.costReductions, pokemon.costReductions, pokemon.costReductions === 2 ? 'Complete' : 'Improvement');
    }
    if (pokemon.natureCount > prior.natureCount) {
      add(pokemon, 'Natures', prior.natureCount, pokemon.natureCount, 'Improvement');
    }
    if (pokemon.classicWins > prior.classicWins) {
      add(pokemon, 'Classic Wins', prior.classicWins, pokemon.classicWins, 'Improvement');
    }
    if (!prior.haUnlocked && pokemon.haUnlocked) {
      add(pokemon, 'Hidden Ability', 'Locked', 'Unlocked', 'Major');
    }
    if (!prior.a2Unlocked && pokemon.a2Unlocked) {
      add(pokemon, 'Ability 2', 'Locked', 'Unlocked', 'Improvement');
    }
  });

  return changes;
}
