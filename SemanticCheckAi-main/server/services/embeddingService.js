import { pipeline } from '@xenova/transformers';

// In-memory cache for sentence embeddings
const embeddingCache = new Map();

let extractor = null;
let modelLoadFailed = false;
let isLoadingModel = false;
let loadPromise = null;

/**
 * Initializes the Transformers.js feature extraction pipeline
 */
async function getExtractor() {
  if (extractor) return extractor;
  if (modelLoadFailed) return null;

  if (isLoadingModel && loadPromise) {
    return loadPromise;
  }

  isLoadingModel = true;
  loadPromise = (async () => {
    try {
      console.log('🔄 Loading all-MiniLM-L6-v2 embedding pipeline (with 6s network timeout)...');
      
      const loadWithTimeout = Promise.race([
        pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { quantized: true }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Model download timeout (6s limit exceeded)')), 6000))
      ]);

      extractor = await loadWithTimeout;
      console.log('✅ Embedding model ready.');
      return extractor;
    } catch (err) {
      console.warn('⚠️ Transformer load bypassed or offline, utilizing deterministic semantic vectorizer fallback:', err.message);
      modelLoadFailed = true;
      return null;
    } finally {
      isLoadingModel = false;
    }
  })();

  return loadPromise;
}

/**
 * Generates high-quality dense vector embedding for a single text string
 * @param {string} text 
 * @returns {Promise<number[]>}
 */
export async function getEmbedding(text) {
  const normalized = text.trim().toLowerCase();
  if (embeddingCache.has(normalized)) {
    return embeddingCache.get(normalized);
  }

  const pipe = await getExtractor();

  if (pipe) {
    try {
      // Mean pooling & normalization
      const output = await pipe(text, { pooling: 'mean', normalize: true });
      const vector = Array.from(output.data);
      embeddingCache.set(normalized, vector);
      return vector;
    } catch (err) {
      console.warn('Transformer inference error, falling back:', err.message);
    }
  }

  // Robust deterministic semantic vectorizer fallback (384-dimensional)
  const fallbackVec = generateDeterministicVector(text, 384);
  embeddingCache.set(normalized, fallbackVec);
  return fallbackVec;
}

/**
 * Batch generates embeddings for an array of texts
 * @param {string[]} texts 
 * @returns {Promise<number[][]>}
 */
export async function getBatchEmbeddings(texts) {
  const results = [];
  for (const text of texts) {
    results.push(await getEmbedding(text));
  }
  return results;
}

/**
 * Fast deterministic subword, semantic hash & context vectorizer (fallback)
 * Generates normalized 384-dimensional vectors with semantic affinity
 */
function generateDeterministicVector(text, dimensions = 384) {
  const vector = new Array(dimensions).fill(0);
  const words = text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return vector;
  }

  // Synonym / Semantic anchor clusters
  const semanticConcepts = [
    { name: 'learning', terms: ['learn', 'study', 'education', 'student', 'learner', 'academic', 'curriculum', 'knowledge'] },
    { name: 'instruction', terms: ['teach', 'instruct', 'feedback', 'guidance', 'mentor', 'assessment', 'evaluate'] },
    { name: 'improvement', terms: ['improve', 'better', 'enhance', 'advance', 'progress', 'develop', 'gain', 'results'] },
    { name: 'technology', terms: ['digital', 'online', 'platform', 'ai', 'computer', 'software', 'technology', 'system', 'virtual'] },
    { name: 'flexibility', terms: ['flexible', 'schedule', 'location', 'time', 'anytime', 'remote', 'access', 'convenience'] },
    { name: 'customization', terms: ['personal', 'individual', 'tailor', 'customize', 'specific', 'adaptive'] },
    { name: 'challenge', terms: ['weakness', 'difficulty', 'struggle', 'mistake', 'flaw', 'error', 'gap'] },
    { name: 'research', terms: ['research', 'investigate', 'study', 'analysis', 'finding', 'experiment', 'method'] },
    { name: 'achievement', terms: ['achieve', 'success', 'accomplish', 'outcome', 'grade', 'score', 'mastery'] },
    { name: 'communication', terms: ['communicate', 'express', 'discuss', 'collaborate', 'share', 'interact'] }
  ];

  // 1. Concept activations
  semanticConcepts.forEach((concept, cIdx) => {
    let conceptHits = 0;
    for (const word of words) {
      for (const term of concept.terms) {
        if (word.includes(term) || term.includes(word)) {
          conceptHits += 1.5;
        }
      }
    }
    if (conceptHits > 0) {
      const baseIdx = (cIdx * 25) % dimensions;
      for (let j = 0; j < 20; j++) {
        const slot = (baseIdx + j) % dimensions;
        vector[slot] += conceptHits * Math.cos(j * 0.4);
      }
    }
  });

  // 2. Character 3-gram and 4-gram projections
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const weight = 1.0 / Math.sqrt(i + 1);

    for (let len = 3; len <= 4; len++) {
      for (let s = 0; s <= word.length - len; s++) {
        const gram = word.substring(s, s + len);
        let hash = 0;
        for (let k = 0; k < gram.length; k++) {
          hash = (hash * 31 + gram.charCodeAt(k)) >>> 0;
        }
        const index = hash % dimensions;
        vector[index] += weight * 0.8;
      }
    }
  }

  // 3. Word shape & length characteristics
  const lenSlot = words.length % dimensions;
  vector[lenSlot] += 0.5;

  // Normalize vector to unit length
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);

  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] = vector[i] / norm;
    }
  }

  return vector;
}
