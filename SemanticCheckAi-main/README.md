# SemantiCheck AI
### Semantic Plagiarism Detection & Investigation Platform

> **"Detect similarity by meaning, not just matching words."**

SemantiCheck AI is a **competition-grade** academic integrity platform that goes beyond simple word-matching. It uses **dense sentence embeddings** and **cosine similarity** to detect paraphrased plagiarism — catching copied ideas even when every single word has been changed.

---

## 📸 Demo

Click **"Explore Demo"** on the dashboard to instantly run the real NLP pipeline on 4 built-in benchmark documents covering AI in Education and Healthcare. See live semantic similarity scores, a pairwise matrix, and forensic sentence-level breakdowns.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **Semantic Embedding Comparison** | Sentence-level dense vectors via `all-MiniLM-L6-v2` (384-dim), cosine similarity |
| **Paraphrase Detection** | Detects "Paraphrase Gap" — high semantic (≥70%) with low lexical (≤45%) similarity |
| **Forensic Explainability** | "Why was this flagged?" modal with synonym swap detection and confidence rationale |
| **Sentence Heatmap** | Full Aᵢ × Bⱼ cross-document similarity matrix — click any cell to inspect |
| **Multi-Document Cohort** | Upload 3–10 documents, get a pairwise similarity matrix across the whole cohort |
| **Explore Demo** | One-click real NLP analysis on 4 built-in benchmark documents |
| **Investigation Report** | Print-ready formal academic audit report (PDF-ready) |
| **Paraphrase Lab** | Interactive sandbox to test how rewording affects semantic vs lexical scores |

---

## 🏗️ Tech Stack

```
Frontend         React 19, Vite, Tailwind CSS, Motion, Lucide React
Backend          Node.js, Express, Multer
Text Extraction  pdf-parse (PDF), mammoth (DOCX), native UTF-8 (TXT)
NLP Engine       @xenova/transformers — all-MiniLM-L6-v2 (384-dim quantized)
Similarity       Cosine Similarity, Jaccard Token Overlap, Bigram Dice Coefficient
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js v18+**
- **npm**

### 1. Clone & Install

```bash
git clone https://github.com/inderjeetkaranjaiswal/SemanticCheckAi.git
cd SemanticCheckAi

# Install all dependencies (server + client)
npm run install:all
```

### 2. Start the Backend (Port 5001)

```bash
npm run start:server
# or for hot-reload during development:
npm run dev:server
```

> The backend will start on `http://localhost:5001`.
> **Note:** On first run, `@xenova/transformers` will download the `all-MiniLM-L6-v2` model (~25 MB). This is automatic and cached for subsequent runs.

### 3. Start the Frontend (Port 5173)

```bash
npm run dev:client
```

> Open `http://localhost:5173` in your browser.

---

## 📁 Project Structure

```
SemanticCheckAi/
├── client/                        # React Frontend (Vite)
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   │   ├── AnalysisWorkflowPipeline.jsx   # Interactive 7-stage pipeline visual
│   │   │   ├── DocumentRiskMap.jsx            # Sentence-level risk heatmap
│   │   │   ├── ExplainModal.jsx               # "Why was this flagged?" forensic modal
│   │   │   ├── FingerprintChart.jsx           # Content profile breakdown chart
│   │   │   ├── Header.jsx                     # Top navigation bar
│   │   │   ├── SemanticInvestigationGraph.jsx # Interactive document network graph
│   │   │   ├── SemanticNetworkVisual.jsx      # Animated semantic flow visual
│   │   │   ├── SentenceMatchCard.jsx          # Individual match comparison card
│   │   │   ├── Sidebar.jsx                    # Left navigation sidebar
│   │   │   ├── SimilarityHeatmap.jsx          # Cross-document similarity matrix
│   │   │   └── WhySemantiCheckSection.jsx     # Educational comparison section
│   │   ├── data/
│   │   │   └── sampleData.js      # Built-in demo documents (4 benchmark docs)
│   │   ├── pages/
│   │   │   ├── ComparePage.jsx    # Upload & compare documents (2-doc or multi-doc)
│   │   │   ├── Dashboard.jsx      # Semantic Investigation Command Center
│   │   │   ├── ParaphraseTest.jsx # Paraphrase Attack Laboratory
│   │   │   ├── ReportsPage.jsx    # Formal investigation report
│   │   │   └── ResultsPage.jsx    # Full analysis results (overview, matches, heatmap, report)
│   │   ├── services/
│   │   │   ├── api.js             # API client for backend communication
│   │   │   └── historyStorage.js  # Browser localStorage analysis history
│   │   ├── utils/
│   │   │   └── formatters.js      # Date, risk badge, classification helpers
│   │   ├── App.jsx                # Root app component with routing state
│   │   ├── index.css              # Global styles (print, scrollbar, animations)
│   │   └── main.jsx               # Vite entry point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                        # Node.js Express Backend
│   ├── controllers/
│   │   ├── compareController.js   # 2-doc comparison pipeline + multi-doc handler
│   │   └── explainController.js   # Forensic "why flagged" explanation engine
│   ├── data/
│   │   └── demoDocuments.js       # Legacy demo documents (server-side)
│   ├── services/
│   │   └── embeddingService.js    # MiniLM-L6-v2 embedding + cosine similarity
│   ├── index.js                   # Express app entry + route definitions
│   ├── verify_endpoints.js        # Automated endpoint verification script
│   └── package.json
│
├── sample_documents/              # Ready-to-upload sample .txt files for demo
│   ├── Document_A_Education_Ref.txt
│   ├── Document_B_Education_Sub.txt
│   ├── Document_C_Healthcare_Ref.txt
│   ├── Document_D_Healthcare_Sub.txt
│   ├── Pedagogy_Research_Paper_A.txt
│   └── Digital_Learning_Assignment_B.txt
│
├── .gitignore
├── package.json                   # Root scripts (install:all, dev:server, dev:client)
└── README.md
```

---

## 🎯 3-Minute Competition Demo Script

1. **Open** `http://localhost:5173`
2. **Click "Explore Demo"** — runs the real NLP pipeline on 4 benchmark documents
3. **Read the live metrics**:
   - Document A vs B: **81% Semantic Similarity**, only **~5% lexical overlap** — a perfect paraphrase attack example
   - Standard word-match checkers would score this near 0% — SemantiCheck AI catches it
4. **Click any cell** in the Document Similarity Map to open the sentence-level investigation
5. **Click "Why was this flagged?"** — show the forensic modal with synonym swap detection
6. **Open the Similarity Heatmap** tab to visualize cross-document density
7. **Switch to "Analysis Report"** tab — shows the printable DEMO ANALYSIS REPORT

---

## 🔬 How It Works

```
Documents (PDF / DOCX / TXT)
    ↓
Text Extraction (pdf-parse / mammoth / UTF-8)
    ↓
Sentence Segmentation
    ↓
Dense Embeddings — all-MiniLM-L6-v2 (384-dim)
    ↓
Pairwise Cosine Similarity Matrix  ←→  Lexical Jaccard Overlap
    ↓
Classification Engine:
  • Exact Match    → Semantic ≥95% AND Lexical ≥85%
  • Near Match     → Semantic ≥85% AND Lexical ≥65%
  • Paraphrased    → Semantic ≥70% AND Lexical ≤45%  ← Paraphrase Gap
  • Semantic Only  → Semantic ≥60%
    ↓
Forensic Explanation + Report Generation
```

---

## ⚠️ Responsible AI Disclaimer

SemantiCheck AI flags **potential** semantic similarity. It does **not** make final plagiarism determinations. All results require human review. Shared domain vocabulary, common citations, and discipline-specific phrasing may produce similarity without intent to plagiarize.

---

## 📄 License

MIT License — feel free to fork and build on top of this.
