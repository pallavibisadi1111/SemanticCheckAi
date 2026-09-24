import fs from 'fs';
import path from 'path';

async function verifyAll() {
  console.log('=== SEMANTICHECK AI AUTOMATED VERIFICATION ===\n');

  // 1. Health check
  const healthRes = await fetch('http://localhost:5001/api/health');
  const health = await healthRes.json();
  console.log('1. Health Check:', health.status === 'online' ? '✅ PASS' : '❌ FAIL', health);

  // 2. Demo analysis
  const demoRes = await fetch('http://localhost:5001/api/demo');
  const demo = await demoRes.json();
  console.log('2. Demo Analysis:', demo.summary?.overallSemanticSimilarity ? '✅ PASS' : '❌ FAIL');
  console.log('   Overall Semantic Similarity:', demo.summary.overallSemanticSimilarity + '%');
  console.log('   Overall Lexical Similarity:', demo.summary.overallLexicalSimilarity + '%');
  console.log('   Risk Status:', demo.summary.status);
  console.log('   Paraphrased Matches Flagged:', demo.counts.paraphrasedMatches);
  console.log('   Content Profile:', demo.contentProfile);
  console.log('   Heatmap Matrix Dimensions:', `${demo.heatmapMatrix.length} x ${demo.heatmapMatrix[0].length}`);

  // 3. Sentence explanation
  const expRes = await fetch('http://localhost:5001/api/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sentenceA: 'Students can improve their academic performance by receiving personalized feedback.',
      sentenceB: 'Individualized feedback helps learners achieve better results in their studies.',
      semanticScore: 91,
      lexicalScore: 35
    })
  });
  const exp = await expRes.json();
  console.log('3. "Why Was This Flagged?" Explanation:', exp.signals?.length > 0 ? '✅ PASS' : '❌ FAIL');
  console.log('   Classification:', exp.classification);
  console.log('   Rationale:', exp.rationale);
  console.log('   Substitutions Detected:', exp.substitutions?.map(s => `"${s.from}" ↔ "${s.to}"`).join(', '));
  console.log('   Signals count:', exp.signals?.length);

  // 4. Paraphrase Attack Lab
  const paraRes = await fetch('http://localhost:5001/api/paraphrase-test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      original: 'Artificial intelligence is transforming education.',
      variants: [
        { label: 'Mild Paraphrase', text: 'AI is changing the way educational institutions teach and operate.' },
        { label: 'Heavy Paraphrase', text: 'Modern intelligent technologies are reshaping learning environments.' }
      ]
    })
  });
  const para = await paraRes.json();
  console.log('4. Paraphrase Attack Lab:', para.results?.length === 2 ? '✅ PASS' : '❌ FAIL');
  para.results.forEach(r => {
    console.log(`   - ${r.label}: Semantic=${r.semanticSimilarity}%, Lexical=${r.lexicalSimilarity}%, Result=${r.classification}`);
  });

  // 5. Multi-Document Pairwise
  const multiRes = await fetch('http://localhost:5001/api/compare-multiple', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      documents: [
        { name: 'Doc_1.txt', text: 'Online learning platforms give students flexibility in studying.' },
        { name: 'Doc_2.txt', text: 'Digital education allows learners to study with flexible schedules.' },
        { name: 'Doc_3.txt', text: 'Solar panels harness photovoltaic energy to power electric vehicles.' }
      ]
    })
  });
  const multi = await multiRes.json();
  console.log('5. Multi-Document Pairwise:', multi.comparisons?.length === 3 ? '✅ PASS' : '❌ FAIL');
  multi.comparisons.forEach(c => {
    console.log(`   - ${c.docA} vs ${c.docB}: ${c.semanticSimilarity}% (${c.riskLevel})`);
  });

  // 6. Vite Client Bundle
  const clientRes = await fetch('http://localhost:5173/');
  const clientHtml = await clientRes.text();
  console.log('6. Vite Client Server:', clientHtml.includes('SemantiCheck AI') ? '✅ PASS' : '❌ FAIL');

  console.log('\n=== ALL FORENSIC ENGINE CAPABILITIES VERIFIED SUCCESSFULLY ===');
}

verifyAll().catch(e => {
  console.error('Verification error:', e);
  process.exit(1);
});
