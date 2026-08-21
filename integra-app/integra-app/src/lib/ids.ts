import * as Crypto from 'expo-crypto'

export function crearId(): string {
    return Crypto.randomUUID()
}