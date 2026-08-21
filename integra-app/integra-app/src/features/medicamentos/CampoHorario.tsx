import { useState } from "react"
import { View, Text, Pressable, Platform, Modal} from "react-native"
import { Control, useController } from "react-hook-form"
import { MedicamentoForm, DIAS_SEMANA } from "./medicacion-schema"
import DateTimePickerModal from 'react-native-modal-datetime-picker'

type Props = {
    control: Control<MedicamentoForm>
    index: number
    onEliminar: () => void
    puedeEliminar: boolean
}

//"08:00" -> Fecha de hoy a esa hora
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

//"08:00" -> "8:00 a. m."
function mostrarHora(hhmm: string): string {
    return horaADate(hhmm).toLocaleTimeString('es-NI', { hour: 'numeric', minute: '2-digit' })
}

const esAndroid = Platform.OS === 'android'

export function CampoHorario({ control, index, onEliminar, puedeEliminar }: Props) {
    //Se le pasa el indice, en el formulario pueden haber maximo 6 horarios. Indice (numero de horario.)
    const hora = useController({ control, name: `horarios.${index}.hora` })
    const dias = useController({ control, name: `horarios.${index}.dias` })

    const [abierto, setAbierto] = useState(false)
    const [temporal, setTemporal] = useState(() => horaADate(hora.field.value))

    const diasActuales: number[] = dias.field.value ?? []
    const errorHora = hora.fieldState.error?.message
    const errorDias = dias.fieldState.error?.message

    function abrir() {
        setTemporal(horaADate(hora.field.value))
        setAbierto(true)
    }

    function confirmar() {
        hora.field.onChange(dateAHora(temporal))
        setAbierto(false)
    }

    function cancelar() {
        setAbierto(false)
    }

    function alternarDia(valor: number) {
        //Funcion que recibe el arreglo y retorna un arreglo nuevo. La logica es =>
        //Guarda el arreglo nuevo en -> nuevos, se pasa la condicion que retorna un booleano,
        //Si el arreglo de dias actuales incluye el valor (esta seleccionado en el UI) se quita de la lista de dias actuales (se deselecciona), si NO lo incluye, lo agrega a la lista existente y la ordena. (El ordenamiento solo es a nivel de base de datos, no afecta en el UI)
        const nuevos = diasActuales.includes(valor)
            ? diasActuales.filter((d) => d !== valor)
            : [...diasActuales, valor].sort((a, b) => a - b)
        dias.field.onChange(nuevos)
    }


    return (
        <View className="border border-slate-300 rounded-lg p-4 mb-3">
            <View className="flex-row justify-between items-center mb-3">
                <Pressable onPress={abrir}>
                    <Text className="text-2xl font-semibold text-slate-900">
                        {mostrarHora(hora.field.value)}
                    </Text>
                </Pressable>

                {puedeEliminar && (
                    <Pressable onPress={onEliminar} className="px-3 py-1">
                        <Text className="text-red-600">Eliminar</Text>
                    </Pressable>
                )}
            </View>

            <DateTimePickerModal
            isVisible ={abierto}
            mode="time"
            date={horaADate(hora.field.value)}
            onConfirm={(fecha) => {
                hora.field.onChange(dateAHora(fecha)); setAbierto(false)}}
            
            onCancel={() => setAbierto(false)}
            confirmTextIOS="Listo"
            isDarkModeEnabled={false}
            themeVariant="light"
            cancelTextIOS="Cancelar"
            locale="es-NI"
            pickerComponentStyleIOS={{ alignSelf: 'center'}}
            modalStyleIOS={{ marginHorizontal: 16 }}
            buttonTextColorIOS="#0F7C7C"/>


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