import {createClient} from '@supabase/supabase-js'
import { SQLiteStorage } from 'expo-sqlite/kv-store'
import { AppState } from 'react-native'
import { Database } from './database.types'

export const almacenamientoAuth = new SQLiteStorage('supabase-auth')

export const supabase = createClient<Database>(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_KEY!,
    {
        auth: {
            storage: almacenamientoAuth,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false
        }
    }
)

AppState.addEventListener('change', (state) => {
    state === 'active' ? supabase.auth.startAutoRefresh() : supabase.auth.stopAutoRefresh()
})