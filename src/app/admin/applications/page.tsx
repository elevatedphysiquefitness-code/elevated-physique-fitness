'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
  Filter,
  RefreshCw,
  FileText,
  UserCheck,
  Search,
} from 'lucide-react';

interface Application {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  goals: string;
  experience_level: string;
  availability: string;
  program_interest: string;
  why_elevated: string;
  status: 'new' | 'reviewing' | 'approved' | 'declined' | 'converted';
  notes: string | null;
  created_at: string;
}

const statusConfig = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700', icon: Clock },
  reviewing: { label: 'Reviewing', color: 'bg-yellow-100 text-yellow-700', icon: Search },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-700', icon: XCircle },
  converted: { label: 'Converted', color: 'bg-purple-100 text-purple-700', icon: UserCheck },
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from('coaching_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
    } else {
      setApplications(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('coaching_applications')
      .update({
        status: newStatus,
        notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating application:', error);
      alert('Failed to update status');
    } else {
      setApplications(applications.map(app =>
        app.id === id ? { ...app, status: newStatus as Application['status'], notes } : app
      ));
      setSelectedApp(null);
      setNotes('');
    }
    setUpdating(false);
  };

  const filteredApps = filter === 'all'
    ? applications
    : applications.filter(app => app.status === filter);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const stats = {
    total: applications.length,
    new: applications.filter(a => a.status === 'new').length,
    reviewing: applications.filter(a => a.status === 'reviewing').length,
    approved: applications.filter(a => a.status === 'approved').length,
    converted: applications.filter(a => a.status === 'converted').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-grey-500">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Coaching Applications</h1>
          <p className="text-grey-600 mt-1">
            {stats.new > 0 ? `${stats.new} new application${stats.new === 1 ? '' : 's'} to review` : 'All applications reviewed!'}
          </p>
        </div>
        <Button onClick={fetchApplications} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white p-4 border border-grey-200">
          <p className="text-sm text-grey-500">Total</p>
          <p className="text-2xl font-bold text-black">{stats.total}</p>
        </div>
        <div className="bg-blue-50 p-4 border border-blue-200">
          <p className="text-sm text-blue-600">New</p>
          <p className="text-2xl font-bold text-blue-700">{stats.new}</p>
        </div>
        <div className="bg-yellow-50 p-4 border border-yellow-200">
          <p className="text-sm text-yellow-600">Reviewing</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.reviewing}</p>
        </div>
        <div className="bg-green-50 p-4 border border-green-200">
          <p className="text-sm text-green-600">Approved</p>
          <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
        </div>
        <div className="bg-purple-50 p-4 border border-purple-200">
          <p className="text-sm text-purple-600">Converted</p>
          <p className="text-2xl font-bold text-purple-700">{stats.converted}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-grey-500" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-grey-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#3D2314]"
        >
          <option value="all">All Applications</option>
          <option value="new">New Only</option>
          <option value="reviewing">Reviewing</option>
          <option value="approved">Approved</option>
          <option value="declined">Declined</option>
          <option value="converted">Converted</option>
        </select>
      </div>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-grey-500">No applications found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => {
            const StatusIcon = statusConfig[app.status].icon;
            return (
              <Card key={app.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Contact Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-black">{app.full_name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium ${statusConfig[app.status].color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig[app.status].label}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-grey-600">
                        <a href={`mailto:${app.email}`} className="flex items-center gap-1 hover:text-[#3D2314]">
                          <Mail className="h-4 w-4" />
                          {app.email}
                        </a>
                        <a href={`tel:${app.phone}`} className="flex items-center gap-1 hover:text-[#3D2314]">
                          <Phone className="h-4 w-4" />
                          {app.phone}
                        </a>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(app.created_at)}
                        </span>
                      </div>

                      {/* Application Details */}
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="bg-grey-50 p-3">
                          <p className="text-grey-500 text-xs uppercase tracking-wide">Goal</p>
                          <p className="text-grey-800 font-medium">{app.goals}</p>
                        </div>
                        <div className="bg-grey-50 p-3">
                          <p className="text-grey-500 text-xs uppercase tracking-wide">Experience</p>
                          <p className="text-grey-800 font-medium">{app.experience_level}</p>
                        </div>
                        <div className="bg-grey-50 p-3">
                          <p className="text-grey-500 text-xs uppercase tracking-wide">Availability</p>
                          <p className="text-grey-800 font-medium">{app.availability}</p>
                        </div>
                        <div className="bg-grey-50 p-3">
                          <p className="text-grey-500 text-xs uppercase tracking-wide">Program Interest</p>
                          <p className="text-grey-800 font-medium">{app.program_interest}</p>
                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-[#EBE4D6] text-sm">
                        <p className="text-[#6B4423] text-xs uppercase tracking-wide mb-1">Why Elevated Physique</p>
                        <p className="text-[#3D2314]">{app.why_elevated}</p>
                      </div>

                      {app.notes && (
                        <div className="mt-2 text-sm text-grey-500 italic">
                          Notes: {app.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-grey-200 flex flex-wrap gap-2">
                    <Button
                      onClick={() => {
                        setSelectedApp(app);
                        setNotes(app.notes || '');
                      }}
                      variant={app.status === 'new' ? 'primary' : 'outline'}
                      size="sm"
                    >
                      Update Status
                    </Button>
                    <a
                      href={`mailto:${app.email}?subject=Your Elevated Physique Application&body=Hi ${app.full_name},%0D%0A%0D%0AThank you for applying to Elevated Physique Fitness!%0D%0A%0D%0A`}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium border border-grey-300 text-grey-700 hover:bg-grey-50"
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </a>
                    <a
                      href={`tel:${app.phone}`}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium border border-grey-300 text-grey-700 hover:bg-grey-50"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </a>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Update Status Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md">
            <div className="p-6 border-b border-grey-200">
              <h3 className="text-lg font-bold text-black">Update Application Status</h3>
              <p className="text-sm text-grey-500 mt-1">{selectedApp.full_name}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['new', 'reviewing', 'approved', 'declined', 'converted'] as const).map((status) => {
                    const config = statusConfig[status];
                    const Icon = config.icon;
                    return (
                      <button
                        key={status}
                        onClick={() => setSelectedApp({ ...selectedApp, status })}
                        className={`p-3 border-2 flex items-center gap-2 transition-colors ${
                          selectedApp.status === status
                            ? 'border-[#3D2314] bg-[#EBE4D6]'
                            : 'border-grey-200 hover:border-grey-300'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-[#3D2314] resize-none"
                  placeholder="Add any notes about this application..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-grey-200 flex gap-3">
              <Button
                onClick={() => {
                  setSelectedApp(null);
                  setNotes('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => updateStatus(selectedApp.id, selectedApp.status)}
                variant="primary"
                className="flex-1"
                disabled={updating}
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
