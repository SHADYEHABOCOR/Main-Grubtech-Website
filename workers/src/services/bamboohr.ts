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
 */
interface BambooHRJob {
  id: number;
  title: string;
  department?: {
    id: number;
    name: string;
  };
  location?: {
    id: number;
    name: string;
    city?: string;
    state?: string;
    country?: string;
  };
  employmentType?: string;
  minimumExperience?: string;
  compensation?: string;
  jobDescription?: string;
  applicationUrl?: string;
  status?: {
    id: number;
    name: string;
  };
  datePosted?: string;
  dateLastModified?: string;
}

/**
 * BambooHR Jobs API response
 */
interface BambooHRJobsResponse {
  jobs?: BambooHRJob[];
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

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: getAuthHeader(),
          Accept: 'application/json',
        },
      });

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

      const data = (await response.json()) as BambooHRJobsResponse;
      return data.jobs || [];
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
      const parts = [
        bambooJob.location.city,
        bambooJob.location.state,
        bambooJob.location.country,
      ].filter(Boolean);
      locationString = parts.length > 0 ? parts.join(', ') : bambooJob.location.name || 'Remote';
    }

    return {
      id: bambooJob.id,
      title: bambooJob.title || 'Untitled Position',
      department: bambooJob.department?.name || 'General',
      location: locationString,
      type: bambooJob.employmentType || 'Full-time',
      description: bambooJob.jobDescription || null,
      requirements: bambooJob.minimumExperience || null,
      application_link: bambooJob.applicationUrl || null,
      status: 'active', // All fetched jobs are active
      created_at: bambooJob.datePosted || new Date().toISOString(),
      updated_at: bambooJob.dateLastModified || new Date().toISOString(),
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
        console.log('Returning cached BambooHR jobs');
        return JSON.parse(cached) as Job[];
      }
    } catch (error) {
      console.warn('Cache read failed:', error);
    }

    // Fetch from API
    const bambooJobs = await fetchJobsFromAPI();

    // Transform to our format
    const jobs = bambooJobs.map(transformJob);

    // Cache the results
    try {
      await env.CACHE.put(JOBS_CACHE_KEY, JSON.stringify(jobs), {
        expirationTtl: CACHE_TTL,
      });
      console.log(`Cached ${jobs.length} jobs for ${CACHE_TTL}s`);
    } catch (error) {
      console.warn('Cache write failed:', error);
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
