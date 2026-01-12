import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, ArrowLeft } from 'lucide-react';
import { AnimatedElement } from '../../components/ui/AnimatedElement';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import { useTranslation } from 'react-i18next';
import { OptimizedImage } from '../../components/ui/OptimizedImage';
import { sanitizeHtml, stripHtml } from '../../utils/sanitizeHtml';

interface BlogPost {
  id: number;
  // Localized fields (returned from API based on lang parameter)
  title: string;
  content: string;
  excerpt: string;
  // Original fields for fallback
  title_en: string;
  content_en: string;
  slug: string;
  featured_image: string | null;
  created_at: string;
  status: string;
}

export const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        // Pass language parameter to get localized content
        const response = await axios.get(`${API_ENDPOINTS.BLOG.BASE}/${slug}?lang=${i18n.language}`);
        setPost(response.data);
      } catch (error) {
        console.error('Error fetching blog post:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRelatedPosts = async () => {
      try {
        // Pass language parameter to get localized content
        const response = await axios.get(`${API_ENDPOINTS.BLOG.BASE}?lang=${i18n.language}`);
        // Filter out current post and limit to 3 posts
        const filtered = response.data
          .filter((p: BlogPost) => p.slug !== slug)
          .slice(0, 3);
        setRelatedPosts(filtered);
      } catch (error) {
        console.error('Error fetching related posts:', error);
      }
    };

    fetchPost();
    fetchRelatedPosts();
  }, [slug, i18n.language]); // Re-fetch when language changes

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h1>
          <Link to="/blog" className="text-primary hover:text-primary-dark">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-12 md:pt-40 md:pb-16 bg-blue-50 overflow-hidden rounded-b-[4rem] border-b border-gray-200/50">
        {/* Light gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-blue-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent" />

        {/* Decorative elements */}
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-24 left-0 w-[400px] h-[400px] bg-blue-100/50 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <AnimatedElement animation="fade-up">
            {/* Use localized title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {post.title || post.title_en}
            </h1>

            <div className="flex items-center gap-6 text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </AnimatedElement>
        </div>
      </section>

      {/* Featured Image */}
      {post.featured_image && (
        <section className="py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedElement animation="scale-in" delay={200}>
              <img
                src={post.featured_image}
                alt={post.title || post.title_en}
                className="w-full rounded-lg shadow-xl"
              />
            </AnimatedElement>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="py-8 md:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Use localized content */}
          <AnimatedElement
            as="article"
            animation="fade-up"
            speed="fast"
            delay={400}
            className="prose prose-lg max-w-none prose-headings:text-text-primary prose-p:text-text-secondary prose-a:text-primary hover:prose-a:text-primary-dark prose-strong:text-text-primary prose-ul:text-text-secondary prose-ol:text-text-secondary prose-li:text-text-secondary"
          >
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content || post.content_en) }} />
          </AnimatedElement>
        </div>
      </section>

      {/* Related Posts */}
      <section className="py-16 bg-background-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-8 text-shadow-sm">
            Related Posts
          </h2>

          {relatedPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost, index) => (
                <AnimatedElement
                  key={relatedPost.id}
                  as="article"
                  animation="fade-up"
                  delay={index * 100}
                  scrollTrigger
                  once
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                >
                  {relatedPost.featured_image && (
                    <Link to={`/blog/${relatedPost.slug}`}>
                      <OptimizedImage
                        src={relatedPost.featured_image}
                        alt={relatedPost.title || relatedPost.title_en}
                        className="w-full h-48 object-cover"
                      />
                    </Link>
                  )}

                  <div className="p-6">
                    {/* Use localized title and content */}
                    <h3 className="text-xl font-bold text-text-primary mb-3 hover:text-primary transition-colors">
                      <Link to={`/blog/${relatedPost.slug}`}>{relatedPost.title || relatedPost.title_en}</Link>
                    </h3>

                    <p className="text-text-secondary mb-4 line-clamp-2">
                      {stripHtml(relatedPost.content || relatedPost.content_en).substring(0, 120)}...
                    </p>

                    <div className="flex items-center justify-between text-sm text-text-secondary pt-4 border-t border-border">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(relatedPost.created_at).toLocaleDateString()}
                      </span>
                      <Link
                        to={`/blog/${relatedPost.slug}`}
                        className="text-primary font-semibold hover:text-primary-dark"
                      >
                        Read More <span dir="ltr">→</span>
                      </Link>
                    </div>
                  </div>
                </AnimatedElement>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary">No related posts available.</p>
          )}
        </div>
      </section>
    </div>
  );
};
