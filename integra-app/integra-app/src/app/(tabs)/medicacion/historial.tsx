import MedicinasLista from "@/features/medicacion/MedicinasLista";
import TopBarSecondary from "@/components/TopBarSecondary";
import TopBar from "@/components/TopBar";
import { medicamento$, medicamentosActivos } from "@/state/medicacion";
import { perfil$ } from "@/state/usuario";
import { useValue } from "@legendapp/state/react";
import { ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistorialMedicamentos() {
        const perfil = useValue(perfil$)
    
        const medicamentos = useValue(medicamento$)
    
        const lista = medicamentosActivos(medicamentos, perfil?.id)
    
    return (
        <View className="flex-1">
        <SafeAreaView edges={['top']} className="bg-slate-100">
            <TopBar
                name="Medicación"
                canGoBack={false}
                grande
                subtitulo={`${new Date().toLocaleDateString('es-CR', {weekday: 'long'})}, ${new Date().getDate()} de ${new Date().toLocaleString('es-ES', {month: 'long'})}`}
            />
        </SafeAreaView>
        
        <TopBarSecondary active="Medicamentos" tab1="Tomas" tab2="Medicamentos" route1="/medicacion" route2="/medicacion/historial"/>

        <ScrollView
        className="flex-grow bg-neutral-50"
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 80 }}>

            <Text className="text-2xl font-bold text-neutral-900 tracking-tight mb-4 px-6">Mis medicamentos</Text>
            
            {lista.length === 0 && (
            <View className="mx-6 mb-6 rounded-2xl border border-dashed border-neutral-200 bg-white px-5 py-8 items-center">
                <Text className="text-neutral-500 text-sm text-center">
                    Todavia no has agregado medicamentos.
                </Text>
            </View>
            )}
            
            {lista.map((item) => (
            <MedicinasLista key = {item.id} {...item}/>
            ))}
        </ScrollView>
        </View>
    )
}