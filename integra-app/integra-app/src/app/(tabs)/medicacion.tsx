import { Text, View, ScrollView } from "react-native";
import TopBar from "@/features/topbar/TopBar";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MedicacionScreen() {
  return (
    <View className="flex-1">
        <SafeAreaView edges={['top']} className="bg-white">
            <TopBar name='Medicacion' canGoBack={false}/>
        </SafeAreaView>
        <ScrollView className="flex-1 bg-white">
          <View className="flex-1 justify-center items-center">
            <Text className="text-2xl font-bold text-slate-900">Medicacion</Text>
          </View>
        </ScrollView>
    </View>
  );
}
