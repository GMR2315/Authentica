import multer from 'multer';

// Allowed MIME types matching the UI: Images (JPG, PNG, GIF) + Documents (PDF, DOC, DOCX)
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: JPG, PNG, GIF, PDF, DOC, DOCX`));
  }
};

/**
 * Multer middleware: accepts up to 10 files in the "files" field.
 * Files are stored in memory (buffer) for direct upload to IPFS.
 */
export const uploadFiles = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10,
  },
}).array('files', 10);
