import { tokenizeWords } from './segmentationService.js';

/**
 * Default configurable detection thresholds
 */
export const DEFAULT_THRESHOLDS = {
  highSemantic: 0.80,
  suspiciousSemantic: 0.65,
  moderateSemantic: 0.50,
  exactLexical: 0.88,
  nearLexical: 0.70,
  paraphraseLexicalMax: 0.65,
};

/**
 * Calculates cosine similarity between two numeric vectors
 * @param {number[]} vecA 
 * @param {number[]} vecB 
 * @returns {number} Value between -1.0 and 1.0 (clamped 0 to 1)
 */
export function calculateCosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  const sim = dotProduct / denominator;
  return Math.max(0, Math.min(1, sim));
}

/**
 * Calculates lexical similarity using token Jaccard and Dice overlap
 * @param {string} textA 
 * @param {string} textB 
 * @returns {number} Value between 0.0 and 1.0
 */
export function calculateLexicalSimilarity(textA, textB) {
  const wordsA = tokenizeWords(textA);
  const wordsB = tokenizeWords(textB);

  if (wordsA.length === 0 || wordsB.length === 0) return 0;

  const setA = new Set(wordsA);
  const setB = new Set(wordsB);

  let intersection = 0;
  for (const word of setA) {
    if (setB.has(word)) {
      intersection++;
    }
  }

  const union = setA.size + setB.size - intersection;
  const jaccard = union > 0 ? intersection / union : 0;

  // Dice coefficient on bigrams for phrase continuity
  const bigramsA = getBigrams(wordsA);
  const bigramsB = getBigrams(wordsB);
  let bigramInter = 0;
  for (const bg of bigramsA) {
    if (bigramsB.has(bg)) {
      bigramInter++;
    }
  }
  const bigramUnion = bigramsA.size + bigramsB.size;
  const bigramDice = bigramUnion > 0 ? (2 * bigramInter) / bigramUnion : 0;

  // Blended lexical score
  return Math.round((jaccard * 0.7 + bigramDice * 0.3) * 1000) / 1000;
}

function getBigrams(words) {
  const bigrams = new Set();
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.add(`${words[i]}_${words[i + 1]}`);
  }
  return bigrams;
}

/**
 * Calculates structural similarity based on sentence length, punctuation cadence, and syntax rhythm
 * @param {string} textA 
 * @param {string} textB 
 * @returns {number} Value between 0.0 and 1.0
 */
export function calculateStructuralSimilarity(textA, textB) {
  const wordsA = tokenizeWords(textA);
  const wordsB = tokenizeWords(textB);

  if (wordsA.length === 0 || wordsB.length === 0) return 0;

  // 1. Length ratio
  const lenRatio = Math.min(wordsA.length, wordsB.length) / Math.max(wordsA.length, wordsB.length);

  // 2. Punctuation patterns (commas, semicolons, dashes)
  const punctA = (textA.match(/[,;:\-–]/g) || []).length;
  const punctB = (textB.match(/[,;:\-–]/g) || []).length;
  const punctRatio = (punctA === 0 && punctB === 0) ? 1.0 : (Math.min(punctA, punctB) + 1) / (Math.max(punctA, punctB) + 1);

  // 3. Average word length similarity
  const avgWordLenA = wordsA.reduce((sum, w) => sum + w.length, 0) / wordsA.length;
  const avgWordLenB = wordsB.reduce((sum, w) => sum + w.length, 0) / wordsB.length;
  const wordLenDiff = Math.abs(avgWordLenA - avgWordLenB);
  const wordLenSim = Math.max(0, 1 - (wordLenDiff / 5));

  const structural = lenRatio * 0.5 + punctRatio * 0.25 + wordLenSim * 0.25;
  return Math.round(structural * 1000) / 1000;
}

/**
 * Calculates paraphrase likelihood based on semantic similarity vs lexical divergence
 * Paraphrase exists when semantic is high, but lexical is moderate/low
 * @param {number} semantic 
 * @param {number} lexical 
 * @returns {number} Value between 0.0 and 1.0
 */
export function calculateParaphraseLikelihood(semantic, lexical) {
  if (semantic < 0.55) return 0;

  // Divergence bonus: the bigger the gap where semantic is high and lexical is low
  const gap = Math.max(0, semantic - lexical);
  
  // Paraphrase probability function
  let likelihood = semantic * (1 + gap * 0.6);
  if (lexical > 0.85) {
    // If lexical is very high, it's an exact/near copy, not a clever paraphrase
    likelihood *= 0.6;
  }
  return Math.min(0.99, Math.max(0, Math.round(likelihood * 1000) / 1000));
}

/**
 * Classifies a sentence comparison into distinct forensic categories
 * @param {number} semantic 
 * @param {number} lexical 
 * @param {object} customThresholds 
 * @returns {object} { type: string, label: string, riskLevel: string, color: string }
 */
export function classifyMatch(semantic, lexical, customThresholds = {}) {
  const t = { ...DEFAULT_THRESHOLDS, ...customThresholds };

  if (semantic >= 0.94 && lexical >= t.exactLexical) {
    return {
      type: 'EXACT_MATCH',
      label: 'Exact Match',
      riskLevel: 'HIGH',
      badgeColor: 'rose',
      description: 'Identical or near-verbatim text with matching vocabulary and phrasing.'
    };
  }

  if (semantic >= 0.85 && lexical >= t.nearLexical) {
    return {
      type: 'NEAR_MATCH',
      label: 'Near Match',
      riskLevel: 'HIGH',
      badgeColor: 'orange',
      description: 'Heavily borrowed wording with minor edits or word deletions.'
    };
  }

  if (semantic >= t.suspiciousSemantic && lexical <= t.paraphraseLexicalMax) {
    return {
      type: 'PARAPHRASED_MATCH',
      label: 'Paraphrased Match',
      riskLevel: semantic >= t.highSemantic ? 'HIGH' : 'SUSPICIOUS',
      badgeColor: 'amber',
      description: 'Same underlying concept expressed through synonym substitutions and altered sentence structure.'
    };
  }

  if (semantic >= t.suspiciousSemantic) {
    return {
      type: 'SEMANTIC_MATCH',
      label: 'Semantic Match',
      riskLevel: semantic >= t.highSemantic ? 'HIGH' : 'SUSPICIOUS',
      badgeColor: 'indigo',
      description: 'Strong conceptual alignment with substantial vocabulary overlap.'
    };
  }

  if (semantic >= t.moderateSemantic) {
    return {
      type: 'MODERATE_SIMILARITY',
      label: 'Moderate Similarity',
      riskLevel: 'MODERATE',
      badgeColor: 'sky',
      description: 'Partial thematic overlap or shared subject domain terminology.'
    };
  }

  return {
    type: 'LOW_SIMILARITY',
    label: 'Low Similarity',
    riskLevel: 'LOW',
    badgeColor: 'emerald',
    description: 'Distinct meaning with standard unrelated content.'
  };
}
