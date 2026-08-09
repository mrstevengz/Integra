// src/features/topbar/TopBar.tsx
import { router } from "expo-router"
import { Pressable, Text, View } from "react-native"

type TopBarProps = {
    name: string
    canGoBack: boolean
}

export default function TopBar({ name, canGoBack }: TopBarProps) {
    return (
        <View className="relative flex-row items-center justify-center py-4 px-4 bg-white border-b border-black/10">
            {canGoBack && (
                <Pressable
                    onPress={() => router.back()}
                    hitSlop={8}
                    className="absolute left-4 h-9 w-9 items-center justify-center rounded-full active:bg-black/5">
                    <Text className="text-2xl leading-none">‹</Text>
                </Pressable>
            )}
            <Text className="text-xl font-bold px-12" numberOfLines={1}>
                {name}
            </Text>
        </View>
    )
}
