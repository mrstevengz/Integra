import { Link, router } from "expo-router";
import { ReactNode } from "react";
import { View, Text } from "react-native";

type PerfilBoxProps = {
    titulo: string;
    children: React.ReactNode
    link: string
    linkName: string
}

type PerfilBoxTextProps = {
    titulo: string
    data: string | null
}


export default function PerfilBox({titulo, children, link, linkName}: PerfilBoxProps) {
    return (
        <View className="flex flex-col">
            <View className="flex flex-row justify-between items-center px-4 my-4">
                <Text className="text-xl font-semibold tracking-wide "
                onPress={() => router.navigate(link)}>{titulo}</Text>
                <Link className = "font-light text-black/40 active:text-black" href={link}>{linkName}</Link>
            </View>
            {children}
        </View>
    )
}

export function PerfilBoxText({titulo, data}: PerfilBoxTextProps) {
    return (
    <View className="flex flex-row justify-between p-4 px-5 bg-slate-100 border-b-2 border-black/20 group-active:bg-slate-200 ">
        <Text className="text-black/50">{titulo}</Text>
        <Text>{data ?? 'Sin definir'}</Text>
    </View>
    )
}