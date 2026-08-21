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

export function CampoTexto<T extends FieldValues>({
    control, name, title, placeholder,
    keyboardType = 'default', autoComplete='off', secureTextEntry=false, opcional=false
}: Props<T>) {
 
    const {field, fieldState} = useController({name, control})
    const error = fieldState.error?.message
    return (
        <View className="mb-4">
            <Text className='mb-2 text-lg'>
                {title} {opcional && <Text className='text-sm text-slate-500'>(opcional)</Text>} {!opcional && <Text className={`${error ? 'text-red-400' : 'text-slate-400'} font-semibold`}></Text>}
            </Text>

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
            {error && <Text className="text-red-600 text-sm mt-1">{error}</Text>}
        </View>
    )
}