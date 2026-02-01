'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Clock,
  CheckCircle,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  Filter,
  RefreshCw,
  Archive,
  Reply,
} from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  workout_days: string | null;
  availability: string | null;
  goals: string | null;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  notes: string | null;
  created_at: string;
}

const statusConfig = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700', icon: Clock },
  read: { label: 'Read', color: 'bg-yellow-100 text-yellow-700', icon: CheckCircle },
  replied: { label: 'Replied', color: 'bg-green-100 text-green-700', icon: Reply },
  archived: { label: 'Archived', color: 'bg-grey-100 text-grey-700', icon: Archive },
};

export default function ContactsPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('contact_messages')
      .update({
        status: newStatus,
        notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating message:', error);
      alert('Failed to update status');
    } else {
      setMessages(messages.map(msg =>
        msg.id === id ? { ...msg, status: newStatus as ContactMessage['status'], notes } : msg
      ));
      setSelectedMessage(null);
      setNotes('');
    }
    setUpdating(false);
  };

  const filteredMessages = filter === 'all'
    ? messages
    : messages.filter(msg => msg.status === filter);

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
    total: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    read: messages.filter(m => m.status === 'read').length,
    replied: messages.filter(m => m.status === 'replied').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-grey-500">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Contact Messages</h1>
          <p className="text-grey-600 mt-1">
            {stats.new > 0 ? `${stats.new} new message${stats.new === 1 ? '' : 's'} awaiting response` : 'All caught up!'}
          </p>
        </div>
        <Button onClick={fetchMessages} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-grey-200">
          <p className="text-sm text-grey-500">Total</p>
          <p className="text-2xl font-bold text-black">{stats.total}</p>
        </div>
        <div className="bg-blue-50 p-4 border border-blue-200">
          <p className="text-sm text-blue-600">New</p>
          <p className="text-2xl font-bold text-blue-700">{stats.new}</p>
        </div>
        <div className="bg-yellow-50 p-4 border border-yellow-200">
          <p className="text-sm text-yellow-600">Read</p>
          <p className="text-2xl font-bold text-yellow-700">{stats.read}</p>
        </div>
        <div className="bg-green-50 p-4 border border-green-200">
          <p className="text-sm text-green-600">Replied</p>
          <p className="text-2xl font-bold text-green-700">{stats.replied}</p>
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
          <option value="all">All Messages</option>
          <option value="new">New Only</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-grey-500">No messages found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((msg) => {
            const StatusIcon = statusConfig[msg.status].icon;
            return (
              <Card key={msg.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Contact Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-black">{msg.name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium ${statusConfig[msg.status].color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig[msg.status].label}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-grey-600">
                        <a href={`mailto:${msg.email}`} className="flex items-center gap-1 hover:text-[#3D2314]">
                          <Mail className="h-4 w-4" />
                          {msg.email}
                        </a>
                        {msg.phone && (
                          <a href={`tel:${msg.phone}`} className="flex items-center gap-1 hover:text-[#3D2314]">
                            <Phone className="h-4 w-4" />
                            {msg.phone}
                          </a>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(msg.created_at)}
                        </span>
                      </div>

                      <div className="mt-3 p-3 bg-grey-50 text-sm text-grey-700">
                        <MessageSquare className="h-4 w-4 inline mr-2 text-grey-400" />
                        {msg.message}
                      </div>

                      {(msg.goals || msg.availability || msg.workout_days) && (
                        <div className="mt-2 text-sm text-grey-500">
                          {msg.goals && <span className="mr-4">Goal: {msg.goals}</span>}
                          {msg.availability && <span className="mr-4">Availability: {msg.availability}</span>}
                          {msg.workout_days && <span>Days/week: {msg.workout_days}</span>}
                        </div>
                      )}

                      {msg.notes && (
                        <div className="mt-2 text-sm text-grey-500 italic">
                          Notes: {msg.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-grey-200 flex flex-wrap gap-2">
                    <Button
                      onClick={() => {
                        setSelectedMessage(msg);
                        setNotes(msg.notes || '');
                      }}
                      variant={msg.status === 'new' ? 'primary' : 'outline'}
                      size="sm"
                    >
                      Update Status
                    </Button>
                    <a
                      href={`mailto:${msg.email}?subject=Re: Your Elevated Physique Inquiry&body=Hi ${msg.name},%0D%0A%0D%0AThank you for reaching out!%0D%0A%0D%0A`}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium border border-grey-300 text-grey-700 hover:bg-grey-50"
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Reply
                    </a>
                    {msg.phone && (
                      <a
                        href={`tel:${msg.phone}`}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium border border-grey-300 text-grey-700 hover:bg-grey-50"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Update Status Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md">
            <div className="p-6 border-b border-grey-200">
              <h3 className="text-lg font-bold text-black">Update Message Status</h3>
              <p className="text-sm text-grey-500 mt-1">{selectedMessage.name}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-grey-700 mb-2">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['new', 'read', 'replied', 'archived'] as const).map((status) => {
                    const config = statusConfig[status];
                    const Icon = config.icon;
                    return (
                      <button
                        key={status}
                        onClick={() => setSelectedMessage({ ...selectedMessage, status })}
                        className={`p-3 border-2 flex items-center gap-2 transition-colors ${
                          selectedMessage.status === status
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
                  placeholder="Add any notes about this message..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-grey-200 flex gap-3">
              <Button
                onClick={() => {
                  setSelectedMessage(null);
                  setNotes('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => updateStatus(selectedMessage.id, selectedMessage.status)}
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
