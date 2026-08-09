import { auth$, cerrarSesion } from "@/state/auth";
import { perfil$ } from "@/state/usuario";
import { useValue } from "@legendapp/state/react";
import { Text, View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import TopBar from "@/features/topbar/TopBar";
import { SafeAreaView } from "react-native-safe-area-context";
import PerfilSummary from "@/features/perfil/PerfilSummary";


export default function ExpedienteScreen() {
    //Obtener datos de sesion y perfil
    const session = useValue(auth$.session)
    const perfil = useValue(perfil$)
    
    if(!perfil) {
      return (
        <View className="flex-1">
                <SafeAreaView edges={['top']} className="bg-white">
                    <TopBar name='Mi Expediente' canGoBack={false}/>
                </SafeAreaView>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#0F7C7C"/>
                </View>
            </View>
      )
    }

    const nombreCompleto = `${perfil.nombre ?? ''} ${perfil.apellidos ?? ''}`.trim()
    const usersYear = perfil?.fecha_nacimiento.slice(0,10)
    const cleanDate = usersYear.toString().replaceAll("-", "")

    const todaysDate = new Date().toISOString().slice(0,10).replaceAll("-", "")

    const age = (parseInt(todaysDate) - parseInt(cleanDate))

    const usersAge = age.toString().slice(0,2)


  return (
    <View className="flex-1">
        <SafeAreaView edges={['top']} className="bg-white">
            <TopBar name='Mi Expediente' canGoBack={false}/>
        </SafeAreaView>
        <ScrollView className="flex-1 bg-white">
         <PerfilSummary nombre={nombreCompleto} edad={usersAge} genero={perfil.genero} cedula={perfil.cedula}/>
            
            
            <Pressable onPress={cerrarSesion} className="border border-red-300 rounded-lg py-3 items-center">
              <Text>Cerrar sesion</Text>
            </Pressable>
        </ScrollView>
    </View>
  );
}
