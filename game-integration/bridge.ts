import type Phaser from 'phaser';
import { damagePreviewModule } from './modules/damage-preview';
import type { RoguePlusModule } from './modules/contracts';

const modules: RoguePlusModule[] = [damagePreviewModule];
const enabled = new Map<string, () => void>();
const byId = new Map(modules.map(module => [module.id, module]));

export function installRoguePlusBridge(game: Phaser.Game): void {
  function enable(id: string): boolean {
    if (enabled.has(id)) return true;
    const module = byId.get(id);
    if (!module) return false;
    try {
      enabled.set(id, module.mount(game));
      return true;
    } catch (error) {
      console.error('[Rogue+] Extension failed safely', id, error);
      return false;
    }
  }
  function disable(id: string): void {
    const stop = enabled.get(id);
    if (!stop) return;
    try { stop(); } finally { enabled.delete(id); }
  }
  Object.defineProperty(window, 'RoguePlusModules', {
    configurable: true,
    value: Object.freeze({
      version: '0.1.0-alpha',
      list: () => modules.map(module => ({ id: module.id, title: module.title, enabled: enabled.has(module.id) })),
      enable,
      disable
    })
  });
  enable('damage-preview');
}
