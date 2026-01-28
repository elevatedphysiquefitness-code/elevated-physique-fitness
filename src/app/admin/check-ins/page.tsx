'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, Clock, MessageSquare, X } from 'lucide-react';
import Button from '@/components/ui/Button';

interface CheckIn {
  id: string;
  client_id: string;
  week_number: number;
  weight: number;
  sleep_quality: string;
  energy_level: number;
  adherence: string;
  notes: string;
  coach_feedback: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

export default function CheckInsPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null);
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'reviewed' | 'all'>('pending');

  useEffect(() => {
    fetchCheckIns();
  }, [filter]);

  const fetchCheckIns = async () => {
    const supabase = createClient();

    let query = supabase
      .from('check_ins')
      .select(`
        *,
        profiles (full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query;

    if (data) {
      setCheckIns(data);
    }

    setLoading(false);
  };

  const openReview = (checkIn: CheckIn) => {
    setSelectedCheckIn(checkIn);
    setFeedback(checkIn.coach_feedback || '');
  };

  const submitFeedback = async () => {
    if (!selectedCheckIn) return;

    setSaving(true);
    const supabase = createClient();

    await supabase
      .from('check_ins')
      .update({
        coach_feedback: feedback,
        status: 'reviewed',
      })
      .eq('id', selectedCheckIn.id);

    // Update local state
    setCheckIns(
      checkIns.map((c) =>
        c.id === selectedCheckIn.id
          ? { ...c, coach_feedback: feedback, status: 'reviewed' }
          : c
      )
    );

    setSelectedCheckIn(null);
    setFeedback('');
    setSaving(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
      <div>
        <h1 className="text-2xl font-bold text-black">Check-ins</h1>
        <p className="text-grey-600 mt-1">Review and respond to client check-ins</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-2 flex gap-2">
        {(['pending', 'reviewed', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              filter === tab
                ? 'bg-blue-600 text-white'
                : 'text-grey-600 hover:bg-grey-100'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Check-ins List */}
      <div className="space-y-4">
        {checkIns.map((checkIn) => (
          <div key={checkIn.id} className="bg-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 flex items-center justify-center text-white font-bold">
                  {checkIn.profiles?.full_name?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div>
                  <p className="font-semibold text-black">{checkIn.profiles?.full_name}</p>
                  <p className="text-sm text-grey-500">Week {checkIn.week_number} Check-in</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium ${
                    checkIn.status === 'pending'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {checkIn.status === 'pending' ? (
                    <Clock className="h-3 w-3" />
                  ) : (
                    <CheckCircle className="h-3 w-3" />
                  )}
                  {checkIn.status}
                </span>
                <span className="text-sm text-grey-500">{formatDate(checkIn.created_at)}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-grey-50 p-3">
                <p className="text-xs text-grey-500">Weight</p>
                <p className="font-semibold text-black">{checkIn.weight} lbs</p>
              </div>
              <div className="bg-grey-50 p-3">
                <p className="text-xs text-grey-500">Sleep Quality</p>
                <p className="font-semibold text-black">{checkIn.sleep_quality}</p>
              </div>
              <div className="bg-grey-50 p-3">
                <p className="text-xs text-grey-500">Energy Level</p>
                <p className="font-semibold text-black">{checkIn.energy_level}/10</p>
              </div>
              <div className="bg-grey-50 p-3">
                <p className="text-xs text-grey-500">Adherence</p>
                <p className="font-semibold text-black">{checkIn.adherence}</p>
              </div>
            </div>

            {checkIn.notes && (
              <div className="mt-4">
                <p className="text-sm text-grey-500">Notes:</p>
                <p className="text-grey-700 mt-1">{checkIn.notes}</p>
              </div>
            )}

            {checkIn.coach_feedback && (
              <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-600">
                <p className="text-sm text-blue-600 font-medium">Your Feedback:</p>
                <p className="text-grey-700 mt-1">{checkIn.coach_feedback}</p>
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <Button onClick={() => openReview(checkIn)} variant="primary" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                {checkIn.status === 'pending' ? 'Review' : 'Edit Feedback'}
              </Button>
            </div>
          </div>
        ))}

        {checkIns.length === 0 && (
          <div className="bg-white p-12 text-center">
            <p className="text-grey-500">No check-ins found</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedCheckIn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-grey-200">
              <div>
                <h3 className="text-lg font-bold text-black">Review Check-in</h3>
                <p className="text-sm text-grey-500">
                  {selectedCheckIn.profiles?.full_name} - Week {selectedCheckIn.week_number}
                </p>
              </div>
              <button
                onClick={() => setSelectedCheckIn(null)}
                className="text-grey-400 hover:text-black"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-black mb-2">
                Your Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={5}
                placeholder="Provide feedback and encouragement for your client..."
                className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600 resize-none"
              />
              <div className="mt-6 flex gap-3">
                <Button
                  onClick={() => setSelectedCheckIn(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitFeedback}
                  variant="primary"
                  className="flex-1"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Submit Feedback'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
