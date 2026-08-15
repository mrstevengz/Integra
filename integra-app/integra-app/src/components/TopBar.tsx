import { GlassView } from "expo-glass-effect"
import { router } from "expo-router"
import { Pressable, Text, TouchableOpacity, View } from "react-native"


//Topbar para todas las pantallas de la aplicacion. Aqui se puede modificar. Acepta el titulo y un booleano, para permitir retornar o no. (En las pantallas principales de (tabs) no se retorna)
type TopBarProps = {
    name: string
    canGoBack: boolean
}

export default function TopBar({ name, canGoBack }: TopBarProps) {
    return (
        <View className="relative flex-row items-center justify-center py-4 px-4 bg-slate-100 border-b border-black/10">
            {canGoBack && (
                <GlassView
                    style={{ borderRadius: 20, position:"absolute", left: 20, height: 40, width: 40  }}
                    glassEffectStyle="regular"
                    tintColor="#e2e8f0"
                    isInteractive
                >
                    <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={8}
                    className="flex-1 justify-center items-center">
                    <Text className="text-2xl leading-none">‹</Text>
                    </TouchableOpacity>
                </GlassView>
            )}

            <Text className="text-xl font-bold px-12" numberOfLines={1}>
                {name}
            </Text>
        </View>
    )
}
