import { View, Text, TextInput, Pressable, Platform } from 'react-native'
import { Control, Controller, FieldValues, Path, useController, useFormContext } from 'react-hook-form'
import type { RegistroForm } from './registro-schema'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useState } from 'react'

type Props<T extends FieldValues> = {
    name: Path<T>
    control: Control<T>
    placeholder: string,
    title: string
}

export function CampoFecha<T extends FieldValues>({
    name,
    placeholder,
    title,
    control
}: Props<T>) {

    const {field, fieldState} = useController({name, control})
    const error = fieldState.error?.message
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)


    
    return (
        <View className="mb-4">
            <Text>{title}</Text>
                    
            <Pressable 
            className={`border rounded-lg py-3 text-slate-900 flex ${error ? 'border-red-400' : 'border-slate-300'}`}
            onPress={() => setIsDatePickerOpen(true)}>

            {Platform.OS !== "ios" && (
                <Text className={field.value ? 'text-slate-900 pl-4': 'text-slate-400 pl-4'}>
                    {field.value ? field.value.toLocaleDateString('es-CR', 
                    {day: '2-digit', month: 'long', year: 'numeric'}): placeholder}
                </Text> )}
                        
                {isDatePickerOpen && (
                    <DateTimePicker
                    value={field.value ?? new Date(2000,0, 1)}
                    mode='date'
                    maximumDate={new Date()}
                    minimumDate={new Date(1930, 0, 1)}
                    onChange={(evento, fecha) => {
                    if (Platform.OS === 'android') setIsDatePickerOpen(false)
                    if (evento.type === 'set' && fecha) field.onChange(fecha)
                    }}
                    />

                    )}
                    {/* //Para hacer espacio dentro del TextInput (en IOS no se puede poner texto dentro, ya que renderiza el componente de la fecha al tocar) */}
                    {!isDatePickerOpen && Platform.OS === 'ios' && (
                        <Text></Text>
                    )}
            </Pressable>
            {error && <Text className="text-red-600 text-sm mt-1">{error}</Text>}
        </View>
    )
}