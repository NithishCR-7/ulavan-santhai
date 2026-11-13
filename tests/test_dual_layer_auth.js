import dotenv from 'dotenv';
dotenv.config();

process.env.NODE_ENV = 'test';

import http from 'node:http';
import { app } from '../src/server.js';
import * as userRepository from '../src/repositories/user.repository.js';
import * as applicationRepository from '../src/repositories/application.repository.js';
import { generateAuthToken } from '../src/services/auth.service.js';
import { assertAuthenticated, assertAuthorized, AuthError, ForbiddenError } from '../src/utils/authGuard.js';

const TEST_PORT = 5059;
let serverInstance = null;

async function runDualLayerTests() {
  console.log('[TEST] Starting Dual-Layer Authentication & Authorization Verification Suite...');

  // Start test server
  await new Promise((resolve) => {
    serverInstance = app.listen(TEST_PORT, '127.0.0.1', () => {
      console.log(`[TEST] Test server listening on http://127.0.0.1:${TEST_PORT}`);
      resolve();
    });
  });

  const baseUrl = `http://127.0.0.1:${TEST_PORT}`;

  try {
    // 1. Fetch live test user
    const testUser = await userRepository.findByEmail('nithishtestcase@gmail.com');
    if (!testUser) {
      throw new Error('Test user nithishtestcase@gmail.com not found in database.');
    }
    console.log(`[TEST] Active test user: ${testUser.id} (${testUser.email})`);

    const validToken = generateAuthToken(testUser);

    // =========================================================================
    // SECTION 1: Gate 1 Route Middleware - Missing Authorization Header (401)
    // =========================================================================
    console.log('\n--- SECTION 1: Gate 1 Route Middleware Rejections (Missing Token) ---');

    const unauthEndpoints = [
      { method: 'POST', path: '/api/v1/applications/submit', body: { role: 'BUYER' } },
      { method: 'POST', path: '/api/v1/payments', body: { amount: 365 } },
      { method: 'POST', path: '/api/v1/onboarding/buyer', body: { buyerType: 'Individual' } },
      { method: 'POST', path: '/api/v1/onboarding/seller', body: { sellerType: 'Farmer' } },
      { method: 'GET', path: '/api/v1/buyer/marketplace' },
      { method: 'GET', path: '/api/v1/seller/dashboard' },
      { method: 'GET', path: '/api/v1/user/me' },
    ];

    for (const ep of unauthEndpoints) {
      const opts = {
        method: ep.method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (ep.body) opts.body = JSON.stringify(ep.body);

      const res = await fetch(`${baseUrl}${ep.path}`, opts);
      const json = await res.json().catch(() => ({}));

      console.log(`[GATE 1] ${ep.method} ${ep.path} -> Status: ${res.status} (Success: ${json.success})`);
      if (res.status !== 401) {
        throw new Error(`Gate 1 failure: Expected 401 for ${ep.path}, got ${res.status}`);
      }
      if (json.success !== false) {
        throw new Error(`Gate 1 failure: Response success flag should be false`);
      }
    }

    // =========================================================================
    // SECTION 2: Gate 1 Route Middleware - Invalid / Tampered Token (401)
    // =========================================================================
    console.log('\n--- SECTION 2: Gate 1 Invalid Token Signature Rejection ---');
    const badTokenRes = await fetch(`${baseUrl}/api/v1/applications/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer invalid_signature_payload_xyz',
      },
      body: JSON.stringify({ role: 'BUYER' }),
    });
    const badTokenJson = await badTokenRes.json().catch(() => ({}));
    console.log(`[GATE 1] Invalid Token -> Status: ${badTokenRes.status}, Message: "${badTokenJson.message}"`);
    if (badTokenRes.status !== 401) {
      throw new Error(`Expected 401 for invalid token, got ${badTokenRes.status}`);
    }

    // =========================================================================
    // SECTION 3: Gate 2 Controller-Level Assertion Direct Unit Verification
    // =========================================================================
    console.log('\n--- SECTION 3: Gate 2 Controller Assertion Direct Verification ---');
    
    // Test 3A: Empty req object
    let caughtAuthError = false;
    try {
      assertAuthenticated({});
    } catch (err) {
      if (err instanceof AuthError && err.statusCode === 401) {
        caughtAuthError = true;
      }
    }
    if (!caughtAuthError) throw new Error('Gate 2 assertion failed to throw 401 on empty req');
    console.log('[GATE 2] assertAuthenticated({}) correctly threw AuthError(401)');

    // Test 3B: req with pre-verified req.user
    const mockReqWithUser = { user: { id: testUser.id, role: 'BUYER' } };
    const assertedUser = assertAuthenticated(mockReqWithUser);
    if (assertedUser.id !== testUser.id) throw new Error('Gate 2 assertion failed to return req.user');
    console.log('[GATE 2] assertAuthenticated(req.user) passed identity check');

    // Test 3C: assertAuthorized with invalid role
    let caughtRoleError = false;
    try {
      await assertAuthorized(mockReqWithUser, { roles: ['ADMIN'] });
    } catch (err) {
      if (err instanceof ForbiddenError && err.statusCode === 403) {
        caughtRoleError = true;
      }
    }
    if (!caughtRoleError) throw new Error('Gate 2 assertAuthorized failed to enforce role restriction');
    console.log('[GATE 2] assertAuthorized(roles) correctly threw ForbiddenError(403)');

    // =========================================================================
    // SECTION 4: Anti-Spoofing & Identity Pinning Protection
    // =========================================================================
    console.log('\n--- SECTION 4: Anti-Spoofing Identity Pinning Test ---');
    // An attacker authenticates as testUser, but provides a spoofed userId in the request body
    const spoofPayload = {
      role: 'BUYER',
      subType: 'Individual',
      userId: 'SPOOFED_VICTIM_USER_ID_999999',
      account: {
        id: 'SPOOFED_VICTIM_USER_ID_999999',
        email: 'victim@corporate.com',
      },
      profile: {
        district: 'Coimbatore',
        city: 'Pollachi',
        address: '100 Security Boulevard',
        individualCommodities: ['Organic Produce'],
        individualVolume: '10 - 20 kg',
      },
    };

    const spoofRes = await fetch(`${baseUrl}/api/v1/applications/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      body: JSON.stringify(spoofPayload),
    });

    const spoofJson = await spoofRes.json();
    console.log(`[ANTI-SPOOF] Application Submit Status: ${spoofRes.status}`);
    console.log(`[ANTI-SPOOF] Returned Application ID: ${spoofJson.applicationId}`);

    if (spoofRes.status !== 200) {
      throw new Error(`Application submission failed with status ${spoofRes.status}`);
    }

    // Verify in database: Application MUST be stored under testUser.id, NEVER under spoofed ID
    const submittedApp = await applicationRepository.findById(spoofJson.applicationId);
    if (!submittedApp) {
      throw new Error(`Application record ${spoofJson.applicationId} not found in database`);
    }

    console.log(`[ANTI-SPOOF] Database verification:`);
    console.log(`  Saved userId in DB:    ${submittedApp.userId}`);
    console.log(`  Actual authenticated:  ${testUser.id}`);
    console.log(`  Rejected spoofed ID:   SPOOFED_VICTIM_USER_ID_999999`);

    if (submittedApp.userId !== testUser.id) {
      throw new Error(`CRITICAL SECURITY FAILURE: Application saved under spoofed userId ${submittedApp.userId}!`);
    }
    console.log('[ANTI-SPOOF] PASSED: Body-based spoofed identity was completely ignored and pinned to JWT token user ID.');

    // =========================================================================
    // SECTION 5: Gate 2 Authorization - Lifecycle Onboarding Check (403)
    // =========================================================================
    console.log('\n--- SECTION 5: Gate 2 Seller Onboarding Authorization Check ---');
    // testUser currently has sellerOnboarded = false
    const sellerDashRes = await fetch(`${baseUrl}/api/v1/seller/dashboard`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    });
    const sellerDashJson = await sellerDashRes.json();
    console.log(`[GATE 2] Non-onboarded seller dashboard -> Status: ${sellerDashRes.status}, Message: "${sellerDashJson.message}"`);
    if (sellerDashRes.status !== 403) {
      throw new Error(`Expected 403 for non-onboarded seller, got ${sellerDashRes.status}`);
    }

    // =========================================================================
    // SECTION 6: Gate 1 + Gate 2 Dual Pass (Happy Path)
    // =========================================================================
    console.log('\n--- SECTION 6: Gate 1 + Gate 2 Dual Pass (Happy Path) ---');

    // 6A: Payment Record
    const paymentRes = await fetch(`${baseUrl}/api/v1/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      body: JSON.stringify({
        transactionId: `TXN_TEST_${Date.now()}`,
        amount: 365,
        plan: 'Buyer Verified Annual Plan',
        role: 'BUYER',
      }),
    });
    const paymentJson = await paymentRes.json();
    console.log(`[HAPPY PATH] Payment Status: ${paymentRes.status}, PaymentId: ${paymentJson.payment?.id}`);
    if (paymentRes.status !== 200) {
      throw new Error(`Payment processing failed with status ${paymentRes.status}`);
    }

    // 6B: Buyer Marketplace (testUser has buyerOnboarded = true from Section 4)
    const marketplaceRes = await fetch(`${baseUrl}/api/v1/buyer/marketplace`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    });
    const marketplaceJson = await marketplaceRes.json();
    console.log(`[HAPPY PATH] Buyer Marketplace Status: ${marketplaceRes.status}`);
    console.log(`[HAPPY PATH] Buyer Marketplace Name: "${marketplaceJson.data?.buyer?.name}", Commodities:`, marketplaceJson.data?.marketplace?.featuredCommodities?.slice(0, 3));
    if (marketplaceRes.status !== 200) {
      throw new Error(`Marketplace fetch failed with status ${marketplaceRes.status}`);
    }

    console.log('\n=============================================================');
    console.log('[SUCCESS] All Dual-Layer Authentication & Authorization Tests Passed!');
    console.log('=============================================================\n');

  } finally {
    if (serverInstance) {
      await new Promise(resolve => serverInstance.close(resolve));
      console.log('[TEST] Test server stopped.');
    }
  }
}

runDualLayerTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[TEST FAILED]', err);
    process.exit(1);
  });
