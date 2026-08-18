import { Alert } from "react-native"


export const deleteAlert = (confirm: () => void) => {
    Alert.alert('Estas seguro que quieres eliminar esta fila', 'Esta accion no puede ser revertida', [
        {
            text: 'Cancelar',
            style: 'cancel'
        },
        {
            text: 'Confirmar',
            onPress: () => confirm(),
        }
    ])
}