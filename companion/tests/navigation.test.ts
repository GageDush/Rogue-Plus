import { describe, expect, it } from 'vitest';
import { isNavigationActive, navigation, pageTitles, primaryNavigation, secondaryNavigation } from '../src/app/navigation';
import { localAppUrl, runtimeConfig } from '../src/app/config';

describe('Rogue+ hybrid navigation contract', () => {
  it('has five unique primary destinations in the approved order', () => {
    expect(primaryNavigation.map(item => item.id)).toEqual(['home', 'dex', 'build', 'run', 'goals']);
    expect(primaryNavigation.map(item => item.label)).toEqual(['Home', 'Dex', 'Build', 'Run', 'Goals']);
    expect(new Set(navigation.map(item => item.id)).size).toBe(navigation.length);
  });

  it('identifies unfinished screens and preserves truthful labels', () => {
    expect(primaryNavigation.find(item => item.id === 'build')?.status).toBe('preview');
    expect(primaryNavigation.find(item => item.id === 'run')?.status).toBe('planned');
    expect(primaryNavigation.find(item => item.id === 'goals')?.status).toBe('preview');
    expect(secondaryNavigation.find(item => item.id === 'modules')?.status).toBe('planned');
    expect(pageTitles.build).toBe('Build Library');
    expect(pageTitles.goals).toBe('Collection Goals');
    expect(isNavigationActive('detail', 'dex')).toBe(true);
    expect(isNavigationActive('detail', 'build')).toBe(false);
  });

  it('supports changing domains without hard-coded internal routes', () => {
    expect(localAppUrl('/dex', 'https://rogueplus.example')).toBe('https://rogueplus.example/dex');
    expect(localAppUrl('/settings', 'https://other.example')).toBe('https://other.example/settings');
    expect(() => localAppUrl('https://not-local.test/', 'https://other.example')).toThrow();
    expect(() => localAppUrl('//evil.test/path', 'https://other.example')).toThrow();
    expect(runtimeConfig.playPreviewUrl).toMatch(/^https:\/\//);
    expect(new Set(Object.keys(runtimeConfig))).toEqual(new Set(['playPreviewUrl']));
  });
});
