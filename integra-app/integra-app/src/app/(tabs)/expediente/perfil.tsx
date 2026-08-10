import { View, ActivityIndicator, ScrollView, Pressable, Text} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context";
import TopBar from "@/features/topbar/TopBar";
import { useValue } from "@legendapp/state/react";
import { perfil$ } from "@/state/usuario";
import { useForm } from "react-hook-form";
import { PerfilForm, perfilSchema } from "@/features/perfil/perfil-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { OPCIONES_GENEROS, TIPOS_SANGRE } from "@/features/perfil/perfil-schema";
import { CampoTexto } from "@/features/auth/CampoTexto";
import { CampoSelect } from "@/features/perfil/CampoSelect";
import { router } from "expo-router";

export default function PerfilScreen() {
    const perfil = useValue(perfil$)

    const {control, handleSubmit, formState: {isDirty}, reset} = useForm<PerfilForm>({
        resolver: zodResolver(perfilSchema),
        mode: 'onTouched',
        defaultValues: {
            nombre: '', apellidos: '', genero: '', cedula: '', tipoSangre: '', telefono: '', medicoTratante: '',
        },
         values: perfil ? {
            nombre: perfil.nombre ?? '',
            apellidos: perfil.apellidos ?? '',
            telefono: perfil.telefono ?? '',
            cedula: perfil.cedula ?? '',
            genero: perfil.genero ?? '',
            tipoSangre: perfil.tipo_sangre ?? '',
            medicoTratante: perfil.medico_tratante ?? '',
        } : undefined,
    })

    function onSubmit(formValues: PerfilForm) {
        perfil$.assign({
            nombre: formValues.nombre,
            apellidos: formValues.apellidos,
            genero: formValues.genero || null,
            cedula: formValues.cedula || null,
            tipo_sangre: formValues.tipoSangre || null,
            telefono: formValues.telefono || null,
            medico_tratante: formValues.medicoTratante || null,
        })

        reset(formValues)
        router.back()
    }

    if (!perfil) return (
    <View className="flex-1">
        <SafeAreaView edges={['top']} className="bg-slate-100">
            <TopBar name='Mi Expediente' canGoBack={false}/>
        </SafeAreaView>
        <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#0F7C7C"/>
        </View>
    </View>
    )

    return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">
                <TopBar name='Datos personales' canGoBack={true}/>
            </SafeAreaView>

            <ScrollView contentContainerClassName="flex-1 px-6 py-6">
                <CampoTexto
                name="nombre" control = {control} title="Nombre"
                autoComplete="name"
                />

                <CampoTexto
                name="apellidos" control = {control} title="Apellidos" 
                autoComplete="family-name"
                />

                <CampoSelect name="genero" control={control} title="Genero" opciones={OPCIONES_GENEROS}/>

                <CampoTexto
                name="telefono" control = {control} title="Numero telefonico" 
                keyboardType="phone-pad"
                autoComplete="tel"
                />

                <CampoSelect name="tipoSangre" control={control} title="Tipo de sangre" opciones={TIPOS_SANGRE}/>

                <CampoTexto
                name="cedula" control = {control} title="Cedula de identidad" 
                />

                <CampoTexto
                name="medicoTratante" control = {control} title="Medico Tratante"
                />

                <Pressable
                onPress={handleSubmit(onSubmit)}
                disabled={!isDirty}
                className={`bg-black py-4 rounded-lg ${!isDirty && 'bg-black/40'}`}
                >
                    <Text className="text-white text-center">Guardar cambios</Text>
                </Pressable>


            </ScrollView>
        </View>
    )
}