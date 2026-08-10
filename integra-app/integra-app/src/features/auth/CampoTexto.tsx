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
        <View className="mb-4 ">
          <Text>
            {title} {!opcional && <Text className={`${error ? 'text-red-400' : 'text-slate-400'} font-semibold`}></Text>}
          </Text>

          <TextInput
          placeholder={placeholder}
          value={(field.value as string) ?? ''}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          secureTextEntry={secureTextEntry}
          className={`border rounded-lg px-4 py-3 text-slate-900 ${error ? 'border-red-400' : 'border-slate-300'}`}
          />
            {error && <Text className="text-red-600 text-sm mt-1">{error}</Text>}
        </View>
    )
}