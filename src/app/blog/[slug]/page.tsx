import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ArrowLeft, Calendar, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (!post) {
    return {
      title: 'Post Not Found | Elevated Physique Fitness',
    };
  }

  return {
    title: `${post.title} | Elevated Physique Fitness`,
    description: post.excerpt || `Read ${post.title} on the Elevated Physique Fitness blog.`,
  };
}

const categories: { [key: string]: string } = {
  'habits-mindset': 'Habits & Mindset',
  'workout-education': 'Workout Education',
  'nutrition': 'Nutrition',
  'goal-setting': 'Goal-Setting & Progress',
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (!post) {
    notFound();
  }

  // Get related posts
  const { data: relatedPosts } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt')
    .eq('category', post.category)
    .eq('published', true)
    .neq('id', post.id)
    .limit(3);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Simple markdown-like processing (just paragraphs)
  const renderContent = (content: string) => {
    if (!content) return null;
    return content.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-6 text-grey-700 leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  return (
    <>
      {/* Article Header */}
      <section className="py-24 bg-black text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-grey-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-blue-500 text-sm font-semibold uppercase tracking-widest">
              {categories[post.category] || post.category}
            </span>
            <span className="text-grey-500">•</span>
            <span className="text-grey-400 text-sm flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(post.created_at)}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-6 text-xl text-grey-300 leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <article className="prose prose-lg max-w-none">
            {renderContent(post.content)}
          </article>
        </div>
      </section>

      {/* Author/CTA */}
      <section className="py-12 bg-grey-100">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="bg-black text-white p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-600 flex items-center justify-center text-2xl font-bold">
                JH
              </div>
              <div>
                <p className="font-bold text-lg">John&apos;te Horace</p>
                <p className="text-grey-400">Founder, Elevated Physique Fitness</p>
              </div>
            </div>
            <p className="text-grey-300">
              Ready to transform your physique and build lasting discipline? Apply for coaching and let&apos;s get started.
            </p>
            <Button href="/apply" variant="primary" className="mt-6">
              Apply for Coaching
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts && relatedPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-black mb-8">Related Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <article key={relatedPost.id} className="bg-grey-100 p-6 group">
                  <h3 className="font-bold text-black group-hover:text-blue-600 transition-colors">
                    <Link href={`/blog/${relatedPost.slug}`}>{relatedPost.title}</Link>
                  </h3>
                  {relatedPost.excerpt && (
                    <p className="mt-2 text-grey-600 text-sm line-clamp-2">{relatedPost.excerpt}</p>
                  )}
                  <Link
                    href={`/blog/${relatedPost.slug}`}
                    className="inline-flex items-center mt-4 text-blue-600 text-sm font-medium hover:underline"
                  >
                    Read More
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
