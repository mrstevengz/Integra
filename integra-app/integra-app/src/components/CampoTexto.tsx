import { View, Text, TextInput } from 'react-native'
import { Control, FieldValues, Path, useController} from 'react-hook-form'

type Props<T extends FieldValues> = {
    name: Path<T>
    control: Control<T>
    placeholder?: string
    secureTextEntry?: boolean
    keyboardType?: 'default' | 'email-address' | 'phone-pad'
    autoComplete?: 'name' | 'family-name' | 'email' | 'new-password' | 'tel' | 'off'
    opcional?: boolean,
    title: string
}

function separarTelefono(valor: string | undefined): [string, string] {
    const texto = valor ?? ''
    if (!texto) return ['505', '']
    const coincidencia = texto.match(/^\+(\d*)\s*(.*)$/)
    return coincidencia ? [coincidencia[1], coincidencia[2]] : ['505', '']
}

export function CampoTexto<T extends FieldValues>({
    control, name, title, placeholder,
    keyboardType = 'default', autoComplete='off', secureTextEntry=false, opcional=false
}: Props<T>) {

    const {field, fieldState} = useController({name, control})
    const error = fieldState.error?.message
    const esTelefono = keyboardType === 'phone-pad'
    const [codigoPais, numero] = esTelefono ? separarTelefono(field.value as string) : ['', '']

    const actualizarTelefono = (codigo: string, num: string) => {
        field.onChange(`+${codigo} ${num}`.trim())
    }

    return (
        <View className="mb-4">
            <Text className='mb-2 text-lg'>
                {title} {opcional && <Text className='text-sm text-slate-500'>(opcional)</Text>} {!opcional && <Text className={`${error ? 'text-red-400' : 'text-slate-400'} font-semibold`}></Text>}
            </Text>

            {esTelefono ? (
                <View className="flex-row gap-2">
                    <View className={`flex-row items-center border rounded-chip bg-surface-raised px-2 ${error ? 'border-red-400' : 'border-slate-300'}`}>
                        <Text className="text-[17px] text-slate-500">+</Text>
                        <TextInput
                        value={codigoPais}
                        onChangeText={(texto) => actualizarTelefono(texto, numero)}
                        onBlur={field.onBlur}
                        keyboardType="number-pad"
                        maxLength={4}
                        maxFontSizeMultiplier={1.3}
                        textAlignVertical="center"
                        className="w-14 py-3 text-[17px]"
                        />
                    </View>

                    <TextInput
                    placeholder={placeholder}
                    value={numero}
                    onChangeText={(texto) => actualizarTelefono(codigoPais, texto)}
                    onBlur={field.onBlur}
                    keyboardType="phone-pad"
                    autoComplete={autoComplete}
                    maxFontSizeMultiplier={1.3}
                    textAlignVertical="center"
                    className={`flex-1 border rounded-chip bg-surface-raised py-3 px-2 text-[17px] ${error ? 'border-red-400' : 'border-slate-300'}`}
                    />
                </View>
            ) : (
                <TextInput
                placeholder={placeholder}
                value={(field.value as string) ?? ''}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                keyboardType={keyboardType}
                autoComplete={autoComplete}
                secureTextEntry={secureTextEntry}
                maxFontSizeMultiplier={1.3}
                textAlignVertical="center"
                className={`border border-line rounded-chip bg-surface-raised py-3 px-2 text-[17px] ${error ? 'border-red-400' : 'border-slate-300'}`}
                />
            )}

            {error && <Text className="text-red-600 text-sm mt-1">{error}</Text>}
        </View>
    )
}
