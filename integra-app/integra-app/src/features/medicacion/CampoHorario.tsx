import { useState } from "react"
import { View, Text, Pressable, Platform } from "react-native"
import DateTimePicker from '@react-native-community/datetimepicker'
import { Control, useController } from "react-hook-form"
import { MedicamentoForm, DIAS_SEMANA } from "./medicacion-schema"

type Props = {
    control: Control<MedicamentoForm>
    index: number
    onEliminar: () => void
    puedeEliminar: boolean
}

//"08:00" -> Date de hoy a esa hora
function horaADate(hhmm: string): Date {
    const [h, m] = hhmm.split(':').map(Number)
    const d = new Date()
    d.setHours(h, m, 0, 0)
    return d
}

//Date -> "08:00"
function dateAHora(d: Date): string {
    const h = String(d.getHours()).padStart(2, '0')
    const m = String(d.getMinutes()).padStart(2, '0')
    return `${h}:${m}`
}

export function CampoHorario({ control, index, onEliminar, puedeEliminar }: Props) {
    const hora = useController({ control, name: `horarios.${index}.hora` })
    const dias = useController({ control, name: `horarios.${index}.dias` })

    const [abierto, setAbierto] = useState(false)

    const diasActuales: number[] = dias.field.value ?? []
    const errorHora = hora.fieldState.error?.message
    const errorDias = dias.fieldState.error?.message

    function alternarDia(valor: number) {
        const nuevos = diasActuales.includes(valor)
            ? diasActuales.filter((d) => d !== valor)
            : [...diasActuales, valor].sort((a, b) => a - b)
        dias.field.onChange(nuevos)
    }

    function onChange(event: any, selectedDate?: Date) {
        if (Platform.OS === 'android') {
            setAbierto(false)
        }

        if (selectedDate) {

        }
    }

    return (
        <View className="border border-slate-300 rounded-lg p-4 mb-3">
            <View className="flex-row justify-between items-center mb-3">
                <Pressable onPress={() => setAbierto(true)}>
                    <Text className="text-2xl font-semibold text-slate-900">
                        {hora.field.value}
                    </Text>
                </Pressable>

                {puedeEliminar && (
                    <Pressable onPress={onEliminar} className="px-3 py-1">
                        <Text className="text-red-600">Eliminar</Text>
                    </Pressable>
                )}
            </View>

            {abierto && (
                <DateTimePicker
                    value={horaADate(hora.field.value)}
                    mode="time"
                    is24Hour={true}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(evento, fecha) => {

                    if (Platform.OS === 'android') {
                        setAbierto(false)
                        if (evento.type === 'set' && fecha) {
                            hora.field.onChange(dateAHora(fecha))
                        } 
        
                    }
                    
                    if (Platform.OS === "ios") {
                        if (fecha) {
                            hora.field.onChange(dateAHora(fecha))
                        }
                        setTimeout(() => setAbierto(false), 1500)
                        
                    }
                }}
                />
            )}

            {errorHora && <Text className="text-red-600 text-sm mb-2">{errorHora}</Text>}

            <View className="flex-row justify-between">
                {DIAS_SEMANA.map((dia) => {
                    const activo = diasActuales.includes(dia.valor)
                    return (
                        <Pressable
                            key={dia.valor}
                            onPress={() => alternarDia(dia.valor)}
                            className={`w-10 h-10 rounded-full items-center justify-center ${
                                activo ? 'bg-teal-700' : 'bg-slate-200'
                            }`}
                        >
                            <Text className={activo ? 'text-white font-semibold' : 'text-slate-600'}>
                                {dia.letra}
                            </Text>
                        </Pressable>
                    )
                })}
            </View>

            {errorDias && <Text className="text-red-600 text-sm mt-2">{errorDias}</Text>}
        </View>
    )
}