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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const supabase = createClient();

    const { data } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        phone,
        created_at,
        subscriptions (plan_name, status),
        client_programs (
          current_week,
          workout_programs (title)
        )
      `)
      .eq('role', 'client')
      .order('created_at', { ascending: false });

    if (data) {
      const formattedClients = data.map((client: any) => ({
        id: client.id,
        full_name: client.full_name,
        email: client.email,
        phone: client.phone,
        created_at: client.created_at,
        subscription: client.subscriptions?.[0],
        program: client.client_programs?.[0] ? {
          title: client.client_programs[0].workout_programs?.title,
          current_week: client.client_programs[0].current_week,
        } : undefined,
      }));
      setClients(formattedClients);
    }

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
