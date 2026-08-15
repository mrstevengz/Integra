import { useState } from 'react'
import { View, Text, TextInput, Pressable, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { Link } from 'expo-router'
import { supabase } from '@/lib/supabase'
import {zodResolver} from '@hookform/resolvers/zod'
import {FormProvider, useForm} from 'react-hook-form'
import { CampoFecha } from '@/components/CampoFecha'
import { RegistroForm, registroSchema } from '@/features/auth/registro-schema'
import { PASOS } from '@/features/auth/pasos'
import { CampoTexto } from '@/components/CampoTexto'
import TopBar from '@/components/TopBar'
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
    <View className='flex-1 bg-white'>
    <SafeAreaView edges={['top']} className='bg-slate-100'>
        <TopBar name='Crear cuenta' canGoBack={true}/>
    </SafeAreaView>

        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'} >
        <ScrollView
            className="flex-grow bg-white"
            contentContainerStyle={{
                flexGrow: 1,
                paddingHorizontal: 20,
                paddingTop: 30,
                paddingBottom: 120
            }}>

            <View className="flex-row gap-2 mb-8">
                    {PASOS.map((_, i) => (
                        <View
                            key={i}
                            className={`h-1 flex-1 rounded-full ${
                                i <= paso ? 'bg-slate-700' : 'bg-slate-200'
                            }`}
                        />
                    ))}
            </View>

            <View>
                <Text className='text-4xl font-bold mb-2'>{actual.titulo}</Text>
                <Text className='text-slate-500 mb-8'>{actual.subtitulo}</Text>
            </View>

           
            
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

            

            <View>

            <Pressable onPress={continuar} className='border rounded-lg py-4 items-center mb-2 bg-black'>
                {isLoading ? (
                    <ActivityIndicator color="white"/>
                ): (
                    <Text className='text-white font-semibold'>
                        {esUltimo ? "Crear cuenta": 'Continuar'}
                    </Text>
                )}
            </Pressable>
            {paso > 0 && (
                <Pressable
                    onPress={regresar}>
                    <Text className='text-center text-slate-700 mt-3 underline '>Volver</Text>
                </Pressable>
            )}

            {paso === 0 && (
                <Link href="/login" className="text-slate-700 text-center mt-3 underline ">
                        ¿Ya tienes cuenta? Iniciar sesion
                </Link>
            )}

        
            </View>
        
            </ScrollView>
        </KeyboardAvoidingView>
    </View>   
  )
}