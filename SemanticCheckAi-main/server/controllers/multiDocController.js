import { extractText } from '../services/extractorService.js';
import { runComparisonPipeline } from './compareController.js';

/**
 * Compares 3 or more documents pairwise
 */
export async function compareMultipleDocumentsHandler(req, res) {
  try {
    const docs = [];

    // Check uploaded files
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const text = await extractText(file.buffer, file.originalname, file.mimetype);
        if (text.trim()) {
          docs.push({
            name: file.originalname,
            text: text.trim()
          });
        }
      }
    }

    // Check JSON payload documents
    if (req.body.documents && Array.isArray(req.body.documents)) {
      for (const doc of req.body.documents) {
        if (doc.text && doc.text.trim()) {
          docs.push({
            name: doc.name || `Document ${docs.length + 1}`,
            text: doc.text.trim()
          });
        }
      }
    }

    if (docs.length < 2) {
      return res.status(400).json({
        error: 'At least 2 documents are required for pairwise comparison.'
      });
    }

    const pairwiseComparisons = [];

    // Pairwise iteration
    for (let i = 0; i < docs.length; i++) {
      for (let j = i + 1; j < docs.length; j++) {
        const docA = docs[i];
        const docB = docs[j];

        const analysis = await runComparisonPipeline(docA.text, docB.text, docA.name, docB.name);

        pairwiseComparisons.push({
          docA: docA.name,
          docB: docB.name,
          semanticSimilarity: analysis.summary.overallSemanticSimilarity,
          lexicalSimilarity: analysis.summary.overallLexicalSimilarity,
          paraphraseLikelihood: analysis.summary.overallParaphraseLikelihood,
          riskLevel: analysis.summary.riskLevel,
          status: analysis.summary.status,
          suspiciousCount: analysis.counts.totalSuspicious,
          analysisId: analysis.id,
          analysisData: analysis
        });
      }
    }

    // Sort by highest similarity
    pairwiseComparisons.sort((a, b) => b.semanticSimilarity - a.semanticSimilarity);

    return res.json({
      totalDocuments: docs.length,
      totalPairs: pairwiseComparisons.length,
      documents: docs.map(d => ({ name: d.name, charCount: d.text.length })),
      comparisons: pairwiseComparisons
    });
  } catch (error) {
    console.error('Error in multi-document comparison:', error);
    return res.status(500).json({ error: error.message });
  }
}
