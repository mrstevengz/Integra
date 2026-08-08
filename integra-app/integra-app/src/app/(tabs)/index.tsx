import { StatusBar } from "expo-status-bar";
import { Text, View, ScrollView, FlatList } from "react-native";
import {useValue} from '@legendapp/state/react'
import { articulo$ } from "@/state/articulos";

export default function HomeScreen() {
  const articulos = useValue(articulo$)

  return (
    <FlatList
    className="flex-1"
    data={Object.values(articulos)}
    keyExtractor={(a) => a.id}
    renderItem={({item}) => (
      <View className="p-4 border-b">
        <Text>{item.titulo}</Text>
        <Text>{item.categoria}</Text>
        <Text>{item.sintomas}</Text>
      </View>
    )}>

    </FlatList>
  );
}
