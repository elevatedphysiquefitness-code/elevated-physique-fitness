'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProfileAvatar from '@/components/ui/ProfileAvatar';
import {
  ClipboardCheck,
  Camera,
  Scale,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Clock,
  X,
  MessageSquare,
  ListChecks,
} from 'lucide-react';

interface ClientProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

interface PendingCheckIn {
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

interface RecentPhoto {
  id: string;
  client_id: string;
  photo_url: string;
  photo_type: string;
  photo_date: string;
  created_at: string;
}

interface RecentMeasurement {
  id: string;
  client_id: string;
  measurement_date: string;
  weight: number | null;
  body_fat_percentage: number | null;
  created_at: string;
}

interface ReviewStats {
  pendingCheckIns: number;
  newPhotos: number;
  newMeasurements: number;
  totalItems: number;
}

interface ClientReviewData {
  profile: ClientProfile;
  pendingCheckIns: PendingCheckIn[];
  recentPhotos: RecentPhoto[];
  recentMeasurements: RecentMeasurement[];
  latestActivity: string;
  totalPendingItems: number;
}

type SortOption = 'recent' | 'most-pending' | 'alphabetical';
type FilterOption = 'pending-only' | 'all';

export default function ReviewHubPage() {
  const [clientReviews, setClientReviews] = useState<ClientReviewData[]>([]);
  const [allClients, setAllClients] = useState<ClientProfile[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    pendingCheckIns: 0,
    newPhotos: 0,
    newMeasurements: 0,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterBy, setFilterBy] = useState<FilterOption>('pending-only');
  const [selectedCheckIn, setSelectedCheckIn] = useState<PendingCheckIn | null>(null);
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchReviewData = useCallback(async () => {
    const supabase = createClient();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString();

    const [checkInsResult, photosResult, measurementsResult, clientsResult] =
      await Promise.all([
        supabase
          .from('check_ins')
          .select(
            `*, profiles:client_id (full_name, email)`
          )
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),

        supabase
          .from('progress_photos')
          .select('id, client_id, photo_url, photo_type, photo_date, created_at')
          .gte('created_at', sevenDaysAgoStr)
          .order('created_at', { ascending: false }),

        supabase
          .from('measurements')
          .select(
            'id, client_id, measurement_date, weight, body_fat_percentage, created_at'
          )
          .gte('created_at', sevenDaysAgoStr)
          .order('created_at', { ascending: false }),

        supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .eq('role', 'client')
          .order('full_name'),
      ]);

    const clients = clientsResult.data || [];
    const checkIns = checkInsResult.data || [];
    const photos = photosResult.data || [];
    const measurements = measurementsResult.data || [];

    setAllClients(clients);

    // Build client lookup map
    const clientMap = new Map<string, ClientProfile>();
    clients.forEach((p) => clientMap.set(p.id, p));

    // Collect client IDs that have pending items
    const clientIdsWithItems = new Set<string>();
    checkIns.forEach((c) => clientIdsWithItems.add(c.client_id));
    photos.forEach((p) => clientIdsWithItems.add(p.client_id));
    measurements.forEach((m) => clientIdsWithItems.add(m.client_id));

    // Build per-client review data
    const reviews: ClientReviewData[] = [];

    clientIdsWithItems.forEach((clientId) => {
      const profile = clientMap.get(clientId);
      if (!profile) return;

      const clientCheckIns = checkIns.filter((c) => c.client_id === clientId);
      const clientPhotos = photos.filter((p) => p.client_id === clientId);
      const clientMeasurements = measurements.filter(
        (m) => m.client_id === clientId
      );

      const allDates = [
        ...clientCheckIns.map((c) => c.created_at),
        ...clientPhotos.map((p) => p.created_at),
        ...clientMeasurements.map((m) => m.created_at),
      ];
      const latestActivity = allDates.sort().reverse()[0] || '';

      reviews.push({
        profile,
        pendingCheckIns: clientCheckIns,
        recentPhotos: clientPhotos,
        recentMeasurements: clientMeasurements,
        latestActivity,
        totalPendingItems:
          clientCheckIns.length +
          clientPhotos.length +
          clientMeasurements.length,
      });
    });

    setClientReviews(reviews);
    setStats({
      pendingCheckIns: checkIns.length,
      newPhotos: photos.length,
      newMeasurements: measurements.length,
      totalItems: checkIns.length + photos.length + measurements.length,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReviewData();
  }, [fetchReviewData]);

  const getFilteredAndSorted = () => {
    let filtered = [...clientReviews];

    if (filterBy === 'all') {
      const existingIds = new Set(filtered.map((r) => r.profile.id));
      allClients.forEach((profile) => {
        if (!existingIds.has(profile.id)) {
          filtered.push({
            profile,
            pendingCheckIns: [],
            recentPhotos: [],
            recentMeasurements: [],
            latestActivity: '',
            totalPendingItems: 0,
          });
        }
      });
    }

    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) =>
          b.latestActivity.localeCompare(a.latestActivity)
        );
        break;
      case 'most-pending':
        filtered.sort((a, b) => b.totalPendingItems - a.totalPendingItems);
        break;
      case 'alphabetical':
        filtered.sort((a, b) =>
          (a.profile.full_name || '').localeCompare(b.profile.full_name || '')
        );
        break;
    }

    return filtered;
  };

  const openReview = (checkIn: PendingCheckIn) => {
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

    // Update local state - remove reviewed check-in
    setClientReviews((prev) =>
      prev
        .map((client) => {
          if (client.profile.id !== selectedCheckIn.client_id) return client;

          const updatedCheckIns = client.pendingCheckIns.filter(
            (c) => c.id !== selectedCheckIn.id
          );
          return {
            ...client,
            pendingCheckIns: updatedCheckIns,
            totalPendingItems: client.totalPendingItems - 1,
          };
        })
        .filter((client) => client.totalPendingItems > 0 || filterBy === 'all')
    );

    setStats((prev) => ({
      ...prev,
      pendingCheckIns: prev.pendingCheckIns - 1,
      totalItems: prev.totalItems - 1,
    }));

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

  const formatRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const statCards = [
    {
      name: 'Pending Check-ins',
      value: stats.pendingCheckIns,
      icon: ClipboardCheck,
      color: 'bg-orange-600',
      href: '/admin/check-ins',
    },
    {
      name: 'New Photos (7d)',
      value: stats.newPhotos,
      icon: Camera,
      color: 'bg-purple-600',
      href: null,
    },
    {
      name: 'New Measurements (7d)',
      value: stats.newMeasurements,
      icon: Scale,
      color: 'bg-blue-600',
      href: null,
    },
    {
      name: 'Total Items',
      value: stats.totalItems,
      icon: AlertCircle,
      color: 'bg-red-600',
      href: null,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-grey-500">Loading review hub...</div>
      </div>
    );
  }

  const displayedClients = getFilteredAndSorted();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-black">Review Hub</h1>
        <p className="text-grey-600 mt-1">
          Items needing your attention across all clients
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const content = (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-grey-500">{stat.name}</p>
                <p className="text-3xl font-bold text-black mt-1">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-12 h-12 ${stat.color} flex items-center justify-center`}
              >
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          );

          if (stat.href) {
            return (
              <Link
                key={stat.name}
                href={stat.href}
                className="bg-white p-6 hover:shadow-lg transition-shadow"
              >
                {content}
              </Link>
            );
          }

          return (
            <div key={stat.name} className="bg-white p-6">
              {content}
            </div>
          );
        })}
      </div>

      {/* Filter & Sort Bar */}
      <div className="bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2">
          {(
            [
              { key: 'pending-only', label: 'Needs Review' },
              { key: 'all', label: 'All Clients' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterBy(tab.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                filterBy === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'text-grey-600 hover:bg-grey-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-grey-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="border border-grey-300 text-sm px-3 py-1.5 text-black focus:outline-none focus:border-blue-600"
          >
            <option value="recent">Most Recent</option>
            <option value="most-pending">Most Items</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Client Review Cards */}
      {displayedClients.length > 0 ? (
        <div className="space-y-4">
          {displayedClients.map((client) => (
            <Card key={client.profile.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ProfileAvatar
                      avatarUrl={client.profile.avatar_url}
                      userName={client.profile.full_name}
                      size="md"
                    />
                    <div>
                      <p className="font-medium text-black">
                        {client.profile.full_name}
                      </p>
                      <p className="text-sm text-grey-500">
                        {client.profile.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {client.totalPendingItems > 0 && (
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 text-xs font-medium">
                        {client.totalPendingItems} item
                        {client.totalPendingItems > 1 ? 's' : ''}
                      </span>
                    )}
                    <Link href={`/admin/clients/${client.profile.id}`}>
                      <ChevronRight className="h-5 w-5 text-grey-400 hover:text-grey-600" />
                    </Link>
                  </div>
                </div>
              </CardHeader>

              {client.totalPendingItems > 0 && (
                <CardContent>
                  <div className="space-y-4">
                    {/* Pending Check-ins */}
                    {client.pendingCheckIns.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <ClipboardCheck className="h-4 w-4 text-orange-600" />
                          <span className="text-sm font-medium text-black">
                            {client.pendingCheckIns.length} Pending Check-in
                            {client.pendingCheckIns.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {client.pendingCheckIns.map((checkIn) => (
                            <div
                              key={checkIn.id}
                              className="bg-grey-50 p-3 flex items-center justify-between"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-black">
                                    Week {checkIn.week_number}
                                  </p>
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-orange-100 text-orange-700">
                                    <Clock className="h-3 w-3" />
                                    Pending
                                  </span>
                                </div>
                                <p className="text-xs text-grey-500 mt-1">
                                  {formatRelativeDate(checkIn.created_at)}
                                </p>
                                <div className="flex gap-4 mt-1">
                                  {checkIn.weight && (
                                    <span className="text-xs text-grey-600">
                                      {checkIn.weight} lbs
                                    </span>
                                  )}
                                  {checkIn.energy_level && (
                                    <span className="text-xs text-grey-600">
                                      Energy: {checkIn.energy_level}/10
                                    </span>
                                  )}
                                  {checkIn.adherence && (
                                    <span className="text-xs text-grey-600">
                                      Adherence: {checkIn.adherence}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button
                                onClick={() => openReview(checkIn)}
                                variant="primary"
                                size="sm"
                              >
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Photos */}
                    {client.recentPhotos.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Camera className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-black">
                            {client.recentPhotos.length} New Photo
                            {client.recentPhotos.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex gap-2 overflow-x-auto">
                          {client.recentPhotos.slice(0, 4).map((photo) => (
                            <div
                              key={photo.id}
                              className="w-16 h-16 bg-grey-200 flex-shrink-0 overflow-hidden relative"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={photo.photo_url}
                                alt={photo.photo_type}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">
                                {photo.photo_type}
                              </span>
                            </div>
                          ))}
                          {client.recentPhotos.length > 4 && (
                            <div className="w-16 h-16 bg-grey-100 flex-shrink-0 flex items-center justify-center text-xs text-grey-500">
                              +{client.recentPhotos.length - 4}
                            </div>
                          )}
                        </div>
                        <Link
                          href={`/admin/clients/${client.profile.id}`}
                          className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                        >
                          View all photos
                        </Link>
                      </div>
                    )}

                    {/* Recent Measurements */}
                    {client.recentMeasurements.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Scale className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-black">
                            New Measurements
                          </span>
                          <span className="text-xs text-grey-500">
                            {formatRelativeDate(
                              client.recentMeasurements[0].created_at
                            )}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-grey-50 p-2">
                            <p className="text-xs text-grey-500">Weight</p>
                            <p className="font-semibold text-black text-sm">
                              {client.recentMeasurements[0].weight
                                ? `${client.recentMeasurements[0].weight} lbs`
                                : '-'}
                            </p>
                          </div>
                          <div className="bg-grey-50 p-2">
                            <p className="text-xs text-grey-500">Body Fat</p>
                            <p className="font-semibold text-black text-sm">
                              {client.recentMeasurements[0].body_fat_percentage
                                ? `${client.recentMeasurements[0].body_fat_percentage}%`
                                : '-'}
                            </p>
                          </div>
                        </div>
                        <Link
                          href={`/admin/clients/${client.profile.id}`}
                          className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                        >
                          View measurements
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center">
          <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-semibold text-black">All caught up!</h3>
          <p className="text-grey-500 mt-1">
            No items need your review right now.
          </p>
        </div>
      )}

      {/* Review Modal */}
      {selectedCheckIn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-grey-200">
              <div>
                <h3 className="text-lg font-bold text-black">
                  Review Check-in
                </h3>
                <p className="text-sm text-grey-500">
                  {selectedCheckIn.profiles?.full_name} - Week{' '}
                  {selectedCheckIn.week_number}
                </p>
              </div>
              <button
                onClick={() => setSelectedCheckIn(null)}
                className="text-grey-400 hover:text-black"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Check-in details */}
            <div className="p-6 border-b border-grey-200">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-grey-50 p-3">
                  <p className="text-xs text-grey-500">Weight</p>
                  <p className="font-semibold text-black">
                    {selectedCheckIn.weight} lbs
                  </p>
                </div>
                <div className="bg-grey-50 p-3">
                  <p className="text-xs text-grey-500">Sleep Quality</p>
                  <p className="font-semibold text-black">
                    {selectedCheckIn.sleep_quality}
                  </p>
                </div>
                <div className="bg-grey-50 p-3">
                  <p className="text-xs text-grey-500">Energy Level</p>
                  <p className="font-semibold text-black">
                    {selectedCheckIn.energy_level}/10
                  </p>
                </div>
                <div className="bg-grey-50 p-3">
                  <p className="text-xs text-grey-500">Adherence</p>
                  <p className="font-semibold text-black">
                    {selectedCheckIn.adherence}
                  </p>
                </div>
              </div>
              {selectedCheckIn.notes && (
                <div className="mt-3">
                  <p className="text-xs text-grey-500">Client Notes:</p>
                  <p className="text-sm text-grey-700 mt-1">
                    {selectedCheckIn.notes}
                  </p>
                </div>
              )}
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
