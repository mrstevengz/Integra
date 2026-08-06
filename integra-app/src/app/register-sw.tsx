'use client'
import { useEffect } from 'react'

//Componente basico para llamar y registrar el service worker
export default function RegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
    }
  }, [])
  return null
}