import * as applicationService from '../services/application.service.js';
import { assertAuthenticated } from '../utils/authGuard.js';

/**
 * Controller: Submit Onboarding Application (Gate 2 Guarded)
 * @route POST /api/v1/applications/submit
 */
export const submitApplication = async (req, res) => {
  try {
    // Gate 2 Assertion: Re-verify JWT and authenticate user identity
    const authUser = assertAuthenticated(req);

    const result = await applicationService.submitApplicationService({
      ...req.body,
      userId: authUser.id,
      user: authUser,
    });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Application submission failed.',
    });
  }
};

/**
 * Controller: Get Application Status (Gate 2 Guarded)
 * @route GET /api/v1/applications/status
 */
export const getApplicationStatus = async (req, res) => {
  try {
    // Gate 2 Assertion: Re-verify JWT and authenticate user identity
    const authUser = assertAuthenticated(req);

    const applicationId = req.query.applicationId || req.params.applicationId;
    const result = await applicationService.getApplicationStatusService({
      applicationId,
      user: authUser,
      userId: authUser.id,
    });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Failed to fetch application status.',
    });
  }
};
