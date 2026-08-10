import { CampoTexto } from "@/features/auth/CampoTexto"
import { AlergiasForm, alergiasSchema, SEVERIDAD_ALERGIA } from "@/features/condicion/condiciones-schema"
import { CampoSelect } from "@/features/perfil/CampoSelect"
import TopBar from "@/features/topbar/TopBar"
import { alergia$ } from "@/state/alergia"
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

export default function AgregarAlergiaScreen() {
    const perfil = useValue(perfil$)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {control, handleSubmit, reset} = useForm<AlergiasForm>({
        resolver: zodResolver(alergiasSchema),
        defaultValues: {
            nombre: '',
            severidad: '',
            detalles: ''
        }
    })

    function generateUUID(): string {
        return Crypto.randomUUID()
    }

    

    function onSubmit(formValues: AlergiasForm) {
        if (isSubmitting) return setIsSubmitting(true)
        
        try {
            const id = generateUUID()
            alergia$[id].set({
            id,
            perfil_id: perfil.id,
            nombre: formValues.nombre,
            severidad: formValues.severidad,
            detalles: formValues.detalles
        })
        reset(formValues)
        router.back()
        } catch (error) {
            console.error('No se pudo guardar la alergia', error)
        } finally {
            setIsSubmitting(false)
        }
       
    }

     if (!perfil.id) return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">
                <TopBar name='Agregar alergia' canGoBack={true}/>
            </SafeAreaView>
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#0F7C7C"/>
            </View>
        </View>
    )

    return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">
                <TopBar name='Agregar alergia' canGoBack={true}/>
            </SafeAreaView>

            <ScrollView contentContainerClassName="flex-1 px-6 py-6">
                <CampoTexto name="nombre" control={control} title="Nombre de la alergia"/>

                <CampoSelect name="severidad" control={control} title="Severidad de la alergia" opciones={SEVERIDAD_ALERGIA}/>

                <CampoTexto name="detalles" control={control} title="Detalles de la alergia (opcional)"/>

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