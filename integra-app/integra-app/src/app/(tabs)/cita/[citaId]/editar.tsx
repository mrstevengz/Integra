import { CitaForm, citasSchema, TIPO_CITA } from "@/features/citas/citas-schema"
import { cita$ } from "@/state/cita"
import { porId } from "@/state/helpers"
import { perfil$ } from "@/state/usuario"
import { zodResolver } from "@hookform/resolvers/zod"
import { useValue } from "@legendapp/state/react"
import { router, useLocalSearchParams } from "expo-router"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { View, Text, KeyboardAvoidingView, Platform, Pressable, ScrollView } from "react-native"
import { combinarFechaHora } from "../agregar-cita"
import { SafeAreaView } from "react-native-safe-area-context"
import { CampoFecha } from "@/components/CampoFecha"
import { CampoSelect } from "@/components/CampoSelect"
import { CampoTexto } from "@/components/CampoTexto"
import TopBar from "@/components/TopBar"

export default function EditarCita() {
    const {citaId} = useLocalSearchParams()
    const perfil = useValue(perfil$)
    const citas = useValue(cita$)
    
    const citaAEditar = porId(citas, citaId as string)

    const date = new Date(citaAEditar.programada_para)

    const horas = date.getTime()

    const [isSubmitting, setIsSubmitting] = useState(false)

    const {control, handleSubmit, reset,} = useForm<CitaForm>({
    
            resolver: zodResolver(citasSchema),
            mode: 'onTouched',
            defaultValues: {
                tipoCita: '',
                especialidad: '',
                medico: '',
                institucion: '',
                fecha: date,
                hora: date,
                notas: '',

            },
    
            values: citaAEditar ? {
            tipoCita: citaAEditar.tipo_citas,
            especialidad: citaAEditar.especialidad,
            medico: citaAEditar.medico,
            institucion: citaAEditar.institucion,
            fecha: date,
            hora: date,
            notas: citaAEditar.notas
            }: undefined
        })
    
    
        function onSubmit(formValues: CitaForm) {
        if (isSubmitting) return 
        setIsSubmitting(true)
        
        try {
            const id = citaId as string
            const programadaPara = combinarFechaHora(formValues.fecha, formValues.hora)

            cita$[id].set({
            id,
            perfil_id: perfil.id,
            tipo_citas: formValues.tipoCita,
            especialidad: formValues.especialidad,
            medico: formValues.medico,
            institucion: formValues.institucion,
            programada_para: programadaPara,
            notas: formValues.notas,
        })
        reset(formValues)
        router.back()
        } catch (error) {
            console.error('No se pudo guardar la condicion', error)
        } finally {
            setIsSubmitting(false)
        }
    }

        function onCancel(formValues: CitaForm) {
        if (isSubmitting) return 
        setIsSubmitting(true)
        
        try {
            const id = citaId as string
            cita$[id].assign!({
            cancelada: true,
            nota_cancelacion: formValues.notaCancelacion
        })
        reset(formValues)
        router.back()
        } catch (error) {
            console.error('No se pudo guardar la condicion', error)
        } finally {
            setIsSubmitting(false)
        }
    }
    
        if (!citaAEditar) {
            return (
                <View className="flex-1 justify-center items-center px-6">
                    <Text className="text-gray-400">Error</Text>
                </View>
            )
        }

    return (
                <View className="flex-1">
                    <SafeAreaView edges={['top']} className="bg-slate-100">
                        <TopBar name='Editar / Cancelar cita' canGoBack={true}/>
                    </SafeAreaView>
        
                    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
                        <ScrollView
                        className="flex-grow bg-white"
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingHorizontal: 20,
                            paddingTop: 20,
                            paddingBottom: 120
                        }}
                        keyboardShouldPersistTaps="handled"
                    >
        
                        <CampoSelect name="tipoCita" control={control} title="Tipo de cita" opciones={TIPO_CITA}/>
        
                        <CampoTexto name="especialidad" control={control} title="Especialidad / Servicio" placeholder="Endocrinologia"/>
        
                        <CampoTexto name="medico" control={control} title="Médico" placeholder="Dra. Ramírez" />
        
                        <CampoTexto name="institucion" control={control} title="Institucion / Clinica" placeholder="CS-74"/>
        
                        <View className="flex flex-row gap-3">
                            <View className="flex-1">
                                <CampoFecha name ="fecha" control={control} title="Nueva Fecha" placeholder="0" mode="date"/>
                            </View>
        
                            <View className="flex-1">
                                <CampoFecha name ="hora" control={control} title="Nueva Hora" placeholder="0" mode="time"/>
                            </View>
                        </View>
        
                        
        
                        <CampoTexto name="notas" control={control} title="Notas / Instrucciones previas" opcional={true} placeholder="Ej. Acudir en ayunas"/>
        
                        <Pressable onPress={handleSubmit(onSubmit)} disabled={isSubmitting}
                        className="bg-black py-4 rounded-lg active:bg-black/50">
                            <Text className="text-white text-center">
                                {isSubmitting? "Guardando..." : "Guardar cambios"}
                            </Text>
                        </Pressable>

                        <View className="flex-col gap-3 mt-4 border rounded-3xl p-4">
                            <Text className="text-lg font-bold">
                                Cancelar esta cita
                            </Text>
                            <Text className="text-neutral-500">
                                La cita quedara marcada como cancelada. No se elimina del historial.
                            </Text>

                            <CampoTexto name="notaCancelacion" control={control} title="Motivo de cancelacion" opcional={true} placeholder="Ej. Me reprogramaron"/>

                            <Pressable onPress={
                                handleSubmit(onCancel)
                            } disabled={isSubmitting}
                            className="border py-4 rounded-lg active:bg-black/50">
                            <Text className="text-txt-color text-center text-lg">
                                {isSubmitting? "Cancelando..." : "Cancelar cita"}
                            </Text>
                        </Pressable>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>
                </View>
            )
}
