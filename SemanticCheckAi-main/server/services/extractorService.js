import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Extracts plain text from buffer based on mimetype or file extension
 * @param {Buffer} buffer 
 * @param {string} originalname 
 * @param {string} mimetype 
 * @returns {Promise<string>}
 */
export async function extractText(buffer, originalname = '', mimetype = '') {
  const ext = originalname.split('.').pop()?.toLowerCase() || '';

  if (mimetype === 'application/pdf' || ext === 'pdf') {
    try {
      const data = await pdfParse(buffer);
      return data.text || '';
    } catch (err) {
      throw new Error(`Failed to parse PDF file: ${err.message}`);
    }
  }

  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === 'docx'
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || '';
    } catch (err) {
      throw new Error(`Failed to parse DOCX file: ${err.message}`);
    }
  }

  // Fallback to text/plain or utf8 string
  try {
    return buffer.toString('utf-8');
  } catch (err) {
    throw new Error(`Failed to read text file: ${err.message}`);
  }
}
