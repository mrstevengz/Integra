import { SafeAreaView } from "react-native-safe-area-context"
import { FlatList, View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native"
import TopBar from "@/components/TopBar"
import { useValue } from "@legendapp/state/react"
import { perfil$ } from "@/state/usuario"
import PerfilBox, { PerfilBoxText } from "@/features/perfil/PerfilBox"
import { condicion$ } from "@/state/condicion"
import { router } from "expo-router"
import { alergia$ } from "@/state/alergia"

export default function DiagnosticosScreen() {
    const perfil = useValue(perfil$)
    
    const condiciones = Object.values(useValue(condicion$) ?? {}).filter(
        (c) => c.perfil_id === perfil.id
    )

    const alergias = Object.values(useValue(alergia$) ?? {}).filter(
        (a) => a.perfil_id === perfil.id
    )

    if (!perfil.id || !condicion$ || !alergia$) return (
            <View className="flex-1">
                <SafeAreaView edges={['top']} className="bg-slate-100">
                    <TopBar name='Condiciones y alergias' canGoBack={true}/>
                </SafeAreaView>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#0F7C7C"/>
                </View>
            </View>
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
            link="/expediente/diagnosticos/agregar-condicion"
            >

            <View>
            {condiciones.map((condicion) => (
                <Pressable
                    onPress={() => router.navigate({
                        pathname: '/expediente/diagnosticos/[condicionId]',
                        params: {condicionId: condicion.id}
                    })}
                    className="group"
                    key={condicion.id}>
                    <PerfilBoxText titulo={condicion.nombre} data={condicion.tipo}/>
                </Pressable>
            ))}
            </View>

            </PerfilBox>

            <PerfilBox
            titulo="Alergias"
            linkName="+ Agregar"
            link="/expediente/diagnosticos/agregar-alergia"
            >

            <View>
            {alergias.map((alergia) => (
                <Pressable
                    onPress={() => router.navigate({
                        pathname: '/expediente/diagnosticos/[alergiaId]',
                        params: {alergiaId: alergia.id}
                    })}
                    className="group"
                    key={alergia.id}>
                    <PerfilBoxText titulo={alergia.nombre} data={alergia.severidad}/>
                </Pressable>
            ))}
            </View>


            </PerfilBox>
            </ScrollView>
        </View>
    )
}