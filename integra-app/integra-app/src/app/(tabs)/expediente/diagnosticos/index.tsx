import { SafeAreaView } from "react-native-safe-area-context"
import {View, ActivityIndicator, ScrollView } from "react-native"
import TopBar from "@/components/TopBar"
import { useValue } from "@legendapp/state/react"
import { perfil$ } from "@/state/usuario"
import PerfilBox, { PerfilBoxText } from "@/features/perfil/PerfilBox"
import { condiciones$, condicionesDelPerfil } from "@/state/condiciones"
import { router } from "expo-router"
import { alergias$ } from "@/state/alergias"
import Swipeable, { SwipeableMethods, SwipeDirection } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { RectButton } from "react-native-gesture-handler"
import Reanimated from 'react-native-reanimated'
import { SharedValue, useAnimatedStyle } from "react-native-reanimated"
import Ionicons from "@expo/vector-icons/Ionicons"
import { deleteAlert } from "@/components/Alert"
import { useRef } from "react"
import { color } from "@/theme/colors"
import { delPerfil } from "@/state/consultas"

export default function DiagnosticosScreen() {
    const perfil = useValue(perfil$)
    
    const condiciones = condicionesDelPerfil(useValue(condiciones$), perfil.id)
    const alergias = delPerfil(useValue(alergias$), perfil.id)

    const direction = SwipeDirection
    const swipeableRef = useRef<SwipeableMethods>(null)


    if (!perfil.id || !condiciones$ || !alergias$) return (
            <View className="flex-1">
                <SafeAreaView edges={['top']} className="bg-slate-100">
                    <TopBar name='Condiciones y alergias' canGoBack={true}/>
                </SafeAreaView>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={color.primary}/>
                </View>
            </View>
    )

    
    return (
         <View className="flex-1">
            <SafeAreaView edges={['top']} className="bg-slate-100">
                <TopBar name='Condiciones y alergias' canGoBack={true}/>
            </SafeAreaView>

            <ScrollView>

            <PerfilBox
            titulo="Condiciones / Diagnosticos"
            linkName="+ Agregar"
            link="/expediente/diagnosticos/condicion/agregar-condicion"
            >

            <View>
            {condiciones.map((condicion) => (
                <Swipeable key = {condicion.id} friction={1} rightThreshold={140} overshootRight={false} renderRightActions={(prog, drag, methods) => 
                    RightSwipe(
                    prog, drag, methods, 
                    () => router.navigate({pathname: '/expediente/diagnosticos/condicion/[condicionId]', params: {condicionId: condicion.id}}), 
                    () => deleteAlert(() => condiciones$[condicion.id].delete())
                    )} 
                    ref={swipeableRef}
                    >
                        <PerfilBoxText titulo={condicion.nombre} data={condicion.tipo}/>

                </Swipeable>    
            ))}
            </View>

            </PerfilBox>

            <PerfilBox
            titulo="Alergias"
            linkName="+ Agregar"
            link="/expediente/diagnosticos/alergia/agregar-alergia"
            >
    
            <View>
            {alergias.map((alergia) => (
               <Swipeable key = {alergia.id} friction={1} rightThreshold={140} overshootRight={false} renderRightActions={(prog, drag, methods) => 
                    RightSwipe(
                    prog, drag, methods, 
                    () => router.navigate({pathname: '/expediente/diagnosticos/alergia/[alergiaId]', params: {alergiaId: alergia.id}}), 
                    () => deleteAlert(() => alergias$[alergia.id].delete())
                    )} 
                    ref={swipeableRef}
                    >
                        <PerfilBoxText titulo={alergia.nombre} data={alergia.severidad}/>

                </Swipeable>  
            ))}
            </View>


            </PerfilBox>
            </ScrollView>
        </View>
    )
}

function RightSwipe(prog: SharedValue<number>, drag: SharedValue<number>, methods: SwipeableMethods, onEdit: () => void, onDelete: () => void) {
    const styleAnimation = useAnimatedStyle(() => {
        return {
            transform: [{translateX: drag.value + 160}]
        }
    })

    return (
        <Reanimated.View className="flex-row w-50 bg-bg-color">
            <RectButton style={{width: 80, alignItems: "center", justifyContent: "center", backgroundColor: "#000000"}}
            
            onPress={() => {
                onEdit() 
                methods.close()}
                }>
                <Ionicons color={"#ffffff"} name="pencil" size={25}/>
            </RectButton>

             <RectButton style={{width: 80, alignItems: "center", justifyContent: "center", backgroundColor: "#ff3131"}}
             onPress={() => {
                onDelete() 
                methods.close()}
                }>
                <Ionicons color={"#ffffff"} name="trash" size={25}/>
            </RectButton>
        </Reanimated.View>
    )
}