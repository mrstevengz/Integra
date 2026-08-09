import "../../global.css";
import { useValue } from "@legendapp/state/react";
import { Stack } from "expo-router";
import { auth$ } from "@/state/auth";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const cargando = useValue(auth$.cargando)
  const sesion = useValue(auth$.session)

  if(cargando) {
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
          <Stack.Screen name="(articulos)"/>
        </Stack.Protected>
    
        <Stack.Protected guard={!sesion}>
          <Stack.Screen name="(auth)"/>
        </Stack.Protected>
    
    
    
      </Stack>
    </SafeAreaProvider>
  );
}
