import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { analyzeScript, detectDatabaseTypes } from '../services/aiService.js';
import { assessRisk } from '../services/riskAnalyzer.js';
import { saveAnalysisResult, getAnalysisResult } from '../models/database.js';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    // Create uploads directory if it doesn't exist
    fs.mkdir(uploadDir, { recursive: true }).then(() => {
      cb(null, uploadDir);
    }).catch(err => cb(err));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'script-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.sql', '.txt', '.js', '.py', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${ext}. Supported formats: SQL (.sql), TXT (.txt), JS (.js), PY (.py), Excel (.xlsx, .xls)`));
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large', 
        message: 'File size exceeds 10MB limit' 
      });
    }
    return res.status(400).json({ 
      error: 'Upload error', 
      message: err.message 
    });
  } else if (err) {
    return res.status(400).json({ 
      error: 'File upload error', 
      message: err.message 
    });
  }
  next();
};

// Function to extract text/SQL from Excel files (real-world: scripts, DDL/DML, procedure exports)
async function extractTextFromExcel(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    let extractedText = '';

    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: false });

      if (workbook.SheetNames.length > 1) extractedText += `\n--- Sheet: ${sheetName} ---\n`;

      jsonData.forEach((row, rowIndex) => {
        if (!Array.isArray(row)) return;
        const cells = row.map(c => (c != null && c !== '') ? String(c).trim() : '').filter(Boolean);
        if (cells.length === 0) return;
        const rowLine = cells.join(' ');
        // Include: long cells (scripts), or rows with SQL-like keywords, or any non-empty row
        const hasSql = /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|GRANT|EXEC|BEGIN|END|PROCEDURE|FUNCTION|SCHEMA)\b/i.test(rowLine);
        const hasLongCell = cells.some(c => c.length > 150);
        if (rowLine.length > 15 && (hasSql || hasLongCell || cells.some(c => c.length > 30))) {
          extractedText += (hasLongCell ? `[${sheetName} R${rowIndex + 1}] ` : '') + rowLine + '\n';
        }
      });
    });

    let result = extractedText.replace(/(\r?\n){3,}/g, '\n\n').trim();

    if (!result || result.length < 20) {
      workbook.SheetNames.forEach((sn) => {
        const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sn]);
        if (csv && csv.trim().length > 10) result += '\n' + csv;
      });
    }

    return (result || 'No readable content in Excel').trim();
  } catch (error) {
    throw new Error(`Failed to read Excel file: ${error.message}`);
  }
}

// POST /api/analysis - Upload and analyze a script
router.post('/', upload.single('script'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded', 
        message: 'Please select a file to upload' 
      });
    }

    // Read the uploaded file
    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    let scriptContent;
    
    try {
      // Handle Excel files differently
      if (fileExt === '.xlsx' || fileExt === '.xls') {
        scriptContent = await extractTextFromExcel(filePath);
      } else {
        // Read text-based files normally
        scriptContent = await fs.readFile(filePath, 'utf-8');
      }
    } catch (readError) {
      // Clean up file if read fails
      await fs.unlink(filePath).catch(() => {});
      return res.status(400).json({ 
        error: 'File read error', 
        message: `Could not read file: ${readError.message}` 
      });
    }
    
    // Check if file is empty or too small
    if (!scriptContent || scriptContent.trim().length === 0) {
      await fs.unlink(filePath).catch(() => {});
      return res.status(400).json({ 
        error: 'Empty file', 
        message: 'The uploaded file appears to be empty or contains no readable content.' 
      });
    }

    // Get database type from form
    const selectedDbType = req.body.dbType || '';

    // Validate database type match (server-side validation) - STRICT
    if (selectedDbType && selectedDbType !== 'Other') {
      const detectedTypes = detectDatabaseTypes(scriptContent);
      // Strict mapping - only exact matches (no generic SQL fallback)
      const typeMap = {
        'MS SQL Server': ['MS SQL Server'],
        'SAP HANA': ['SAP HANA'],
        'Oracle': ['Oracle'],
        'PostgreSQL': ['PostgreSQL'],
        'MySQL': ['MySQL'],
        'MongoDB': ['MongoDB'],
        'DB2': ['DB2'],
        'Sybase': ['Sybase'],
        'Teradata': ['Teradata'],
        'Snowflake': ['Snowflake'],
        'SQLite': ['SQLite']
      };
      
      const allowedTypes = typeMap[selectedDbType] || [];
      
      // Reject if no types detected or if detected types don't match
      const isValid = detectedTypes.length > 0 && detectedTypes.some(dt => allowedTypes.includes(dt));
      
      if (!isValid) {
        await fs.unlink(filePath).catch(() => {});
        const detectedStr = detectedTypes.length > 0 
          ? detectedTypes.join(', ') 
          : 'No matching database patterns detected';
        return res.status(400).json({
          error: 'Database type mismatch',
          message: `Selected database type "${selectedDbType}" does not match detected types in file: ${detectedStr}. Please upload using the correct database type.`
        });
      }
    }

    // Analyze with AI (pass filename, DB type, and source for real-world context)
    const aiAnalysis = await analyzeScript(scriptContent, {
      filename: req.file.originalname,
      source: (fileExt === '.xlsx' || fileExt === '.xls') ? 'excel' : 'file',
      dbType: selectedDbType
    });

    // Assess risk levels
    const riskAssessment = assessRisk(aiAnalysis.issues || []);

    // Save to database
    const resultId = await saveAnalysisResult({
      userId: req.session ? req.session.userId : null,
      filename: req.file.originalname,
      dbType: selectedDbType,
      scriptContent: scriptContent,
      aiAnalysis: aiAnalysis,
      riskAssessment: riskAssessment,
      timestamp: new Date().toISOString()
    });

    // Clean up uploaded file
    await fs.unlink(filePath);

    res.json({
      success: true,
      resultId: resultId,
      analysis: {
        ...aiAnalysis,
        riskAssessment: riskAssessment
      }
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis failed', 
      message: error.message 
    });
  }
});

// GET /api/analysis/:id - Get analysis results
router.get('/:id', async (req, res) => {
  try {
    const result = await getAnalysisResult(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Analysis result not found' });
    }
    res.json(result);
  } catch (error) {
    console.error('Error fetching result:', error);
    res.status(500).json({ error: 'Failed to fetch result' });
  }
});

export default router;
