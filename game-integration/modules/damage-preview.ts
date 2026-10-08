import type Phaser from 'phaser';
import { findBattleScene, pokemonName, type RoguePlusModule } from './contracts';

/** Minimal read-only proof of bridge, NOT a complete damage range calculator. */
export const damagePreviewModule: RoguePlusModule = {
  id: 'damage-preview',
  title: 'Damage Preview',
  mount(game: Phaser.Game) {
    const style = document.createElement('style');
    style.textContent = '.rp-launch{position:fixed;z-index:10050;right:12px;top:calc(env(safe-area-inset-top,0px) + 12px);border:0;background:#ff6a35;color:#101010;border-radius:12px;padding:12px;font:800 15px system-ui;cursor:pointer}.rp-panel{position:fixed;z-index:10051;right:12px;top:calc(env(safe-area-inset-top,0px) + 60px);max-width:min(350px,calc(100vw - 24px));max-height:70vh;overflow:auto;padding:15px;background:#101923;color:#fff;border:1px solid #ff6a35;border-radius:12px;font:14px system-ui;box-shadow:0 10px 25px #000b}.rp-panel[hidden]{display:none!important}.rp-panel button{margin:4px 5px 4px 0;padding:8px;background:#28323d;color:#fff;border-radius:8px;border:1px solid #536070;cursor:pointer}.rp-panel p{font-size:12px;color:#bdc8d2;line-height:1.45}';
    document.head.append(style);
    const launch = document.createElement('button');
    launch.className = 'rp-launch'; launch.type = 'button'; launch.textContent = 'R+';
    launch.setAttribute('aria-label', 'Toggle Rogue+ Damage Preview');
    const panel = document.createElement('aside');
    panel.className = 'rp-panel'; panel.hidden = true;
    panel.setAttribute('aria-label','Rogue+ damage preview');
    const heading = document.createElement('strong'); heading.textContent = 'Damage Preview · Alpha';
    const close = document.createElement('button'); close.type = 'button'; close.textContent = 'Close';
    const summary = document.createElement('div');
    const moves = document.createElement('div');
    const output = document.createElement('output');
    const refresh = document.createElement('button'); refresh.type = 'button'; refresh.textContent = 'Refresh battle';
    const note = document.createElement('p');
    note.textContent = 'Simulated result from PokéRogue; not an exact min/max range. Abilities, multi-hit effects and boss mechanics require live validation.';
    panel.append(heading,close,summary,moves,output,refresh,note);
    document.body.append(launch,panel);
    function render() {
      moves.replaceChildren(); output.textContent = '';
      const scene = findBattleScene(game);
      if (!scene?.currentBattle) {
        summary.textContent = 'No active battle. Start a battle and refresh.';
        return;
      }
      let attacker;
      let target;
      try {
        attacker = scene.getPlayerPokemon?.();
        target = scene.getEnemyPokemon?.() || scene.getEnemyField?.()[0];
      } catch {
        summary.textContent = 'Battle is still initializing. Refresh after both Pokémon appear.';
        return;
      }
      if (!attacker || !target) {
        summary.textContent = 'No active combatants. Refresh once the turn begins.';
        return;
      }
      summary.textContent = pokemonName(attacker) + ' → ' + pokemonName(target);
      const moveList = (attacker.moveset || []).map(x => x.getMove()).filter(Boolean);
      for (const move of moveList) {
        const choice = document.createElement('button');
        choice.type = 'button'; choice.textContent = move.name || 'Move ' + String(move.id || '?');
        choice.addEventListener('click', event => {
          event.stopPropagation();
          try {
            if (!target.getAttackDamage) { output.textContent = 'Damage method unavailable in this game build.'; return; }
            const result = target.getAttackDamage({ source: attacker, move, simulated: true });
            output.textContent = typeof result?.damage === 'number'
              ? (move.name || 'Move') + ': ' + String(Math.round(result.damage)) + ' simulated damage'
              : 'No supported damage result for this move.';
          } catch (error) {
            output.textContent = 'Preview unavailable: ' + (error instanceof Error ? error.message : String(error));
          }
        });
        moves.append(choice);
      }
      if (!moveList.length) output.textContent = 'No selectable moves in this battle state.';
    }
    function toggle() { panel.hidden = !panel.hidden; if (!panel.hidden) render(); }
    launch.addEventListener('click',toggle); close.addEventListener('click',toggle); refresh.addEventListener('click',render);
    return () => { launch.remove(); panel.remove(); style.remove(); };
  }
};
