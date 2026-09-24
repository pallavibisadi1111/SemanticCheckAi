/**
 * Cleans text and splits into cohesive, clean sentences.
 */

// Common academic abbreviations that should not trigger sentence boundaries
const ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'vs', 'etc',
  'al', 'i.e', 'e.g', 'fig', 'inc', 'ltd', 'dept', 'vol', 'no',
  'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
  'u.s', 'u.k', 'e.u'
]);

/**
 * Normalizes text whitespace, quotes, and punctuation
 * @param {string} text 
 * @returns {string}
 */
export function cleanText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2013|\u2014/g, '-')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/**
 * Splits raw text into an array of clean sentences
 * @param {string} text 
 * @returns {Array<{ id: number, text: string, wordCount: number, paragraphIndex: number }>}
 */
export function segmentSentences(text) {
  const cleaned = cleanText(text);
  if (!cleaned) return [];

  const paragraphs = cleaned.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const sentences = [];
  let globalId = 1;

  paragraphs.forEach((paragraph, pIdx) => {
    // Regex matches sentence-ending punctuation followed by space or end
    const rawTokens = paragraph.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [paragraph];
    
    let buffer = '';

    for (let i = 0; i < rawTokens.length; i++) {
      const token = rawTokens[i].trim();
      if (!token) continue;

      buffer = buffer ? `${buffer} ${token}` : token;

      // Check if the end of buffer might be an abbreviation
      const lastWordMatch = buffer.match(/([a-zA-Z.]+)[.!?]$/);
      if (lastWordMatch) {
        const word = lastWordMatch[1].toLowerCase().replace(/\.$/, '');
        if (ABBREVIATIONS.has(word) && i < rawTokens.length - 1) {
          // Keep buffering because this is likely an abbreviation
          continue;
        }
      }

      // If buffer is substantial enough (at least 3 characters)
      if (buffer.length >= 3) {
        const words = tokenizeWords(buffer);
        if (words.length > 0) {
          sentences.push({
            id: globalId++,
            text: buffer,
            wordCount: words.length,
            paragraphIndex: pIdx + 1,
          });
        }
        buffer = '';
      }
    }

    if (buffer.trim().length >= 3) {
      const words = tokenizeWords(buffer);
      if (words.length > 0) {
        sentences.push({
          id: globalId++,
          text: buffer.trim(),
          wordCount: words.length,
          paragraphIndex: pIdx + 1,
        });
      }
    }
  });

  return sentences;
}

/**
 * Tokenizes sentence into lowercase alphanumeric words
 * @param {string} sentence 
 * @returns {string[]}
 */
export function tokenizeWords(sentence) {
  if (!sentence) return [];
  return sentence
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0);
}
