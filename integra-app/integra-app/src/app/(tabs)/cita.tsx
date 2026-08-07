import { Text, View, ScrollView } from "react-native";

export default function CitaScreen() {
  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center">
        <Text className="text-2xl font-bold text-slate-900">Citas</Text>
      </View>
    </ScrollView>
  );
}