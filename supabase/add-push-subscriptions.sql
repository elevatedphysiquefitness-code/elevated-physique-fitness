-- Push Notifications Tables
-- Run this in the Supabase SQL Editor

-- Table to store push notification subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL, -- Public key for encryption
  auth TEXT NOT NULL, -- Auth secret
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to store notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  workout_reminders BOOLEAN DEFAULT TRUE,
  check_in_reminders BOOLEAN DEFAULT TRUE,
  habit_reminders BOOLEAN DEFAULT TRUE,
  coach_messages BOOLEAN DEFAULT TRUE,
  progress_updates BOOLEAN DEFAULT TRUE,
  promotional BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '07:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to log sent notifications
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  status TEXT CHECK (status IN ('sent', 'failed', 'clicked')) DEFAULT 'sent',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  clicked_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON notification_logs(notification_type);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for push_subscriptions
CREATE POLICY "push_subscriptions_select" ON push_subscriptions FOR SELECT USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "push_subscriptions_insert" ON push_subscriptions FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "push_subscriptions_update" ON push_subscriptions FOR UPDATE USING (
  auth.uid() = user_id
);

CREATE POLICY "push_subscriptions_delete" ON push_subscriptions FOR DELETE USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for notification_preferences
CREATE POLICY "notification_preferences_select" ON notification_preferences FOR SELECT USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "notification_preferences_insert" ON notification_preferences FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "notification_preferences_update" ON notification_preferences FOR UPDATE USING (
  auth.uid() = user_id
);

-- RLS Policies for notification_logs
CREATE POLICY "notification_logs_select" ON notification_logs FOR SELECT USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "notification_logs_insert" ON notification_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  OR auth.uid() = user_id
);

-- Comments
COMMENT ON TABLE push_subscriptions IS 'Web push notification subscriptions';
COMMENT ON TABLE notification_preferences IS 'User notification preferences';
COMMENT ON TABLE notification_logs IS 'Log of sent notifications';
