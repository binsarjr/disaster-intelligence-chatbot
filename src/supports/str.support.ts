import { CHARS, UnicodeSteganographer } from 'src/supports/unicode.support';

export const whatsappFormat = (text: string) => {
  // replace **text** to *text*
  text = text.replace(/\*\*(.*?)\*\*/g, '*$1*');
  // replace __text__ to _text_
  text = text.replace(/__(.*?)__/g, '_$1_');
  // replace [text](url) to *text* (url)
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '*$1* ($2)');
  // replace [text] to *text*
  text = text.replace(/\[(.*?)\]/g, '*$1*');
  // remove all headings (#)
  text = text.replace(/^#+/gm, '');
  return text;
};

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

export function customSplit(str: string, separator: string, maxParts: number) {
  // Inisialisasi array hasil
  const result = [];

  // Jika string kosong, kembalikan array kosong
  if (str.length === 0) {
    return result;
  }

  // Inisialisasi indeks awal potongan
  let startIndex = 0;

  // Iterasi melalui string untuk mencari separator dan membaginya
  for (let i = 0; i < str.length; i++) {
    // Jika sudah mencapai jumlah maksimal potongan
    if (result.length === maxParts - 1) {
      break;
    }

    // Jika karakter saat ini adalah separator
    if (str[i] === separator) {
      // Potong string dari startIndex hingga i dan tambahkan ke array
      result.push(str.substring(startIndex, i));
      // Update indeks awal potongan
      startIndex = i + 1;
    }
  }

  // Jika ada sisanya setelah iterasi
  if (startIndex < str.length) {
    // Tambahkan sisanya ke array
    result.push(str.substring(startIndex));
  }

  return result;
}
