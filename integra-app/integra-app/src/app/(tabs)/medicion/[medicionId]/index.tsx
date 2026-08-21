import { deleteAlert } from "@/components/Alert";
import TopBar from "@/components/TopBar";
import { buscarPorId } from "@/state/consultas";
import { formatearFecha } from "@/lib/fechas";
import { formatearHora } from "@/lib/fechas";
import {
  esDoble,
  mediciones$,
  tiposMedicion$,
  TipoMedicion,
} from "@/state/mediciones";
import { useValue } from "@legendapp/state/react";
import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Estado = "bajo" | "normal" | "elevado";

function calcularEstado(valor: number, tipo?: TipoMedicion): Estado | null {
  if (!tipo) return null;
  if (valor < tipo.rango_min) return "bajo";
  if (valor > tipo.rango_max) return "elevado";
  return "normal";
}

const ETIQUETA_ESTADO: Record<Estado, string> = {
  bajo: "BAJO",
  normal: "NORMAL",
  elevado: "ELEVADO",
};

const ESTILO_ESTADO: Record<Estado, { texto: string; icono: string }> = {
  bajo: { texto: "text-warning-on-subtle", icono: "bg-warning" },
  normal: { texto: "text-success-on-subtle", icono: "bg-success" },
  elevado: { texto: "text-warning-on-subtle", icono: "bg-warning" },
};

function labelContexto(contexto: string | null) {
  const map: Record<string, string> = {
    en_ayunas: "En ayunas",
    despues_comer: "Despues de comer",
    antes_dormir: "Antes de dormir",
    en_reposo: "En reposo",
    despues_ejercicio: "Despues de ejercicio",
    otro: "Otro",
  };
  return contexto ? (map[contexto] ?? "—") : "—";
}

export default function DetalleMedicion() {
  const { medicionId } = useLocalSearchParams();
  const mediciones = useValue(mediciones$);
  const tipos = useValue(tiposMedicion$);

  const medicionAEditar = buscarPorId(mediciones, medicionId as string);
  const tipo = buscarPorId(tipos, medicionAEditar?.tipo_medicion_id ?? "");
  const date = new Date(medicionAEditar?.medido_en ?? new Date());

  const doble = tipo ? esDoble(tipo) : false;
  const estado =
    medicionAEditar && !doble
      ? calcularEstado(medicionAEditar.valor, tipo)
      : null;

  const id = medicionAEditar?.id ?? "";

  return (
    <View className="flex-1">
      <SafeAreaView edges={["top"]} className="bg-surface">
        <TopBar name="Detalle de medición" canGoBack={true} />
      </SafeAreaView>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-grow bg-surface"
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: 16,
            paddingHorizontal: 20,
            paddingBottom: 120,
            gap: 16,
          }}
        >
          {/* Card de valor */}
          <View className="rounded-card bg-surface-raised border border-line-strong p-5 gap-4">
            <Text className="text-caption font-semibold text-content-muted uppercase">
              {tipo?.nombre}
            </Text>

            <View className="flex-row items-center gap-1.5">
              <Text className="text-[60px] font-extrabold text-content">
                {medicionAEditar?.valor}
                {doble && ` / ${medicionAEditar?.valor_secundario}`}
              </Text>
              <Text className="text-body text-content-muted mb-1">
                {tipo?.unidad}
              </Text>
            </View>

            {estado && (
              <View className="flex-row items-center justify-between rounded-control bg-surface-raised border border-line px-4 py-3">
                <View className="flex-row items-center gap-2">
                  <View
                    className={`w-3.5 h-3.5 rounded-[3px] ${ESTILO_ESTADO[estado].icono}`}
                  />
                  <Text
                    className={`text-label font-bold ${ESTILO_ESTADO[estado].texto}`}
                  >
                    {ETIQUETA_ESTADO[estado]}
                  </Text>
                </View>
                <Text className="text-caption text-content-muted">
                  {tipo?.rango_min}-{tipo?.rango_max} {tipo?.unidad}
                </Text>
              </View>
            )}
          </View>

          {/* Card de detalles */}
          <View className="rounded-card bg-surface-raised border border-line-strong overflow-hidden">
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-line">
              <Text className="text-body text-content-muted">Fecha</Text>
              <Text className="text-body font-semibold text-content">
                {formatearFecha(date, { mesLargo: true, conAnio: true })}
              </Text>
            </View>

            <View className="flex-row items-center justify-between px-5 py-4 border-b border-line-strong">
              <Text className="text-body text-content-muted">Hora</Text>
              <Text className="text-body font-semibold text-content">
                {formatearHora(date)}
              </Text>
            </View>

            <View className="flex-row items-center justify-between px-5 py-4 border-b border-line-strong">
              <Text className="text-body text-content-muted">Contexto</Text>
              <Text className="text-body font-semibold text-content">
                {labelContexto(medicionAEditar?.contexto ?? null)}
              </Text>
            </View>

            <View className="flex-row items-start justify-between px-5 py-4 gap-4">
              <Text className="text-body text-content-muted">Nota</Text>
              <Text className="text-body font-semibold text-content flex-1 text-right">
                {medicionAEditar?.nota ? medicionAEditar.nota : "Sin nota"}
              </Text>
            </View>
          </View>

          {/* Acciones */}
          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 py-4 bg-surface-raised rounded-control border border-line-strong items-center active:bg-surface-sunken"
              onPress={() =>
                router.navigate({
                  pathname: "/medicion/[medicionId]/editar",
                  params: { medicionId: medicionAEditar?.id },
                })
              }
            >
              <Text className="text-body font-semibold text-content">
                Editar
              </Text>
            </Pressable>

            <Pressable
              className="flex-1 py-4 bg-surface-raised rounded-control border border-line-strong items-center active:bg-danger-subtle"
              onPress={() => {
                deleteAlert(() => {
                  mediciones$[id].delete();
                  router.back();
                });
              }}
            >
              <Text className="text-body font-semibold text-danger">
                Eliminar
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
