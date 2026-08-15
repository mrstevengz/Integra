import TopBar from "@/components/TopBar";
import { alergia$ } from "@/state/alergia";
import { condicion$ } from "@/state/condicion";
import { contactoEmergencia$ } from "@/state/contactosemergencia";
import { Checklist, expedienteChecklist$ } from "@/state/expedienteChecklist";
import { perfil$ } from "@/state/usuario";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useValue } from "@legendapp/state/react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CompletarPerfil() {

    const perfil = useValue(perfil$)
    const condiciones = Object.values(useValue(condicion$) ?? {}).filter(c => c.perfil_id === perfil.id)
    const alergias = Object.values(useValue(alergia$) ?? {}).filter(a => a.perfil_id === perfil.id)
    const contactos = Object.values(useValue(contactoEmergencia$) ?? {}).filter(c => c.perfil_id === perfil.id)

        const secciones: Checklist[] = [
        { id: 'datosPersonales',    label: 'Datos personales',       incompleta: perfil.genero == null || perfil.cedula == null },
        { id: 'tipoSangre',         label: 'Tipo de sangre',         incompleta: perfil.tipo_sangre == null },
        { id: 'condiciones',        label: 'Condiciones médicas',    incompleta: condiciones.length === 0 },
        { id: 'alergias',           label: 'Alergias',                incompleta: alergias.length === 0 },
        { id: 'contactoEmergencia', label: 'Contacto de emergencia', incompleta: contactos.length === 0 },
    ]


    const confirmadas = useValue(expedienteChecklist$)

    const seccionesLista = secciones.map(seccion => ({
        ...seccion,
        completada: seccion.incompleta === false || confirmadas[seccion.id] === true,
    }))

    const completas = seccionesLista.filter(seccion => seccion.completada)

    const checkSeccion = (id: string) => {
        expedienteChecklist$[id].set(true)
    }

    return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">
                <TopBar name='Completar expediente' canGoBack={true}/>
            </SafeAreaView>

            <ScrollView className="flex-grow bg-slate-100" contentContainerStyle={{paddingBottom: 100, paddingHorizontal: 20, paddingTop: 20 }}>

                <View className="flex flex-col bg-bg-color items-center justify-center p-8 rounded-lg shadow-sm gap-4">
                    <Text className="text-[45px] font-bold">{((completas.length / seccionesLista.length) * 100)}%</Text>
                    <Text>Expediente completado</Text>

                    <View className="h-4 w-full overflow-hidden bg-neutral-color rounded-3xl">
                    <View className="h-full bg-sec-color border-r-8 rounded-lg" style={{
                    width:  `${(completas.length/seccionesLista.length)* 100}%`
                    }}/>
                    </View>
                </View>

                 <View className="flex flex-col mt-5">
                    <Text className="font-semibold mb-6 text-xl">Secciones pendientes</Text>

                    {seccionesLista.map(seccion => {
                        const completada = seccion.completada
                        return (
                            <View key={seccion.id} className="flex flex-row items-center gap-4 py-4 border-b border-neutral-400">
                                <Pressable
                                disabled={completada}
                                className={`${completada ? 'bg-btn-color' : 'border border-btn-color'} w-8 h-8 rounded-full items-center justify-center`}
                                onPress={() => checkSeccion(seccion.id)}>
                                    {completada && (
                                        <Ionicons name="checkmark" size={25} color={"#ffffff"}/>
                                    )}
                                </Pressable>

                                <Text className={`${completada && 'line-through text-black/40'} text-lg`}>{seccion.label}</Text>
                            </View>
                        )
                    })}

                </View>

                

            </ScrollView>
        </View>
    )
}