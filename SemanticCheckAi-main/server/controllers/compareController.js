import { extractText } from '../services/extractorService.js';
import { segmentSentences } from '../services/segmentationService.js';
import { getBatchEmbeddings } from '../services/embeddingService.js';
import {
  calculateCosineSimilarity,
  calculateLexicalSimilarity,
  calculateStructuralSimilarity,
  calculateParaphraseLikelihood,
  classifyMatch,
  DEFAULT_THRESHOLDS
} from '../services/similarityService.js';
import { explainFlaggedMatch } from '../services/explainService.js';
import { DEMO_DOCUMENTS } from '../data/demoDocuments.js';

/**
 * Controller to compare two documents
 */
export async function compareDocumentsHandler(req, res) {
  try {
    let textA = '';
    let textB = '';
    let docAName = 'Document A';
    let docBName = 'Document B';

    // 1. Extract texts from uploaded files or pasted text
    if (req.files) {
      if (req.files.fileA && req.files.fileA[0]) {
        const fileA = req.files.fileA[0];
        docAName = fileA.originalname || 'Document A';
        textA = await extractText(fileA.buffer, fileA.originalname, fileA.mimetype);
      }
      if (req.files.fileB && req.files.fileB[0]) {
        const fileB = req.files.fileB[0];
        docBName = fileB.originalname || 'Document B';
        textB = await extractText(fileB.buffer, fileB.originalname, fileB.mimetype);
      }
    }

    if (!textA && req.body.textA) {
      textA = req.body.textA;
      if (req.body.nameA) docAName = req.body.nameA;
    }

    if (!textB && req.body.textB) {
      textB = req.body.textB;
      if (req.body.nameB) docBName = req.body.nameB;
    }

    if (!textA.trim() || !textB.trim()) {
      return res.status(400).json({
        error: 'Both Document A and Document B must contain readable text or files.'
      });
    }

    const customThresholds = req.body.thresholds ? JSON.parse(req.body.thresholds) : {};

    // 2. Perform comparison analysis
    const analysis = await runComparisonPipeline(textA, textB, docAName, docBName, customThresholds);
    return res.json(analysis);
  } catch (error) {
    console.error('Error during document comparison:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred during comparison analysis.'
    });
  }
}

/**
 * Endpoint to load benchmark demo documents
 */
export async function loadDemoHandler(req, res) {
  try {
    const analysis = await runComparisonPipeline(
      DEMO_DOCUMENTS.documentA.text,
      DEMO_DOCUMENTS.documentB.text,
      DEMO_DOCUMENTS.documentA.title,
      DEMO_DOCUMENTS.documentB.title
    );
    return res.json({
      ...analysis,
      isDemo: true,
      rawA: DEMO_DOCUMENTS.documentA.text,
      rawB: DEMO_DOCUMENTS.documentB.text
    });
  } catch (error) {
    console.error('Error loading demo:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * Core analysis pipeline for two documents
 */
export async function runComparisonPipeline(textA, textB, nameA = 'Document A', nameB = 'Document B', customThresholds = {}) {
  // 1. Segmentation
  const sentencesA = segmentSentences(textA);
  const sentencesB = segmentSentences(textB);

  if (sentencesA.length === 0 || sentencesB.length === 0) {
    throw new Error('Could not identify any valid sentences in one of the documents.');
  }

  // 2. Generate Dense Embeddings
  const textsA = sentencesA.map(s => s.text);
  const textsB = sentencesB.map(s => s.text);

  const embeddingsA = await getBatchEmbeddings(textsA);
  const embeddingsB = await getBatchEmbeddings(textsB);

  // 3. Compute Cross-Sentence Similarity Matrix
  const matrix = [];
  let totalMaxSemantic = 0;
  let totalMaxLexical = 0;
  let totalMaxStructural = 0;

  const matches = [];
  const riskMapA = [];
  const riskMapB = [];

  let exactMatchesCount = 0;
  let nearMatchesCount = 0;
  let paraphrasedMatchesCount = 0;
  let semanticMatchesCount = 0;

  for (let i = 0; i < sentencesA.length; i++) {
    const row = [];
    let bestMatchForA = null;
    let highestSemanticForA = -1;

    for (let j = 0; j < sentencesB.length; j++) {
      const semScore = calculateCosineSimilarity(embeddingsA[i], embeddingsB[j]);
      const lexScore = calculateLexicalSimilarity(sentencesA[i].text, sentencesB[j].text);
      const strScore = calculateStructuralSimilarity(sentencesA[i].text, sentencesB[j].text);
      const classification = classifyMatch(semScore, lexScore, customThresholds);

      const cell = {
        sentenceAIndex: i,
        sentenceBIndex: j,
        sentenceAId: sentencesA[i].id,
        sentenceBId: sentencesB[j].id,
        semanticScore: Math.round(semScore * 100) / 100,
        lexicalScore: Math.round(lexScore * 100) / 100,
        structuralScore: Math.round(strScore * 100) / 100,
        classification: classification.label,
        riskLevel: classification.riskLevel,
        badgeColor: classification.badgeColor
      };

      row.push(cell);

      if (semScore > highestSemanticForA) {
        highestSemanticForA = semScore;
        bestMatchForA = {
          ...cell,
          sentenceA: sentencesA[i].text,
          sentenceB: sentencesB[j].text,
          paragraphA: sentencesA[i].paragraphIndex,
          paragraphB: sentencesB[j].paragraphIndex,
          classificationObject: classification,
          paraphraseLikelihood: calculateParaphraseLikelihood(semScore, lexScore)
        };
      }
    }

    matrix.push(row);

    if (bestMatchForA) {
      totalMaxSemantic += bestMatchForA.semanticScore;
      totalMaxLexical += bestMatchForA.lexicalScore;
      totalMaxStructural += bestMatchForA.structuralScore;

      // Classify match count
      const cType = bestMatchForA.classificationObject.type;
      if (cType === 'EXACT_MATCH') exactMatchesCount++;
      else if (cType === 'NEAR_MATCH') nearMatchesCount++;
      else if (cType === 'PARAPHRASED_MATCH') paraphrasedMatchesCount++;
      else if (cType === 'SEMANTIC_MATCH') semanticMatchesCount++;

      // Precompute explanation for flagged matches
      const explanation = explainFlaggedMatch(
        bestMatchForA.sentenceA,
        bestMatchForA.sentenceB,
        bestMatchForA.semanticScore,
        bestMatchForA.lexicalScore
      );

      matches.push({
        id: `match_${i + 1}`,
        sentenceAId: sentencesA[i].id,
        sentenceBId: sentencesB[bestMatchForA.sentenceBIndex].id,
        sentenceAIndex: i,
        sentenceBIndex: bestMatchForA.sentenceBIndex,
        sentenceA: bestMatchForA.sentenceA,
        sentenceB: bestMatchForA.sentenceB,
        semanticScore: Math.round(bestMatchForA.semanticScore * 100),
        lexicalScore: Math.round(bestMatchForA.lexicalScore * 100),
        structuralScore: Math.round(bestMatchForA.structuralScore * 100),
        paraphraseLikelihood: Math.round(bestMatchForA.paraphraseLikelihood * 100),
        classification: bestMatchForA.classificationObject.label,
        riskLevel: bestMatchForA.classificationObject.riskLevel,
        badgeColor: bestMatchForA.classificationObject.badgeColor,
        description: bestMatchForA.classificationObject.description,
        explanation
      });

      // Risk map entry for Document A
      riskMapA.push({
        sentenceId: sentencesA[i].id,
        sentenceIndex: i,
        text: sentencesA[i].text,
        maxSimilarity: Math.round(bestMatchForA.semanticScore * 100),
        riskLevel: bestMatchForA.classificationObject.riskLevel,
        matchedSentenceIndex: bestMatchForA.sentenceBIndex,
        classification: bestMatchForA.classificationObject.label
      });
    }
  }

  // Document B Risk Map
  for (let j = 0; j < sentencesB.length; j++) {
    let maxSemForB = -1;
    let bestAIndex = 0;
    for (let i = 0; i < sentencesA.length; i++) {
      if (matrix[i][j].semanticScore > maxSemForB) {
        maxSemForB = matrix[i][j].semanticScore;
        bestAIndex = i;
      }
    }
    const matchedCell = matrix[bestAIndex][j];
    riskMapB.push({
      sentenceId: sentencesB[j].id,
      sentenceIndex: j,
      text: sentencesB[j].text,
      maxSimilarity: Math.round(maxSemForB * 100),
      riskLevel: matchedCell.riskLevel,
      matchedSentenceIndex: bestAIndex,
      classification: matchedCell.classification
    });
  }

  // Overall Document Aggregates
  const totalSentences = sentencesA.length;
  const overallSemantic = Math.round((totalMaxSemantic / totalSentences) * 100);
  const overallLexical = Math.round((totalMaxLexical / totalSentences) * 100);
  const overallStructural = Math.round((totalMaxStructural / totalSentences) * 100);
  const overallParaphrase = Math.round(calculateParaphraseLikelihood(overallSemantic / 100, overallLexical / 100) * 100);

  // Determine overall status & risk level
  let status = 'LOW SIMILARITY';
  let riskLevel = 'LOW';
  let statusMessage = 'Minimal similarity detected. Content appears original with standard independent phrasing.';

  if (overallSemantic >= 75) {
    status = 'HIGH SIMILARITY';
    riskLevel = 'HIGH';
    statusMessage = 'Potential semantic plagiarism detected. Human review recommended.';
  } else if (overallSemantic >= 60) {
    status = 'SUSPICIOUS SIMILARITY';
    riskLevel = 'SUSPICIOUS';
    statusMessage = 'Suspicious semantic overlap identified. Several paraphrased arguments warrant human review.';
  } else if (overallSemantic >= 45) {
    status = 'MODERATE SIMILARITY';
    riskLevel = 'MODERATE';
    statusMessage = 'Moderate conceptual overlap detected, consistent with shared subject references or general academic terminology.';
  }

  // Content Profile breakdown percentages (fingerprint)
  const exactPercent = Math.min(100, Math.round(((exactMatchesCount + nearMatchesCount * 0.5) / totalSentences) * 100));
  const paraphrasePercent = Math.min(100 - exactPercent, Math.round((paraphrasedMatchesCount / totalSentences) * 100));
  const semanticPercent = Math.min(100 - exactPercent - paraphrasePercent, Math.round((semanticMatchesCount / totalSentences) * 100));
  const originalPercent = Math.max(0, 100 - (exactPercent + paraphrasePercent + semanticPercent));

  // Sort matches by risk severity and semantic score descending
  const sortedMatches = [...matches].sort((a, b) => b.semanticScore - a.semanticScore);

  return {
    id: `analysis_${Date.now()}`,
    timestamp: new Date().toISOString(),
    documentA: {
      name: nameA,
      sentenceCount: sentencesA.length,
      wordCount: sentencesA.reduce((sum, s) => sum + s.wordCount, 0),
      sentences: sentencesA
    },
    documentB: {
      name: nameB,
      sentenceCount: sentencesB.length,
      wordCount: sentencesB.reduce((sum, s) => sum + s.wordCount, 0),
      sentences: sentencesB
    },
    summary: {
      overallSemanticSimilarity: overallSemantic,
      overallLexicalSimilarity: overallLexical,
      overallStructuralSimilarity: overallStructural,
      overallParaphraseLikelihood: overallParaphrase,
      status,
      riskLevel,
      statusMessage,
      disclaimer: 'High similarity does not necessarily prove plagiarism. Common terminology, citations, shared references, and standard academic language can produce similarity. Human investigation is required.'
    },
    counts: {
      totalComparedSentences: totalSentences,
      exactMatches: exactMatchesCount,
      nearMatches: nearMatchesCount,
      paraphrasedMatches: paraphrasedMatchesCount,
      semanticMatches: semanticMatchesCount,
      totalSuspicious: exactMatchesCount + nearMatchesCount + paraphrasedMatchesCount + semanticMatchesCount
    },
    contentProfile: {
      originalContent: originalPercent,
      semanticOverlap: semanticPercent,
      directOverlap: exactPercent,
      suspiciousParaphrase: paraphrasePercent
    },
    matches: sortedMatches,
    heatmapMatrix: matrix,
    riskMaps: {
      documentA: riskMapA,
      documentB: riskMapB
    }
  };
}
