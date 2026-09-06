/**
 * Vietnamese Telex typing engine.
 * Converts telex keys (s, f, r, x, j, w, aa, ee, oo, dd) to proper Vietnamese diacritics.
 */

const VOWEL_MAP = {
  // Plain
  'a': { s: 'á', f: 'à', r: 'ả', x: 'ã', j: 'ạ' },
  'ă': { s: 'ắ', f: 'ằ', r: 'ẳ', x: 'ẵ', j: 'ặ' },
  'â': { s: 'ấ', f: 'ầ', r: 'ẩ', x: 'ẫ', j: 'ậ' },
  'e': { s: 'é', f: 'è', r: 'ẻ', x: 'ẽ', j: 'ẹ' },
  'ê': { s: 'ế', f: 'ề', r: 'ể', x: 'ễ', j: 'ệ' },
  'i': { s: 'í', f: 'ì', r: 'ỉ', x: 'ĩ', j: 'ị' },
  'o': { s: 'ó', f: 'ò', r: 'ỏ', x: 'õ', j: 'ọ' },
  'ô': { s: 'ố', f: 'ồ', r: 'ổ', x: 'ỗ', j: 'ộ' },
  'ơ': { s: 'ớ', f: 'ờ', r: 'ở', x: 'ỡ', j: 'ợ' },
  'u': { s: 'ú', f: 'ù', r: 'ủ', x: 'ũ', j: 'ụ' },
  'ư': { s: 'ứ', f: 'ừ', r: 'ử', x: 'ữ', j: 'ự' },
  'y': { s: 'ý', f: 'ỳ', r: 'ỷ', x: 'ỹ', j: 'ỵ' },
  // Capitals
  'A': { s: 'Á', f: 'À', r: 'Ả', x: 'Ã', j: 'Ạ' },
  'Ă': { s: 'Ắ', f: 'Ằ', r: 'Ẳ', x: 'Ẵ', j: 'Ặ' },
  'Â': { s: 'Ấ', f: 'Ầ', r: 'Ẩ', x: 'Ẫ', j: 'Ậ' },
  'E': { s: 'É', f: 'È', r: 'Ẻ', x: 'Ẽ', j: 'Ẹ' },
  'Ê': { s: 'Ế', f: 'Ề', r: 'Ể', x: 'Ễ', j: 'Ệ' },
  'I': { s: 'Í', f: 'Ì', r: 'Ỉ', x: 'Ĩ', j: 'Ị' },
  'O': { s: 'Ó', f: 'Ò', r: 'Ỏ', x: 'Õ', j: 'Ọ' },
  'Ô': { s: 'Ố', f: 'Ồ', r: 'Ổ', x: 'Ỗ', j: 'Ộ' },
  'Ơ': { s: 'Ớ', f: 'Ờ', r: 'Ở', x: 'Ỡ', j: 'Ợ' },
  'U': { s: 'Ú', f: 'Ù', r: 'Ủ', x: 'Ũ', j: 'Ụ' },
  'Ư': { s: 'Ứ', f: 'Ừ', r: 'Ử', x: 'Ữ', j: 'Ự' },
  'Y': { s: 'Ý', f: 'Ỳ', r: 'Ỷ', x: 'Ỹ', j: 'Ỵ' },
};

const BASE_VOWELS = {
  'á': 'a', 'à': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
  'ắ': 'ă', 'ằ': 'ă', 'ẳ': 'ă', 'ẵ': 'ă', 'ặ': 'ă',
  'ấ': 'â', 'ầ': 'â', 'ẩ': 'â', 'ẫ': 'â', 'ậ': 'â',
  'é': 'e', 'è': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
  'ế': 'ê', 'ề': 'ê', 'ể': 'ê', 'ễ': 'ê', 'ệ': 'ê',
  'í': 'i', 'ì': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
  'ó': 'o', 'ò': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
  'ố': 'ô', 'ồ': 'ô', 'ổ': 'ô', 'ỗ': 'ô', 'ộ': 'ô',
  'ớ': 'ơ', 'ờ': 'ơ', 'ở': 'ơ', 'ỡ': 'ơ', 'ợ': 'ơ',
  'ú': 'u', 'ù': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
  'ứ': 'ư', 'ừ': 'ư', 'ử': 'ư', 'ữ': 'ư', 'ự': 'ư',
  'ý': 'y', 'ỳ': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
};

/**
 * Applies a single keystroke using Vietnamese Telex rules.
 * @param {string} text - The current full input text
 * @param {string} char - The typed character
 * @returns {string} The updated text with telex applied
 */
export function applyTelexKey(text, char) {
  if (!text) {
    if (char === 'd' || char === 'D') return char;
    if (char === 'w' || char === 'W') return char === 'W' ? 'Ư' : 'ư';
    return char;
  }

  const lastChar = text.slice(-1);
  const lowerChar = char.toLowerCase();

  // 1. dd -> đ / DD -> Đ
  if (lowerChar === 'd' && (lastChar === 'd' || lastChar === 'D')) {
    const isUpper = lastChar === 'D';
    return text.slice(0, -1) + (isUpper ? 'Đ' : 'đ');
  }

  // 2. aa -> â, ee -> ê, oo -> ô
  if ((lowerChar === 'a' && (lastChar === 'a' || lastChar === 'A')) ||
      (lowerChar === 'e' && (lastChar === 'e' || lastChar === 'E')) ||
      (lowerChar === 'o' && (lastChar === 'o' || lastChar === 'O'))) {
    const isUpper = lastChar === lastChar.toUpperCase();
    const map = {
      a: isUpper ? 'Â' : 'â',
      e: isUpper ? 'Ê' : 'ê',
      o: isUpper ? 'Ô' : 'ô',
    };
    return text.slice(0, -1) + map[lowerChar];
  }

  // 3. w rules: aw -> ă, ow -> ơ, uw -> ư, or standalone w -> ư
  if (lowerChar === 'w') {
    if (lastChar === 'a' || lastChar === 'A') {
      return text.slice(0, -1) + (lastChar === 'A' ? 'Ă' : 'ă');
    }
    if (lastChar === 'o' || lastChar === 'O') {
      return text.slice(0, -1) + (lastChar === 'O' ? 'Ơ' : 'ơ');
    }
    if (lastChar === 'u' || lastChar === 'U') {
      return text.slice(0, -1) + (lastChar === 'U' ? 'Ư' : 'ư');
    }
    return text + (char === 'W' ? 'Ư' : 'ư');
  }

  // 4. Tone marks (s, f, r, x, j) on the latest word
  if (['s', 'f', 'r', 'x', 'j'].includes(lowerChar)) {
    // Find vowels in the last word
    const words = text.split(' ');
    const lastWord = words[words.length - 1];

    // Find the right vowel to place mark
    // Prioritize main vowels: ê, ô, ơ, â, ă, ư or last vowel
    let targetIndex = -1;
    for (let i = lastWord.length - 1; i >= 0; i--) {
      const c = lastWord[i];
      const base = BASE_VOWELS[c] || c;
      if (VOWEL_MAP[base]) {
        if (['ê', 'ô', 'ơ', 'â', 'ă', 'ư', 'Ê', 'Ô', 'Ơ', 'Â', 'Ă', 'Ư'].includes(base)) {
          targetIndex = i;
          break;
        }
        if (targetIndex === -1) {
          targetIndex = i;
        }
      }
    }

    if (targetIndex !== -1) {
      const originalVowel = lastWord[targetIndex];
      const baseVowel = BASE_VOWELS[originalVowel] || originalVowel;
      const map = VOWEL_MAP[baseVowel];

      if (map && map[lowerChar]) {
        // If already has this tone mark, undo it (e.g. á + s -> as)
        if (originalVowel === map[lowerChar]) {
          const undoneWord = lastWord.slice(0, targetIndex) + baseVowel + lastWord.slice(targetIndex + 1) + char;
          words[words.length - 1] = undoneWord;
          return words.join(' ');
        }
        const markedVowel = map[lowerChar];
        const newWord = lastWord.slice(0, targetIndex) + markedVowel + lastWord.slice(targetIndex + 1);
        words[words.length - 1] = newWord;
        return words.join(' ');
      }
    }
  }

  return text + char;
}
