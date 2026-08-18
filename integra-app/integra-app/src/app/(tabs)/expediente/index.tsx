import {cerrarSesion } from "@/state/auth";
import { perfil$ } from "@/state/usuario";
import { useValue } from "@legendapp/state/react";
import { Text, View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import TopBar from "@/components/TopBar";
import { SafeAreaView } from "react-native-safe-area-context";
import PerfilSummary from "@/features/perfil/PerfilSummary";
import PerfilBox, { PerfilBoxText } from "@/features/perfil/PerfilBox";
import {condicion$ } from "@/state/condicion";
import { alergia$ } from "@/state/alergia";
import { contactoEmergencia$ } from "@/state/contactosemergencia";
import { router } from "expo-router";
import ContactoEmergenciaBox from "@/features/perfil/ContactoEmergenciaBox";
import { expedienteChecklist$ } from "@/state/expedienteChecklist";
import {QrCode} from "lucide-react-native";
import { color } from "@/theme/colors";



export function getAge(edadNacimiento: string) {
      const yearUsuario = (edadNacimiento ?? "").slice(0,10)
      const fechaLimpia = yearUsuario.toString().replaceAll("-", "")

      const hoy = new Date().toISOString().slice(0,10).replaceAll("-", "")
      const edad = parseInt(hoy) - parseInt(fechaLimpia)
      return edad.toString().slice(0,2)
  }

export default function ExpedienteScreen() {
    //Obtener datos de sesion y perfil
    const perfil = useValue(perfil$)
    const condiciones = Object.values(useValue(condicion$) ?? {}).filter(
        (c) => c.perfil_id === perfil.id 
    )
    const alergias = Object.values(useValue(alergia$) ?? {}).filter(
        (a) => a.perfil_id === perfil.id 
    )

    const contactos = Object.values(useValue(contactoEmergencia$) ?? {}).filter(
        (ce) => ce.perfil_id === perfil.id 
    )

    const confirmadas = useValue(expedienteChecklist$)

    

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

      const expedienteIncompleto = [
      perfil.genero == null || perfil.cedula == null,
      perfil.tipo_sangre == null,
      condiciones.length === 0,
      alergias.length === 0,
      contactos.length === 0,
    ].some((incompleta, i) => incompleta && !confirmadas[['datosPersonales','tipoSangre','condiciones','alergias','contactoEmergencia'][i]])


    const nombreCompleto = `${perfil.nombre ?? ''} ${perfil.apellidos ?? ''}`.trim()

  return (
    <View className="flex-1">
        <SafeAreaView edges={['top']} className="bg-slate-100">
            <TopBar name='Mi Expediente' canGoBack={false} grande={true} subtitulo={`${new Date().toLocaleDateString('es-CR', {weekday: 'long'})}, ${new Date().getDate()} de ${new Date().toLocaleString('es-ES', {month: 'long'})}`}
            accion={() => router.navigate("/expediente/exportar")}
            accionIcono={<QrCode size={25} color={color.primary}/>}
            />
        </SafeAreaView>
        <ScrollView className="flex-grow bg-slate-100" contentContainerStyle={{paddingBottom: 100, paddingTop: 15 }}>

          <PerfilSummary nombre={nombreCompleto} edad={getAge(perfil.fecha_nacimiento ?? '')} genero={perfil.genero} cedula={perfil.cedula}/>

          {expedienteIncompleto && (
              <Pressable className="mt-3 p-4 px-5 bg-slate-200 border-l-2 border-slate-700 text-slate-500"
              onPress={() => router.navigate("/expediente/completar")}>
                  <Text>Expediente incompleto ——— Termina de completar tu perfil</Text>
              </Pressable>
          )}

          

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
              className="p-2 border rounded-xl border-black/40 text-black/90"
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
                className="p-2 border rounded-xl border-black/40 text-black/70"
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

