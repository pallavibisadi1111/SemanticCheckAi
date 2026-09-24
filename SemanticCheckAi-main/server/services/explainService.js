import { tokenizeWords } from './segmentationService.js';
import { calculateCosineSimilarity, calculateLexicalSimilarity, calculateStructuralSimilarity, classifyMatch } from './similarityService.js';

// Common English stopwords to isolate content/concept words
const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'could', 'did', 'do', 'does', 'doing', 'down', 'during',
  'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers',
  'herself', 'him', 'himself', 'his', 'how',
  'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself',
  'just', 'me', 'more', 'most', 'my', 'myself',
  'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'she', 'should', 'so', 'some', 'such',
  'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours'
]);

// Known academic semantic synonym pairs
const SYNONYM_PAIRS = [
  ['student', 'learner'],
  ['students', 'learners'],
  ['academic', 'educational'],
  ['performance', 'result'],
  ['performance', 'results'],
  ['personalized', 'individualized'],
  ['personalized', 'tailored'],
  ['feedback', 'guidance'],
  ['feedback', 'assessment'],
  ['improve', 'enhance'],
  ['improve', 'boost'],
  ['improve', 'achieve'],
  ['weakness', 'weaknesses'],
  ['weakness', 'deficiency'],
  ['weakness', 'difficulty'],
  ['online', 'digital'],
  ['platform', 'system'],
  ['platforms', 'systems'],
  ['flexibility', 'convenience'],
  ['different', 'various'],
  ['location', 'place'],
  ['schedule', 'time'],
  ['material', 'resource'],
  ['materials', 'resources'],
  ['access', 'study'],
  ['technology', 'technologies'],
  ['artificial', 'automated'],
  ['transform', 'reshape'],
  ['transforming', 'reshaping'],
  ['transforming', 'changing'],
  ['education', 'learning'],
  ['institution', 'school'],
  ['institutions', 'schools'],
  ['method', 'approach'],
  ['methods', 'approaches'],
  ['analyze', 'evaluate'],
  ['create', 'generate'],
  ['show', 'demonstrate'],
  ['show', 'indicate'],
  ['important', 'critical'],
  ['significant', 'substantial']
];

/**
 * Generates an in-depth, explainable forensic audit for why a sentence pair was flagged
 * @param {string} sentenceA 
 * @param {string} sentenceB 
 * @param {number} semanticScore 
 * @param {number} lexicalScore 
 * @returns {object} Detailed explanation object
 */
export function explainFlaggedMatch(sentenceA, sentenceB, semanticScore, lexicalScore) {
  const wordsA = tokenizeWords(sentenceA);
  const wordsB = tokenizeWords(sentenceB);

  const contentWordsA = wordsA.filter(w => !STOPWORDS.has(w));
  const contentWordsB = wordsB.filter(w => !STOPWORDS.has(w));

  const setA = new Set(contentWordsA);
  const setB = new Set(contentWordsB);

  // Exact shared content keywords
  const sharedKeywords = [];
  for (const w of setA) {
    if (setB.has(w)) {
      sharedKeywords.push(w);
    }
  }

  // Detect synonym mappings
  const detectedSubstitutions = [];
  for (const wordA of setA) {
    for (const wordB of setB) {
      if (wordA !== wordB) {
        const isSyn = SYNONYM_PAIRS.some(([s1, s2]) => 
          (wordA.includes(s1) && wordB.includes(s2)) || 
          (wordA.includes(s2) && wordB.includes(s1))
        );
        if (isSyn) {
          detectedSubstitutions.push({ from: wordA, to: wordB });
        }
      }
    }
  }

  // Deduplicate substitutions
  const uniqueSubstitutions = [];
  const seenPairs = new Set();
  for (const sub of detectedSubstitutions) {
    const key = `${sub.from}->${sub.to}`;
    if (!seenPairs.has(key)) {
      seenPairs.add(key);
      uniqueSubstitutions.push(sub);
    }
  }

  // Structural & syntactic signals
  const lenDiff = Math.abs(wordsA.length - wordsB.length);
  const lengthSimilar = lenDiff <= 4;
  const structSim = calculateStructuralSimilarity(sentenceA, sentenceB);

  // Signals checklist
  const signals = [];

  if (semanticScore >= 0.70) {
    signals.push({
      detected: true,
      name: 'Shared Core Concept',
      description: 'Both sentences communicate identical underlying thematic assertions and logical objectives.'
    });
  }

  if (sharedKeywords.length > 0 || uniqueSubstitutions.length > 0) {
    signals.push({
      detected: true,
      name: 'Matched Subject & Focus',
      description: `Primary subject matter matches (${sharedKeywords.slice(0, 3).join(', ') || 'parallel entities detected'}).`
    });
  }

  if (uniqueSubstitutions.length > 0) {
    signals.push({
      detected: true,
      name: 'Vocabulary Substitution (Paraphrasing)',
      description: `Direct synonym substitutions identified: ${uniqueSubstitutions.slice(0, 3).map(s => `"${s.from}" ↔ "${s.to}"`).join(', ')}.`
    });
  } else if (lexicalScore < 0.55 && semanticScore >= 0.65) {
    signals.push({
      detected: true,
      name: 'Alternative Lexical Realization',
      description: 'Low direct vocabulary overlap with high semantic alignment suggests systemic rewording.'
    });
  }

  if (structSim >= 0.70) {
    signals.push({
      detected: true,
      name: 'Parallel Syntactic Progression',
      description: 'Sentence lengths, clause rhythm, and grammatical tempo follow an identical structural pattern.'
    });
  } else {
    signals.push({
      detected: true,
      name: 'Restructured Syntax',
      description: 'Active/passive voice shifts or clause reordering used to disguise conceptual duplication.'
    });
  }

  // Outcome / Conclusion alignment
  if (semanticScore >= 0.75) {
    signals.push({
      detected: true,
      name: 'Identical Consequence / Outcome',
      description: 'Both statements lead to the same practical conclusion, effect, or recommendation.'
    });
  }

  // Confidence calculation
  let confidence = 'High';
  if (semanticScore < 0.65) confidence = 'Moderate';
  if (semanticScore >= 0.85) confidence = 'Very High';

  const classification = classifyMatch(semanticScore, lexicalScore);

  // Dynamic rationale summary
  let rationale = '';
  if (classification.type === 'EXACT_MATCH') {
    rationale = 'The two sentences are verbatim or near-verbatim duplicates with identical phrasing and vocabulary structure.';
  } else if (classification.type === 'PARAPHRASED_MATCH') {
    rationale = `The sentences convey the exact same thought (${Math.round(semanticScore * 100)}% semantic match), but use alternate vocabulary (${Math.round(lexicalScore * 100)}% lexical match). ${uniqueSubstitutions.length > 0 ? `Substitutions like ${uniqueSubstitutions.slice(0, 2).map(s => `"${s.from}" for "${s.to}"`).join(', ')} indicate deliberate rewording.` : 'Different words are used to convey the same thesis.'}`;
  } else if (classification.type === 'SEMANTIC_MATCH') {
    rationale = 'The sentences share substantive conceptual overlap and common technical terminology, indicating shared authorship origin or heavy reliance on the same source text.';
  } else {
    rationale = 'The sentences share partial thematic terminology or common academic references, but maintain distinct sentence objectives.';
  }

  return {
    sentenceA,
    sentenceB,
    semanticSimilarity: Math.round(semanticScore * 100),
    lexicalSimilarity: Math.round(lexicalScore * 100),
    structuralSimilarity: Math.round(structSim * 100),
    classification: classification.label,
    riskLevel: classification.riskLevel,
    confidence,
    rationale,
    signals,
    sharedKeywords,
    substitutions: uniqueSubstitutions,
    wordsOnlyInA: contentWordsA.filter(w => !setB.has(w)).slice(0, 8),
    wordsOnlyInB: contentWordsB.filter(w => !setA.has(w)).slice(0, 8),
  };
}
