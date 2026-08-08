import { supabase } from "@/lib/supabase"
import { Link, router } from "expo-router"
import { useState } from "react"
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native"

export default function LoginScreen() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState<string | null>(null)


    async function iniciarSesion() {
        const {error} = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
    })

    if(error) setError(error.message)
        setCargando(false)
    }
   

    return (
        <View className="flex-1 justify-center px-6">

            <View className="flex justify-center items-center">
                <Text className="text-4xl font-bold mb-2">Bienvenido a Integra</Text>
                <Text className="text-slate-500 mb-8">Tu expediente medico siempre contigo</Text>
            </View>
            

            <View>
                <Text>Correo electronico</Text>
                <TextInput 
                className="border border-slate-300 rounded-lg px-4 py-3 mb-3 text-slate-900"
                placeholder="correo@ejemplo.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                />

                <Text>Correo electronico</Text>
                <TextInput 
                className="border border-slate-300 rounded-lg px-4 py-3 mb-3 text-slate-900"
                placeholder="************"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="current-password"
                />

                {error && <Text>{error}</Text>}
            </View>

            <Pressable
                onPress={iniciarSesion}
                disabled={cargando}
                className="bg-black rounded-lg py-4 items-center active:opacity-80"
            >
                {cargando ? <ActivityIndicator color="white"/> : <Text className="text-white font-semibold">Iniciar sesion</Text>}
            </Pressable>

            <Text className="text-center my-5">o</Text>

            <Pressable 
                onPress={() => router.push("/registro")}
                className="bg-transparent border-2 border-black py-4 items-center rounded-lg">
                <Text>Crear cuenta nueva</Text>
            </Pressable>

            <Text className="mt-8 text-black/40">Al continuar aceptas los Terminos de Uso y la Politica de Privacidad</Text>
            
        </View>
    )
}