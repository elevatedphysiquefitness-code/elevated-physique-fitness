'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/ui/Button';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
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

export default function BlogManagementPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'habits-mindset',
    published: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const supabase = createClient();

    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setPosts(data);
    }

    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const createPost = async () => {
    if (!newPost.title.trim()) return;

    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const slug = newPost.slug || generateSlug(newPost.title);

    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        title: newPost.title,
        slug,
        excerpt: newPost.excerpt,
        content: newPost.content,
        category: newPost.category,
        published: newPost.published,
        author_id: user?.id,
      })
      .select()
      .single();

    if (data && !error) {
      setPosts([data, ...posts]);
      setNewPost({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: 'habits-mindset',
        published: false,
      });
      setShowCreateModal(false);
    }

    setSaving(false);
  };

  const togglePublished = async (post: BlogPost) => {
    const supabase = createClient();

    await supabase
      .from('blog_posts')
      .update({ published: !post.published })
      .eq('id', post.id);

    setPosts(
      posts.map((p) =>
        p.id === post.id ? { ...p, published: !p.published } : p
      )
    );
  };

  const deletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    const supabase = createClient();
    await supabase.from('blog_posts').delete().eq('id', id);
    setPosts(posts.filter((p) => p.id !== id));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryLabel = (value: string) => {
    return categories.find((c) => c.value === value)?.label || value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-grey-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Blog Posts</h1>
          <p className="text-grey-600 mt-1">Create and manage blog content</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} variant="primary">
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Posts Table */}
      <div className="bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-grey-50 border-b border-grey-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-grey-500">Title</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-grey-500">Category</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-grey-500">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-grey-500">Date</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-grey-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-200">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-grey-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-black">{post.title}</p>
                      <p className="text-sm text-grey-500">/blog/{post.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-grey-600">{getCategoryLabel(post.category)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => togglePublished(post)}
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium ${
                        post.published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-grey-100 text-grey-600'
                      }`}
                    >
                      {post.published ? (
                        <>
                          <Eye className="h-3 w-3" /> Published
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3" /> Draft
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-grey-600">{formatDate(post.created_at)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/blog/${post.id}`}
                        className="p-2 text-grey-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="p-2 text-grey-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {posts.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-grey-500 mb-4">No blog posts yet</p>
            <Button onClick={() => setShowCreateModal(true)} variant="primary">
              Create Your First Post
            </Button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl my-8 p-6">
            <h3 className="text-lg font-bold text-black mb-6">Create New Post</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => {
                    setNewPost({
                      ...newPost,
                      title: e.target.value,
                      slug: generateSlug(e.target.value),
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
                <input
                  type="text"
                  value={newPost.slug}
                  onChange={(e) => setNewPost({ ...newPost, slug: e.target.value })}
                  placeholder="auto-generated-from-title"
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Category
                </label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
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
                  Excerpt
                </label>
                <textarea
                  value={newPost.excerpt}
                  onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                  rows={2}
                  placeholder="Brief summary of the post..."
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Content
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={8}
                  placeholder="Write your post content here... (Markdown supported)"
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 resize-none font-mono text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={newPost.published}
                  onChange={(e) => setNewPost({ ...newPost, published: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="published" className="text-sm text-black">
                  Publish immediately
                </label>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => setShowCreateModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={createPost}
                variant="primary"
                className="flex-1"
                disabled={saving || !newPost.title.trim()}
              >
                {saving ? 'Creating...' : 'Create Post'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
