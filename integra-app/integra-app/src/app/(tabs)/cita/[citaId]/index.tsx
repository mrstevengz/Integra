import TopBar from "@/components/TopBar";
import { cita$ } from "@/state/cita";
import { porId } from "@/state/helpers";
import { formatearFecha, formatearHora } from "@/state/medicacion";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useValue } from "@legendapp/state/react";
import { router, useLocalSearchParams } from "expo-router";
import { View, KeyboardAvoidingView, Platform, ScrollView, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DetalleCita() {
    const {citaId} = useLocalSearchParams()
    const citas = useValue(cita$)

    const citaAEditar = porId(citas, citaId as string)

    const date = new Date(citaAEditar.programada_para)
    return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">
                <TopBar name='Detalle de la cita' canGoBack={true}/>
            </SafeAreaView>
        
            <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
                <ScrollView
                className="flex-grow bg-bg-color"
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingTop: 40,
                    paddingBottom: 120
                }}
                keyboardShouldPersistTaps="handled"
                >

                    <View className="flex-col flex px-6 border-b border-neutral-400 pb-8">
                        <View className="flex-row gap-6 items-center mb-8 flex-2">
                            <View className="p-5 bg-neutral-200 border border-neutral-400 rounded-xl">
                                <Ionicons name="calendar-clear-outline" size={25}/>
                            </View>

                            <View className="flex-1 items-start">
                                <Text className="text-3xl font-bold">{citaAEditar.especialidad}</Text>
                                <Text className="text-lg my-2 text-neutral-600">{citaAEditar.medico}</Text>
                                {/* //TODO: Implementar mapeador para convertir texto de citas a texto de label */}
                                <Text className="rounded-lg border border-neutral-400 px-3 py">{citaAEditar.tipo_citas}</Text>
                            </View>
                        </View>

                        <View className="flex-row gap-4">
                            <View className="flex-1 flex-row gap-2 rounded-xl bg-neutral-color border border-neutral-400 p-6 items-center overflow-auto w-0 ">
                                <Ionicons name="calendar-outline"/>
                                <Text>{formatearFecha(date, true, true)}</Text>
                            </View>
                            <View className="flex-1 w-0 flex-row gap-2 rounded-xl bg-neutral-color border border-neutral-400 p-6 items-center overflow-hidden">
                                <Ionicons name="time-outline"/>
                                <Text>{formatearHora(date.toLocaleTimeString())}</Text>
                            </View>
                        </View>
                    </View>

                    <View className="flex-col">
                        <View className="gap-2 border-b border-neutral-400 px-6 py-4">
                            <Text className="text-neutral-600">
                                Institucion
                            </Text>

                            <Text className="text-lg">
                                {citaAEditar.institucion}
                            </Text>
                        </View>

                        <View className="gap-2 border-b border-neutral-400 px-6 py-4">
                            <Text className="text-neutral-600">
                                Notas
                            </Text>

                            <Text className="text-lg">
                                {citaAEditar.notas === "" || null ? 'Sin notas': citaAEditar.notas}
                            </Text>
                        </View>
                    </View>

                    <View className="px-6 py-4 gap-4">
                    <Pressable
                        className="bg-black py-4 rounded-xl active:bg-neutral-800/80">
                        <Text className="text-white text-center font-bold text-lg">
                            Registrar resultado
                        </Text>
                    </Pressable>

                    <Pressable
                        className="bg-transparent py-4 rounded-xl border-txt-color border-2 active:bg-neutral-800/10"
                        onPress={() => router.navigate({
                        pathname: '/cita/[citaId]/editar',
                        params: {citaId: citaAEditar.id}})
                        }
                        >
                        <Text className="text-txt-color text-center font-semibold text-lg">
                            Editar cita
                        </Text>
                    </Pressable>

                    </View>
                
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    )
}