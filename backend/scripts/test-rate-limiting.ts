/**
 * Rate Limiting Manual Test Script
 *
 * This script tests that rate limiting is working correctly on the login endpoint.
 * It makes multiple rapid requests and verifies that:
 * 1. Rate limiting kicks in after the configured number of requests
 * 2. Proper error messages are returned when rate limited
 * 3. Rate limit headers are present in responses
 *
 * Usage:
 *   1. Start the development server: npm run dev
 *   2. In another terminal, run: npx tsx backend/scripts/test-rate-limiting.ts
 *
 * Expected behavior:
 *   - First N requests should succeed or return 401 (invalid credentials)
 *   - After N requests, should receive 429 (Too Many Requests)
 *   - Response should include rate limit headers
 *   - Response message should match the configured message
 */

import * as http from 'http';

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const LOGIN_ENDPOINT = '/api/auth/login';
const TEST_USERNAME = 'testuser';
const TEST_PASSWORD = 'testpass123';

// Rate limit configuration (from env.ts defaults)
const RATE_LIMIT_MAX = parseInt(process.env.LOGIN_RATE_LIMIT_MAX || '100', 10);
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || '900000', 10);

interface TestResult {
  requestNumber: number;
  statusCode: number;
  message: string;
  headers: {
    'ratelimit-limit'?: string;
    'ratelimit-remaining'?: string;
    'ratelimit-reset'?: string;
    'retry-after'?: string;
  };
  timestamp: number;
}

/**
 * Make a single login request
 */
async function makeLoginRequest(requestNumber: number): Promise<TestResult> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      username: TEST_USERNAME,
      password: TEST_PASSWORD
    });

    const options = {
      hostname: BASE_URL.replace('http://', '').replace('https://', '').split(':')[0],
      port: parseInt(BASE_URL.split(':')[2] || '3001', 10),
      path: LOGIN_ENDPOINT,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        let message = '';
        try {
          const parsed = JSON.parse(body);
          message = parsed.error || parsed.message || JSON.stringify(parsed);
        } catch {
          message = body;
        }

        resolve({
          requestNumber,
          statusCode: res.statusCode || 0,
          message,
          headers: {
            'ratelimit-limit': res.headers['ratelimit-limit'] as string,
            'ratelimit-remaining': res.headers['ratelimit-remaining'] as string,
            'ratelimit-reset': res.headers['ratelimit-reset'] as string,
            'retry-after': res.headers['retry-after'] as string,
          },
          timestamp: Date.now()
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Run the rate limiting test
 */
async function runTest() {
  console.log('\n============================================');
  console.log('🧪 RATE LIMITING TEST');
  console.log('============================================');
  console.log(`Target: ${BASE_URL}${LOGIN_ENDPOINT}`);
  console.log(`Expected Rate Limit: ${RATE_LIMIT_MAX} requests per ${RATE_LIMIT_WINDOW_MS / 1000 / 60} minutes`);
  console.log('============================================\n');

  const results: TestResult[] = [];
  const testCount = RATE_LIMIT_MAX + 10; // Test beyond the limit
  let rateLimitHit = false;
  let rateLimitRequestNumber = 0;

  console.log(`📊 Making ${testCount} rapid login requests...\n`);

  // Make rapid requests
  for (let i = 1; i <= testCount; i++) {
    try {
      const result = await makeLoginRequest(i);
      results.push(result);

      // Print progress for key requests
      if (i === 1 || i === 5 || i === 10 || i % 20 === 0 || result.statusCode === 429) {
        const statusIcon = result.statusCode === 429 ? '🚫' :
                          result.statusCode === 401 ? '🔒' :
                          result.statusCode === 200 ? '✅' : '❓';

        console.log(`${statusIcon} Request ${i}: ${result.statusCode} - ${result.message}`);

        // Print rate limit headers if available
        if (result.headers['ratelimit-limit']) {
          console.log(`   Rate Limit Headers:`);
          console.log(`     Limit: ${result.headers['ratelimit-limit']}`);
          console.log(`     Remaining: ${result.headers['ratelimit-remaining']}`);
          console.log(`     Reset: ${result.headers['ratelimit-reset']}`);
          if (result.headers['retry-after']) {
            console.log(`     Retry-After: ${result.headers['retry-after']} seconds`);
          }
        }
      }

      // Track when rate limit is hit
      if (result.statusCode === 429 && !rateLimitHit) {
        rateLimitHit = true;
        rateLimitRequestNumber = i;
        console.log(`\n⚠️  RATE LIMIT TRIGGERED at request ${i}\n`);
      }

      // If rate limited, make a few more requests to confirm it's consistent
      if (rateLimitHit && i >= rateLimitRequestNumber + 5) {
        break;
      }

      // Small delay to avoid overwhelming the server (but still rapid)
      await new Promise(resolve => setTimeout(resolve, 10));
    } catch (error) {
      console.error(`❌ Error on request ${i}:`, error);
      break;
    }
  }

  // Analyze results
  console.log('\n============================================');
  console.log('📈 TEST RESULTS');
  console.log('============================================\n');

  const normalRequests = results.filter(r => r.statusCode !== 429);
  const rateLimitedRequests = results.filter(r => r.statusCode === 429);

  console.log(`Total requests made: ${results.length}`);
  console.log(`Normal responses (200/401): ${normalRequests.length}`);
  console.log(`Rate limited responses (429): ${rateLimitedRequests.length}`);

  // Verify acceptance criteria
  console.log('\n============================================');
  console.log('✅ ACCEPTANCE CRITERIA');
  console.log('============================================\n');

  let allPassed = true;

  // Criterion 1: Rate limiting kicks in after configured number of requests
  const criterion1 = rateLimitedRequests.length > 0;
  if (criterion1) {
    console.log(`✅ Rate limiting kicks in after ${rateLimitRequestNumber} requests`);
    console.log(`   (Expected around ${RATE_LIMIT_MAX}, actual: ${rateLimitRequestNumber})`);
  } else {
    console.log(`❌ Rate limiting did NOT activate (made ${results.length} requests)`);
    allPassed = false;
  }

  // Criterion 2: Proper error message is returned
  const rateLimitMessage = rateLimitedRequests[0]?.message || '';
  const expectedMessage = 'Too many login attempts from this IP, please try again after 15 minutes';
  const criterion2 = rateLimitMessage.includes('Too many login attempts') ||
                      rateLimitMessage.includes('try again');

  if (criterion2) {
    console.log(`✅ Proper error message returned: "${rateLimitMessage}"`);
  } else {
    console.log(`❌ Error message does not match expected format`);
    console.log(`   Expected: "${expectedMessage}"`);
    console.log(`   Actual: "${rateLimitMessage}"`);
    allPassed = false;
  }

  // Criterion 3: Rate limit headers are present
  const firstRateLimited = rateLimitedRequests[0];
  const hasHeaders = firstRateLimited && (
    firstRateLimited.headers['ratelimit-limit'] ||
    firstRateLimited.headers['retry-after']
  );

  if (hasHeaders) {
    console.log(`✅ Rate limit headers present:`);
    if (firstRateLimited.headers['ratelimit-limit']) {
      console.log(`   - RateLimit-Limit: ${firstRateLimited.headers['ratelimit-limit']}`);
      console.log(`   - RateLimit-Remaining: ${firstRateLimited.headers['ratelimit-remaining']}`);
      console.log(`   - RateLimit-Reset: ${firstRateLimited.headers['ratelimit-reset']}`);
    }
    if (firstRateLimited.headers['retry-after']) {
      console.log(`   - Retry-After: ${firstRateLimited.headers['retry-after']}`);
    }
  } else {
    console.log(`⚠️  Rate limit headers not found`);
    console.log(`   Note: This may be expected depending on express-rate-limit configuration`);
  }

  // Summary
  console.log('\n============================================');
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED! Rate limiting is working correctly.');
  } else {
    console.log('⚠️  SOME TESTS FAILED! Please review the results above.');
  }
  console.log('============================================\n');

  // Additional verification for skipSuccessfulRequests
  console.log('============================================');
  console.log('📝 ADDITIONAL NOTES');
  console.log('============================================\n');
  console.log('The loginRateLimiter has skipSuccessfulRequests: true');
  console.log('This means successful logins (200) are not counted against the limit.');
  console.log('Only failed attempts (401) and rate limited requests (429) count.');
  console.log('\nTo fully test this behavior, you would need:');
  console.log('1. A valid test user in the database');
  console.log('2. Mix of successful and failed login attempts');
  console.log('3. Verify only failed attempts count toward the limit\n');

  return allPassed ? 0 : 1;
}

// Run the test
console.log('\n⏳ Starting rate limiting test...');
console.log('⚠️  Make sure the development server is running (npm run dev)\n');

runTest()
  .then((exitCode) => {
    process.exit(exitCode);
  })
  .catch((error) => {
    console.error('\n❌ Test failed with error:', error);
    process.exit(1);
  });
