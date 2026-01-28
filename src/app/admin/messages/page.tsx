'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Send, Search } from 'lucide-react';
import Button from '@/components/ui/Button';

interface Client {
  id: string;
  full_name: string;
  email: string;
  unread_count?: number;
  last_message?: string;
  last_message_time?: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read: boolean;
}

export default function AdminMessagesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [adminId, setAdminId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchMessages(selectedClient.id);
    }
  }, [selectedClient]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchClients = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      setAdminId(user.id);

      // Fetch clients with their last message
      const { data: clientsData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'client')
        .order('full_name');

      if (clientsData) {
        // Get unread counts for each client
        const clientsWithUnread = await Promise.all(
          clientsData.map(async (client: any) => {
            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('sender_id', client.id)
              .eq('receiver_id', user.id)
              .eq('read', false);

            return {
              ...client,
              unread_count: count || 0,
            };
          })
        );

        setClients(clientsWithUnread);
      }
    }

    setLoading(false);
  };

  const fetchMessages = async (clientId: string) => {
    const supabase = createClient();

    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${clientId},receiver_id.eq.${adminId}),and(sender_id.eq.${adminId},receiver_id.eq.${clientId})`)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);

      // Mark messages as read
      const unreadIds = data
        .filter((m: Message) => m.sender_id === clientId && !m.read)
        .map((m: Message) => m.id);

      if (unreadIds.length > 0) {
        await supabase
          .from('messages')
          .update({ read: true })
          .in('id', unreadIds);

        // Update unread count in clients list
        setClients(
          clients.map((c) =>
            c.id === clientId ? { ...c, unread_count: 0 } : c
          )
        );
      }
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedClient || sending) return;

    setSending(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from('messages')
      .insert({
        content: newMessage.trim(),
        sender_id: adminId,
        receiver_id: selectedClient.id,
      })
      .select()
      .single();

    if (data && !error) {
      setMessages([...messages, data]);
      setNewMessage('');
    }

    setSending(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const filteredClients = clients.filter((client) =>
    client.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-grey-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-10rem)] flex bg-white">
      {/* Clients List */}
      <div className="w-80 border-r border-grey-200 flex flex-col">
        <div className="p-4 border-b border-grey-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-grey-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients..."
              className="w-full border border-grey-300 pl-9 pr-4 py-2 text-sm text-black focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredClients.map((client) => (
            <button
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className={`w-full p-4 text-left border-b border-grey-100 hover:bg-grey-50 transition-colors ${
                selectedClient?.id === client.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {client.full_name?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-black truncate">{client.full_name}</p>
                    {(client.unread_count ?? 0) > 0 && (
                      <span className="w-5 h-5 bg-blue-600 text-white text-xs flex items-center justify-center rounded-full">
                        {client.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-grey-500 truncate">{client.email}</p>
                </div>
              </div>
            </button>
          ))}
          {filteredClients.length === 0 && (
            <p className="p-4 text-grey-500 text-center">No clients found</p>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedClient ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-grey-200">
              <p className="font-semibold text-black">{selectedClient.full_name}</p>
              <p className="text-sm text-grey-500">{selectedClient.email}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => {
                const isOwn = message.sender_id === adminId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] p-4 ${
                        isOwn
                          ? 'bg-blue-600 text-white'
                          : 'bg-grey-100 text-black'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-2 ${
                          isOwn ? 'text-blue-200' : 'text-grey-500'
                        }`}
                      >
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              {messages.length === 0 && (
                <p className="text-grey-500 text-center py-8">
                  No messages yet. Send a message to start the conversation.
                </p>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-grey-200">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
                />
                <Button type="submit" variant="primary" disabled={sending || !newMessage.trim()}>
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-grey-500">
            Select a client to view messages
          </div>
        )}
      </div>
    </div>
  );
}
