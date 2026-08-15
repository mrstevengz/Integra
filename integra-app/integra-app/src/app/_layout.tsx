import "../../global.css";
import { useValue } from "@legendapp/state/react";
import { ErrorBoundaryProps, Stack } from "expo-router";
import { auth$ } from "@/state/auth";
import { ActivityIndicator, View, Text, Pressable } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";


export function ErrorBoundary({error, retry}: ErrorBoundaryProps) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="text-lg font-semibold mb-2">Algo salio mal</Text>
      <Text className="text-slate-500 text-center mb-6">{error.message}</Text>
      <Pressable onPress={retry} className="bg-black py-3 px-6 rounded-lg">
        <Text className="text-white">Reintentar</Text>
      </Pressable>
    </View>
  )
}

export default function RootLayout() {
  const cargando = useValue(auth$.cargando)
  const cerrandoSesion = useValue(auth$.cerrandoSesion)
  const sesion = useValue(auth$.session)

  if(cargando || cerrandoSesion) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large"/>
      </View>
    )
  }

  return (
    //Stack.Protected solo deja entrar si cumplen una condicion. Como puede ser nulo, !!es cuando hay sesion, !es cuando no hay (si hay sesion manda a la aplicacion, si no al login)

    //Stack.Screen abarca todas las pantallas en un grupo
    <SafeAreaProvider>
    <Stack screenOptions={{headerShown: false}}>
        <Stack.Protected guard={!!sesion}>
          <Stack.Screen name="(tabs)"/>
        </Stack.Protected>
    
        <Stack.Protected guard={!sesion}>
          <Stack.Screen name="(auth)"/>
        </Stack.Protected>
    
    
    
      </Stack>
    </SafeAreaProvider>
  );
}
