-- ============================================
-- RADAD STORES - Complete Database Migration
-- Project: jchcpswvlpdatudrstzl
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. STORE OWNERS (main tenant table)
-- ============================================
CREATE TABLE IF NOT EXISTS public.store_owners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  store_name_ar TEXT,
  store_type TEXT DEFAULT 'general',
  business_type TEXT,
  description TEXT,
  working_hours TEXT,
  address TEXT,
  google_maps_url TEXT,
  phone TEXT,
  whatsapp_number TEXT,
  whatsapp_phone_number_id TEXT,
  whatsapp_waba_id TEXT,
  whatsapp_access_token TEXT,
  whatsapp_connected BOOLEAN DEFAULT false,
  whatsapp_webhook_verified BOOLEAN DEFAULT false,
  telegram_bot_token TEXT,
  telegram_chat_id TEXT,
  telegram_connected BOOLEAN DEFAULT false,
  ai_tone TEXT DEFAULT 'friendly',
  ai_welcome_message TEXT,
  ai_custom_instructions TEXT,
  ai_language TEXT DEFAULT 'ar-sa',
  is_active BOOLEAN DEFAULT true,
  setup_completed BOOLEAN DEFAULT false,
  plan TEXT DEFAULT 'trial' CHECK (plan IN ('trial', 'monthly', 'yearly', 'expired')),
  trial_started_at TIMESTAMPTZ DEFAULT now(),
  trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '10 days'),
  plan_started_at TIMESTAMPTZ,
  plan_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. PRODUCTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.store_owners(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  price NUMERIC(10,2),
  category TEXT,
  is_available BOOLEAN DEFAULT true,
  image_url TEXT,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'google_maps')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 3. SUPPORT THREADS
-- ============================================
CREATE TABLE IF NOT EXISTS public.support_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.store_owners(id) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  platform TEXT DEFAULT 'whatsapp' CHECK (platform IN ('whatsapp', 'telegram', 'widget')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'awaiting_owner')),
  mode TEXT DEFAULT 'ai' CHECK (mode IN ('ai', 'human', 'awaiting_owner')),
  silent_escalation BOOLEAN DEFAULT false,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, customer_phone, platform)
);

-- ============================================
-- 4. SUPPORT MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES public.support_threads(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.store_owners(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('customer', 'ai', 'owner')),
  content TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'video', 'document', 'location')),
  media_url TEXT,
  whatsapp_message_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 5. STORE KNOWLEDGE BASE (self-learning)
-- ============================================
CREATE TABLE IF NOT EXISTS public.store_knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.store_owners(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  keywords TEXT[],
  source TEXT DEFAULT 'owner_reply' CHECK (source IN ('owner_reply', 'manual')),
  times_used INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 6. OWNER INSTRUCTIONS (escalation queue)
-- ============================================
CREATE TABLE IF NOT EXISTS public.owner_instructions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.store_owners(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL REFERENCES public.support_threads(id) ON DELETE CASCADE,
  customer_phone TEXT NOT NULL,
  customer_message TEXT NOT NULL,
  detected_intent TEXT DEFAULT 'SILENT_ESCALATION',
  owner_reply TEXT,
  ai_response_sent TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'replied', 'auto_resolved', 'expired')),
  platform TEXT DEFAULT 'whatsapp',
  created_at TIMESTAMPTZ DEFAULT now(),
  replied_at TIMESTAMPTZ
);

-- ============================================
-- 7. SUBSCRIPTIONS (payment tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID UNIQUE NOT NULL REFERENCES public.store_owners(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('trial', 'monthly', 'yearly')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  moyasar_payment_id TEXT,
  moyasar_subscription_id TEXT,
  amount_sar NUMERIC(10,2),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 8. USAGE TRACKING (monthly AI usage)
-- ============================================
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES public.store_owners(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL,
  replies_count INTEGER DEFAULT 0,
  replies_limit INTEGER DEFAULT 100,
  voice_replies_count INTEGER DEFAULT 0,
  last_reset_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, month_year)
);

-- ============================================
-- 9. STORE SETTINGS (extra config)
-- ============================================
CREATE TABLE IF NOT EXISTS public.store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID UNIQUE NOT NULL REFERENCES public.store_owners(id) ON DELETE CASCADE,
  notify_telegram BOOLEAN DEFAULT true,
  daily_report BOOLEAN DEFAULT false,
  dashboard_language TEXT DEFAULT 'ar',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- get_my_store_id: Returns the store_id for the currently authenticated user
CREATE OR REPLACE FUNCTION public.get_my_store_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.store_owners WHERE auth_user_id = auth.uid();
$$;

-- get_my_store_info: Returns full store info for the current user
CREATE OR REPLACE FUNCTION public.get_my_store_info()
RETURNS TABLE (
  store_id UUID,
  store_name TEXT,
  store_type TEXT,
  business_type TEXT,
  whatsapp_connected BOOLEAN,
  telegram_connected BOOLEAN,
  plan TEXT,
  is_active BOOLEAN,
  setup_completed BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    id,
    store_name,
    store_type,
    business_type,
    whatsapp_connected,
    telegram_connected,
    plan,
    is_active,
    setup_completed
  FROM public.store_owners
  WHERE auth_user_id = auth.uid();
$$;


-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE public.store_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;


-- ============================================
-- RLS POLICIES
-- ============================================

-- STORE OWNERS: user can only see/edit their own store
CREATE POLICY "store_owners_select_own" ON public.store_owners
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "store_owners_update_own" ON public.store_owners
  FOR UPDATE USING (auth_user_id = auth.uid());

CREATE POLICY "store_owners_insert_own" ON public.store_owners
  FOR INSERT WITH CHECK (auth_user_id = auth.uid());

-- PRODUCTS: user can only see/edit products for their store
CREATE POLICY "products_select_own" ON public.products
  FOR SELECT USING (store_id = public.get_my_store_id());

CREATE POLICY "products_insert_own" ON public.products
  FOR INSERT WITH CHECK (store_id = public.get_my_store_id());

CREATE POLICY "products_update_own" ON public.products
  FOR UPDATE USING (store_id = public.get_my_store_id());

CREATE POLICY "products_delete_own" ON public.products
  FOR DELETE USING (store_id = public.get_my_store_id());

-- SUPPORT THREADS: user can only see threads for their store
CREATE POLICY "threads_select_own" ON public.support_threads
  FOR SELECT USING (store_id = public.get_my_store_id());

CREATE POLICY "threads_update_own" ON public.support_threads
  FOR UPDATE USING (store_id = public.get_my_store_id());

-- SUPPORT MESSAGES: user can only see messages for their store
CREATE POLICY "messages_select_own" ON public.support_messages
  FOR SELECT USING (store_id = public.get_my_store_id());

CREATE POLICY "messages_insert_own" ON public.support_messages
  FOR INSERT WITH CHECK (store_id = public.get_my_store_id());

-- KNOWLEDGE BASE: user can only see/edit KB entries for their store
CREATE POLICY "kb_select_own" ON public.store_knowledge_base
  FOR SELECT USING (store_id = public.get_my_store_id());

CREATE POLICY "kb_insert_own" ON public.store_knowledge_base
  FOR INSERT WITH CHECK (store_id = public.get_my_store_id());

CREATE POLICY "kb_update_own" ON public.store_knowledge_base
  FOR UPDATE USING (store_id = public.get_my_store_id());

CREATE POLICY "kb_delete_own" ON public.store_knowledge_base
  FOR DELETE USING (store_id = public.get_my_store_id());

-- OWNER INSTRUCTIONS: user can only see escalations for their store
CREATE POLICY "instructions_select_own" ON public.owner_instructions
  FOR SELECT USING (store_id = public.get_my_store_id());

CREATE POLICY "instructions_update_own" ON public.owner_instructions
  FOR UPDATE USING (store_id = public.get_my_store_id());

-- SUBSCRIPTIONS: user can only see their own subscription
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT USING (store_id = public.get_my_store_id());

-- USAGE TRACKING: user can only see their own usage
CREATE POLICY "usage_select_own" ON public.usage_tracking
  FOR SELECT USING (store_id = public.get_my_store_id());

-- STORE SETTINGS: user can only see/edit their own settings
CREATE POLICY "settings_select_own" ON public.store_settings
  FOR SELECT USING (store_id = public.get_my_store_id());

CREATE POLICY "settings_insert_own" ON public.store_settings
  FOR INSERT WITH CHECK (store_id = public.get_my_store_id());

CREATE POLICY "settings_update_own" ON public.store_settings
  FOR UPDATE USING (store_id = public.get_my_store_id());


-- ============================================
-- SERVICE ROLE POLICIES (for edge functions)
-- Edge functions use service_role key which bypasses RLS,
-- but we add explicit policies for safety
-- ============================================

-- Allow service role to insert threads and messages (from webhooks)
CREATE POLICY "service_insert_threads" ON public.support_threads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "service_insert_messages" ON public.support_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "service_insert_instructions" ON public.owner_instructions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "service_insert_usage" ON public.usage_tracking
  FOR INSERT WITH CHECK (true);

CREATE POLICY "service_update_usage" ON public.usage_tracking
  FOR UPDATE USING (true);

CREATE POLICY "service_insert_subscriptions" ON public.subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "service_update_subscriptions" ON public.subscriptions
  FOR UPDATE USING (true);


-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_store_owners_auth_user ON public.store_owners(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_products_store ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(store_id, category);
CREATE INDEX IF NOT EXISTS idx_threads_store ON public.support_threads(store_id);
CREATE INDEX IF NOT EXISTS idx_threads_customer ON public.support_threads(store_id, customer_phone);
CREATE INDEX IF NOT EXISTS idx_threads_status ON public.support_threads(store_id, status);
CREATE INDEX IF NOT EXISTS idx_threads_last_message ON public.support_threads(store_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON public.support_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_store ON public.support_messages(store_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.support_messages(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_kb_store ON public.store_knowledge_base(store_id);
CREATE INDEX IF NOT EXISTS idx_kb_keywords ON public.store_knowledge_base USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_instructions_store ON public.owner_instructions(store_id);
CREATE INDEX IF NOT EXISTS idx_instructions_pending ON public.owner_instructions(store_id, status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_usage_store_month ON public.usage_tracking(store_id, month_year);

-- WhatsApp lookup indexes (used by webhooks)
CREATE INDEX IF NOT EXISTS idx_store_whatsapp_phone ON public.store_owners(whatsapp_phone_number_id) WHERE whatsapp_phone_number_id IS NOT NULL;


-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_store_owners_updated
  BEFORE UPDATE ON public.store_owners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER tr_products_updated
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER tr_threads_updated
  BEFORE UPDATE ON public.support_threads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER tr_kb_updated
  BEFORE UPDATE ON public.store_knowledge_base
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER tr_subscriptions_updated
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER tr_settings_updated
  BEFORE UPDATE ON public.store_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ============================================
-- DONE!
-- 9 tables, 2 helper functions, 25 RLS policies,
-- 16 indexes, 6 auto-update triggers
-- ============================================
SELECT 'Migration complete! Created 9 tables, 2 functions, 25 RLS policies, 16 indexes, 6 triggers.' as result;
