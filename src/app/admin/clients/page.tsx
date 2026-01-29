'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Search, Filter, MoreVertical, Mail, Eye } from 'lucide-react';
import Button from '@/components/ui/Button';

interface Client {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  subscription?: {
    plan_name: string;
    status: string;
  };
  program?: {
    title: string;
    current_week: number;
  };
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const supabase = createClient();

    // First fetch profiles without complex joins to avoid FK ambiguity
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, created_at')
      .eq('role', 'client')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      setError(`Failed to fetch clients: ${profilesError.message}`);
      setLoading(false);
      return;
    }

    if (!profilesData || profilesData.length === 0) {
      setClients([]);
      setLoading(false);
      return;
    }

    // Fetch subscriptions and programs separately to avoid FK ambiguity
    const clientIds = profilesData.map(p => p.id);

    const [subsResult, programsResult] = await Promise.all([
      supabase
        .from('subscriptions')
        .select('client_id, plan_name, status')
        .in('client_id', clientIds),
      supabase
        .from('client_programs')
        .select('client_id, program_name, current_week, status')
        .in('client_id', clientIds)
    ]);

    // Create lookup maps
    const subscriptionMap = new Map();
    if (subsResult.data) {
      subsResult.data.forEach((sub: any) => {
        if (!subscriptionMap.has(sub.client_id)) {
          subscriptionMap.set(sub.client_id, sub);
        }
      });
    }

    const programMap = new Map();
    if (programsResult.data) {
      programsResult.data.forEach((prog: any) => {
        // Prefer active programs
        const existing = programMap.get(prog.client_id);
        if (!existing || prog.status === 'active') {
          programMap.set(prog.client_id, prog);
        }
      });
    }

    // Combine and format the data
    const formattedClients = profilesData.map(profile => {
      const subscription = subscriptionMap.get(profile.id);
      const program = programMap.get(profile.id);
      return {
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        created_at: profile.created_at,
        subscription: subscription ? {
          plan_name: subscription.plan_name,
          status: subscription.status,
        } : undefined,
        program: program ? {
          title: program.program_name,
          current_week: program.current_week,
        } : undefined,
      };
    });

    setClients(formattedClients);
    setLoading(false);
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && client.subscription?.status === 'active') ||
      (statusFilter === 'inactive' && client.subscription?.status !== 'active');
    return matchesSearch && matchesStatus;
  });

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

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 p-4 mb-4">
          <h2 className="font-bold text-red-800">Error Loading Clients</h2>
          <p className="text-red-700 mt-1">{error}</p>
          <p className="text-red-600 text-sm mt-2">
            This may be an RLS policy issue. Check that admin policies are set up correctly in Supabase.
          </p>
        </div>
        <Button onClick={() => { setError(null); setLoading(true); fetchClients(); }} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Clients</h1>
          <p className="text-grey-600 mt-1">{clients.length} total clients</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-grey-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients..."
            className="w-full border border-grey-300 pl-10 pr-4 py-3 text-black focus:outline-none focus:border-blue-600"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-grey-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 border border-grey-300 pl-10 pr-4 py-3 text-black focus:outline-none focus:border-blue-600 bg-white appearance-none"
          >
            <option value="all">All Clients</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-grey-50 border-b border-grey-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-grey-500">Client</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-grey-500">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-grey-500">Program</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-grey-500">Joined</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-grey-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grey-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-grey-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 flex items-center justify-center text-white font-bold">
                        {client.full_name?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div>
                        <p className="font-medium text-black">{client.full_name || 'Unknown'}</p>
                        <p className="text-sm text-grey-500">{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium ${
                        client.subscription?.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-grey-100 text-grey-600'
                      }`}
                    >
                      {client.subscription?.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {client.program ? (
                      <div>
                        <p className="text-sm text-black">{client.program.title}</p>
                        <p className="text-xs text-grey-500">Week {client.program.current_week}</p>
                      </div>
                    ) : (
                      <span className="text-sm text-grey-400">No program</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-grey-600">{formatDate(client.created_at)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="p-2 text-grey-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="View client"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                      <Link
                        href={`/admin/messages?client=${client.id}`}
                        className="p-2 text-grey-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Message client"
                      >
                        <Mail className="h-5 w-5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredClients.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-grey-500">No clients found</p>
          </div>
        )}
      </div>
    </div>
  );
}
