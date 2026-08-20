import ContactoEmergencia from "@/features/perfil/ContactoEmergencia";
import TopBar from "@/components/TopBar";
import { contactoEmergencia$ } from "@/state/contactosemergencia";
import { useValue } from "@legendapp/state/react";
import { router } from "expo-router";
import { View, ScrollView, Pressable, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { perfil$ } from "@/state/usuario";

export default function ContactosEmergenciaScreen() {

    const perfil = useValue(perfil$)
    const contactos = Object.values(useValue(contactoEmergencia$) ?? {}).filter(
        (ce) => ce.perfil_id === perfil.id && ce.deleted !== true
    )

    if(!perfil.id || !contactoEmergencia$) {
          return (
            <View className="flex-1">
                    <SafeAreaView edges={['top']} className="bg-slate-100">
                        <TopBar name='Mi Expediente' canGoBack={false}/>
                    </SafeAreaView>
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#0F7C7C"/>
                    </View> 
                </View>
          )
    }
    
    return (
        <View className="flex-1">
                <SafeAreaView edges={['top']} className="bg-slate-100">
                    <TopBar name='Contactos de Emergencia' canGoBack={true}/>
                </SafeAreaView>
                <ScrollView className="flex-1 bg-slate-100">
                    <View className="flex justify-center p-6 ">
                        <Text className="text-slate-500/60">Estos contactos seran mostrados en tu QR de emergencia para ser contactados por personal medico</Text>
                    </View>

                    <Pressable>
                         {contactos.map((contacto) => (
                            <ContactoEmergencia key={contacto.id} nombre={contacto.nombre} relacion={contacto.relacion} telefono = {contacto.telefono} 
                            onPress={() => router.navigate({
                            pathname: '/expediente/contactos-emergencia/[contactoId]',
                            params: {contactoId: contacto.id}
                            })}/>
                        ))}
                    </Pressable>

                    <Pressable className="p-4 py-6 flex justify-center items-center border m-6 rounded-xl active:bg-slate-200/70" onPress={() => router.navigate('/expediente/contactos-emergencia/agregar-contacto')}>
                        <Text className="text-md">+ Agregar contacto</Text>
                    </Pressable>
                </ScrollView>
        </View>
    )
}