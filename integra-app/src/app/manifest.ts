import type {MetadataRoute} from 'next'

//Metadata de la app para telefonos. Aqui se asignan los iconos y se configura todo como que fuera una app instalable
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Integra App',
        short_name: 'Integra',
        description: 'Integra-App',
        start_url: '/inicio',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
    }
}