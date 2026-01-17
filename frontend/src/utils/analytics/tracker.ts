import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

const API_URL = `${API_BASE_URL}/api`;

// Session management
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

// Device type detection
function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
}

// Browser detection
function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.indexOf('Firefox') > -1) return 'Firefox';
  if (ua.indexOf('SamsungBrowser') > -1) return 'Samsung Browser';
  if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) return 'Opera';
  if (ua.indexOf('Trident') > -1) return 'Internet Explorer';
  if (ua.indexOf('Edge') > -1) return 'Edge';
  if (ua.indexOf('Chrome') > -1) return 'Chrome';
  if (ua.indexOf('Safari') > -1) return 'Safari';
  return 'Other';
}

// Operating system detection
function getOS(): string {
  const ua = navigator.userAgent;
  if (ua.indexOf('Win') > -1) return 'Windows';
  if (ua.indexOf('Mac') > -1) return 'macOS';
  if (ua.indexOf('X11') > -1) return 'UNIX';
  if (ua.indexOf('Linux') > -1) return 'Linux';
  if (ua.indexOf('Android') > -1) return 'Android';
  if (ua.indexOf('like Mac') > -1) return 'iOS';
  return 'Other';
}

export const analytics = {
  // Initialize session tracking
  async initSession(): Promise<void> {
    const sessionId = getSessionId();
    try {
      await axios.post(`${API_URL}/analytics/track/session`, {
        session_id: sessionId,
        user_agent: navigator.userAgent,
        device_type: getDeviceType(),
        browser: getBrowser(),
        os: getOS(),
        language: navigator.language
      });
    } catch (error) {
      console.error('Analytics session init failed:', error);
    }
  },

  // Track page view
  async trackPageView(): Promise<void> {
    // Skip tracking admin pages
    if (window.location.pathname.startsWith('/admin')) {
      return;
    }

    const sessionId = getSessionId();
    try {
      await axios.post(`${API_URL}/analytics/track/pageview`, {
        page_url: window.location.pathname + window.location.search,
        page_title: document.title,
        referrer: document.referrer,
        session_id: sessionId,
        user_agent: navigator.userAgent,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight
      });
    } catch (error) {
      console.error('Analytics page view tracking failed:', error);
    }
  },

  // Track custom event
  async trackEvent(
    eventName: string,
    category: string | null = null,
    label: string | null = null,
    value: number | null = null,
    metadata: Record<string, any> | null = null
  ): Promise<void> {
    const sessionId = getSessionId();
    try {
      await axios.post(`${API_URL}/analytics/track/event`, {
        event_name: eventName,
        event_category: category,
        event_label: label,
        event_value: value,
        page_url: window.location.pathname + window.location.search,
        session_id: sessionId,
        metadata
      });
    } catch (error) {
      console.error('Analytics event tracking failed:', error);
    }
  }
};

// Convenience functions for common events
export const trackButtonClick = (buttonLabel: string, location?: string) => {
  analytics.trackEvent('button_click', 'engagement', buttonLabel, null, { location });
};

export const trackFormSubmit = (formName: string) => {
  analytics.trackEvent('form_submit', 'conversion', formName);
};

export const trackDownload = (fileName: string) => {
  analytics.trackEvent('download', 'engagement', fileName);
};

export const trackOutboundLink = (url: string) => {
  analytics.trackEvent('outbound_click', 'navigation', url);
};

export const trackSearch = (query: string) => {
  analytics.trackEvent('search', 'engagement', query);
};

export const trackVideoPlay = (videoTitle: string) => {
  analytics.trackEvent('video_play', 'engagement', videoTitle);
};
