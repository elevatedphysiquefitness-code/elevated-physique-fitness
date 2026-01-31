'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Bell,
  BellOff,
  BellRing,
  Dumbbell,
  MessageSquare,
  CheckSquare,
  TrendingUp,
  Calendar,
  Megaphone,
  Smartphone,
  CheckCircle,
  X,
} from 'lucide-react';

interface NotificationPreferences {
  workout_reminders: boolean;
  check_in_reminders: boolean;
  habit_reminders: boolean;
  coach_messages: boolean;
  progress_updates: boolean;
  promotional: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

const defaultPreferences: NotificationPreferences = {
  workout_reminders: true,
  check_in_reminders: true,
  habit_reminders: true,
  coach_messages: true,
  progress_updates: true,
  promotional: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '07:00',
};

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    checkPushSupport();
    fetchPreferences();
  }, []);

  const checkPushSupport = async () => {
    // Check if push is supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true);

      // Check current permission
      if ('Notification' in window) {
        setPushPermission(Notification.permission);
      }

      // Check if already subscribed
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    }
  };

  const fetchPreferences = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setPreferences({
        workout_reminders: data.workout_reminders ?? true,
        check_in_reminders: data.check_in_reminders ?? true,
        habit_reminders: data.habit_reminders ?? true,
        coach_messages: data.coach_messages ?? true,
        progress_updates: data.progress_updates ?? true,
        promotional: data.promotional ?? false,
        quiet_hours_start: data.quiet_hours_start || '22:00',
        quiet_hours_end: data.quiet_hours_end || '07:00',
      });
    }

    setLoading(false);
  };

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        throw error;
      }
    }
    throw new Error('Service Worker not supported');
  };

  const subscribeToPush = async () => {
    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission !== 'granted') {
        alert('Please enable notifications in your browser settings to receive push notifications.');
        return;
      }

      // Register service worker
      const registration = await registerServiceWorker();
      await navigator.serviceWorker.ready;

      // Get VAPID public key
      const vapidResponse = await fetch('/api/push/vapid-key');
      const { publicKey } = await vapidResponse.json();

      if (!publicKey) {
        alert('Push notifications are not configured. Please contact support.');
        return;
      }

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });

      if (response.ok) {
        setIsSubscribed(true);
      } else {
        throw new Error('Failed to save subscription');
      }
    } catch (error) {
      console.error('Error subscribing to push:', error);
      alert('Failed to enable notifications. Please try again.');
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push
        await subscription.unsubscribe();

        // Remove from server
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });

        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    await supabase
      .from('notification_preferences')
      .upsert({
        user_id: user.id,
        ...preferences,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    setSaving(false);
  };

  const sendTestNotification = async () => {
    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: {
            title: 'Test Notification',
            body: 'Push notifications are working! 🎉',
            url: '/dashboard/notifications',
          },
          notificationType: 'test',
        }),
      });

      if (response.ok) {
        setTestSent(true);
        setTimeout(() => setTestSent(false), 3000);
      }
    } catch (error) {
      console.error('Error sending test:', error);
    }
  };

  // Helper function to convert VAPID key
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  const togglePreference = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-grey-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">Notification Settings</h1>
        <p className="mt-2 text-grey-600">Manage how and when you receive notifications</p>
      </div>

      {/* Push Notification Status */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            <h2 className="font-bold text-black">Push Notifications</h2>
          </div>
        </CardHeader>
        <CardContent>
          {!pushSupported ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                Push notifications are not supported in your browser. Try using Chrome, Firefox, or Safari.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isSubscribed ? (
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <BellRing className="h-6 w-6 text-green-600" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-grey-100 rounded-full flex items-center justify-center">
                      <BellOff className="h-6 w-6 text-grey-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-black">
                      {isSubscribed ? 'Notifications Enabled' : 'Notifications Disabled'}
                    </p>
                    <p className="text-sm text-grey-500">
                      {isSubscribed
                        ? 'You will receive push notifications on this device'
                        : 'Enable to receive workout reminders and updates'}
                    </p>
                  </div>
                </div>
                {isSubscribed ? (
                  <Button onClick={unsubscribeFromPush} variant="outline">
                    Disable
                  </Button>
                ) : (
                  <Button onClick={subscribeToPush} variant="primary">
                    Enable
                  </Button>
                )}
              </div>

              {isSubscribed && (
                <div className="pt-4 border-t border-grey-200">
                  <button
                    onClick={sendTestNotification}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    {testSent ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Test notification sent!
                      </>
                    ) : (
                      <>
                        <Bell className="h-4 w-4" />
                        Send test notification
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <h2 className="font-bold text-black">Notification Types</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { key: 'workout_reminders', icon: Dumbbell, label: 'Workout Reminders', description: 'Get reminded about scheduled workouts' },
              { key: 'check_in_reminders', icon: Calendar, label: 'Check-in Reminders', description: 'Reminders to submit weekly check-ins' },
              { key: 'habit_reminders', icon: CheckSquare, label: 'Habit Reminders', description: 'Daily reminders for your habits' },
              { key: 'coach_messages', icon: MessageSquare, label: 'Coach Messages', description: 'New messages from your coach' },
              { key: 'progress_updates', icon: TrendingUp, label: 'Progress Updates', description: 'Weekly progress summaries and milestones' },
              { key: 'promotional', icon: Megaphone, label: 'Promotional', description: 'Special offers and announcements' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-3 border-b border-grey-100 last:border-0">
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-grey-400" />
                  <div>
                    <p className="font-medium text-black">{item.label}</p>
                    <p className="text-sm text-grey-500">{item.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => togglePreference(item.key as keyof NotificationPreferences)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    preferences[item.key as keyof NotificationPreferences]
                      ? 'bg-blue-600'
                      : 'bg-grey-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      preferences[item.key as keyof NotificationPreferences]
                        ? 'translate-x-7'
                        : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BellOff className="h-5 w-5 text-blue-600" />
            <h2 className="font-bold text-black">Quiet Hours</h2>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-grey-600 mb-4">
            No notifications will be sent during quiet hours
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-grey-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={preferences.quiet_hours_start}
                onChange={(e) => setPreferences({ ...preferences, quiet_hours_start: e.target.value })}
                className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-grey-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={preferences.quiet_hours_end}
                onChange={(e) => setPreferences({ ...preferences, quiet_hours_end: e.target.value })}
                className="w-full px-4 py-2 border border-grey-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={savePreferences}
        variant="primary"
        size="lg"
        className="w-full"
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Preferences'}
      </Button>
    </div>
  );
}
