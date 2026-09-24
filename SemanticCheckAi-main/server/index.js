import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { compareDocumentsHandler, loadDemoHandler } from './controllers/compareController.js';
import { testParaphraseHandler } from './controllers/paraphraseController.js';
import { compareMultipleDocumentsHandler } from './controllers/multiDocController.js';
import { explainFlaggedMatch } from './services/explainService.js';

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Multer memory storage configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max file size
  },
  fileFilter: (req, file, cb) => {
    const allowedExts = ['.txt', '.pdf', '.docx'];
    const originalName = file.originalname.toLowerCase();
    const isAllowed = allowedExts.some(ext => originalName.endsWith(ext));
    if (isAllowed || file.mimetype.includes('text') || file.mimetype.includes('pdf') || file.mimetype.includes('word')) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.originalname}. Only TXT, PDF, and DOCX are supported.`));
    }
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'SemantiCheck AI Core Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Load Benchmark Demo Comparison
app.get('/api/demo', loadDemoHandler);

// 2-Document Comparison endpoint (supports multipart file uploads or json body)
const twoFilesUpload = upload.fields([
  { name: 'fileA', maxCount: 1 },
  { name: 'fileB', maxCount: 1 },
]);
app.post('/api/compare', twoFilesUpload, compareDocumentsHandler);

// Multi-Document Pairwise Comparison endpoint
app.post('/api/compare-multiple', upload.array('files', 10), compareMultipleDocumentsHandler);

// Paraphrase Attack Lab endpoint
app.post('/api/paraphrase-test', testParaphraseHandler);

// On-demand explanation endpoint for any sentence pair
app.post('/api/explain', (req, res) => {
  try {
    const { sentenceA, sentenceB, semanticScore, lexicalScore } = req.body;
    if (!sentenceA || !sentenceB) {
      return res.status(400).json({ error: 'Both sentenceA and sentenceB are required.' });
    }
    const explanation = explainFlaggedMatch(
      sentenceA,
      sentenceB,
      (semanticScore || 75) / 100,
      (lexicalScore || 30) / 100
    );
    return res.json(explanation);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 SemantiCheck AI Server running on http://localhost:${PORT}`);
  console.log(`   Engine: Semantic Plagiarism Detection & Investigation`);
  console.log(`====================================================`);
});
