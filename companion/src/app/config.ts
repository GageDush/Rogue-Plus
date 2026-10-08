/**
 * Keep external endpoints in one place. Internal navigation uses route IDs,
 * and local URLs resolve against the browser origin, not a deployment domain.
 */
export const runtimeConfig = Object.freeze({
  playPreviewUrl: 'https://alpha-play-integration-rogue-plus.gagedush-bff.workers.dev/play/',
});
export function localAppUrl(path: string, origin: string = window.location.origin): string {
  if (!path.startsWith('/') || path.startsWith('//')) throw new Error('Expected a root-relative application path.');
  return new URL(path, origin).toString();
}
