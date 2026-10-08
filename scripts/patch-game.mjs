import { existsSync, copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const entry = resolve(root, 'upstream/src/main.ts');
if (!existsSync(entry)) throw new Error('Missing upstream/src/main.ts; run npm run setup:upstream first.');
const files = ['bridge.ts', 'modules/contracts.ts', 'modules/damage-preview.ts'];
for (const file of files) {
  const dst = resolve(root, 'upstream/src/rogue-plus', file);
  mkdirSync(dirname(dst), { recursive: true });
  copyFileSync(resolve(root, 'game-integration', file), dst);
}
let text = readFileSync(entry, 'utf8');
const anchor = 'import Phaser from "phaser";';
const insertion = 'import { installRoguePlusBridge } from "./rogue-plus/bridge";';
if (!text.includes(insertion)) {
  if (!text.includes(anchor)) throw new Error('Upstream import anchor changed; aborting patch.');
  text = text.replace(anchor, anchor + '\n' + insertion);
}
const bootAnchor = '  game.sound.pauseOnBlur = isMobile();';
const hook = '  installRoguePlusBridge(game);';
if (!text.includes(hook)) {
  if (!text.includes(bootAnchor)) throw new Error('Upstream boot anchor changed; aborting patch.');
  text = text.replace(bootAnchor, bootAnchor + '\n' + hook);
}
writeFileSync(entry, text);
const envPath = resolve(root, 'upstream/.env.production');
let envText = readFileSync(envPath, 'utf8');
if (process.env.ROGUE_PLUS_GAME_MODE !== 'official') {
  // The official API normally allows only the official game's browser origin.
  // Guest mode is the game's own localStorage-based play/save path; no API proxy.
  if (!/^VITE_BYPASS_LOGIN=[01]$/m.test(envText)) {
    throw new Error('Upstream login toggle changed; aborting Guest mode patch.');
  }
  envText = envText.replace(/^VITE_BYPASS_LOGIN=[01]$/m, 'VITE_BYPASS_LOGIN=1');
  writeFileSync(envPath, envText);
  console.log('Rogue+ Play using official PokéRogue local Guest save mode.');
}
console.log('Game extension hook installed without modifying battle logic.');
