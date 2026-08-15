import { CampoTexto } from "@/components/CampoTexto"
import { CondicionesForm, condicionesSchema, TIPO_CONDICION } from "@/features/condicion/condiciones-schema"
import { CampoSelect } from "@/components/CampoSelect"
import TopBar from "@/components/TopBar"
import { condicion$ } from "@/state/condicion"
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

export default function AgregarCondicionScreen() {
    const perfil = useValue(perfil$)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {control, handleSubmit, reset} = useForm<CondicionesForm>({
        resolver: zodResolver(condicionesSchema),
        defaultValues: {
            nombre: '',
            tipo: '',
            detalles: ''
        }
    })

    function generateUUID(): string {
        return Crypto.randomUUID()
    }

    

    function onSubmit(formValues: CondicionesForm) {
        if (isSubmitting) return 
        setIsSubmitting(true)
        
        try {
            const id = generateUUID()
            condicion$[id].set({
            id,
            perfil_id: perfil.id,
            nombre: formValues.nombre,
            tipo: formValues.tipo,
            detalles: formValues.detalles
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
                <TopBar name='Agregar condicion' canGoBack={true}/>
            </SafeAreaView>
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#0F7C7C"/>
            </View>
        </View>
    )

    return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">
                <TopBar name='Agregar condicion' canGoBack={true}/>
            </SafeAreaView>

            <ScrollView contentContainerClassName="flex-1 px-6 py-6">
                <CampoTexto name="nombre" control={control} title="Nombre de la condicion"/>

                <CampoSelect name="tipo" control={control} title="Tipo de condicion" opciones={TIPO_CONDICION}/>

                <CampoTexto name="detalles" control={control} title="Detalles de la condicion (opcional)"/>

                <Pressable onPress={handleSubmit(onSubmit)} disabled={isSubmitting}
                className="bg-black py-4 rounded-lg">
                    <Text className="text-white text-center">
                        {isSubmitting? "Guardando..." : "Guardar condicion"}
                    </Text>
                </Pressable>
            </ScrollView>
        </View>
    )
}