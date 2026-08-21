import { alergias$ } from "@/state/alergias";
import { condiciones$ } from "@/state/condiciones";
import { contactosEmergencia$ } from "@/state/contactos-emergencia";
import { medicamentos$ } from "@/state/medicamentos";
import { perfil$ } from "@/state/usuario";
import { useValue } from "@legendapp/state/react";
import { useCallback, useRef, useState } from "react";
import * as Brightness from "expo-brightness";
import * as Print from "expo-print";
import { shareAsync, isAvailableAsync } from "expo-sharing";
import { useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  View,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TopBar from "@/components/TopBar";
import { armarCarnetHTML } from "@/features/emergencia/carnet-html";
import QRCode from "react-native-qrcode-svg";
import TopBarSecondary from "@/components/TopBarSecondary";
import { armarQREmergencia, LARGO } from "@/features/emergencia/armarqr";

//Propiedades del QR. El tamaño determina que tanto puede leerse en caso de corromperse. Asociado a la propiedad L, M, Q Y H de los SVGs.
const SIZE_QR = 280;

const MARGEN = 10;

export default function ExportarScreen() {
  //Inicializacion de los valores utilizados, respectivos al usuario.
  const perfil = useValue(perfil$);

  const alergias = Object.values(useValue(alergias$) ?? {}).filter(
    (a) => a.perfil_id === perfil.id,
  );
  const contactos = Object.values(useValue(contactosEmergencia$) ?? {}).filter(
    (c) => c.perfil_id === perfil.id,
  );
  const condiciones = Object.values(useValue(condiciones$) ?? {}).filter(
    (c) => c.perfil_id === perfil.id,
  );
  const medicamentos = Object.values(useValue(medicamentos$) ?? {}).filter(
    (m) => m.perfil_id === perfil.id,
  );

  //Estados para manejar si el QR fue generado o no, y que mostrar en caso de error

  const [generado, setGenerado] = useState(false);

  const [errorQR, setErrorQR] = useState<string | null>(null);

  //Referencia para el componente del QR

  const refQR = useRef<any>(null);

  //UseEffect en la pagina cuando se abre el QR. Si se inicializa la variable de generado, se le sube el brillo al maximo al dispositivo, y si se regresa se le baja.
  useFocusEffect(
    useCallback(() => {
      if (!generado) return;

      let previo: number | null = null;
      let cancelado = false;

      (async () => {
        try {
          previo = await Brightness.getBrightnessAsync();
          if (!cancelado) await Brightness.setBrightnessAsync(1);
        } catch (e) {
          console.warn("[qr] no se pudo ajustar el brillo", e);
        }
      })();

      return () => {
        cancelado = true;
        if (previo != null)
          Brightness.setBrightnessAsync(previo).catch(() => {});
      };
    }, [generado]),
  );

  if (!perfil.id) {
    return (
      <View className="flex-1">
        <SafeAreaView edges={["top"]} className="bg-surface">
          <TopBar name="QR de emergencia" canGoBack={true} />
        </SafeAreaView>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1C469C" />
        </View>
      </View>
    );
  }

  //Variable donde se almacena el texto del QR generado. Se manda a llamar a la funcion armarQREmergencia
  const textoQR = armarQREmergencia(
    perfil,
    alergias,
    contactos,
    condiciones,
    medicamentos,
  );

  //Variable bool para manejar el caso donde la longitud de QR es mayor a la establecida.
  const largoDeMas = textoQR.length > LARGO;

  const bloques = textoQR.split("\n\n");

  //Funcion para manejar la alerta al exportar el PDF (Cuando se le da al boton de exportar)
  async function exportarPDF() {
    const qrBase64 = await new Promise<string>((r) => refQR.current.toDataURL(r));
    const html = armarCarnetHTML({perfil, alergias, contactos, condiciones, medicamentos, qrBase64})

    const { uri } = await Print.printToFileAsync({ html});
    await shareAsync(uri, { UTI: "com.adobe.pdf", mimeType: "application/pdf" });
  }


  return (
    <View className="flex-1">
      <SafeAreaView edges={["top"]} className="bg-surface">
        <TopBar name="Exportar perfil" canGoBack={true} />
      </SafeAreaView>

      <TopBarSecondary
        active="Emergencia"
        tab1="Emergencia"
        tab2="Expediente"
        route1="/expediente/emergencia"
        route2="/cita/historial"
      />

      <ScrollView
        className="flex-1 bg-surface"
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 100,
          paddingTop: 10,
        }}
      >
        {/* //Lo que se muestra si no esta generado */}
        {!generado ? (
          <>
            <View className="flex-col border border-line-focus rounded-card p-5 mb-5 gap-2 bg-surface-sunken">
              <Text className="text-subheading font-semibold">
                Acceso de emergencia
              </Text>
              <Text className="text-body text-content-muted mb-4">
                Este codigo muestra informacion critica de salud para personal
                medico en caso de emergencia. No requiere que el paciente este
                consciente.
              </Text>
            </View>

            <View className="bg-surface-raised rounded-card border border-line p-5">
              {bloques.map((bloque, i) => {
                const lineas = bloque.split("\n");

                //Primer bloque: identidad. Ultimo: el pie de fecha.
                if (i === 0) {
                  return (
                    <View key={i} className="mb-5">
                      {lineas.map((l, j) => (
                        <Text
                          key={j}
                          className={
                            j === 1
                              ? "text-heading font-bold text-content"
                              : "text-caption text-content-muted"
                          }
                        >
                          {l}
                        </Text>
                      ))}
                    </View>
                  );
                }

                if (lineas.length === 1) {
                  return (
                    <Text
                      key={i}
                      className="text-caption text-content-subtle mt-3"
                    >
                      {lineas[0]}
                    </Text>
                  );
                }

                return (
                  <View key={i} className="mb-5">
                    <Text className="text-label font-bold tracking-wider text-content-subtle mb-2">
                      {lineas[0]}
                    </Text>
                    {lineas.slice(1).map((l, j) => (
                      <Text
                        key={j}
                        className="text-body text-content leading-6"
                      >
                        {l}
                      </Text>
                    ))}
                  </View>
                );
              })}
            </View>

            <Text className="text-caption text-content-subtle mt-3 text-center">
              {textoQR.length} caracteres
            </Text>

            <Pressable
              onPress={() => setGenerado(true)}
              className="bg-primary active:bg-primary-pressed rounded-control py-4 mt-6 items-center"
            >
              <Text className="text-content-on-primary text-body font-semibold">
                Generar codigo QR
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            {largoDeMas && (
              <View className="bg-warning-subtle border-l-4 border-warning rounded-chip p-4 mb-5">
                <Text className="text-caption text-warning-on-subtle">
                  El codigo quedo largo ({textoQR.length} caracteres). Funciona,
                  pero puede costar enfocarlo. Acerque bien la camara.
                </Text>
              </View>
            )}

            <View className="bg-surface-raised rounded-card border border-line p-6 items-center">
              {errorQR ? (
                <Text className="text-body text-danger text-center py-10">
                  {errorQR}
                </Text>
              ) : (
                <QRCode
                  value={textoQR}
                  size={SIZE_QR}
                  quietZone={MARGEN}
                  ecl="M"
                  color="#000000"
                  backgroundColor="#FFFFFF"
                  getRef={(c) => (refQR.current = c)}
                  onError={() => setErrorQR("No se pudo generar el codigo")}
                />
              )}

              <Text className="text-caption text-content-subtle mt-5 text-center">
                Apunte cualquier camara de telefono al codigo. No necesita
                internet ni instalar nada.
              </Text>
            </View>

            <Pressable
              onPress={exportarPDF}
              className="bg-primary active:bg-primary-pressed rounded-control py-4 mt-6 items-center"
            >
              <Text className="text-content-on-primary text-body font-semibold">
                Exportar carnet en PDF
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setGenerado(false)}
              className="rounded-control py-4 mt-2 items-center active:opacity-60"
            >
              <Text className="text-content-muted text-body">
                Ver la informacion
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}
