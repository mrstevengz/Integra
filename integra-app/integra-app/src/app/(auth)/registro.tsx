import { useState } from 'react'
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native'
import { Link } from 'expo-router'
import { supabase } from '@/lib/supabase'
import {useForm} from 'react-hook-form'

export default function RegistroScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  async function registrarse() {
    setCargando(true)
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })

    if (error) {
      setError(error.message)
    } else if (!data.session) {
      // Ocurre si "Confirm email" sigue activado en el dashboard
      setAviso('Revisa tu correo para confirmar la cuenta.')
    }
    setCargando(false)
  }

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-3xl font-bold text-slate-900 mb-8">Crear cuenta</Text>

      <TextInput
        className="border border-slate-300 rounded-lg px-4 py-3 mb-3 text-slate-900"
        placeholder="correo@ejemplo.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        className="border border-slate-300 rounded-lg px-4 py-3 mb-3 text-slate-900"
        placeholder="Contraseña (mínimo 6 caracteres)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      {error && <Text className="text-red-600 mb-3">{error}</Text>}
      {aviso && <Text className="text-teal-700 mb-3">{aviso}</Text>}

      <Pressable
        onPress={registrarse}
        disabled={cargando}
        className="bg-black rounded-lg py-4 items-center active:opacity-80"
      >
        {cargando
          ? <ActivityIndicator color="white" />
          : <Text className="text-white font-semibold">Registrarme</Text>}
      </Pressable>

      <Link href="/login" className="text-black/75 text-center mt-6">
        Ya tengo cuenta
      </Link>
    </View>
  )
}