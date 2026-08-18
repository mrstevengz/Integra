import {View} from "react-native"
import Categorias from "@/features/articulos/CategoriasBox"
import { SafeAreaView } from "react-native-safe-area-context"
import DestacadosBox from "@/features/articulos/DestacadosBox"
import TopBar from "@/components/TopBar"

export default function ArticulosPage() {

    return (
        <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">
                <TopBar name='Informacion y salud' canGoBack={true}/>
            </SafeAreaView>

            <DestacadosBox/>
            <Categorias/>
        </View>
    )
}
