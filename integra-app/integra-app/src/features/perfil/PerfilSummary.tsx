import { router } from "expo-router";
import { View, Text, Pressable } from "react-native";

type PerfilSummaryProps = {
    nombre: string;
    edad: string;
    genero: string;
    cedula: string
}

export default function PerfilSummary({nombre, edad, genero, cedula}: PerfilSummaryProps) {
    return (
        <Pressable className="flex flex-row gap-5 p-4 border-b border-black/20 active:bg-black/5"
            onPress={() => router.navigate("/expediente/perfil")}>
            <View className="flex-2 w-20 border-2 rounded-3xl">
            </View>
            <View className="flex-1">
                <Text className="text-3xl font-semibold">{nombre}</Text>
                <Text className="text-lg color-black/50">{edad} años | {genero ? genero : 'Por definir'}</Text>
                <Text className="text-lg color-black/50">Cedula: {cedula ? cedula : 'Por definir'}</Text>
            </View>
        </Pressable>
    )
}