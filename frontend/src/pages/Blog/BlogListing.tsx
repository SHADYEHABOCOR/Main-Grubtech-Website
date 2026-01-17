import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, FileText } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataState } from '../../components/ui/DataState';
import { CardGridSkeleton } from '../../components/ui/Skeleton';
import { AnimatedElement } from '../../components/ui/AnimatedElement';
import axios from 'axios';
import { logError } from '../../utils/logger';
import { API_ENDPOINTS } from '../../config/api';
import { useTranslation } from 'react-i18next';
import { OptimizedImage } from '../../components/ui/OptimizedImage';
import { stripHtml } from '../../utils/sanitizeHtml';

interface BlogPost {
  id: number;
  slug: string;
  // Localized fields (returned from API based on lang parameter)
  title: string;
  content: string;
  excerpt: string;
  // Original fields for fallback
  title_en: string;
  content_en: string;
  featured_image: string | null;
  status: string;
  created_at: string;
}

export const BlogListing: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // PERF: Reduced from 100 to 20 - implement pagination for more
      const response = await axios.get(`${API_ENDPOINTS.BLOG.BASE}?lang=${i18n.language}&limit=20`);
      // Handle new paginated response format
      const data = response.data.data || response.data;
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load blog posts');
      logError('Error fetching blog posts', err);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [i18n.language]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]); // Re-fetch when language changes

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative min-h-[60vh] pt-32 pb-20 md:pt-36 md:pb-24 flex items-center bg-blue-50 overflow-hidden rounded-b-[4rem] border-b border-gray-200/50">
        {/* Light gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-blue-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent" />

        {/* Decorative elements */}
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-24 left-0 w-[400px] h-[400px] bg-blue-100/50 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          <AnimatedElement
            as="h1"
            animation="fade-up"
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            {t('blog.title', 'Grubtech Blog')}
          </AnimatedElement>
          <AnimatedElement
            as="p"
            animation="fade-up"
            delay={200}
            className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"
          >
            {t('blog.subtitle', 'Insights, tips, and trends for modern restaurant operations')}
          </AnimatedElement>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DataState
            isLoading={loading}
            isError={!!error}
            error={error}
            isEmpty={posts.length === 0}
            onRetry={fetchPosts}
            skeleton={<CardGridSkeleton count={6} />}
            messages={{
              loading: t('blog.loading', 'Loading blog posts...'),
              error: t('blog.error', 'Failed to load blog posts. Please try again.'),
              empty: t('blog.empty', 'No blog posts available yet. Check back soon!'),
            }}
            emptyComponent={
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('blog.noPosts', 'No Blog Posts Yet')}</h3>
                <p className="text-gray-600">{t('blog.checkBack', "We're working on new content. Check back soon!")}</p>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <AnimatedElement
                  key={post.id}
                  as="article"
                  animation="fade-up"
                  delay={index * 100}
                >
                  <Card className="h-full flex flex-col overflow-hidden !p-0">
                    {post.featured_image && (
                      <OptimizedImage
                        src={post.featured_image}
                        alt={post.title || post.title_en}
                        className="w-full h-48 object-cover"
                      />
                    )}

                    <div className="p-6 flex flex-col flex-grow">
                      <Badge variant="primary" className="w-fit mb-3">
                        {t('blog.badgeLabel', 'Blog Post')}
                      </Badge>

                      {/* Use localized title and content */}
                      <h2 className="text-2xl font-bold text-text-primary mb-3 hover:text-primary transition-colors">
                        <Link to={`/blog/${post.slug}`}>{post.title || post.title_en}</Link>
                      </h2>

                      <p className="text-text-secondary mb-4 flex-grow">
                        {stripHtml(post.content || post.content_en).substring(0, 150)}...
                      </p>

                      <div className="flex items-center justify-between text-sm text-text-secondary pt-4 border-t border-border">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <Link
                        to={`/blog/${post.slug}`}
                        className="mt-4 text-primary font-semibold flex items-center gap-2 hover:gap-3 transition-all"
                      >
                        {t('blog.readMore', 'Read More')} <ArrowRight className="w-4 h-4 rtl-mirror" />
                      </Link>
                    </div>
                  </Card>
                </AnimatedElement>
              ))}
            </div>
          </DataState>
        </div>
      </section>
    </div>
  );
};
