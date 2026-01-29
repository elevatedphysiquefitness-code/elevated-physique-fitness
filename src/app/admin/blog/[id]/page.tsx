'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import {
  ArrowLeft,
  Save,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  featured_image: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const categories = [
  { value: 'habits-mindset', label: 'Habits & Mindset' },
  { value: 'workout-education', label: 'Workout Education' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'goal-setting', label: 'Goal-Setting & Progress' },
];

export default function BlogEditPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'habits-mindset',
    featured_image: '',
    published: false,
  });

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error || !data) {
      console.error('Error fetching post:', error);
      setLoading(false);
      return;
    }

    setPost(data);
    setFormData({
      title: data.title || '',
      slug: data.slug || '',
      excerpt: data.excerpt || '',
      content: data.content || '',
      category: data.category || 'habits-mindset',
      featured_image: data.featured_image || '',
      published: data.published || false,
    });
    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const savePost = async () => {
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('blog_posts')
      .update({
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        featured_image: formData.featured_image || null,
        published: formData.published,
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId);

    if (error) {
      alert('Failed to save post. Please try again.');
      console.error('Error saving post:', error);
    } else {
      alert('Post saved successfully!');
    }

    setSaving(false);
  };

  const deletePost = async () => {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      alert('Failed to delete post.');
      console.error('Error deleting post:', error);
      return;
    }

    router.push('/admin/blog');
  };

  const togglePublish = async () => {
    const newPublished = !formData.published;
    setFormData({ ...formData, published: newPublished });

    const supabase = createClient();
    await supabase
      .from('blog_posts')
      .update({ published: newPublished, updated_at: new Date().toISOString() })
      .eq('id', postId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-grey-500">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-grey-500">Post not found</p>
        <Button href="/admin/blog" variant="outline" className="mt-4">
          Back to Blog
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-grey-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-grey-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-black">Edit Blog Post</h1>
          <p className="text-grey-600">
            {formData.published ? 'Published' : 'Draft'}
          </p>
        </div>
        <div className="flex gap-2">
          {formData.published && formData.slug && (
            <a
              href={`/blog/${formData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-grey-600 hover:text-blue-600 hover:bg-blue-50"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          )}
          <Button onClick={togglePublish} variant="outline">
            {formData.published ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Unpublish
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Publish
              </>
            )}
          </Button>
          <Button onClick={deletePost} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button onClick={savePost} variant="primary" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      title: e.target.value,
                      slug: formData.slug || generateSlug(e.target.value),
                    });
                  }}
                  placeholder="Post title"
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  URL Slug
                </label>
                <div className="flex items-center">
                  <span className="text-grey-500 text-sm mr-2">/blog/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="url-slug"
                    className="flex-1 border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={2}
                  placeholder="Brief description for previews..."
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={20}
                  placeholder="Write your post content here... (Markdown supported)"
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 resize-none font-mono text-sm"
                />
                <p className="mt-1 text-xs text-grey-500">Markdown formatting is supported</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6">
            <h2 className="font-semibold text-black mb-4">Post Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Featured Image URL
                </label>
                <input
                  type="text"
                  value={formData.featured_image}
                  onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                  placeholder="https://..."
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6">
            <h2 className="font-semibold text-black mb-4">Post Info</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-grey-500">Status</span>
                <span className={formData.published ? 'text-green-600' : 'text-yellow-600'}>
                  {formData.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-grey-500">Created</span>
                <span className="text-black">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-grey-500">Updated</span>
                <span className="text-black">
                  {new Date(post.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
