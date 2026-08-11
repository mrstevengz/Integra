import {cerrarSesion } from "@/state/auth";
import { perfil$ } from "@/state/usuario";
import { useValue } from "@legendapp/state/react";
import { Text, View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import TopBar from "@/features/topbar/TopBar";
import { SafeAreaView } from "react-native-safe-area-context";
import PerfilSummary from "@/features/perfil/PerfilSummary";
import PerfilBox, { PerfilBoxText } from "@/features/perfil/PerfilBox";
import {condicion$ } from "@/state/condicion";
import { alergia$ } from "@/state/alergia";
import { contactoEmergencia$ } from "@/state/contactosemergencia";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import ContactoEmergenciaBox from "@/features/perfil/ContactoEmergenciaBox";


export default function ExpedienteScreen() {
    //Obtener datos de sesion y perfil
    const perfil = useValue(perfil$)
    const condiciones = Object.values(useValue(condicion$)).filter(
        (c) => c.perfil_id === perfil.id && c.deleted !== true
    )
    const alergias = Object.values(useValue(alergia$)).filter(
        (a) => a.perfil_id === perfil.id && a.deleted !== true
    )

    const contactos = Object.values(useValue(contactoEmergencia$)).filter(
        (ce) => ce.perfil_id === perfil.id && ce.deleted !== true
    )

    
    if(!perfil.id || !condicion$) {
      return (
        <View className="flex-1">
                <SafeAreaView edges={['top']} className="bg-slate-100">
                    <TopBar name='Mi Expediente' canGoBack={false}/>
                </SafeAreaView>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#0F7C7C"/>
                </View> 
            </View>
      )
    }


    const nombreCompleto = `${perfil.nombre ?? ''} ${perfil.apellidos ?? ''}`.trim()
    const usersYear = (perfil.fecha_nacimiento ?? "").slice(0,10)
    const cleanDate = usersYear.toString().replaceAll("-", "")

    const todaysDate = new Date().toISOString().slice(0,10).replaceAll("-", "")

    const age = (parseInt(todaysDate) - parseInt(cleanDate))

    const usersAge = age.toString().slice(0,2)


  return (
    <View className="flex-1">
        <SafeAreaView edges={['top']} className="bg-slate-100">
            <TopBar name='Mi Expediente' canGoBack={false}/>
        </SafeAreaView>
        <ScrollView className="flex-grow bg-white">

          <PerfilSummary nombre={nombreCompleto} edad={usersAge} genero={perfil.genero} cedula={perfil.cedula}/>

          <PerfilBox titulo="Datos Personales" link="/expediente/perfil" linkName="Editar">
            <View className="flex flex-col">

              <PerfilBoxText titulo="Fecha de nac." data={perfil.fecha_nacimiento}/>
              <PerfilBoxText titulo="Telefono" data={perfil.telefono}/>
              <PerfilBoxText titulo="Tipo de sangre" data={perfil.tipo_sangre}/>
              <PerfilBoxText titulo="Medico tratante" data={perfil.medico_tratante}/>

            </View>
          </PerfilBox> 

          <PerfilBox titulo="Condiciones" link="/expediente/diagnosticos" linkName="Editar">
          <ScrollView 
          contentContainerClassName="flex flex-row gap-3 px-4 mb-4 "
          horizontal
          >
            {condiciones.map((condicion) => (
              <Text
              key={condicion.id}
              className="p-2 border rounded-xl border-black/40 text-black/40"
              >{condicion.nombre}</Text>
            ))}
          </ScrollView>
          </PerfilBox>

          <PerfilBox titulo="Alergias" link="/expediente/diagnosticos" linkName="Editar">
            <ScrollView 
            contentContainerClassName="flex flex-row gap-3 px-4 mb-4"
            horizontal
            >
              {alergias.map((alergia) => (
                <Text
                key={alergia.id}
                className="p-2 border rounded-xl border-black/40 text-black/40"
                >{alergia.nombre}</Text>
              ))}
            </ScrollView>
          </PerfilBox>

          <PerfilBox titulo="Contactos de Emergencia" link="/expediente/contactos-emergencia" linkName="Agregar">
            {contactos.map((contacto) => (
              <ContactoEmergenciaBox key={contacto.id} nombre={contacto.nombre} relacion={contacto.relacion} telefono = {contacto.telefono}  
              onPress={() => router.navigate({
              pathname: '/expediente/contactos-emergencia',
                    })}/>
            ))}
          </PerfilBox>

          <Pressable onPress={cerrarSesion} className="border border-red-300 rounded-lg py-3 mt-4 items-center">
            <Text>Cerrar sesion</Text>
          </Pressable>
        </ScrollView>
    </View>
  );
}
