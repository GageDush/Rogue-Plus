/**
 * Retired by the 2026-10-07 architecture overhaul.
 *
 * Canonical runtime sources now live in:
 * - src/reference/*.json for static game/reference data
 * - src/user-data/teams.v1.json for strategy rosters
 * - src/user-data/fusions.v1.json for fusion recipes
 * - src/domain/* for selectors/derived logic
 * - src/ui/components/PokemonSprite.tsx for Pokémon artwork
 *
 * This stub intentionally exports nothing so stale TEAMS/FUSIONS/spriteUrl
 * implementations cannot be reintroduced accidentally.
 */
export {};
