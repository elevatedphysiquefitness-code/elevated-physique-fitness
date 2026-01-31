'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import ProfileAvatar from '@/components/ui/ProfileAvatar';
import Button from '@/components/ui/Button';
import { User, Mail, Phone, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, avatar_url')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
      });
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id);

    if (error) {
      setMessage({ type: 'error', text: 'Failed to save changes. Please try again.' });
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setProfile({ ...profile, ...formData });
    }

    setSaving(false);
  };

  const handleAvatarChange = (newUrl: string) => {
    if (profile) {
      setProfile({ ...profile, avatar_url: newUrl });
    }
    setMessage({ type: 'success', text: 'Profile picture updated!' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-grey-500">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-grey-500">Please log in to view settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 hover:bg-grey-200 transition-colors">
          <ArrowLeft className="h-5 w-5 text-grey-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-black">Profile Settings</h1>
          <p className="text-grey-600">Manage your account information</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-black">Profile Picture</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <ProfileAvatar
              userId={profile.id}
              avatarUrl={profile.avatar_url}
              userName={profile.full_name}
              size="xl"
              editable={true}
              onAvatarChange={handleAvatarChange}
            />
            <div>
              <p className="text-sm text-grey-600 mb-2">
                Click on the avatar to upload a new profile picture.
              </p>
              <p className="text-xs text-grey-400">
                Recommended: Square image, at least 200x200px. Max 5MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-black">Personal Information</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-grey-700 mb-2">
              <User className="h-4 w-4 inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-[#3D2314]"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-grey-700 mb-2">
              <Mail className="h-4 w-4 inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full border border-grey-200 bg-grey-50 px-4 py-3 text-grey-500 cursor-not-allowed"
            />
            <p className="text-xs text-grey-400 mt-1">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-grey-700 mb-2">
              <Phone className="h-4 w-4 inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-[#3D2314]"
              placeholder="Your phone number"
            />
          </div>

          <div className="pt-4">
            <Button
              onClick={handleSave}
              variant="primary"
              disabled={saving}
              className="w-full sm:w-auto"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
