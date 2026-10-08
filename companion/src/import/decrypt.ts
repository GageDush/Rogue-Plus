import CryptoJS from 'crypto-js';

const SAVE_KEY = 'x0i2O7WRiANTqPmZ';

export function decryptSaveText(encryptedText: string): string {
  const clean = encryptedText.trim().replace(/\s+/g, '');
  if (!clean) throw new Error('The selected save is empty.');
  const bytes = CryptoJS.AES.decrypt(clean, SAVE_KEY);
  const plain = bytes.toString(CryptoJS.enc.Utf8);
  if (!plain) {
    throw new Error('Could not decrypt this .prsv. It may not be a PokéRogue system save.');
  }
  return plain;
}
