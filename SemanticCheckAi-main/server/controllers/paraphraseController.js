import { getEmbedding } from '../services/embeddingService.js';
import {
  calculateCosineSimilarity,
  calculateLexicalSimilarity,
  calculateStructuralSimilarity,
  calculateParaphraseLikelihood,
  classifyMatch
} from '../services/similarityService.js';
import { explainFlaggedMatch } from '../services/explainService.js';

/**
 * Tests an original sentence against one or more paraphrased variants
 */
export async function testParaphraseHandler(req, res) {
  try {
    const { original, variants } = req.body;

    if (!original || !variants || !Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({
        error: 'Please provide an original sentence and an array of text variants to test.'
      });
    }

    const origEmbedding = await getEmbedding(original);
    const results = [];

    for (let i = 0; i < variants.length; i++) {
      const variantText = variants[i].text || variants[i];
      const variantLabel = variants[i].label || `Variant ${i + 1}`;

      const varEmbedding = await getEmbedding(variantText);
      const semScore = calculateCosineSimilarity(origEmbedding, varEmbedding);
      const lexScore = calculateLexicalSimilarity(original, variantText);
      const strScore = calculateStructuralSimilarity(original, variantText);
      const paraphraseLikelihood = calculateParaphraseLikelihood(semScore, lexScore);
      const classification = classifyMatch(semScore, lexScore);

      const explanation = explainFlaggedMatch(original, variantText, semScore, lexScore);

      results.push({
        id: `variant_${i + 1}`,
        label: variantLabel,
        text: variantText,
        semanticSimilarity: Math.round(semScore * 100),
        lexicalSimilarity: Math.round(lexScore * 100),
        structuralSimilarity: Math.round(strScore * 100),
        paraphraseLikelihood: Math.round(paraphraseLikelihood * 100),
        classification: classification.label,
        riskLevel: classification.riskLevel,
        badgeColor: classification.badgeColor,
        description: classification.description,
        explanation
      });
    }

    return res.json({
      original,
      results
    });
  } catch (error) {
    console.error('Error in paraphrase test:', error);
    return res.status(500).json({ error: error.message });
  }
}
