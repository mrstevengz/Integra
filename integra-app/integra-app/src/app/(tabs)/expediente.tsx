import { auth$, cerrarSesion } from "@/state/auth";
import { perfil$ } from "@/state/usuario";
import { useValue } from "@legendapp/state/react";
import { Text, View, ScrollView, Pressable } from "react-native";
import TopBar from "@/features/topbar/TopBar";
import { SafeAreaView } from "react-native-safe-area-context";


export default function ExpedienteScreen() {
    //Obtener datos de sesion y perfil
    const session = useValue(auth$.session)
    const perfil = useValue(perfil$)

    // console.log(perfil)

    // //Calcular la edad del usuario
    // const usersYear = perfil.fecha_nacimiento.slice(0,4)
    // const age = new Date().getFullYear() - usersYear


  return (
    <View className="flex-1">
        <SafeAreaView edges={['top']} className="bg-white">
            <TopBar name='Expediente' canGoBack={false}/>
        </SafeAreaView>
        <ScrollView className="flex-1 bg-white">
          <View className="flex-1 justify-center items-center">
            <View className="flex">
              {/* <Text className="text-2xl font-bold text-slate-900">{`${perfil.nombre} ${perfil.apellidos}`}</Text>
              <Text className="text-md"> años {perfil.genero && `${perfil.genero}`}</Text> */}
            </View>

            <Text className="text-2xl font-bold text-slate-900">{session?.user.email}</Text>

            <Pressable onPress={cerrarSesion} className="border border-red-300 rounded-lg py-3 items-center">
              <Text>Cerrar sesion</Text>
            </Pressable>
          </View>
        </ScrollView>
    </View>
  );
}
