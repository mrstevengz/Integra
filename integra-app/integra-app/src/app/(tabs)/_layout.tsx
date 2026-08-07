import {Icon, Label, NativeTabs} from 'expo-router/unstable-native-tabs'
import { DynamicColorIOS, Platform } from 'react-native';


const activeTint = Platform.OS === "ios" ? DynamicColorIOS({light: "#0F7C7C", dark: "84D3C4"}) : "#0F7C7C"

export default function TabsLayout() {
  return (
    <NativeTabs tintColor={activeTint}>
      <NativeTabs.Trigger name="index">
        <Label>Inicio</Label>
        <Icon sf="house" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="medicacion">
        <Label>Medicacion</Label>
        <Icon sf="pill" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="medicion">
        <Label>Mediciones</Label>
        <Icon sf="cross.case" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="cita">
        <Label>Citas</Label>
        <Icon sf="calendar.badge" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="expediente">
        <Label>Expediente</Label>
        <Icon sf="person.text.rectangle" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
