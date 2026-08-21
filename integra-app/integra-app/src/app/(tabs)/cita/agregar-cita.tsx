import { CampoTexto } from "@/components/CampoTexto"
import { CampoSelect } from "@/components/CampoSelect"
import TopBar from "@/components/TopBar"
import { perfil$ } from "@/state/usuario"
import { zodResolver } from "@hookform/resolvers/zod"
import { useValue } from "@legendapp/state/react"
import { router } from "expo-router"
import { useForm } from "react-hook-form"
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text } from "react-native"
import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useState } from "react"
import { CitaForm, citasSchema, TIPO_CITA } from "@/features/citas/citas-schema"
import { citas$, type TipoCita } from "@/state/citas";
import { CampoFecha } from "@/components/CampoFecha"
import { crearId } from "@/lib/ids"
import { color } from "@/theme/colors"
import { combinarFechaHora } from "@/lib/fechas"

export default function AgregarCitaScreen() {
    const perfil = useValue(perfil$)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const hoy = new Date()

    const {control, handleSubmit, reset} = useForm<CitaForm>({
        resolver: zodResolver(citasSchema),
        defaultValues: {
            tipoCita: 'control',
            especialidad: '',
            medico: '',
            institucion: '',
            fecha: hoy,
            hora: hoy,
            notas: ''
        }
    })



    function onSubmit(formValues: CitaForm) {
        if (isSubmitting) return 
        setIsSubmitting(true)
        
        try {
            const programadaPara = combinarFechaHora(formValues.fecha, formValues.hora)
            const id = crearId()

            citas$[id].set({
            id,
            perfil_id: perfil.id,
            tipo_citas: formValues.tipoCita as TipoCita,
            especialidad: formValues.especialidad,
            medico: formValues.medico,
            institucion: formValues.institucion,
            programada_para: programadaPara,
            notas: formValues.notas
        })
        reset(formValues)
        router.back()
        } catch (error) {
            console.error('No se pudo guardar la condicion', error)
        } finally {
            setIsSubmitting(false)
        }
       
    }

     if (!perfil.id) return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">
                <TopBar name='Agregar cita' canGoBack={true}/>
            </SafeAreaView>
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color={color.primary}/>
            </View>
        </View>
    )

    return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">
                <TopBar name='Nueva cita' canGoBack={true}/>
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
                        <CampoFecha name ="fecha" control={control} title="Fecha" placeholder="0" mode="date"/>
                    </View>

                    <View className="flex-1">
                        <CampoFecha name ="hora" control={control} title="Hora" placeholder="0" mode="time"/>
                    </View>
                </View>

                

                <CampoTexto name="notas" control={control} title="Notas / Instrucciones previas" opcional={true} placeholder="Ej. Acudir en ayunas"/>

                <Pressable onPress={handleSubmit(onSubmit)} disabled={isSubmitting}
                className="bg-black py-4 rounded-lg active:bg-black/50">
                    <Text className="text-white text-center">
                        {isSubmitting? "Guardando..." : "Guardar condicion"}
                    </Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
        </View>
    )
}

