/**
 * API client service for SemantiCheck AI backend
 */

const API_BASE = '/api';

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Backend service is unreachable');
  return res.json();
}

export async function loadDemoAnalysis() {
  const res = await fetch(`${API_BASE}/demo`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to load demo analysis');
  }
  return res.json();
}

export async function compareDocuments({
  fileA,
  fileB,
  textA,
  textB,
  nameA,
  nameB,
  thresholds
}) {
  const hasFiles = Boolean(fileA || fileB);

  let response;
  if (hasFiles) {
    const formData = new FormData();
    if (fileA) formData.append('fileA', fileA);
    if (fileB) formData.append('fileB', fileB);
    if (textA) formData.append('textA', textA);
    if (textB) formData.append('textB', textB);
    if (nameA) formData.append('nameA', nameA);
    if (nameB) formData.append('nameB', nameB);
    if (thresholds) formData.append('thresholds', JSON.stringify(thresholds));

    response = await fetch(`${API_BASE}/compare`, {
      method: 'POST',
      body: formData,
    });
  } else {
    response = await fetch(`${API_BASE}/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        textA,
        textB,
        nameA,
        nameB,
        thresholds: JSON.stringify(thresholds || {})
      }),
    });
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Comparison analysis failed.');
  }

  return response.json();
}

export async function runParaphraseTest(original, variants) {
  const res = await fetch(`${API_BASE}/paraphrase-test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ original, variants }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Paraphrase test failed.');
  }

  return res.json();
}

export async function compareMultipleDocs(formDataOrJson) {
  let res;
  if (formDataOrJson instanceof FormData) {
    res = await fetch(`${API_BASE}/compare-multiple`, {
      method: 'POST',
      body: formDataOrJson,
    });
  } else {
    res = await fetch(`${API_BASE}/compare-multiple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formDataOrJson),
    });
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Multi-document comparison failed.');
  }

  return res.json();
}

export async function explainSentencePair(sentenceA, sentenceB, semanticScore, lexicalScore) {
  const res = await fetch(`${API_BASE}/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sentenceA, sentenceB, semanticScore, lexicalScore }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to generate explanation.');
  }

  return res.json();
}
