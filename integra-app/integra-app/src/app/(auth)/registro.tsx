import { useState } from 'react'
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView } from 'react-native'
import { Link } from 'expo-router'
import { supabase } from '@/lib/supabase'
import {zodResolver} from '@hookform/resolvers/zod'
import {FormProvider, useForm} from 'react-hook-form'
import { CampoFecha } from '@/features/auth/CampoFecha'
import { RegistroForm, registroSchema } from '@/features/auth/registro-schema'
import { PASOS } from '@/features/auth/pasos'
import { CampoTexto } from '@/features/auth/CampoTexto'
import TopBar from '@/features/topbar/TopBar'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function RegistroScreen() {
    const [paso, setPaso] = useState(0)
    const [errorServer, setErrorServer] = useState<string | null>(null)
    const [aviso, setAviso] = useState<string | null>(null)

  const {control, handleSubmit, trigger, formState: {isLoading}} = useForm<RegistroForm>({
    resolver: zodResolver(registroSchema),
    defaultValues: {
        nombre: '', apellidos: '', email: '', password: '', confirmar: '', telefono: '', cedula: ''
    }
  })

  //Trigger: funcion de react-hook-form que determina si los campos son validos, handleSubmit manda el form al API, formState es un objeto que da diferentes estados del form

  //Variables para manejar los cambios de pagina
  const actual = PASOS[paso]
  const esUltimo = paso === PASOS.length - 1

  async function onSubmit(formValues: RegistroForm) {
    setErrorServer(null)
    setAviso(null)

    const {data, error} = await supabase.auth.signUp({
        email: formValues.email.trim().toLowerCase(),
        password: formValues.password,
        options: {
            data: {
                nombre: formValues.nombre,
                apellidos: formValues.apellidos,
                fecha_nacimiento: formValues.fechaNacimiento.toISOString().slice(0, 10),
                telefono: formValues.telefono,
                cedula: formValues.cedula
            }
        }
    })

    if(error) setErrorServer(error.message)
    else if (!data.session) setAviso('Cuenta creada, revisa tu correo para confirmarla')

  }

  async function continuar() {
    const valido = await trigger(actual.campos)
    if (!valido) return

    if (esUltimo) await handleSubmit(onSubmit)()
    else setPaso((p) => ( p + 1))
  }

  function regresar() {
    if (paso === 0) return
    else setPaso((p) => (p - 1))
  }

  return (
    <SafeAreaView className='flex-1 bg-white'>
        <TopBar name='Crear cuenta' canGoBack={true}/>

        <ScrollView contentContainerClassName="flex-1 justify-center px-6">

            <View className="flex-row gap-2 mb-8">
                    {PASOS.map((_, i) => (
                        <View
                            key={i}
                            className={`h-1 flex-1 rounded-full ${
                                i <= paso ? 'bg-teal-700' : 'bg-slate-200'
                            }`}
                        />
                    ))}
            </View>

            <View>
                <Text className='text-4xl font-bold mb-2'>{actual.titulo}</Text>
                <Text className='text-slate-500 mb-8'>{actual.subtitulo}</Text>
            </View>

            <View className=''>
                {paso === 0 && (
            <>
                <CampoTexto name='nombre' control={control} title='Nombre' placeholder='Nombre' autoComplete='name'/>
                <CampoTexto name='apellidos' control={control} title='Apellidos' placeholder='Apellidos' autoComplete='family-name'/>
                <CampoTexto name='email' control={control} title='Correo electronico' placeholder='correo@ejemplo.com' autoComplete='email' keyboardType='email-address'/>
                <CampoFecha control ={control} name='fechaNacimiento' title='Fecha de nacimiento' placeholder='Fecha de nacimiento' mode='date'/>
            </>
            )}

            {paso === 1 && (
            <>
                <CampoTexto name='password' control={control} title = 'Contraseña' placeholder='Minimo 8 caracteres' autoComplete='new-password' secureTextEntry/>
                <CampoTexto name='confirmar' control={control} title ='Confirmar contraseña' placeholder='Confirmar contraseña' autoComplete='new-password'/>
            </>
            )}

            {paso === 2 && (
            <>
                <CampoTexto name='telefono' control={control} title = 'Telefono' placeholder='+505 8823 2345' autoComplete='tel' keyboardType='phone-pad'/>
                <CampoTexto name='cedula' control={control} title = 'Cedula de identidad' placeholder='(opcional)' autoComplete='off'/>
            </>        
            )}

             {errorServer && (
                    <Text className="text-red-600 mb-3 text-center">{errorServer}</Text>
                )}
                {aviso && <Text className="text-teal-700 mb-3 text-center">{aviso}</Text>}
            </View>

            <View>

            <Pressable onPress={continuar} className='py-4 bg-black'>
                {isLoading ? (
                    <ActivityIndicator color="white"/>
                ): (
                    <Text className='text-white'>
                        {esUltimo ? "Crear cuenta": 'Continuar'}
                    </Text>
                )}
            </Pressable>
            {paso > 0 && (
                <Pressable
                    onPress={regresar}>
                    <Text>Ir atras</Text>
                </Pressable>
            )}

            {paso === 0 && (
                <Link href="/login" className="text-teal-700 text-center mt-6">
                        Ya tengo cuenta
                </Link>
            )}

            </View>
        </ScrollView>
    </SafeAreaView>
  )
}