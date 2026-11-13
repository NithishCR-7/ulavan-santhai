import crypto from 'node:crypto';
import * as profileRepository from '../repositories/profile.repository.js';
import * as applicationRepository from '../repositories/application.repository.js';
import * as userRepository from '../repositories/user.repository.js';
import * as documentRepository from '../repositories/document.repository.js';

/**
 * Helper: Extract unified search attributes and category-specific details
 * across all 8 dynamic seller classifications with zero data loss.
 * @param {string} subType
 * @param {object} profile
 * @returns {object}
 */
export const extractSellerProfile = (subType, profile = {}) => {
  const sellerType = String(subType || profile.sellerType || 'Farmer').trim();

  const district = profile.district || null;
  const village = profile.village || null;
  const pinCode = profile.pinCode || profile.pincode || null;
  const farmAddress = profile.farmAddress || profile.address || null;

  let businessName = '';
  let primaryProducts = '';
  let capacity = '';
  let isGst = false;
  let gstin = null;
  let fssaiNumber = null;
  const categoryDetails = {};

  switch (sellerType) {
    case 'Farmer': {
      businessName = profile.farmerFarmName || profile.farmName || 'Farmer Cultivator';
      const crops = Array.isArray(profile.farmerCrops) ? profile.farmerCrops : (profile.crops || []);
      primaryProducts = crops.join(', ');
      capacity = profile.farmerAvailableQty || profile.availableQty || null;
      isGst = false;
      gstin = null;
      fssaiNumber = null;

      categoryDetails.farmName = profile.farmerFarmName || null;
      categoryDetails.landSize = profile.farmerLandSize || profile.farmerLandArea || profile.landSize || null;
      categoryDetails.category = profile.farmerCategory || profile.category || null;
      categoryDetails.crops = crops;
      categoryDetails.availableQty = profile.farmerAvailableQty || null;
      categoryDetails.harvestMonths = profile.farmerHarvestMonths || profile.harvestMonths || null;
      categoryDetails.priceExpectation = profile.farmerPriceExpectation || profile.priceExpectation || null;
      categoryDetails.farmingMethod = profile.farmerMethod || profile.farmingMethod || null;
      break;
    }

    case 'Agricultural Producer': {
      businessName = profile.fpoName || 'FPO Producer Company';
      const crops = Array.isArray(profile.fpoCrops) ? profile.fpoCrops : [];
      primaryProducts = crops.join(', ');
      capacity = profile.fpoCapacity || null;
      isGst = profile.fpoIsGst === 'Yes' || Boolean(profile.isGst);
      gstin = profile.fpoGstin || profile.gstin || null;
      fssaiNumber = null;

      categoryDetails.fpoName = profile.fpoName || null;
      categoryDetails.fpoStructure = profile.fpoStructure || profile.structure || null;
      categoryDetails.fpoRegNumber = profile.fpoRegNumber || profile.regNumber || null;
      categoryDetails.fpoMemberCount = profile.fpoMemberCount || profile.memberCount || null;
      categoryDetails.fpoCombinedAcreage = profile.fpoCombinedAcreage || profile.combinedAcreage || null;
      categoryDetails.fpoCrops = crops;
      categoryDetails.fpoCapacity = profile.fpoCapacity || null;
      categoryDetails.fpoIsGst = profile.fpoIsGst || (isGst ? 'Yes' : 'No');
      categoryDetails.fpoGstin = gstin;
      break;
    }

    case 'Organic Producer': {
      businessName = profile.organicFarmName || 'Organic Producer Farm';
      const crops = Array.isArray(profile.organicCrops) ? profile.organicCrops : [];
      primaryProducts = crops.join(', ');
      capacity = profile.organicCapacity || null;
      isGst = Boolean(profile.isGst);
      gstin = profile.gstin || null;
      fssaiNumber = null;

      categoryDetails.organicFarmName = profile.organicFarmName || null;
      categoryDetails.organicAcreage = profile.organicAcreage || null;
      categoryDetails.organicCertStatus = profile.organicCertStatus || profile.certStatus || null;
      categoryDetails.organicCertAgency = profile.organicCertAgency || profile.certAgency || null;
      categoryDetails.organicScopeNumber = profile.organicScopeNumber || profile.scopeNumber || null;
      categoryDetails.organicCrops = crops;
      categoryDetails.organicCapacity = profile.organicCapacity || null;
      categoryDetails.organicMethod = profile.organicMethod || null;
      break;
    }

    case 'Raw-Material Provider': {
      businessName = profile.rawProviderName || 'Raw Material Provider';
      const comms = Array.isArray(profile.rawCommodities)
        ? profile.rawCommodities
        : (typeof profile.rawCommodities === 'string' ? profile.rawCommodities.split(',').map(s => s.trim()) : []);
      primaryProducts = comms.join(', ');
      capacity = profile.rawStockCapacity || null;
      isGst = profile.rawIsGst === 'Yes' || Boolean(profile.isGst);
      gstin = profile.rawGstin || profile.gstin || null;
      fssaiNumber = null;

      categoryDetails.rawProviderName = profile.rawProviderName || null;
      categoryDetails.rawConstitution = profile.rawConstitution || null;
      categoryDetails.rawCommodities = comms;
      categoryDetails.rawSource = profile.rawSource || null;
      categoryDetails.rawStockCapacity = profile.rawStockCapacity || null;
      categoryDetails.rawMoq = profile.rawMoq || null;
      categoryDetails.rawIsGst = profile.rawIsGst || (isGst ? 'Yes' : 'No');
      categoryDetails.rawGstin = gstin;
      break;
    }

    case 'Ingredient Producer': {
      businessName = profile.ingProducerName || 'Agri Ingredient Producer';
      primaryProducts = profile.ingProducts || '';
      capacity = profile.ingCapacity || null;
      isGst = profile.ingIsGst === 'Yes' || Boolean(profile.isGst);
      gstin = profile.ingGstin || profile.gstin || null;
      fssaiNumber = profile.ingFssaiNumber || profile.fssaiNumber || null;

      categoryDetails.ingProducerName = profile.ingProducerName || null;
      categoryDetails.ingProducts = profile.ingProducts || null;
      categoryDetails.ingCapacity = profile.ingCapacity || null;
      categoryDetails.ingTechnology = profile.ingTechnology || null;
      categoryDetails.ingFssaiNumber = fssaiNumber;
      categoryDetails.ingPackaging = profile.ingPackaging || null;
      categoryDetails.ingIsGst = profile.ingIsGst || (isGst ? 'Yes' : 'No');
      categoryDetails.ingGstin = gstin;
      break;
    }

    case 'Manufacturer': {
      businessName = profile.mfgSellerName || 'Agro Manufacturer';
      primaryProducts = profile.mfgProductsOffered || '';
      capacity = profile.mfgCapacity || null;
      isGst = profile.mfgIsGst === 'Yes' || Boolean(profile.isGst);
      gstin = profile.mfgGstin || profile.gstin || null;
      fssaiNumber = profile.mfgFssaiNumber || profile.fssaiNumber || null;

      categoryDetails.mfgSellerName = profile.mfgSellerName || null;
      categoryDetails.mfgSellerConstitution = profile.mfgSellerConstitution || null;
      categoryDetails.mfgCategory = profile.mfgCategory || null;
      categoryDetails.mfgProductsOffered = profile.mfgProductsOffered || null;
      categoryDetails.mfgRawMaterialsUsed = profile.mfgRawMaterialsUsed || null;
      categoryDetails.mfgCapacity = profile.mfgCapacity || null;
      categoryDetails.mfgFssaiNumber = fssaiNumber;
      categoryDetails.mfgIsGst = profile.mfgIsGst || (isGst ? 'Yes' : 'No');
      categoryDetails.mfgGstin = gstin;
      break;
    }

    case 'Value-Added Manufacturer': {
      businessName = profile.vaBrandName || 'Value-Added Enterprise';
      primaryProducts = profile.vaProducts || '';
      capacity = profile.vaMonthlyCapacity || null;
      isGst = profile.vaIsGst === 'Yes' || Boolean(profile.isGst);
      gstin = profile.vaGstin || profile.gstin || null;
      fssaiNumber = profile.vaFssaiNumber || profile.fssaiNumber || null;

      categoryDetails.vaBrandName = profile.vaBrandName || null;
      categoryDetails.vaProducts = profile.vaProducts || null;
      categoryDetails.vaAgriInputs = profile.vaAgriInputs || null;
      categoryDetails.vaMonthlyCapacity = profile.vaMonthlyCapacity || null;
      categoryDetails.vaPackagingFormat = profile.vaPackagingFormat || null;
      categoryDetails.vaFssaiNumber = fssaiNumber;
      categoryDetails.vaIsGst = profile.vaIsGst || (isGst ? 'Yes' : 'No');
      categoryDetails.vaGstin = gstin;
      break;
    }

    case 'Other':
    default: {
      businessName = profile.otherSellerName || profile.businessName || profile.farmName || 'Specialized Farm Enterprise';
      primaryProducts = profile.otherProducts || '';
      capacity = profile.otherStockQty || null;
      isGst = profile.otherIsGst === 'Yes' || Boolean(profile.isGst);
      gstin = profile.otherGstin || profile.gstin || null;
      fssaiNumber = profile.fssaiNumber || null;

      categoryDetails.otherSellerName = profile.otherSellerName || null;
      categoryDetails.otherActivity = profile.otherActivity || null;
      categoryDetails.otherProducts = profile.otherProducts || null;
      categoryDetails.otherStockQty = profile.otherStockQty || null;
      categoryDetails.otherIsGst = profile.otherIsGst || (isGst ? 'Yes' : 'No');
      categoryDetails.otherGstin = gstin;
      break;
    }
  }

  return {
    sellerType,
    businessName: businessName || 'Agri Enterprise',
    district: district || 'Not specified',
    village,
    pinCode,
    farmAddress,
    isGst,
    gstin,
    fssaiNumber,
    primaryProducts: primaryProducts || null,
    capacity: capacity || null,
    categoryDetails,
  };
};

/**
 * Helper: Extract unified search attributes and category-specific details
 * across all 7 dynamic buyer classifications with zero data loss.
 * @param {string} subType
 * @param {object} profile
 * @returns {object}
 */
export const extractBuyerProfile = (subType, profile = {}) => {
  const buyerType = String(subType || profile.buyerType || 'Individual').trim();

  const district = profile.district || null;
  const city = profile.city || null;
  const pinCode = profile.pinCode || profile.pincode || null;
  const address = profile.address || null;

  let businessName = '';
  let targetCommodities = '';
  let procurementVolume = '';
  let isGst = false;
  let gstin = null;
  let fssaiNumber = null;
  const categoryDetails = {};

  switch (buyerType) {
    case 'Individual': {
      businessName = profile.userName || profile.name || profile.businessName || 'Individual Household Buyer';
      const comms = Array.isArray(profile.individualCommodities)
        ? profile.individualCommodities
        : (profile.commodities || []);
      targetCommodities = comms.join(', ');
      procurementVolume = profile.individualVolume || profile.volume || null;
      isGst = false;
      gstin = null;
      fssaiNumber = null;

      categoryDetails.individualCommodities = comms;
      categoryDetails.individualVolume = profile.individualVolume || null;
      categoryDetails.individualFrequency = profile.individualFrequency || null;
      categoryDetails.individualPayment = profile.individualPayment || null;
      break;
    }

    case 'Business': {
      businessName = profile.businessName || 'Commercial Agro Business';
      const comms = Array.isArray(profile.businessCommodities)
        ? profile.businessCommodities
        : (profile.commodities || []);
      targetCommodities = comms.join(', ');
      procurementVolume = profile.businessVolume || profile.volume || null;
      isGst = profile.businessIsGst === 'Yes' || Boolean(profile.isGst);
      gstin = profile.businessGstin || profile.gstin || null;
      fssaiNumber = null;

      categoryDetails.businessName = profile.businessName || null;
      categoryDetails.businessConstitution = profile.businessConstitution || profile.constitution || null;
      categoryDetails.businessDesignation = profile.businessDesignation || profile.designation || null;
      categoryDetails.businessCommodities = comms;
      categoryDetails.businessVolume = profile.businessVolume || null;
      categoryDetails.businessPaymentTerms = profile.businessPaymentTerms || profile.paymentTerms || null;
      categoryDetails.businessIsGst = profile.businessIsGst || (isGst ? 'Yes' : 'No');
      categoryDetails.businessGstin = gstin;
      break;
    }

    case 'Manufacturer': {
      businessName = profile.mfgCompanyName || profile.companyName || profile.businessName || 'Industrial Agro Manufacturer';
      targetCommodities = profile.mfgRawMaterials || profile.rawMaterials || '';
      procurementVolume = profile.mfgVolume || profile.volume || null;
      isGst = profile.mfgIsGst === 'Yes' || Boolean(profile.isGst);
      gstin = profile.mfgGstin || profile.gstin || null;
      fssaiNumber = null;

      categoryDetails.mfgCompanyName = profile.mfgCompanyName || null;
      categoryDetails.mfgConstitution = profile.mfgConstitution || profile.constitution || null;
      categoryDetails.mfgDesignation = profile.mfgDesignation || profile.designation || null;
      categoryDetails.mfgCategory = profile.mfgCategory || null;
      categoryDetails.mfgRawMaterials = profile.mfgRawMaterials || null;
      categoryDetails.mfgVolume = profile.mfgVolume || null;
      categoryDetails.mfgPaymentTerms = profile.mfgPaymentTerms || profile.paymentTerms || null;
      categoryDetails.mfgIsGst = profile.mfgIsGst || (isGst ? 'Yes' : 'No');
      categoryDetails.mfgGstin = gstin;
      break;
    }

    case 'Food Processor': {
      businessName = profile.procBusinessName || profile.businessName || 'Agro Food Processor';
      targetCommodities = profile.procRawCommodities || profile.rawMaterials || '';
      procurementVolume = profile.procCapacity || profile.capacity || null;
      isGst = profile.procIsGst === 'Yes' || Boolean(profile.isGst);
      gstin = profile.procGstin || profile.gstin || null;
      fssaiNumber = profile.procFssaiNumber || profile.fssaiNumber || null;

      categoryDetails.procBusinessName = profile.procBusinessName || null;
      categoryDetails.procActivity = profile.procActivity || profile.activity || null;
      categoryDetails.procRawCommodities = profile.procRawCommodities || null;
      categoryDetails.procCapacity = profile.procCapacity || null;
      categoryDetails.procFssaiNumber = fssaiNumber;
      categoryDetails.procPaymentTerms = profile.procPaymentTerms || profile.paymentTerms || null;
      categoryDetails.procIsGst = profile.procIsGst || (isGst ? 'Yes' : 'No');
      categoryDetails.procGstin = gstin;
      break;
    }

    case 'Bakery or Food Business': {
      businessName = profile.bakeryName || profile.businessName || 'Commercial Bakery & Food Business';
      targetCommodities = profile.bakeryIngredients || '';
      procurementVolume = profile.bakeryFrequency || null;
      isGst = profile.bakeryIsGst === 'Yes' || Boolean(profile.isGst);
      gstin = profile.bakeryGstin || profile.gstin || null;
      fssaiNumber = profile.bakeryFssaiNumber || profile.fssaiNumber || null;

      categoryDetails.bakeryName = profile.bakeryName || null;
      categoryDetails.bakeryType = profile.bakeryType || null;
      categoryDetails.bakeryDesignation = profile.bakeryDesignation || null;
      categoryDetails.bakeryIngredients = profile.bakeryIngredients || null;
      categoryDetails.bakeryFrequency = profile.bakeryFrequency || null;
      categoryDetails.bakeryFssaiNumber = fssaiNumber;
      categoryDetails.bakeryIsGst = profile.bakeryIsGst || (isGst ? 'Yes' : 'No');
      categoryDetails.bakeryGstin = gstin;
      break;
    }

    case 'Reseller': {
      businessName = profile.resellerShopName || profile.shopName || profile.businessName || 'Wholesale Mandi Merchant';
      const comms = Array.isArray(profile.resellerCategories)
        ? profile.resellerCategories
        : (profile.commodities || []);
      targetCommodities = comms.join(', ');
      procurementVolume = profile.resellerDailyVolume || profile.volume || null;
      isGst = profile.resellerIsGst === 'Yes' || Boolean(profile.isGst);
      gstin = profile.resellerGstin || profile.gstin || null;
      fssaiNumber = null;

      categoryDetails.resellerShopName = profile.resellerShopName || null;
      categoryDetails.resellerType = profile.resellerType || null;
      categoryDetails.resellerCategories = comms;
      categoryDetails.resellerDailyVolume = profile.resellerDailyVolume || null;
      categoryDetails.resellerPaymentPreference = profile.resellerPaymentPreference || null;
      categoryDetails.resellerIsGst = profile.resellerIsGst || (isGst ? 'Yes' : 'No');
      categoryDetails.resellerGstin = gstin;
      break;
    }

    case 'Other':
    default: {
      businessName = profile.otherOrgName || profile.businessName || 'Institutional Food Buyer';
      targetCommodities = profile.otherItemsNeeded || '';
      procurementVolume = null;
      isGst = profile.otherIsGst === 'Yes' || Boolean(profile.isGst);
      gstin = profile.otherGstin || profile.gstin || null;
      fssaiNumber = profile.fssaiNumber || null;

      categoryDetails.otherOrgName = profile.otherOrgName || null;
      categoryDetails.otherCategory = profile.otherCategory || null;
      categoryDetails.otherPurpose = profile.otherPurpose || null;
      categoryDetails.otherItemsNeeded = profile.otherItemsNeeded || null;
      categoryDetails.otherIsGst = profile.otherIsGst || (isGst ? 'Yes' : 'No');
      categoryDetails.otherGstin = gstin;
      break;
    }
  }

  return {
    buyerType,
    businessName: businessName || 'Agri Buyer',
    district: district || 'Not specified',
    city,
    pinCode,
    address,
    isGst,
    gstin,
    fssaiNumber,
    targetCommodities: targetCommodities || null,
    procurementVolume: procurementVolume || null,
    categoryDetails,
  };
};

/**
 * Service: Submit Onboarding Application (Buyer & Seller)
 * @param {object} input
 * @returns {Promise<object>}
 */
export const submitApplicationService = async ({
  applicationId,
  role,
  subType,
  profile = {},
  documents = {},
  account = {},
  user,
} = {}) => {
  const userId = user?.id;

  if (!userId) {
    const error = new Error('User authentication required. Unverified credentials rejected.');
    error.statusCode = 401;
    throw error;
  }

  const normalizedRole = String(role || account?.activeRole || 'BUYER').trim().toUpperCase();
  const cleanSubType = String(subType || 'Individual').trim();
  const finalAppId = String(applicationId || `US_${normalizedRole}_${crypto.randomInt(100000, 999999)}`).trim();
  const now = new Date();

  // 1. Persist Profile
  if (normalizedRole === 'BUYER') {
    const buyerData = extractBuyerProfile(cleanSubType, profile);
    await profileRepository.upsertBuyer(userId, buyerData);
    await userRepository.updateBuyerOnboarding(userId);
    console.log(`[APPLICATION] Buyer profile & onboarding updated for user: ${userId}`);
  } else {
    // SELLER
    const sellerData = extractSellerProfile(cleanSubType, profile);
    await profileRepository.upsertSeller(userId, sellerData);
    await userRepository.updateSellerOnboarding(userId);
    console.log(`[APPLICATION] Seller profile & onboarding updated for user: ${userId}`);
  }

  // 2. Persist Application Record with Full Profile Payload Snapshot
  const savedApp = await applicationRepository.upsert(finalAppId, {
    userId,
    role: normalizedRole,
    subType: cleanSubType,
    profilePayload: profile,
    documents,
    overallStatus: 'PENDING_REVIEW',
    adminComments: 'Application received and queued for review.',
    submittedAt: now,
    updatedAt: now,
  });

  return {
    success: true,
    message: 'Application submitted successfully.',
    applicationId: finalAppId,
    data: {
      applicationId: finalAppId,
      role: normalizedRole,
      subType: cleanSubType,
      overallStatus: 'PENDING_REVIEW',
      submittedAt: savedApp.submittedAt,
    },
  };
};

/**
 * Service: Check Application Status
 * @param {object} input
 * @returns {Promise<object>}
 */
export const getApplicationStatusService = async ({ applicationId, user } = {}) => {
  let app = null;

  if (applicationId) {
    app = await applicationRepository.findById(applicationId);
  }

  const userId = user?.id;
  if (!app && userId) {
    app = await applicationRepository.findLatestByUserId(userId);
  }

  if (app) {
    // Enrich with live documents from the documents table for admin/user verification
    const verifiedDocuments = await documentRepository.findByUserId(app.userId);
    return {
      success: true,
      application: {
        ...app,
        verifiedDocuments: verifiedDocuments || [],
      },
    };
  }

  return {
    success: true,
    application: null,
    message: 'No active application found.',
  };
};
