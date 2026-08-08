import { View, Text, TextInput, Pressable, Platform } from 'react-native'
import { Controller, useFormContext } from 'react-hook-form'
import type { RegistroForm } from './registro-schema'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useState } from 'react'

type Props = {
    name: 'fechaNacimiento'
    placeholder: string,
    title: string
}

export function CampoFecha({
    name,
    placeholder,
    title
}: Props) {
    const { control, formState: { errors } } = useFormContext<RegistroForm>()
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
    const error = errors[name]?.message

    return (
        <View className="mb-4">
            <Controller
                control={control}
                name={name}
                render={({ field: { value, onChange } }) => (
                    <>
                        <Text>{title}</Text>
                        <Pressable 
                        className={`border rounded-lg px-4 py-3 text-slate-900 ${
                            error ? 'border-red-400' : 'border-slate-300'
                        }`}
                        onPress={() => setIsDatePickerOpen(true)}
                        >

                            <Text>15 / 04 / 1962</Text>
                            {isDatePickerOpen && (
                                <DateTimePicker
                                value={value ?? new Date(2000,0, 1)}
                                mode='date'
                                maximumDate={new Date()}
                                minimumDate={new Date(1930, 0, 1)}
                                onChange={(evento, fecha) => {
                                    if (evento.type === 'set') onChange(fecha)
                                    if (Platform.OS === 'android') setIsDatePickerOpen(false)
                                }}
                                />
                            )}


                        </Pressable>
                    </>
                )}
            />
            {error && <Text className="text-red-600 text-sm mt-1">{error}</Text>}
        </View>
    )
}