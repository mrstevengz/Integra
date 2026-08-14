import Ionicons from '@expo/vector-icons/Ionicons';

import {Icon, Label, NativeTabs, VectorIcon} from 'expo-router/unstable-native-tabs'
import { DynamicColorIOS, Platform } from 'react-native';



export default function TabsLayout() {
  return (
    <NativeTabs
    labelVisibilityMode="labeled" 
    indicatorColor={Platform.OS === 'android' ? '#000000' : undefined}
    iconColor={{
        default: Platform.OS === 'android' ? '#888888' : '#000000',
        selected: Platform.OS === 'android' ? '#FFFFFF' : '#000000',
      }}
    labelStyle={{
        default: { color: '#888888' },
        selected: { color: '#000000' },
      }}
    >
      <NativeTabs.Trigger name="index">
        <Label>Inicio</Label>
        <Icon 
        src = {Platform.OS === 'android' ? require("../../../assets/icons/home_icon.png") : undefined}
        sf = {Platform.OS === 'ios' ? "house" : undefined}/>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="medicacion">
        <Label>Medicacion</Label>
        <Icon 
        src = {Platform.OS === 'android' ? require("../../../assets/icons/pill.png") : undefined}
        sf = {Platform.OS === 'ios' ? "pill" : undefined}/>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="medicion">
        <Label>Mediciones</Label>
        <Icon 
        sf={Platform.OS === 'ios' ? "cross.case" : undefined}
        src={Platform.OS === 'android' ? require("../../../assets/icons/mediciones.png") : undefined}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="cita">
        <Label>Citas</Label>
        <Icon 
        sf={Platform.OS === 'ios' ? "calendar.badge" : undefined}
        src={Platform.OS === 'android' ? require("../../../assets/icons/citas.png") : undefined}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="expediente">
        <Label>Expediente</Label>
        <Icon 
        sf={Platform.OS === 'ios' ? "person.text.rectangle" : undefined}
        src={Platform.OS === 'android' ? require("../../../assets/icons/expediente.png") : undefined}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
