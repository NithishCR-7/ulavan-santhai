import crypto from 'node:crypto';
import * as documentRepository from '../repositories/document.repository.js';
import { supabase } from '../config/supabase.js';

const BUCKET_NAME = 'user_documents';

/**
 * Service: Upload Document to Supabase Storage & Record via documentRepository
 * Stored in public bucket under: user_documents/${userName}/${timestamp}_${fileName}
 * @param {object} input
 * @param {Express.Multer.File} input.file
 * @param {string} input.documentType
 * @param {object} input.user - Decoded user from JWT
 * @returns {Promise<object>}
 */
export const uploadDocumentService = async ({ file, documentType, user } = {}) => {
  if (!file) {
    const error = new Error('No file attached. Please provide a document file.');
    error.statusCode = 400;
    throw error;
  }

  const cleanDocType = String(documentType || '').trim();
  if (!cleanDocType) {
    const error = new Error('documentType is required (e.g. ID_PROOF, BANK_PASSBOOK).');
    error.statusCode = 400;
    throw error;
  }

  if (!user || !user.id) {
    const error = new Error('User authentication required.');
    error.statusCode = 401;
    throw error;
  }

  // 1. Format storage path with sanitized user name
  const userName = user.name || user.username || user.id;
  const sanitizedUserName = String(userName).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_') || 'user';
  const cleanOriginalName = String(file.originalname || 'document.bin').replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const storagePath = `${sanitizedUserName}/${timestamp}_${cleanOriginalName}`;

  console.log(`[DOCUMENT] Uploading file to Supabase Storage bucket '${BUCKET_NAME}': ${storagePath}`);

  // 2. Upload buffer to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (uploadError) {
    console.error('[STORAGE ERROR]', uploadError.message);
    const error = new Error(`Storage upload failed: ${uploadError.message}`);
    error.statusCode = 500;
    throw error;
  }

  // 3. Obtain permanent public URL
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);

  const fileUrl = publicUrlData.publicUrl;

  // 4. Save metadata record into database via documentRepository
  const documentId = `DOC_${crypto.randomInt(100000, 999999)}`;
  const now = new Date();

  const docRecord = await documentRepository.create({
    id: documentId,
    userId: user.id,
    documentType: cleanDocType,
    fileName: file.originalname,
    fileUrl: fileUrl,
    storagePath: storagePath,
    fileSize: String(file.size),
    mimeType: file.mimetype,
    status: 'UPLOADED',
    createdAt: now,
  });

  console.log(`[DOC_REPO] Document record saved: ${docRecord.id} (${docRecord.documentType}) for user ${user.id}`);

  return {
    success: true,
    message: 'Document uploaded successfully',
    documentId: docRecord.id,
    url: docRecord.fileUrl,
    fileName: docRecord.fileName,
    documentType: docRecord.documentType,
    data: {
      documentId: docRecord.id,
      url: docRecord.fileUrl,
      fileName: docRecord.fileName,
      documentType: docRecord.documentType,
      storagePath: docRecord.storagePath,
      fileSize: docRecord.fileSize,
      mimeType: docRecord.mimeType,
    },
  };
};
