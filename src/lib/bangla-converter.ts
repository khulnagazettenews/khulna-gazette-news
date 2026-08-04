/**
 * Bijoy (ANSI) <-> Unicode Converter for Bengali
 */

// Mapping table for Bijoy to Unicode
const bijoyToUnicodeMap: Record<string, string> = {
  '‘': '‘', '’': '’', '“': '“', '”': '”',
  'à': 'া', 'á': 'ি', 'â': 'ী', 'ã': 'ু', 'ä': 'ূ', 'å': 'ৃ', 'æ': 'ে', 'ç': 'ৈ', 'è': 'ো', 'é': 'ৌ',
  'ô': '্ব', 'õ': '্য', 'ö': '্র', '÷': 'র্', 'ø': 'ঙ্ক', 'ù': 'ঙ্গ', 'ú': 'ঞ্চ', 'û': 'ঞ্ছ', 'ü': 'ঞ্জ',
  'ý': 'জ্ঞ', 'þ': 'ন্ত', 'ÿ': 'ন্থ',
  '¡': 'হ্ন', '¢': 'হ্ম', '£': 'ক্ষ', '¤': 'দ্ধ', '¥': 'দ্ব', '¦': 'দ্ম', '§': 'শ্ব', '¨': 'শ্ম',
  '©': 'শ্র', 'ª': 'স্ক', '«': 'স্ট', '¬': 'স্ফ', '®': 'প্‌', '¯': 'স্ফ',
  '°': '্তু', '±': 'ক্স', '²': 'চ্ছ', '³': 'জ্জ', '´': 'জ্ঞ', 'µ': 'ট্ট', '¶': 'ঠ্ট', '·': 'ড্ড',
  '¸': 'ণ্ট', '¹': 'ণ্ঠ', 'º': 'ণ্ড', '»': 'ত্ত', '¼': 'ত্থ', '½': 'ত্ম', '¾': 'ত্র', '¿': 'দ্দ',
  'À': 'দ্ব', 'Á': 'ধ্ন', 'Â': 'ন্ঠ', 'Ã': 'ন্ড', 'Ä': 'ন্ত', 'Å': 'ন্থ', 'Æ': 'ন্দ', 'Ç': 'ন্ধ',
  'È': 'ন্ন', 'É': 'ন্ব', 'Ê': 'ন্ম', 'Ë': 'প্ট', 'Ì': 'প্ত', 'Í': 'প্ন', 'Î': 'প্প', 'Ï': 'প্স',
  'Ð': 'ব্জ', 'Ñ': 'ব্দ', 'Ò': 'ব্ধ', 'Ó': 'ব্ব', 'Ô': 'ব্ল', 'Õ': 'ভ্ন', 'Ö': 'ম্ন', '×': 'ম্প',
  'Ø': 'ম্ফ', 'Ù': 'ম্ব', 'Ú': 'ম্ভ', 'Û': 'ম্ম', 'Ü': 'ম্ল', 'Ý': 'ল্ক', 'Þ': 'ল্গ', 'ß': 'ল্ট',
  '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
  'a': 'ঋ', 'b': 'ন', 'c': 'এ', 'd': 'ি', 'e': 'ড', 'f': 'া', 'g': '্', 'h': 'ব', 'i': 'হ', 'j': 'ক',
  'k': 'ত', 'l': 'দ', 'm': 'ম', 'n': 'স', 'o': 'গ', 'p': 'ড়', 'q': 'ঙ', 'r': 'প', 's': 'ু', 't': 'ট',
  'u': 'জ', 'v': 'র', 'w': 'ূ', 'x': 'ও', 'y': 'চ', 'z': '্র',
  'A': 'অ', 'B': 'ণ', 'C': 'ঐ', 'D': 'ী', 'E': 'ঢ', 'F': 'া', 'G': '্', 'H': 'ভ', 'I': 'হ', 'J': 'খ',
  'K': 'থ', 'L': 'ধ', 'M': 'শ', 'N': 'ষ', 'O': 'ঘ', 'P': 'ঢ়', 'Q': 'ং', 'R': 'ফ', 'S': 'ূ', 'T': 'ঠ',
  'U': 'ঝ', 'V': 'র', 'W': 'ৌ', 'X': 'ঔ', 'Y': 'ছ', 'Z': '্য'
};

// Character replacement array for Bijoy to Unicode
const bijoyReplaces: [RegExp, string][] = [
  [/অা/g, 'আ'],
  [/এা/g, 'ও'],
  [/ো/g, 'ো'],
  [/ৌ/g, 'ৌ'],
  [/্ি/g, 'ি্'],
  [/্ু/g, 'ু্'],
  [/্ূ/g, 'ূ্'],
  [/্ৃ/g, 'ৃ্'],
  [/্ে/g, 'ে্'],
  [/্ৈ/g, 'ৈ্'],
  [/্ো/g, 'ো্'],
  [/্ৌ/g, 'ৌ্'],
];

export function convertBijoyToUnicode(src: string): string {
  if (!src) return '';
  let text = src;

  // Swap pre-kar positions for 'ে', 'ৈ', 'ি'
  // In Bijoy, E-kar ('ে'), Oi-kar ('ৈ'), I-kar ('ি') come BEFORE the consonant.
  // We need to reorder them in Unicode after the consonant.
  
  // Reorder E-kar 'æ' or 'ে'
  text = text.replace(/([েৈি])([ক-হড়-য়অ-ঔ])/g, '$2$1');
  text = text.replace(/([েৈি])([্][ক-হড়-য়])/g, '$2$1');
  
  let res = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    res += bijoyToUnicodeMap[ch] !== undefined ? bijoyToUnicodeMap[ch] : ch;
  }

  for (const [pattern, replacement] of bijoyReplaces) {
    res = res.replace(pattern, replacement);
  }

  return res;
}

export function convertUnicodeToBijoy(src: string): string {
  if (!src) return '';
  // Inverse map for simple characters
  let res = src;
  
  // Reorder post-kars to pre-kars for Bijoy
  res = res.replace(/([ক-হড়-য়])([েৈি])/g, '$2$1');
  
  const unicodeToBijoyMap: Record<string, string> = {};
  Object.entries(bijoyToUnicodeMap).forEach(([b, u]) => {
    if (!unicodeToBijoyMap[u]) {
      unicodeToBijoyMap[u] = b;
    }
  });

  let output = '';
  for (let i = 0; i < res.length; i++) {
    const ch = res[i];
    output += unicodeToBijoyMap[ch] !== undefined ? unicodeToBijoyMap[ch] : ch;
  }

  return output;
}
