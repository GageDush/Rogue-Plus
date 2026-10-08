import type Phaser from 'phaser';

export interface RoguePlusModule {
  readonly id: string;
  readonly title: string;
  mount(game: Phaser.Game): () => void;
}
export interface MoveLike { id?: number; name?: string; category?: unknown }
export interface PokemonLike {
  name?: string;
  species?: { name?: string };
  moveset?: Array<{ getMove(): MoveLike }>;
  getName?(): string;
  getAttackDamage?(args: { source: PokemonLike; move: MoveLike; simulated: boolean }): { damage?: number; result?: unknown };
}
export interface SceneLike {
  getPlayerPokemon?(): PokemonLike | undefined;
  getEnemyPokemon?(): PokemonLike | undefined;
  getEnemyField?(): PokemonLike[];
}
export function findBattleScene(game: Phaser.Game): SceneLike | null {
  for (const candidate of game.scene.scenes) {
    const scene = candidate as unknown as SceneLike;
    if (typeof scene.getPlayerPokemon === 'function'
        && (typeof scene.getEnemyPokemon === 'function' || typeof scene.getEnemyField === 'function')) return scene;
  }
  return null;
}
export function pokemonName(p: PokemonLike): string {
  try { return p.getName?.() || p.name || p.species?.name || 'Unknown'; }
  catch { return p.name || 'Unknown'; }
}
