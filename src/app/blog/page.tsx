import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ArrowRight, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Blog | Elevated Physique Fitness',
  description: 'Articles on fitness, habits, mindset, nutrition, and building a disciplined lifestyle.',
};

const categories = [
  { value: 'all', label: 'All Posts' },
  { value: 'habits-mindset', label: 'Habits & Mindset' },
  { value: 'workout-education', label: 'Workout Education' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'goal-setting', label: 'Goal-Setting & Progress' },
];

interface BlogPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const category = params.category || 'all';

  const supabase = await createClient();

  let query = supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, category, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (category !== 'all') {
    query = query.eq('category', category);
  }

  const { data: posts } = await query;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryLabel = (value: string) => {
    return categories.find((c) => c.value === value)?.label || value;
  };

  return (
    <>
      {/* Hero Section */}
      <section className="py-24 bg-black text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-blue-500 text-sm font-semibold uppercase tracking-widest mb-6">
              Blog
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Insights & Education
            </h1>
            <p className="mt-8 text-xl text-grey-300 leading-relaxed">
              Articles on fitness, habits, mindset, and building a disciplined lifestyle that elevates every area of your life.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-12">
            {categories.map((cat) => (
              <Link
                key={cat.value}
                href={cat.value === 'all' ? '/blog' : `/blog?category=${cat.value}`}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  category === cat.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-grey-100 text-grey-700 hover:bg-grey-200'
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </div>

          {/* Posts Grid */}
          {posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article key={post.id} className="bg-grey-100 group">
                  <div className="aspect-[16/9] bg-grey-200 flex items-center justify-center">
                    <span className="text-grey-400">Featured Image</span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs text-blue-600 font-medium uppercase">
                        {getCategoryLabel(post.category)}
                      </span>
                      <span className="text-xs text-grey-400">•</span>
                      <span className="text-xs text-grey-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-black group-hover:text-blue-600 transition-colors">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
                    {post.excerpt && (
                      <p className="mt-3 text-grey-600 line-clamp-3">{post.excerpt}</p>
                    )}
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center mt-4 text-blue-600 font-medium hover:underline"
                    >
                      Read More
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-grey-500 mb-4">No posts found in this category.</p>
              <Button href="/blog" variant="outline">View All Posts</Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-grey-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-black">
            Ready to Start Your Transformation?
          </h2>
          <p className="mt-6 text-grey-600 max-w-2xl mx-auto">
            Knowledge is just the beginning. Take action and let&apos;s build the physique and discipline you deserve.
          </p>
          <div className="mt-10">
            <Button href="/apply" size="lg" variant="primary">
              Apply for Coaching
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
