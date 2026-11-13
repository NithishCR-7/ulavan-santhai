import * as userRepository from '../repositories/user.repository.js';
import * as profileRepository from '../repositories/profile.repository.js';
import { extractSellerProfile, extractBuyerProfile } from './application.service.js';

/**
 * Service: Live check of current user onboarding status
 * @param {string} userId
 * @returns {Promise<object>}
 */
export const getUserStatusService = async (userId) => {
  if (!userId) {
    const error = new Error('User authentication required.');
    error.statusCode = 401;
    throw error;
  }

  const user = await userRepository.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  return {
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      sellerOnboarded: Boolean(user.sellerOnboarded),
      buyerOnboarded: Boolean(user.buyerOnboarded),
    },
  };
};

/**
 * Service: Complete Seller Onboarding
 * Saves seller profile details and activates seller onboarding flag.
 * Leaves buyer onboarding status untouched.
 * @param {string} userId
 * @param {object} sellerData
 * @returns {Promise<object>}
 */
export const onboardSellerService = async (userId, sellerData = {}) => {
  if (!userId) {
    const error = new Error('User authentication required.');
    error.statusCode = 401;
    throw error;
  }

  const user = await userRepository.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  // Normalize seller profile fields using clean 8-category extractor
  const subType = sellerData.sellerType || sellerData.classification || sellerData.sellerClassification || sellerData.subType || 'Farmer';
  const sellerPayload = extractSellerProfile(subType, sellerData);

  // 1. Upsert seller profile via profileRepository
  await profileRepository.upsertSeller(userId, sellerPayload);

  // 2. Mark seller onboarding as active without touching buyer onboarding
  const updatedUser = await userRepository.updateSellerOnboarding(userId);

  console.log(`[ONBOARDING] Seller onboarding completed for user: ${updatedUser.id}`);

  return {
    success: true,
    message: 'Seller onboarding completed successfully.',
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      mobile: updatedUser.mobile,
      sellerOnboarded: true,
      buyerOnboarded: Boolean(updatedUser.buyerOnboarded),
    },
  };
};

/**
 * Service: Complete Buyer Onboarding
 * Saves buyer profile details and activates buyer onboarding flag.
 * Leaves seller onboarding status untouched.
 * @param {string} userId
 * @param {object} buyerData
 * @returns {Promise<object>}
 */
export const onboardBuyerService = async (userId, buyerData = {}) => {
  if (!userId) {
    const error = new Error('User authentication required.');
    error.statusCode = 401;
    throw error;
  }

  const user = await userRepository.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  // Normalize buyer profile fields using clean 7-category extractor
  const subType = buyerData.buyerType || buyerData.classification || buyerData.buyerClassification || buyerData.subType || 'Individual';
  const buyerPayload = extractBuyerProfile(subType, buyerData);

  // 1. Upsert buyer profile via profileRepository
  await profileRepository.upsertBuyer(userId, buyerPayload);

  // 2. Mark buyer onboarding as active without touching seller onboarding
  const updatedUser = await userRepository.updateBuyerOnboarding(userId);

  console.log(`[ONBOARDING] Buyer onboarding completed for user: ${updatedUser.id}`);

  return {
    success: true,
    message: 'Buyer onboarding completed successfully.',
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      mobile: updatedUser.mobile,
      sellerOnboarded: Boolean(updatedUser.sellerOnboarded),
      buyerOnboarded: true,
    },
  };
};

/**
 * Service: Fetch Seller Dashboard
 * Guard: Requires user.sellerOnboarded === true
 * @param {string} userId
 * @returns {Promise<object>}
 */
export const getSellerDashboardService = async (userId) => {
  if (!userId) {
    const error = new Error('User authentication required.');
    error.statusCode = 401;
    throw error;
  }

  const user = await userRepository.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!user.sellerOnboarded) {
    const error = new Error('Access Denied: Please complete seller onboarding first.');
    error.statusCode = 403;
    throw error;
  }

  const profile = await profileRepository.findSellerByUserId(userId);
  const flattenedProfile = profile
    ? {
        ...profile,
        ...(profile.categoryDetails || {}),
      }
    : null;

  return {
    success: true,
    data: {
      seller: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        sellerOnboarded: true,
      },
      profile: flattenedProfile,
      metrics: {
        totalListings: 0,
        activeOrders: 0,
        revenue: 0,
      },
      listings: [],
    },
  };
};

/**
 * Service: Fetch Buyer Marketplace
 * Guard: Requires user.buyerOnboarded === true
 * @param {string} userId
 * @returns {Promise<object>}
 */
export const getBuyerMarketplaceService = async (userId) => {
  if (!userId) {
    const error = new Error('User authentication required.');
    error.statusCode = 401;
    throw error;
  }

  const user = await userRepository.findById(userId);
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!user.buyerOnboarded) {
    const error = new Error('Access Denied: Please complete buyer onboarding first.');
    error.statusCode = 403;
    throw error;
  }

  const profile = await profileRepository.findBuyerByUserId(userId);
  const flattenedProfile = profile
    ? {
        ...profile,
        ...(profile.categoryDetails || {}),
      }
    : null;

  return {
    success: true,
    data: {
      buyer: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        buyerOnboarded: true,
      },
      profile: flattenedProfile,
      marketplace: {
        featuredCommodities: ['Paddy', 'Turmeric', 'Coconut', 'Tomato', 'Banana', 'Sugarcane'],
        suppliersCount: 150,
      },
    },
  };
};

