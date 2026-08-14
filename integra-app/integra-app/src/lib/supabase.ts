import {createClient} from '@supabase/supabase-js'
import Storage from 'expo-sqlite/kv-store'
import { AppState } from 'react-native'

export const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_KEY!,
    {
        auth: {
            storage: Storage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false
        }
    }
)

AppState.addEventListener('change', (state) => {
    state === 'active' ? supabase.auth.startAutoRefresh() : supabase.auth.stopAutoRefresh()
})