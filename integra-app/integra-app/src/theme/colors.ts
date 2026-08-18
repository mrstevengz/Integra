//Espejo de la paleta de colores de tailwind.config.js y globa.css
//Es necesario para iconos como lucide, backdrops en android, etc.
//SI SE cambia un valor aqui, tambien hay que cambiar en global.css

export const color = {
  surface:        '#F2F4F7',
  surfaceRaised:  '#FFFFFF',
  surfaceSunken:  '#E3E6ED',

  content:         '#191F29',
  contentMuted:    '#575F70',
  contentSubtle:   '#717B8E',
  contentDisabled: '#9BA2B0',

  border:       '#E3E6ED',
  borderStrong: '#CFD4DD',

  primary:        '#1C469C',
  primaryPressed: '#17367C',
  primarySubtle:  '#F0F6FF',
  primaryBorder:  '#BBD6FB',

  success:       '#17824C',
  successSubtle: '#EFFBF5',
  successDeep:   '#0B4A2B',

  warning:       '#F59F0A',
  warningSubtle: '#FEF8EB',
  warningDeep:   '#9B5E08',

  danger:       '#B81E1E',
  dangerSubtle: '#FEF1F1',
} as const