import dotenv from 'dotenv';
dotenv.config();

import * as userRepository from '../src/repositories/user.repository.js';
import * as profileRepository from '../src/repositories/profile.repository.js';
import * as applicationRepository from '../src/repositories/application.repository.js';
import { submitApplicationService } from '../src/services/application.service.js';
import { getSellerDashboardService } from '../src/services/onboarding.service.js';

async function runTests() {
  console.log('[TEST] Starting multi-category seller classification tests...');

  // 1. Fetch or create a test user
  let user = await userRepository.findByEmail('mlionelmessi184@gmail.com');
  if (!user) {
    console.error('Test user testuser@gmail.com not found');
    process.exit(1);
  }
  console.log(`[TEST] Using test user: ${user.id} (${user.email})`);

  // Test Case A: Agricultural Producer (FPO / Society from Screenshot 2)
  console.log('\n--- TEST A: Agricultural Producer (FPO) ---');
  const fpoPayload = {
    role: 'SELLER',
    subType: 'Agricultural Producer',
    account: { id: user.id, email: user.email },
    profile: {
      district: 'Coimbatore',
      village: 'Anaimalai',
      pinCode: '642001',
      farmAddress: 'SF No. 42/B, Thottam Road, Anaimalai',
      fpoName: 'Kongu Uzhavar Producer Co Ltd',
      fpoStructure: 'Farmer Producer Company (FPC)',
      fpoRegNumber: 'U01409TZ2021PTC028491',
      fpoMemberCount: '200 - 500 Farmers',
      fpoCombinedAcreage: '1,200 Acres',
      fpoCrops: ['Paddy / Rice', 'Coconut', 'Millets'],
      fpoCapacity: '150 MT / season',
      fpoIsGst: 'No',
      fpoGstin: '',
    },
    documents: {
      identity: { fileName: 'cin_cert.pdf', url: 'https://example.com/cin.pdf' }
    }
  };

  const fpoRes = await submitApplicationService(fpoPayload);
  console.log('[TEST A] Submit Application Result:', fpoRes.message, 'AppId:', fpoRes.applicationId);

  // Verify in seller_profiles
  const fpoProfile = await profileRepository.findSellerByUserId(user.id);
  console.log('[TEST A] Retrieved Profile from DB:');
  console.log('  sellerType:', fpoProfile.sellerType);
  console.log('  businessName:', fpoProfile.businessName);
  console.log('  district:', fpoProfile.district);
  console.log('  primaryProducts:', fpoProfile.primaryProducts);
  console.log('  capacity:', fpoProfile.capacity);
  console.log('  categoryDetails.fpoRegNumber:', fpoProfile.categoryDetails?.fpoRegNumber);
  console.log('  categoryDetails.fpoMemberCount:', fpoProfile.categoryDetails?.fpoMemberCount);
  console.log('  categoryDetails.fpoStructure:', fpoProfile.categoryDetails?.fpoStructure);

  if (fpoProfile.businessName !== 'Kongu Uzhavar Producer Co Ltd') {
    throw new Error('TEST A FAILED: businessName mismatch');
  }
  if (fpoProfile.categoryDetails?.fpoRegNumber !== 'U01409TZ2021PTC028491') {
    throw new Error('TEST A FAILED: fpoRegNumber not preserved in categoryDetails');
  }
  if (fpoProfile.categoryDetails?.fpoMemberCount !== '200 - 500 Farmers') {
    throw new Error('TEST A FAILED: fpoMemberCount not preserved in categoryDetails');
  }

  // Verify in applications table
  const fpoApp = await applicationRepository.findById(fpoRes.applicationId);
  console.log('[TEST A] Retrieved Application Snapshot from DB:');
  console.log('  overallStatus:', fpoApp.overallStatus);
  console.log('  profilePayload.fpoName:', fpoApp.profilePayload?.fpoName);
  console.log('  profilePayload.fpoRegNumber:', fpoApp.profilePayload?.fpoRegNumber);

  if (!fpoApp.profilePayload?.fpoName) {
    throw new Error('TEST A FAILED: profilePayload not stored in applications table');
  }

  // Test Case B: Ingredient Producer (Category 5 with FSSAI & Cold-pressed Technology)
  console.log('\n--- TEST B: Ingredient Producer ---');
  const ingPayload = {
    role: 'SELLER',
    subType: 'Ingredient Producer',
    account: { id: user.id, email: user.email },
    profile: {
      district: 'Erode',
      village: 'Perundurai',
      pinCode: '638052',
      farmAddress: 'SIPCOT Industrial Park, Perundurai',
      ingProducerName: 'Kongu Traditional Chekku Oils',
      ingProducts: 'Cold-pressed Sesame & Coconut Oils',
      ingCapacity: '10 MT / month',
      ingTechnology: 'Traditional Wood Pressed (Marachekku)',
      ingFssaiNumber: '10020042000789',
      ingPackaging: '15L Barrels & Bulk Cans',
      ingIsGst: 'Yes',
      ingGstin: '33AABCK1234F1Z5',
    },
    documents: {
      fssaiCert: { fileName: 'fssai_cert.pdf', url: 'https://example.com/fssai.pdf' }
    }
  };

  const ingRes = await submitApplicationService(ingPayload);
  console.log('[TEST B] Submit Application Result:', ingRes.message, 'AppId:', ingRes.applicationId);

  const ingProfile = await profileRepository.findSellerByUserId(user.id);
  console.log('[TEST B] Retrieved Profile from DB:');
  console.log('  sellerType:', ingProfile.sellerType);
  console.log('  businessName:', ingProfile.businessName);
  console.log('  fssaiNumber:', ingProfile.fssaiNumber);
  console.log('  isGst:', ingProfile.isGst);
  console.log('  gstin:', ingProfile.gstin);
  console.log('  primaryProducts:', ingProfile.primaryProducts);
  console.log('  capacity:', ingProfile.capacity);
  console.log('  categoryDetails.ingTechnology:', ingProfile.categoryDetails?.ingTechnology);

  if (ingProfile.fssaiNumber !== '10020042000789') {
    throw new Error('TEST B FAILED: fssaiNumber mismatch');
  }
  if (ingProfile.categoryDetails?.ingTechnology !== 'Traditional Wood Pressed (Marachekku)') {
    throw new Error('TEST B FAILED: ingTechnology not preserved');
  }

  // Test Case C: Dashboard Retrieval Check (Merged profile check)
  console.log('\n--- TEST C: Dashboard Retrieval Service ---');
  const dashRes = await getSellerDashboardService(user.id);
  console.log('[TEST C] Dashboard profile businessName:', dashRes.data.profile.businessName);
  console.log('[TEST C] Dashboard profile ingTechnology (flattened):', dashRes.data.profile.ingTechnology);
  console.log('[TEST C] Dashboard profile fssaiNumber:', dashRes.data.profile.fssaiNumber);

  if (dashRes.data.profile.ingTechnology !== 'Traditional Wood Pressed (Marachekku)') {
    throw new Error('TEST C FAILED: Flattened profile did not include categoryDetails');
  }

  // Test Case D: Direct Farmer (Category 1 from Screenshot 1)
  console.log('\n--- TEST D: Direct Farmer ---');
  const farmerPayload = {
    role: 'SELLER',
    subType: 'Farmer',
    account: { id: user.id, email: user.email },
    profile: {
      district: 'Coimbatore',
      village: 'Anaimalai',
      pinCode: '642001',
      farmAddress: 'Survey No. 42/B, Thottam Road, Post Box 12',
      farmerFarmName: 'Green Harvest Farm',
      farmerLandSize: '2 - 5 Acres',
      farmerCategory: 'Landowner Farmer',
      farmerCrops: ['Banana', 'Coconut', 'Turmeric'],
      farmerAvailableQty: '50 Quintals',
      farmerHarvestMonths: 'All Year',
      farmerMethod: 'Conventional Farming',
    },
    documents: {
      aadhaar: { fileName: 'aadhaar.pdf', url: 'https://example.com/aadhaar.pdf' }
    }
  };

  const farmerRes = await submitApplicationService(farmerPayload);
  console.log('[TEST D] Submit Application Result:', farmerRes.message);

  const farmerProfile = await profileRepository.findSellerByUserId(user.id);
  console.log('[TEST D] Retrieved Farmer Profile from DB:');
  console.log('  sellerType:', farmerProfile.sellerType);
  console.log('  businessName:', farmerProfile.businessName);
  console.log('  primaryProducts:', farmerProfile.primaryProducts);
  console.log('  capacity:', farmerProfile.capacity);
  console.log('  categoryDetails.crops:', farmerProfile.categoryDetails?.crops);
  console.log('  categoryDetails.farmingMethod:', farmerProfile.categoryDetails?.farmingMethod);

  if (farmerProfile.businessName !== 'Green Harvest Farm') {
    throw new Error('TEST D FAILED: Farmer businessName mismatch');
  }

  console.log('\nALL MULTI-CATEGORY SELLER ONBOARDING TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
}

runTests().catch(err => {
  console.error('\nTEST SUITE ERROR:', err);
  process.exit(1);
});
