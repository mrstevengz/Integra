import { View, Text, TextInput } from 'react-native'
import { Controller, useFormContext } from 'react-hook-form'
import type { RegistroForm } from './registro-schema'

type Props = {
    name: 'nombre' | 'apellidos' | 'email' | 'password' | 'confirmar' | 'telefono' | 'cedula'
    placeholder: string
    secureTextEntry?: boolean
    keyboardType?: 'default' | 'email-address' | 'phone-pad'
    autoComplete?: 'name' | 'family-name' | 'email' | 'new-password' | 'tel' | 'off'
    opcional?: boolean,
    title: string
}

export function CampoTexto({
    name,
    placeholder,
    secureTextEntry = false,
    keyboardType = 'default',
    autoComplete = 'off',
    opcional = false,
    title
}: Props) {
    const { control, formState: { errors } } = useFormContext<RegistroForm>()
    const error = errors[name]?.message

    return (
        <View className="mb-4">
            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, onBlur, value } }) => (
                    <>
                    <Text>{title}</Text>
                    <TextInput
                        className={`border border-slate-300 rounded-lg px-4 py-3 mb-3 text-slate-900 ${
                            error ? 'border-red-400' : 'border-slate-300'
                        }`}
                        placeholder={opcional ? `${placeholder} (opcional)` : placeholder}
                        placeholderTextColor="#94a3b8"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry={secureTextEntry}
                        keyboardType={keyboardType}
                        autoComplete={autoComplete}
                        autoCapitalize="none"
                    />
                    </>
                )}
            />
            {error && <Text className="text-red-600 text-sm mt-1">{error}</Text>}
        </View>
    )
}