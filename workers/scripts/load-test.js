/**
 * k6 Load Test Script for Grubtech API
 *
 * Installation: brew install k6 (macOS) or https://k6.io/docs/getting-started/installation
 *
 * Usage:
 *   k6 run scripts/load-test.js                    # Run with default settings
 *   k6 run --vus 10 --duration 30s scripts/load-test.js  # Light load test
 *   k6 run --out json=reports/load-test.json scripts/load-test.js
 *
 * NOTE: Production has rate limiting (100 req/15min). For heavy load testing,
 * either test against staging/development or temporarily increase limits.
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const integrationsTrend = new Trend('integrations_duration');
const testimonialsTrend = new Trend('testimonials_duration');
const healthTrend = new Trend('health_duration');

// Configuration
const BASE_URL = __ENV.API_URL || 'https://grubtech-api.shady-ehab.workers.dev';

export const options = {
  // Conservative test stages to avoid rate limiting
  stages: [
    { duration: '10s', target: 5 },   // Ramp up to 5 users
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 10 },   // Stay at 10 users
    { duration: '10s', target: 0 },   // Ramp down
  ],

  // Performance thresholds
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],  // 95% under 500ms, 99% under 1s
    http_req_failed: ['rate<0.05'],                   // Less than 5% errors (accounting for rate limits)
    integrations_duration: ['p(95)<400'],             // Integrations endpoint
    testimonials_duration: ['p(95)<400'],             // Testimonials endpoint
    health_duration: ['p(95)<300'],                   // Health check
  },
};

// Headers
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

export default function() {
  // Group: Health Check
  group('Health Endpoints', function() {
    const healthRes = http.get(`${BASE_URL}/api/health`, { headers });

    if (healthRes.status === 200) {
      healthTrend.add(healthRes.timings.duration);
    }

    const healthCheck = check(healthRes, {
      'health status is 200': (r) => r.status === 200,
      'health response has status': (r) => {
        try {
          return JSON.parse(r.body).status !== undefined;
        } catch {
          return false;
        }
      },
    });

    if (!healthCheck) {
      errorRate.add(1);
    }

    sleep(1); // Longer sleep to avoid rate limiting
  });

  // Group: Public API Endpoints
  group('Public Endpoints', function() {
    // Integrations list
    const integrationsRes = http.get(`${BASE_URL}/api/integrations?limit=20`, { headers });

    if (integrationsRes.status === 200) {
      integrationsTrend.add(integrationsRes.timings.duration);
    }

    const intCheck = check(integrationsRes, {
      'integrations status is 200': (r) => r.status === 200,
      'integrations has data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.data && Array.isArray(body.data);
        } catch {
          return false;
        }
      },
      'integrations response time OK': (r) => r.timings.duration < 500,
    });

    if (!intCheck) {
      errorRate.add(1);
    }

    sleep(1);

    // Testimonials
    const testimonialsRes = http.get(`${BASE_URL}/api/testimonials`, { headers });

    if (testimonialsRes.status === 200) {
      testimonialsTrend.add(testimonialsRes.timings.duration);
    }

    const testCheck = check(testimonialsRes, {
      'testimonials status is 200': (r) => r.status === 200,
      'testimonials is array': (r) => {
        try {
          return Array.isArray(JSON.parse(r.body));
        } catch {
          return false;
        }
      },
    });

    if (!testCheck) {
      errorRate.add(1);
    }

    sleep(1);

    // Video galleries
    const videosRes = http.get(`${BASE_URL}/api/video-galleries`, { headers });

    check(videosRes, {
      'videos status is 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    sleep(1);
  });

  // Group: Static Assets (Images)
  group('Static Assets', function() {
    const images = [
      '/uploads/integrations/talabat.webp',
      '/uploads/integrations/deliveroo.webp',
      '/uploads/integrations/FOODICS.webp',
    ];
    const image = images[Math.floor(Math.random() * images.length)];

    const imageRes = http.get(`${BASE_URL}${image}`);

    check(imageRes, {
      'image status is 200': (r) => r.status === 200,
      'image content-type is correct': (r) => r.headers['Content-Type'] === 'image/webp',
    }) || errorRate.add(1);

    sleep(0.5);
  });

  // Think time between iterations
  sleep(Math.random() * 2 + 2);  // 2-4 seconds
}

// Setup - runs once before tests
export function setup() {
  console.log(`Starting load test against: ${BASE_URL}`);
  console.log('Note: Production has rate limiting. For heavy load testing, use staging environment.');

  // Verify API is reachable (with retry for rate limit)
  let retries = 3;
  let res;

  while (retries > 0) {
    res = http.get(`${BASE_URL}/api/health`);
    if (res.status === 200) {
      break;
    }
    if (res.status === 429) {
      console.log('Rate limited, waiting 10 seconds...');
      sleep(10);
      retries--;
    } else {
      throw new Error(`API health check failed: ${res.status}`);
    }
  }

  if (res.status !== 200) {
    throw new Error(`API health check failed after retries: ${res.status}. Rate limit may be exhausted - wait 15 minutes and try again.`);
  }

  return { startTime: new Date().toISOString() };
}

// Teardown - runs once after tests
export function teardown(data) {
  console.log(`Load test completed. Started at: ${data.startTime}`);
}

// Summary report generation
export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // Generate simple text summary
  let summary = `
================================================================================
                         GRUBTECH API LOAD TEST REPORT
================================================================================
Generated: ${new Date().toISOString()}
API URL: ${BASE_URL}

`;

  // Add threshold results
  if (data.thresholds) {
    summary += `THRESHOLDS:\n`;
    for (const [name, result] of Object.entries(data.thresholds)) {
      summary += `  ${result.ok ? '✓' : '✗'} ${name}\n`;
    }
    summary += `\n`;
  }

  // Add HTTP metrics if available
  if (data.metrics && data.metrics.http_req_duration) {
    const dur = data.metrics.http_req_duration;
    summary += `HTTP REQUEST DURATION:\n`;
    if (dur.values) {
      summary += `  - Count:   ${dur.values.count || 'N/A'}\n`;
      summary += `  - Average: ${dur.values.avg ? dur.values.avg.toFixed(2) + 'ms' : 'N/A'}\n`;
      summary += `  - Median:  ${dur.values.med ? dur.values.med.toFixed(2) + 'ms' : 'N/A'}\n`;
      summary += `  - p(95):   ${dur.values['p(95)'] ? dur.values['p(95)'].toFixed(2) + 'ms' : 'N/A'}\n`;
      summary += `  - p(99):   ${dur.values['p(99)'] ? dur.values['p(99)'].toFixed(2) + 'ms' : 'N/A'}\n`;
      summary += `  - Max:     ${dur.values.max ? dur.values.max.toFixed(2) + 'ms' : 'N/A'}\n`;
    }
    summary += `\n`;
  }

  // Add request stats
  if (data.metrics && data.metrics.http_reqs) {
    const reqs = data.metrics.http_reqs;
    summary += `REQUESTS:\n`;
    if (reqs.values) {
      summary += `  - Total:      ${reqs.values.count || 'N/A'}\n`;
      summary += `  - Rate:       ${reqs.values.rate ? reqs.values.rate.toFixed(2) + ' req/s' : 'N/A'}\n`;
    }
    summary += `\n`;
  }

  // Add failure rate
  if (data.metrics && data.metrics.http_req_failed) {
    const failed = data.metrics.http_req_failed;
    summary += `FAILURES:\n`;
    if (failed.values) {
      summary += `  - Rate:       ${failed.values.rate !== undefined ? (failed.values.rate * 100).toFixed(2) + '%' : 'N/A'}\n`;
    }
    summary += `\n`;
  }

  summary += `================================================================================\n`;

  return {
    [`reports/load-test-${timestamp}.json`]: JSON.stringify(data, null, 2),
    stdout: summary,
  };
}
