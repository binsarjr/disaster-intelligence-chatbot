import { CHARS, UnicodeSteganographer } from 'src/supports/unicode.support';

export const randomString = (length: number): string => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Ide nya adalah untuk menghindari terlabelkan sebagai spam dengan memberikan random hidden text yang berbeda.
 */
export const injectRandomHiddenText = (text: string) => {
  const stego = new UnicodeSteganographer();
  stego.setUseChars(
    [
      // CHARS['COMBINING GRAPHEME JOINER'],
      // CHARS['ZERO WIDTH SPACE'],
      CHARS['ZERO WIDTH NON-JOINER'],
      CHARS['ZERO WIDTH JOINER'],
      CHARS['LEFT-TO-RIGHT MARK'],
      // CHARS['LINE SEPARATOR'],
      // CHARS['PARAGRAPH SEPARATOR'],
      // CHARS['LEFT-TO-RIGHT EMBEDDING'],
      CHARS['POP DIRECTIONAL FORMATTING'],
      // CHARS['LEFT-TO-RIGHT OVERRIDE'],
      // CHARS['FUNCTION APPLICATION'],
      // CHARS['INVISIBLE TIMES'],
      // CHARS['INVISIBLE SEPARATOR'],
      CHARS['ZERO WIDTH NO-BREAK SPACE'],
    ].join(''),
  );

  return stego.encodeText(text, randomString(10));
};
