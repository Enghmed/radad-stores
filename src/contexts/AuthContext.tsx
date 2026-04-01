import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

interface StoreInfo {
  id: string
  store_name: string
  store_name_ar: string | null
  store_type: string | null
  business_type: string | null
  description: string | null
  working_hours: string | null
  is_active: boolean
  setup_completed: boolean
  plan: string
  whatsapp_connected: boolean
  whatsapp_number: string | null
  waba_id: string | null
  whatsapp_waba_id: string | null
  whatsapp_phone_number_id: string | null
  telegram_chat_id: string | null
  telegram_connected: boolean
  instagram_connected: boolean
  instagram_page_id: string | null
  instagram_username: string | null
  ai_tone: string | null
  ai_welcome_message: string | null
  ai_custom_instructions: string | null
  trial_started_at: string | null
  trial_ends_at: string | null
  plan_started_at: string | null
  plan_expires_at: string | null
}

interface AuthContextType {
  user: User | null
  session: Session | null
  store: StoreInfo | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, storeName: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshStore: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [store, setStore] = useState<StoreInfo | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadStore(userId: string) {
    const { data, error } = await supabase
      .from('store_owners')
      .select('id, store_name, store_name_ar, store_type, business_type, description, working_hours, is_active, setup_completed, plan, whatsapp_connected, whatsapp_number, waba_id, whatsapp_waba_id, whatsapp_phone_number_id, telegram_chat_id, telegram_connected, instagram_connected, instagram_page_id, instagram_username, ai_tone, ai_welcome_message, ai_custom_instructions, trial_started_at, trial_ends_at, plan_started_at, plan_expires_at')
      .eq('auth_user_id', userId)
      .single()

    if (error && error.code === 'PGRST116') {
      // No row found — create one (happens when user confirmed email but row wasn't created during signup)
      console.log('[Auth] No store_owners row found, creating one...')
      const { data: newData, error: insertError } = await supabase
        .from('store_owners')
        .insert({
          auth_user_id: userId,
          store_name: 'متجري',
          is_active: true,
          setup_completed: false,
          plan: 'trial',
          whatsapp_connected: false,
          telegram_connected: false,
          instagram_connected: false,
        })
        .select('id, store_name, store_name_ar, store_type, business_type, description, working_hours, is_active, setup_completed, plan, whatsapp_connected, whatsapp_number, waba_id, whatsapp_waba_id, whatsapp_phone_number_id, telegram_chat_id, telegram_connected, instagram_connected, instagram_page_id, instagram_username, ai_tone, ai_welcome_message, ai_custom_instructions, trial_started_at, trial_ends_at, plan_started_at, plan_expires_at')
        .single()

      if (insertError) {
        console.error('[Auth] Failed to create store row')
        setStore(null)
      } else {
        setStore(newData)
      }
    } else if (error) {
      console.error('[Auth] Error loading store')
      setStore(null)
    } else {
      setStore(data)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) loadStore(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) loadStore(session.user.id)
      else setStore(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function refreshStore() {
    if (user) await loadStore(user.id)
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error as Error | null }
  }

  async function signUp(email: string, password: string, storeName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { store_name: storeName },
      },
    })
    if (error) return { error: error as Error | null }

    // Try to insert the store row now (may fail if email confirmation is required)
    if (data.user) {
      const { error: insertError } = await supabase
        .from('store_owners')
        .insert({
          auth_user_id: data.user.id,
          store_name: storeName,
          is_active: true,
          setup_completed: false,
          plan: 'trial',
          whatsapp_connected: false,
          telegram_connected: false,
          instagram_connected: false,
        })

      if (insertError) {
        // This is expected if email confirmation is required — row will be created on first login
        console.log('[Auth] Could not insert store row during signup (will retry on login)')
      } else {
        await loadStore(data.user.id)
      }
    }

    return { error: null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setStore(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, store, loading, signIn, signUp, signOut, refreshStore }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
