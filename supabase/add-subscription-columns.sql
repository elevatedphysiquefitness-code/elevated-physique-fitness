-- Add missing columns to subscriptions table for manual subscription management

-- Add user_id as alias for client_id (for code consistency)
-- First check if user_id column exists, if not add it
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'user_id') THEN
    ALTER TABLE subscriptions ADD COLUMN user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Copy existing client_id values to user_id
UPDATE subscriptions SET user_id = client_id WHERE user_id IS NULL AND client_id IS NOT NULL;

-- Add billing_interval column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'billing_interval') THEN
    ALTER TABLE subscriptions ADD COLUMN billing_interval TEXT DEFAULT 'monthly';
  END IF;
END $$;

-- Copy billing_cycle to billing_interval
UPDATE subscriptions SET billing_interval = billing_cycle WHERE billing_interval IS NULL AND billing_cycle IS NOT NULL;

-- Add payment_method column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'payment_method') THEN
    ALTER TABLE subscriptions ADD COLUMN payment_method TEXT DEFAULT 'stripe';
  END IF;
END $$;

-- Add notes column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'notes') THEN
    ALTER TABLE subscriptions ADD COLUMN notes TEXT;
  END IF;
END $$;

-- Update plan_type constraint to allow more values
-- First drop the old constraint if it exists
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check;

-- Add new constraint with expanded values
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_type_check
  CHECK (plan_type IN ('in-person', 'inperson', 'online', 'hybrid', 'nutrition', 'custom'));

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- RLS Policy for admins to manage all subscriptions
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON subscriptions;
CREATE POLICY "Admins can manage all subscriptions" ON subscriptions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policy for users to view their own subscriptions
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT
  USING (
    user_id = auth.uid() OR client_id = auth.uid()
  );
