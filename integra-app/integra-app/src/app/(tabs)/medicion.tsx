import { Text, View, ScrollView } from "react-native";
import TopBar from "@/features/topbar/TopBar";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MedicionScreen() {
  return (
    <View className="flex-1">
        <SafeAreaView edges={['top']} className="bg-slate-100">
            <TopBar name='Registrar medicion' canGoBack={false}/>
        </SafeAreaView>
        <ScrollView className="flex-1">
          <View className="flex-1 justify-center items-center">
            <Text className="text-2xl font-bold text-slate-900">Mediciones</Text>
          </View>
        </ScrollView>
    </View>
  );
}
