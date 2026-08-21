import {TipoMedicion } from "@/state/mediciones";
import { Control, FieldValues, Path, useController } from "react-hook-form";
import { useState } from "react";
import { TextInput, Text, View, TouchableOpacity } from "react-native";
import { alHacerPaso, redondear, numeroDesdeTexto } from "./medicion-schema";

//Tipo de TS generico para pasar un 'FieldValue', que es un tipo de 'react-hook-forms' que recibe un nombre y un controlador. Estos se pasan en la pantalla del Form, donde name: es el nombre del campo/valor en el schema de Zod, y controlador es el controller que se inicializa en cada form. Tipo pasa el tipo de medicion, y doble solo es para el caso de la presion arterial, que tiene campo para sistolica y diastolica
type Props<T extends FieldValues> = {
    name: Path<T>
    control: Control<T>
    tipo: TipoMedicion
    doble: boolean
}

export default function CampoMedicion<T extends FieldValues>({name, control, tipo, doble}: Props<T>) {
    //Se le pasan los valores de field, y fieldState que vienen del controlador. Esto maneja los valores del campo especifico, y reaccionan a errores/cambios
    const {field, fieldState} = useController({name, control})

    const [texto, setTexto] = useState(field.value !== undefined && field.value !== null ? String(field.value) : '')

    //Para manejar el error que tira zod, basado en que error se ponga en este campo especifico en el schema de medicion
    const error = fieldState.error?.message
    
    //Determina CUANTO se avanza, si es temperatura de 0.1 en 0,1. Si no, valores enteros.
    const paso = alHacerPaso(tipo.rango_min, tipo.rango_max)

    const actualizarValor = (numero: number, textoMostrado: string) => {
        field.onChange(numero)
        setTexto(textoMostrado)
    }

    //Determina que pasa al clickear el boton, si es el boton de agregar, agrega y redondea. Si no, resta y redondea
    const manejarBotondePaso = (amount: number, type: string) => {
        const valorActual = Number(field.value) || 0
        const nuevoValor = redondear(type === 'add' ? valorActual + amount : valorActual - amount)

        actualizarValor(nuevoValor, String(nuevoValor))
    }

    return (
        <View className="flex flex-col pb-10">
            <View className={`flex ${doble ? 'flex-col' : 'flex-row'} items-center gap-2`}>
                <TextInput
                value={field.value !== undefined && field.value !== null && !Number.isNaN(field.value) ? String(field.value) : ''}
                onChangeText={(texto) => field.onChange(numeroDesdeTexto(texto))}

                onBlur={field.onBlur}
                keyboardType="phone-pad"
                className={` text-slate-900 font-bold text-[80px] ${error && 'text-red-600'}`}
                />
                {error && <Text className="text-red-600 text-sm mt-1">{error}</Text>}

                <Text>{tipo.unidad}</Text>
            </View>
            <View className="flex flex-row items-center gap-6">
                <TouchableOpacity
                onPress={() => manejarBotondePaso(paso, 'restar')}
                className="bg-transparent border-slate-300 border rounded-xl px-6 py-2">
                    <Text className="text-[40px]">-</Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-black border rounded-xl px-6 py-2"
                onPress={() => manejarBotondePaso(paso, 'add')}>
                    <Text className="text-[40px] text-white">+</Text>
                </TouchableOpacity>
            </View>
           
        </View>
    )
}
