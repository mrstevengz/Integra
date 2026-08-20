import { retornarObjetoPorId } from "@/state/helpers";
import { Toma, medicamento$ } from "@/state/medicacion";
import { useValue } from "@legendapp/state/react";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { View, Pressable, Text } from "react-native";
import { marcarComoTomada, posponerToma } from "./acciones";
import { retornarIcono } from "./TomasDelDia";

interface ComponenteProps {
  tomas: Toma[];
}

export function TomaComponente({ tomas }: ComponenteProps) {
  const sinResolver = tomas.filter(
    (t) => t.estado === "pendiente" || t.estado === "pospuesta",
  );

  const [pospuesta, setPospuesta] = useState(false);

  const medicinas = useValue(medicamento$);

  const hoy = new Date();

  const tomaReciente =
    sinResolver.length > 0
      ? sinResolver.reduce((a, b) => {
          const diffA = Math.abs(
            new Date(a.programada_para).getTime() - hoy.getTime(),
          );
          const diffB = Math.abs(
            new Date(b.programada_para).getTime() - hoy.getTime(),
          );
          return diffB < diffA ? b : a;
        })
      : undefined;

  const medicamentoReciente = tomaReciente
    ? retornarObjetoPorId(medicinas, tomaReciente.medicamento_id)
    : undefined;

  const tiempoParaTomar = new Date(tomaReciente?.programada_para ?? "");
  const tiempoActual = new Date();
  const diff = +tiempoParaTomar - +tiempoActual;

  useEffect(() => {
    setPospuesta(false);
  }, [tomaReciente]);

  //Funcion para obtener el tiempo restante. Calcula los valores que se recomponen de tiempoParaTomar, tiempoActual y diff (diff da el tiempo en ms)
  function getTimeRemaining() {
    //Si es positivo, es en el futuro, si no en el pasado
    if (diff > 0) {
      const diffInMs = Math.abs(diff);
      const hours = Math.floor(diffInMs / (1000 * 60 * 60));
      const minutes = Math.floor(diffInMs / (1000 * 60));

      return (
        <Text>
          {hours > 0
            ? `En ${hours}h ${minutes - hours * 60}min`
            : `En ${minutes - hours * 60}min`}
        </Text>
      );
    } else {
      const diffInMs = Math.abs(diff);
      const hours = Math.floor(diffInMs / (1000 * 60 * 60));
      const minutes = Math.floor(diffInMs / (1000 * 60));

      return (
        <Text className="text-red-400">
          {hours > 0
            ? `Hace ${hours}h ${minutes - hours * 60}min`
            : `Hace ${minutes - hours * 60}min`}
        </Text>
      );
    }
  }

  return (
    <View className="w-full">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-btn-color text-md font-semibold uppercase tracking-wider">
          Próxima toma
        </Text>

        <Pressable
          onPress={() => router.push("/medicacion")}
          hitSlop={8}
          accessibilityRole="button"
        >
          <Text className="text-neutral-400 text-md font-medium">
            Ver todas
          </Text>
        </Pressable>
      </View>

      {!tomaReciente ? (
        <View className="rounded-2xl border border-neutral-200 bg-white p-5 items-center">
          <Text className="text-neutral-500 text-sm">
            No hay tomas pendientes por hoy
          </Text>
        </View>
      ) : (
        <>
          <View className="flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm ">
            {/* //Texto, icono y hora */}
            <View className="flex flex-row items-center">
              <View className="flex-2 p-4 items-center justify-center rounded-xl bg-slate-200 border border-slate-300 mr-4">
                {retornarIcono(medicamentoReciente?.forma)}
              </View>

              <View className="flex-1 pr-3">
                <Text className="text-base font-bold text-neutral-900 tracking-tight">
                  {medicamentoReciente
                    ? `${medicamentoReciente.nombre} ${medicamentoReciente.dosis}${medicamentoReciente.unidad}`
                    : "Medicamento"}
                </Text>

                {medicamentoReciente?.con_alimentos &&
                  medicamentoReciente.con_alimentos !== "indiferente" && (
                    <Text className="text-xs text-neutral-500 mt-0.5">
                      {medicamentoReciente.con_alimentos === "con"
                        ? "Con alimentos"
                        : "Sin alimentos"}
                    </Text>
                  )}
              </View>

              <View className="items-end">
                <Text className="text-base font-bold text-neutral-900">
                  {new Date(tomaReciente.programada_para).toLocaleTimeString(
                    "es-CR",
                    {
                      hour: "numeric",
                      minute: "2-digit",
                    },
                  )}
                </Text>
                <Text className="text-xs text-neutral-400 mt-0.5">
                  {getTimeRemaining()}
                </Text>
              </View>
            </View>

            {/* //Botones */}
            <View className="flex-row gap-3 mt-3">
              <Pressable
                onPress={() => marcarComoTomada(tomaReciente.id)}
                accessibilityRole="button"
                className="flex-1 bg-btn-color rounded-2xl py-4 items-center active:opacity-90 shadow-sm"
              >
                <Text className="text-bg-color font-semibold text-base">
                  ✓ Tomado
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  posponerToma(tomaReciente.id, 15);
                  setPospuesta(true);
                }}
                accessibilityRole="button"
                disabled={pospuesta}
                className={`flex-1 border border-btn-color rounded-2xl py-4 items-center active:bg-neutral-color ${pospuesta && "bg-slate-200"}`}
              >
                <Text className="text-btn-color font-semibold text-base">
                  {pospuesta ? `Pospuesta (15 min)` : `Posponer`}
                </Text>
              </Pressable>
            </View>
          </View>
        </>
      )}
    </View>
  );
}
