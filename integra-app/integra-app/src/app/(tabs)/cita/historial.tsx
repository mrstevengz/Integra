import { Text, View, ScrollView, TouchableOpacity, Platform, Pressable } from "react-native";
import TopBar from "@/components/TopBar";
import { SafeAreaView } from "react-native-safe-area-context";
import TopBarSecondary from "@/components/TopBarSecondary";
import { GlassView } from "expo-glass-effect";
import { router } from "expo-router";
import { useValue } from "@legendapp/state/react";
import { cita$, citasPasadas } from "@/state/cita";
import { perfil$ } from "@/state/usuario";
import { formatearFecha, formatearHora } from "@/state/medicacion";

export default function HistorialCitaScreen() {

  const perfil = useValue(perfil$)
  const citas = useValue(cita$)

  const citasPasadasLista = citasPasadas(citas, new Date(), perfil.id)


  return (
    <View className="flex-1">
        <SafeAreaView edges={['top']} className="bg-slate-100">
            <TopBar name='Citas medicas' canGoBack={false}/>
        </SafeAreaView>

        <TopBarSecondary active="Historial" tab1="Proximas" tab2="Historial" route1="/cita" route2="/cita/historial"/>

        <ScrollView className="flex-1 bg-slate-100">
         {citasPasadasLista.map((c) => {
          const date = new Date(c.programada_para)

          
          return (
          <Pressable key={c.id} className="p-6 justify-between flex flex-row items-center border-b border-slate-400 bg-bg-color active:bg-neutral-200"
          onPress={() => router.navigate({
            pathname: '/cita/[citaId]',
            params: {citaId: c.id}
          })}>
              <View>
                  <Text className="text-xl font-semibold mb-2">{c.especialidad}</Text>
                  <Text className="text-md text-slate-500 mb-1">{c.medico}</Text>

                  <Text className="text-md">{formatearFecha(date, false)}, {formatearHora(date.toLocaleTimeString())}</Text>
              </View>
              
          </Pressable>
        )})}

          
        </ScrollView>

        <GlassView
        style={{
        position: 'absolute',
        bottom: 144, 
        right: 24,   
        height: 64,  
        width: 64,   
        borderRadius: 32, 
        overflow: 'hidden',
        }}
        glassEffectStyle="clear"
        tintColor="#000000E6"
        isInteractive
        >
            <TouchableOpacity
            onPress={() => router.navigate('/cita/agregar-cita')}
            accessibilityRole="button"
            className={`flex-1 justify-center items-center ${Platform.OS === "android" ? 'bg-txt-color' : ''}`}
            >
            <Text className="text-white text-center items-center text-4xl">+</Text>
            </TouchableOpacity>
        </GlassView>
    </View>
  );
}
