import { SafeAreaView } from "react-native-safe-area-context"
import { FlatList, View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native"
import TopBar from "@/features/topbar/TopBar"
import { useValue } from "@legendapp/state/react"
import { perfil$ } from "@/state/usuario"
import PerfilBox, { PerfilBoxText } from "@/features/perfil/PerfilBox"
import { condicion$ } from "@/state/condicion"
import { router } from "expo-router"

export default function CondicionesScreen() {
    const perfil = useValue(perfil$)
    
    const condiciones = Object.values(useValue(condicion$)).filter(
        (c) => c.perfil_id === perfil.id
    )
    
    return (
         <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">
                <TopBar name='Condiciones y alergias' canGoBack={true}/>
            </SafeAreaView>

            <ScrollView>
            <PerfilBox
            titulo="Condiciones / Diagnosticos"
            linkName="+ Agregar"
            link="/expediente/condiciones/agregar"
            >

            <View>
            {condiciones.map((condicion) => (
                <Pressable
                    onPress={() => router.navigate({
                        pathname: '/expediente/condiciones/[itemId]',
                        params: {itemId: condicion.id}
                    })}
                    className="group">
                    <PerfilBoxText key = {condicion.id} titulo={condicion.nombre} data={condicion.tipo}/>
                </Pressable>
            ))}
            </View>

            </PerfilBox>
            </ScrollView>
        </View>
    )
}