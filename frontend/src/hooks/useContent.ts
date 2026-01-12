import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { API_ENDPOINTS } from '../config/api';

interface ContentData {
  [page: string]: {
    [section: string]: unknown;
  };
}

export const useContent = () => {
  const [content, setContent] = useState<ContentData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { i18n } = useTranslation();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.CONTENT.BASE);
        setContent(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching content:', err);
        setError('Failed to load content');
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  /**
   * Get content from the JSON structure
   * @param path - Dot notation path like "homepage.hero.headline" or "homepage.problems.cards.0.title"
   * @param language - Optional language override (defaults to current i18n language)
   */
  const getContent = (path: string, language?: 'en' | 'ar' | 'es' | 'pt'): string => {
    try {
      const lang = language || (i18n.language as 'en' | 'ar' | 'es' | 'pt') || 'en';
      const parts = path.split('.');

      let value: unknown = content;
      for (const part of parts) {
        if (value === undefined || value === null) return '';
        value = (value as Record<string, unknown>)[part];
      }

      // If value is an object with language keys, return the appropriate language
      if (value && typeof value === 'object' && lang in value) {
        return (value as Record<string, string>)[lang] || '';
      }

      // If value is a string, return it directly
      if (typeof value === 'string') {
        return value;
      }

      return '';
    } catch (err) {
      console.error(`Error getting content for path: ${path}`, err);
      return '';
    }
  };

  /**
   * Get content array from the JSON structure
   * @param path - Dot notation path like "homepage.problems.cards"
   */
  const getContentArray = (path: string): unknown[] => {
    try {
      const parts = path.split('.');

      let value: unknown = content;
      for (const part of parts) {
        if (value === undefined || value === null) return [];
        value = (value as Record<string, unknown>)[part];
      }

      return Array.isArray(value) ? value : [];
    } catch (err) {
      console.error(`Error getting content array for path: ${path}`, err);
      return [];
    }
  };

  return { content, loading, error, getContent, getContentArray };
};
