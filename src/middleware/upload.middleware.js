import multer from 'multer';

// Use memory storage so file buffers can be uploaded directly to Supabase Storage
const storage = multer.memoryStorage();

// Allowed MIME types for KYC and bank proofs
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only JPEG, PNG, WEBP, and PDF documents are allowed.');
    error.statusCode = 400;
    cb(error, false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB maximum file size
  },
  fileFilter,
});

