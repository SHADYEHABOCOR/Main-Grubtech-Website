/**
 * BambooHR API Service
 *
 * Fetches job openings from BambooHR's Applicant Tracking System (ATS) API.
 * Jobs are cached in KV to reduce API calls and improve performance.
 *
 * API Documentation: https://documentation.bamboohr.com/reference/applicant-tracking-1
 */

import type { Env } from '../types/bindings';

/**
 * BambooHR Job response from API
 * Note: BambooHR returns jobs as an array directly, not wrapped in { jobs: [] }
 * Fields like title, department, location are objects with { id, label }
 */
interface BambooHRJob {
  id: number;
  title: {
    id: number | null;
    label: string;
  };
  department?: {
    id: number;
    label: string;
  };
  location?: {
    id: number | null;
    label: string | null;
    address?: {
      city?: string | null;
      state?: string | null;
      country?: string | null;
    };
  };
  status?: {
    id: number;
    label: string;
  };
  postedDate?: string;
  postingUrl?: string;
}

/**
 * Transformed job format matching existing careers page structure
 */
export interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string | null;
  requirements: string | null;
  application_link: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// Cache key for jobs
const JOBS_CACHE_KEY = 'bamboohr:jobs';
// Cache duration: 30 minutes (in seconds)
const CACHE_TTL = 30 * 60;

/**
 * Creates a BambooHR service instance
 */
export function createBambooHRService(env: Env) {
  const apiKey = env.BAMBOOHR_API_KEY;
  const subdomain = env.BAMBOOHR_SUBDOMAIN;

  /**
   * Check if BambooHR is configured
   */
  function isConfigured(): boolean {
    return Boolean(apiKey && subdomain);
  }

  /**
   * Build authorization header for BambooHR API
   * Uses HTTP Basic Auth with API key as username
   */
  function getAuthHeader(): string {
    // BambooHR uses API key as username with any password (using 'x')
    const credentials = btoa(`${apiKey}:x`);
    return `Basic ${credentials}`;
  }

  /**
   * Fetch jobs from BambooHR API
   */
  async function fetchJobsFromAPI(): Promise<BambooHRJob[]> {
    if (!isConfigured()) {
      console.warn('BambooHR not configured, skipping API fetch');
      return [];
    }

    const url = `https://api.bamboohr.com/api/gateway.php/${subdomain}/v1/applicant_tracking/jobs`;
    console.log('Fetching jobs from BambooHR:', url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: getAuthHeader(),
          Accept: 'application/json',
        },
      });

      console.log('BambooHR response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`BambooHR API error: ${response.status} - ${errorText}`);

        if (response.status === 401) {
          throw new Error('BambooHR API authentication failed. Check API key.');
        }
        if (response.status === 403) {
          throw new Error('BambooHR API access forbidden. Check permissions.');
        }
        if (response.status === 429) {
          throw new Error('BambooHR API rate limit exceeded. Try again later.');
        }

        throw new Error(`BambooHR API error: ${response.status}`);
      }

      // BambooHR returns jobs as an array directly, not wrapped in { jobs: [] }
      const data = (await response.json()) as BambooHRJob[];
      console.log('BambooHR raw response:', JSON.stringify(data));
      return data || [];
    } catch (error) {
      console.error('Failed to fetch jobs from BambooHR:', error);
      throw error;
    }
  }

  /**
   * Transform BambooHR job to our format
   */
  function transformJob(bambooJob: BambooHRJob): Job {
    // Build location string from location object
    let locationString = 'Remote';
    if (bambooJob.location) {
      const address = bambooJob.location.address;
      if (address) {
        const parts = [
          address.city,
          address.state,
          address.country,
        ].filter(Boolean);
        locationString = parts.length > 0 ? parts.join(', ') : bambooJob.location.label || 'Remote';
      } else {
        locationString = bambooJob.location.label || 'Remote';
      }
    }

    return {
      id: bambooJob.id,
      title: bambooJob.title?.label || 'Untitled Position',
      department: bambooJob.department?.label || 'General',
      location: locationString,
      type: 'Full-time', // BambooHR doesn't return employmentType in this endpoint
      description: null, // Job description needs separate API call
      requirements: null,
      application_link: bambooJob.postingUrl || null,
      status: 'active', // All fetched jobs are active
      created_at: bambooJob.postedDate || new Date().toISOString(),
      updated_at: bambooJob.postedDate || new Date().toISOString(),
    };
  }

  /**
   * Get all active jobs (with caching)
   */
  async function getJobs(): Promise<Job[]> {
    // Try cache first
    try {
      const cached = await env.CACHE.get(JOBS_CACHE_KEY);
      if (cached) {
        const cachedJobs = JSON.parse(cached) as Job[];
        console.log(`Returning ${cachedJobs.length} cached BambooHR jobs`);
        return cachedJobs;
      }
      console.log('No cached BambooHR jobs found, fetching from API');
    } catch (error) {
      console.warn('Cache read failed:', error);
    }

    // Fetch from API
    const bambooJobs = await fetchJobsFromAPI();
    console.log(`Fetched ${bambooJobs.length} jobs from BambooHR API`);

    // Transform to our format
    const jobs = bambooJobs.map(transformJob);

    // Only cache non-empty results to avoid caching errors
    if (jobs.length > 0) {
      try {
        await env.CACHE.put(JOBS_CACHE_KEY, JSON.stringify(jobs), {
          expirationTtl: CACHE_TTL,
        });
        console.log(`Cached ${jobs.length} jobs for ${CACHE_TTL}s`);
      } catch (error) {
        console.warn('Cache write failed:', error);
      }
    } else {
      console.log('Not caching empty jobs result');
    }

    return jobs;
  }

  /**
   * Get a single job by ID
   */
  async function getJobById(id: number): Promise<Job | null> {
    const jobs = await getJobs();
    return jobs.find((job) => job.id === id) || null;
  }

  /**
   * Clear the jobs cache (useful for manual refresh)
   */
  async function clearCache(): Promise<void> {
    try {
      await env.CACHE.delete(JOBS_CACHE_KEY);
      console.log('BambooHR jobs cache cleared');
    } catch (error) {
      console.warn('Cache clear failed:', error);
    }
  }

  return {
    isConfigured,
    getJobs,
    getJobById,
    clearCache,
  };
}

export type BambooHRService = ReturnType<typeof createBambooHRService>;
