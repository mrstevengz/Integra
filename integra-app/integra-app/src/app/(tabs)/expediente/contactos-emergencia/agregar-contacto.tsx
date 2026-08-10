import { CampoTexto } from "@/features/auth/CampoTexto"
import { CampoSelect } from "@/features/perfil/CampoSelect"
import TopBar from "@/features/topbar/TopBar"
import { perfil$ } from "@/state/usuario"
import { zodResolver } from "@hookform/resolvers/zod"
import { useValue } from "@legendapp/state/react"
import { router } from "expo-router"
import { useForm } from "react-hook-form"
import { ActivityIndicator, Pressable, ScrollView, Text } from "react-native"
import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import * as Crypto from 'expo-crypto';
import { useState } from "react"
import { EmergenciaForm, emergenciaSchema, TIPO_RELACION } from "@/features/perfil/emergencia-schema"
import { contactoEmergencia$ } from "@/state/contactosemergencia"

export default function AgregarAlergiaScreen() {
    const perfil = useValue(perfil$)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {control, handleSubmit, reset} = useForm<EmergenciaForm>({
        resolver: zodResolver(emergenciaSchema),
        defaultValues: {
            nombre: '',
            telefono: '',
            relacion: ''
        }
    })

    function generateUUID(): string {
        return Crypto.randomUUID()
    }

    

    function onSubmit(formValues: EmergenciaForm) {
        if (isSubmitting) return setIsSubmitting(true)
        
        try {
            const id = generateUUID()
            contactoEmergencia$[id].set({
            id,
            perfil_id: perfil.id,
            nombre: formValues.nombre,
            telefono: formValues.telefono,
            relacion: formValues.relacion
        })
        reset(formValues)
        router.back()
        } catch (error) {
            console.error('No se pudo guardar el contacto', error)
        } finally {
            setIsSubmitting(false)
        }
       
    }

     if (!perfil.id || !contactoEmergencia$) return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">
                <TopBar name='Agregar contacto de emergencia' canGoBack={true}/>
            </SafeAreaView>
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#0F7C7C"/>
            </View>
        </View>
    )

    return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">
                <TopBar name='Agregar contacto' canGoBack={true}/>
            </SafeAreaView>

            <ScrollView contentContainerClassName="flex-1 px-6 py-6">
                <CampoTexto name="nombre" control={control} title="Nombre"/>

                <CampoTexto name="telefono" control={control} title="Numero telefonico" keyboardType="phone-pad"/>

                <CampoSelect name="relacion" control={control} title="Tipo de relacion" opciones={TIPO_RELACION}/>

                <Pressable onPress={handleSubmit(onSubmit)} disabled={isSubmitting}
                className="bg-black py-4 rounded-lg">
                    <Text className="text-white text-center">
                        {isSubmitting? "Guardando..." : "Guardar alergia"}
                    </Text>
                </Pressable>
            </ScrollView>
        </View>
    )
}