import {createClient} from '@supabase/supabase-js'
import { SQLiteStorage } from 'expo-sqlite/kv-store'
import { AppState } from 'react-native'

export const authStorage = new SQLiteStorage('supabase-auth')

export const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_KEY!,
    {
        auth: {
            storage: authStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false
        }
    }
)

AppState.addEventListener('change', (state) => {
    state === 'active' ? supabase.auth.startAutoRefresh() : supabase.auth.stopAutoRefresh()
})