import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

interface StoreInfo {
  id: string
  store_name: string
  store_name_ar: string | null
  store_type: string
  business_type: string | null
  description: string | null
  is_active: boolean
  setup_completed: boolean
  plan: string
  whatsapp_connected: boolean
  whatsapp_number: string | null
  waba_id: string | null
  whatsapp_phone_number_id: string | null
  instagram_connected: boolean
  instagram_page_id: string | null
  instagram_username: string | null
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
    const { data } = await supabase
      .from('store_owners')
      .select('id, store_name, store_name_ar, store_type, business_type, description, is_active, setup_completed, plan, whatsapp_connected, whatsapp_number, waba_id, whatsapp_phone_number_id, instagram_connected, instagram_page_id, instagram_username')
      .eq('auth_user_id', userId)
      .single()
    setStore(data)
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
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error as Error | null }

    if (data.user) {
      await supabase.from('store_owners').insert({
        auth_user_id: data.user.id,
        store_name: storeName,
      })
      await loadStore(data.user.id)
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
