import dotenv from 'dotenv';
dotenv.config();

import * as userRepository from '../src/repositories/user.repository.js';
import * as profileRepository from '../src/repositories/profile.repository.js';
import * as applicationRepository from '../src/repositories/application.repository.js';
import { submitApplicationService } from '../src/services/application.service.js';
import { getBuyerMarketplaceService } from '../src/services/onboarding.service.js';

async function runTests() {
  console.log('[TEST] Starting multi-category buyer classification tests...');

  // Use verified user from users table
  let user = await userRepository.findByEmail('nithishtestcase@gmail.com');
  if (!user) {
    console.error('Test user nithishtestcase@gmail.com not found');
    process.exit(1);
  }
  console.log(`[TEST] Using test user: ${user.id} (${user.email})`);

  // Test Case 1: Individual Household Buyer (Category 1 from screenshot)
  console.log('\n--- TEST 1: Individual Household Buyer ---');
  const individualPayload = {
    role: 'BUYER',
    subType: 'Individual',
    account: { id: user.id, email: user.email },
    profile: {
      district: 'Coimbatore',
      city: 'Pollachi',
      pinCode: '642001',
      address: '12/4 East Street, Pollachi',
      individualCommodities: ['Fresh Vegetables', 'Fruits'],
      individualVolume: '25 - 50 kg / month',
      individualFrequency: 'Weekly',
      individualPayment: 'UPI Instant',
    },
    documents: {
      idProof: { fileName: 'aadhaar.pdf', url: 'https://example.com/aadhaar.pdf' }
    }
  };

  const indRes = await submitApplicationService(individualPayload);
  console.log('[TEST 1] Submit Result:', indRes.message, 'AppId:', indRes.applicationId);

  const indProfile = await profileRepository.findBuyerByUserId(user.id);
  console.log('[TEST 1] Retrieved Profile from DB:');
  console.log('  buyerType:', indProfile.buyerType);
  console.log('  businessName:', indProfile.businessName);
  console.log('  targetCommodities:', indProfile.targetCommodities);
  console.log('  procurementVolume:', indProfile.procurementVolume);
  console.log('  categoryDetails.individualFrequency:', indProfile.categoryDetails?.individualFrequency);
  console.log('  categoryDetails.individualPayment:', indProfile.categoryDetails?.individualPayment);

  if (!indProfile.businessName) throw new Error('TEST 1 FAILED: businessName is empty');
  if (indProfile.targetCommodities !== 'Fresh Vegetables, Fruits') throw new Error('TEST 1 FAILED: targetCommodities mismatch');
  if (indProfile.categoryDetails?.individualFrequency !== 'Weekly') throw new Error('TEST 1 FAILED: individualFrequency missing');

  // Test Case 2: Food Processor (Category 4 with FSSAI & GSTIN)
  console.log('\n--- TEST 2: Food Processor ---');
  const procPayload = {
    role: 'BUYER',
    subType: 'Food Processor',
    account: { id: user.id, email: user.email },
    profile: {
      district: 'Coimbatore',
      city: 'Pollachi',
      pinCode: '642001',
      address: 'Market Road, Near New Bus Stand, Pollachi',
      procBusinessName: 'Kongu Agro Milling & Processing Ltd',
      procActivity: 'Flour Milling & Spice Grinding',
      procRawCommodities: 'Paddy, Turmeric, Chilly, Pulses',
      procCapacity: '25 MT / month',
      procFssaiNumber: '10020042000555',
      procPaymentTerms: 'NEFT / RTGS Immediate',
      procIsGst: 'Yes',
      procGstin: '33AABCK1234F1Z5',
    },
    documents: {
      fssaiDoc: { fileName: 'fssai_cert.pdf', url: 'https://example.com/fssai.pdf' }
    }
  };

  const procRes = await submitApplicationService(procPayload);
  console.log('[TEST 2] Submit Result:', procRes.message, 'AppId:', procRes.applicationId);

  const procProfile = await profileRepository.findBuyerByUserId(user.id);
  console.log('[TEST 2] Retrieved Profile from DB:');
  console.log('  businessName:', procProfile.businessName);
  console.log('  fssaiNumber:', procProfile.fssaiNumber);
  console.log('  isGst:', procProfile.isGst);
  console.log('  gstin:', procProfile.gstin);
  console.log('  targetCommodities:', procProfile.targetCommodities);
  console.log('  procurementVolume:', procProfile.procurementVolume);
  console.log('  categoryDetails.procActivity:', procProfile.categoryDetails?.procActivity);

  if (procProfile.businessName !== 'Kongu Agro Milling & Processing Ltd') throw new Error('TEST 2 FAILED: businessName mismatch');
  if (procProfile.fssaiNumber !== '10020042000555') throw new Error('TEST 2 FAILED: fssaiNumber mismatch');
  if (!procProfile.isGst) throw new Error('TEST 2 FAILED: isGst should be true');

  // Test Case 3: Bakery or Food Business (Category 5 with Ingredients & Daily Frequency)
  console.log('\n--- TEST 3: Bakery or Food Business ---');
  const bakeryPayload = {
    role: 'BUYER',
    subType: 'Bakery or Food Business',
    account: { id: user.id, email: user.email },
    profile: {
      district: 'Tiruppur',
      city: 'Avinashi',
      pinCode: '641654',
      address: 'Main Road, Avinashi',
      bakeryName: 'Sri Amman Sweets & Bakery',
      bakeryType: 'Commercial Bakery & Kitchen',
      bakeryDesignation: 'Purchase Head',
      bakeryIngredients: 'Wheat Atta, Dairy Butter, Fresh Fruits, Sugar',
      bakeryFrequency: 'Daily',
      bakeryFssaiNumber: '10020042000888',
      bakeryIsGst: 'Yes',
      bakeryGstin: '33AABCS9999F1Z2',
    }
  };

  const bakeryRes = await submitApplicationService(bakeryPayload);
  console.log('[TEST 3] Submit Result:', bakeryRes.message);

  const bakeryProfile = await profileRepository.findBuyerByUserId(user.id);
  console.log('[TEST 3] Retrieved Profile from DB:');
  console.log('  businessName:', bakeryProfile.businessName);
  console.log('  targetCommodities:', bakeryProfile.targetCommodities);
  console.log('  procurementVolume:', bakeryProfile.procurementVolume);
  console.log('  categoryDetails.bakeryIngredients:', bakeryProfile.categoryDetails?.bakeryIngredients);

  if (bakeryProfile.businessName !== 'Sri Amman Sweets & Bakery') throw new Error('TEST 3 FAILED: bakeryName mismatch');
  if (bakeryProfile.categoryDetails?.bakeryFrequency !== 'Daily') throw new Error('TEST 3 FAILED: bakeryFrequency missing');

  // Test Case 4: Wholesale Mandi Reseller (Category 6 with Daily Quintals)
  console.log('\n--- TEST 4: Mandi Reseller ---');
  const resellerPayload = {
    role: 'BUYER',
    subType: 'Reseller',
    account: { id: user.id, email: user.email },
    profile: {
      district: 'Salem',
      city: 'Salem Mandi',
      pinCode: '636001',
      address: 'Shop No. 45, APMC Mandi, Salem',
      resellerShopName: 'Selvam Vegetable Traders',
      resellerType: 'Mandi Wholesale Merchant',
      resellerCategories: ['Fresh Vegetables', 'Onion & Potato', 'Bananas'],
      resellerDailyVolume: '10 - 25 Quintals / day',
      resellerPaymentPreference: 'Daily Settlement (UPI / Cash)',
      resellerIsGst: 'No',
      resellerGstin: '',
    }
  };

  const resRes = await submitApplicationService(resellerPayload);
  console.log('[TEST 4] Submit Result:', resRes.message);

  const resProfile = await profileRepository.findBuyerByUserId(user.id);
  console.log('[TEST 4] Retrieved Profile from DB:');
  console.log('  businessName:', resProfile.businessName);
  console.log('  targetCommodities:', resProfile.targetCommodities);
  console.log('  procurementVolume:', resProfile.procurementVolume);
  console.log('  categoryDetails.resellerDailyVolume:', resProfile.categoryDetails?.resellerDailyVolume);

  if (resProfile.businessName !== 'Selvam Vegetable Traders') throw new Error('TEST 4 FAILED: resellerShopName mismatch');
  if (resProfile.categoryDetails?.resellerDailyVolume !== '10 - 25 Quintals / day') throw new Error('TEST 4 FAILED: daily volume missing');

  // Test Case 5: Buyer Marketplace Service (Flattened check)
  console.log('\n--- TEST 5: Buyer Marketplace Retrieval Service ---');
  const marketRes = await getBuyerMarketplaceService(user.id);
  console.log('[TEST 5] Marketplace profile businessName:', marketRes.data.profile.businessName);
  console.log('[TEST 5] Marketplace profile resellerDailyVolume (flattened):', marketRes.data.profile.resellerDailyVolume);
  console.log('[TEST 5] Marketplace profile buyerType:', marketRes.data.profile.buyerType);

  if (marketRes.data.profile.resellerDailyVolume !== '10 - 25 Quintals / day') {
    throw new Error('TEST 5 FAILED: Flattened profile did not include categoryDetails');
  }

  console.log('\nALL MULTI-CATEGORY BUYER ONBOARDING TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
}

runTests().catch(err => {
  console.error('\nTEST SUITE ERROR:', err);
  process.exit(1);
});
