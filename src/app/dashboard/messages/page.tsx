'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Send, MessageSquare, Users, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  read: boolean;
}

interface ChatUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  unread_count?: number;
  last_message?: string;
  last_message_time?: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('client');
  const [chatPartnerId, setChatPartnerId] = useState<string>('');
  const [chatPartnerName, setChatPartnerName] = useState<string>('');
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showUserList, setShowUserList] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    let channel: ReturnType<ReturnType<typeof createClient>['channel']> | null = null;

    const initializeChat = async () => {
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          setError('Please log in to view messages');
          setLoading(false);
          return;
        }

        setUserId(user.id);

        // Get current user's profile and role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', user.id)
          .single();

        const currentUserRole = profile?.role || 'client';
        setUserRole(currentUserRole);

        if (currentUserRole === 'admin') {
          // Admin: Show list of all clients they can message
          setShowUserList(true);
          await loadClientList(supabase, user.id);
        } else {
          // Client: Find admin to chat with
          const { data: admins } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('role', 'admin');

          if (admins && admins.length > 0) {
            const admin = admins[0];
            setChatPartnerId(admin.id);
            setChatPartnerName(admin.full_name || 'Your Coach');
            await loadMessages(supabase, user.id, admin.id);
          } else {
            // No admin found - show helpful message
            setError('no_admin');
          }
        }

        // Set up real-time subscription
        channel = supabase
          .channel('messages-realtime')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
            },
            (payload) => {
              const newMsg = payload.new as Message;
              if (newMsg.sender_id === user.id || newMsg.receiver_id === user.id) {
                setMessages((prev) => {
                  if (prev.some(m => m.id === newMsg.id)) return prev;
                  return [...prev, newMsg];
                });

                // If admin, refresh client list for unread counts
                if (currentUserRole === 'admin') {
                  loadClientList(supabase, user.id);
                }
              }
            }
          )
          .subscribe();

      } catch (err) {
        console.error('Error initializing chat:', err);
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    return () => {
      if (channel) {
        const supabase = createClient();
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const loadClientList = async (supabase: ReturnType<typeof createClient>, adminId: string) => {
    // Get all clients
    const { data: clients } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('role', 'client')
      .order('full_name');

    if (clients) {
      // Get message stats for each client
      const clientsWithStats = await Promise.all(
        clients.map(async (client) => {
          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', client.id)
            .eq('receiver_id', adminId)
            .eq('read', false);

          // Get last message
          const { data: lastMessages } = await supabase
            .from('messages')
            .select('content, created_at')
            .or(`and(sender_id.eq.${client.id},receiver_id.eq.${adminId}),and(sender_id.eq.${adminId},receiver_id.eq.${client.id})`)
            .order('created_at', { ascending: false })
            .limit(1);

          return {
            ...client,
            unread_count: unreadCount || 0,
            last_message: lastMessages?.[0]?.content,
            last_message_time: lastMessages?.[0]?.created_at,
          };
        })
      );

      // Sort by last message time (most recent first), then by unread
      clientsWithStats.sort((a, b) => {
        if (a.unread_count && !b.unread_count) return -1;
        if (!a.unread_count && b.unread_count) return 1;
        if (a.last_message_time && b.last_message_time) {
          return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
        }
        return 0;
      });

      setChatUsers(clientsWithStats);
    }
  };

  const loadMessages = async (
    supabase: ReturnType<typeof createClient>,
    currentUserId: string,
    partnerId: string
  ) => {
    const { data, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${currentUserId})`)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching messages:', fetchError);
    } else if (data) {
      setMessages(data);

      // Mark unread messages as read
      const unreadIds = data
        .filter((m: Message) => m.receiver_id === currentUserId && !m.read)
        .map((m: Message) => m.id);

      if (unreadIds.length > 0) {
        await supabase
          .from('messages')
          .update({ read: true })
          .in('id', unreadIds);
      }
    }
  };

  const selectChatUser = async (user: ChatUser) => {
    setChatPartnerId(user.id);
    setChatPartnerName(user.full_name || user.email);
    setShowUserList(false);
    setMessages([]);
    setLoading(true);

    const supabase = createClient();
    await loadMessages(supabase, userId, user.id);

    // Refresh client list to update unread counts
    await loadClientList(supabase, userId);

    setLoading(false);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !chatPartnerId) return;

    setSending(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: newMessage.trim(),
          sender_id: userId,
          receiver_id: chatPartnerId,
          read: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
      } else if (data) {
        setMessages((prev) => {
          if (prev.some(m => m.id === data.id)) return prev;
          return [...prev, data];
        });
        setNewMessage('');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Group messages by date
  const groupedMessages: { [key: string]: Message[] } = {};
  messages.forEach((message) => {
    const date = new Date(message.created_at).toDateString();
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(message);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-grey-500">Loading messages...</div>
      </div>
    );
  }

  // Special error state for no admin
  if (error === 'no_admin') {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-4">
        <MessageSquare className="h-12 w-12 mb-4 text-grey-300" />
        <h2 className="text-lg font-semibold text-black mb-2">Messaging Coming Soon</h2>
        <p className="text-grey-600 mb-4 max-w-md">
          Your coach is setting up the messaging system. In the meantime, you can reach out via email.
        </p>
        <Button
          href="mailto:elevatedphysiquefitness@gmail.com"
          variant="primary"
        >
          Email Your Coach
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-grey-500">
        <MessageSquare className="h-12 w-12 mb-4 text-grey-300" />
        <p>{error}</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Admin view: Show client list
  if (userRole === 'admin' && showUserList) {
    return (
      <div className="h-[calc(100vh-12rem)] flex flex-col bg-white">
        <div className="p-4 border-b border-grey-200">
          <h1 className="text-lg font-bold text-black">Messages</h1>
          <p className="text-sm text-grey-500">Select a client to message</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chatUsers.length > 0 ? (
            <div className="divide-y divide-grey-200">
              {chatUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => selectChatUser(user)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-grey-50 transition-colors text-left"
                >
                  <div className="w-12 h-12 bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {(user.full_name || user.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-black truncate">
                        {user.full_name || user.email}
                      </p>
                      {user.last_message_time && (
                        <span className="text-xs text-grey-500">
                          {formatRelativeTime(user.last_message_time)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-grey-500 truncate">
                      {user.last_message || 'No messages yet'}
                    </p>
                  </div>
                  {user.unread_count && user.unread_count > 0 && (
                    <div className="w-6 h-6 bg-blue-600 text-white text-xs flex items-center justify-center rounded-full">
                      {user.unread_count}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-grey-500 p-4">
              <Users className="h-12 w-12 mb-4 text-grey-300" />
              <p className="font-medium">No clients yet</p>
              <p className="text-sm mt-1 text-center">
                Clients will appear here once they sign up
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Chat view
  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-grey-200 flex items-center gap-3">
        {userRole === 'admin' && (
          <button
            onClick={() => setShowUserList(true)}
            className="p-2 hover:bg-grey-100 transition-colors -ml-2"
          >
            <ArrowLeft className="h-5 w-5 text-grey-600" />
          </button>
        )}
        <div className="w-10 h-10 bg-blue-600 flex items-center justify-center text-white font-bold">
          {chatPartnerName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-lg font-bold text-black">{chatPartnerName}</h1>
          <p className="text-sm text-grey-500">
            {userRole === 'admin' ? 'Client' : 'Your Coach'}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {Object.keys(groupedMessages).length > 0 ? (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              <div className="flex justify-center mb-4">
                <span className="text-xs text-grey-500 bg-grey-100 px-3 py-1">
                  {formatDate(dateMessages[0].created_at)}
                </span>
              </div>
              <div className="space-y-3">
                {dateMessages.map((message) => {
                  const isOwn = message.sender_id === userId;
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
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-grey-500">
            <MessageSquare className="h-12 w-12 mb-4 text-grey-300" />
            <p className="font-medium">No messages yet</p>
            <p className="text-sm mt-1">Send a message to start the conversation</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-grey-200">
        <div className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-grey-300 px-4 py-3 text-black focus:outline-none focus:border-blue-600"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={sending || !newMessage.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
