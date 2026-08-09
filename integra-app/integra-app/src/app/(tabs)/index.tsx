import { StatusBar } from "expo-status-bar";
import { Text, View, ScrollView, FlatList, Pressable } from "react-native";
import TopBar from "@/features/topbar/TopBar";
import {useValue} from '@legendapp/state/react'
import { articulo$ } from "@/state/articulos";
import { string } from "zod";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {

  return (
    <View className="flex-1">
        <SafeAreaView edges={['top']} className="bg-white">
            <TopBar name='Inicio' canGoBack={false}/>
        </SafeAreaView>
        <View className="flex-1 justify-center items-center">
            <Pressable
                onPress={() => router.push("/articulos")}
                className="bg-transparent border-2 border-black py-4 items-center rounded-lg">
                <Text>Articulos</Text>
            </Pressable>
        </View>
    </View>
  );
}
