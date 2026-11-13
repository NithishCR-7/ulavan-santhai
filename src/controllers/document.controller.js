import * as documentService from '../services/document.service.js';
import { assertAuthenticated } from '../utils/authGuard.js';

/**
 * Controller: Upload KYC or Bank Document to Supabase Storage (Gate 2 Guarded)
 * @route POST /api/v1/documents/upload
 */
export const uploadDocument = async (req, res, next) => {
  try {
    // Gate 2 Assertion: Re-verify JWT and authenticate user identity
    const authUser = assertAuthenticated(req);

    const result = await documentService.uploadDocumentService({
      file: req.file,
      documentType: req.body.documentType,
      user: authUser,
      userId: authUser.id,
    });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to upload document.',
    });
  }
};
