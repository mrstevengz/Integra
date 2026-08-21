import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Pressable,
} from "react-native";
import TopBar from "@/components/TopBar";
import { SafeAreaView } from "react-native-safe-area-context";
import TopBarSecondary from "@/components/TopBarSecondary";
import { GlassView } from "expo-glass-effect";
import { router } from "expo-router";
import { useValue } from "@legendapp/state/react";
import {
  cita$,
  resultadoCita$,
  citasNoResueltas,
  filtrarPorDia,
  fechaDesdeLocalISO,
} from "@/state/cita";
import { perfil$ } from "@/state/usuario";
import {
  fechaLocal,
  formatearFechaAString,
  formatearHoraAString,
} from "@/state/medicacion";
import { Calendar, DateData } from "react-native-calendars";
import { useMemo, useState } from "react";
import { convertirALista } from "@/state/helpers";

export default function CitaScreen() {
  const perfil = useValue(perfil$);
  const citas = useValue(cita$);
  const resultados = useValue(resultadoCita$);

  const [selectedDate, setSelectedDate] = useState<string>("");

  //Todas las citas sin resolver, sin importar si su fecha ya paso. Si no esta en la tabla de resultados, no esta resuelta
  const pendientes = useMemo(
    () => citasNoResueltas(citas, resultados, perfil.id),
    [citas, resultados, perfil.id],
  );

  const citasArray = useMemo(
    () =>
      selectedDate
        ? filtrarPorDia(pendientes, fechaDesdeLocalISO(selectedDate))
        : pendientes,
    [pendientes, selectedDate],
  );

  //En el calendario, solo se marcan los dias con citas pendientes de resolver.
  const markedDates = useMemo(() => {
    const marcas: Record<string, any> = {};
    pendientes.forEach((c) => {
      marcas[fechaLocal(new Date(c.programada_para))] = {
        marked: true,
        dotColor: "#000000",
      };
    });
    if (selectedDate) {
      marcas[selectedDate] = {
        ...marcas[selectedDate],
        selected: true,
        selectedColor: "#000000",
      };
    }
    return marcas;
  }, [pendientes, selectedDate]);

  //Tocar el mismo dia otra vez limpia el filtro y vuelve a mostrar todas.
  const handleDayPress = (day: DateData) => {
    setSelectedDate((actual) => (actual === day.dateString ? "" : day.dateString));
  };

  return (
    <View className="flex-1">
      <SafeAreaView edges={["top"]} className="bg-slate-100">
        <TopBar name="Citas medicas" canGoBack={false} />
      </SafeAreaView>

      <TopBarSecondary
        active="Pendientes"
        tab1="Pendientes"
        tab2="Historial"
        route1="/cita"
        route2="/cita/historial"
      />

      <View>
        <Calendar onDayPress={handleDayPress} markedDates={markedDates} />
      </View>

      <ScrollView className="flex-1 bg-slate-100">
        <Text className="font-semibold uppercase text-label p-4">
          {selectedDate ? "Citas del dia" : "Pendientes"}
        </Text>

        {citasArray.length === 0 && (
          <Text className="text-content-subtle px-4 pb-4">
            {selectedDate
              ? "No hay citas pendientes ese dia."
              : "No tenes citas pendientes."}
          </Text>
        )}

        {citasArray.map((c) => {
          const date = new Date(c.programada_para);
          const sinRegistrar = date.getTime() < Date.now();

          return (
            <Pressable
              key={c.id}
              className="p-6 justify-between flex flex-row items-center border-b border-slate-400 bg-bg-color active:bg-neutral-200"
              onPress={() =>
                router.navigate({
                  pathname: "/cita/[citaId]",
                  params: { citaId: c.id },
                })
              }
            >
              <View className="flex-1">
                <View className="flex-row items-center gap-3 mb-2">
                  <Text className="text-xl font-semibold">{c.especialidad}</Text>
                  {sinRegistrar && (
                    <View className="rounded-chip border border-warning px-2 py-0.5">
                      <Text className="text-caption text-warning-on-subtle font-semibold">
                        Sin registrar
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-md text-slate-500 mb-1">{c.medico}</Text>
                <Text className="text-md">
                  {formatearFechaAString(date, false)},{" "}
                  {formatearHoraAString(date.toLocaleTimeString())}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <GlassView
        style={{
          position: "absolute",
          bottom: 144,
          right: 24,
          height: 64,
          width: 64,
          borderRadius: 32,
          overflow: "hidden",
        }}
        glassEffectStyle="clear"
        tintColor="#000000E6"
        isInteractive
      >
        <TouchableOpacity
          onPress={() => router.navigate("/cita/agregar-cita")}
          accessibilityRole="button"
          className={`flex-1 justify-center items-center ${Platform.OS === "android" ? "bg-txt-color" : ""}`}
        >
          <Text className="text-white text-center items-center text-4xl">
            +
          </Text>
        </TouchableOpacity>
      </GlassView>
    </View>
  );
}
