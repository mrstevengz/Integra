import { Storage } from 'expo-sqlite/kv-store'

//TEMPORAL: borra todo el cache local al arrancar.
//Correr una vez y luego BORRAR este archivo y su import.
Storage.clearSync()
console.log('>>> CACHE LOCAL BORRADO <<<')