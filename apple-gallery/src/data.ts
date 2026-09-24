// Marca y producto ficticios: el proyecto reproduce el lenguaje visual, no la marca.
export const BRAND = 'Nocturne'
export const PRODUCT = 'Nocturne One Pro'

export const globalLinks = ['Tienda', 'Teléfonos', 'Portátiles', 'Tablets', 'Relojes', 'Audio', 'Hogar', 'Soporte']

export const sectionLinks = [
  { id: 'highlights', label: 'Destacados' },
  { id: 'features', label: 'Capacidades' },
  { id: 'compare', label: 'Comparar' },
  { id: 'models', label: 'Modelos' },
]

export type Slide = {
  id: string
  eyebrow: string
  title: string
  scene: 'lens' | 'chip' | 'night'
}

export const slides: Slide[] = [
  { id: 'camera', eyebrow: 'Cámara', title: 'Un teleobjetivo 5x que ve en la oscuridad.', scene: 'lens' },
  { id: 'chip', eyebrow: 'Rendimiento', title: 'El chip N5 Pro. Silencioso. Implacable.', scene: 'chip' },
  { id: 'night', eyebrow: 'Modo noche', title: 'La medianoche, con todo su detalle.', scene: 'night' },
]

export type Metric = {
  icon: 'chip' | 'battery' | 'camera' | 'display' | 'shield' | 'button'
  stat: string
  label: string
  isNew?: boolean
  accent?: 'yellow'
}

export const metrics: Metric[] = [
  { icon: 'chip', stat: 'Hasta 40% más rápido', label: 'CPU de 6 núcleos con el nuevo chip N5 Pro.', isNew: true },
  { icon: 'battery', stat: 'Hasta 33 h', label: 'De reproducción de video con una sola carga.' },
  { icon: 'camera', stat: '48 MP', label: 'Tres cámaras Fusion, con teleobjetivo 5x.', accent: 'yellow' },
  { icon: 'display', stat: '3000 nits', label: 'Pantalla XDR con brillo máximo en exteriores.' },
  { icon: 'shield', stat: '2x', label: 'Más resistente a caídas con el nuevo frente cerámico.' },
  { icon: 'button', stat: 'Control de cámara', label: 'Un gesto para disparar, hacer zoom y ajustar.', isNew: true },
]

export type Device = {
  id: string
  name: string
  year: number
  chip: string
  battery: number // horas de video
  camera: number // MP del sensor principal
  zoom: number // zoom óptico
  brightness: number // nits
}

export const current: Device = {
  id: 'one-pro', name: PRODUCT, year: 2026, chip: 'N5 Pro', battery: 33, camera: 48, zoom: 5, brightness: 3000,
}

export const legacyDevices: Device[] = [
  { id: 'one-pro-2024', name: 'Nocturne One Pro (2024)', year: 2024, chip: 'N3 Pro', battery: 27, camera: 48, zoom: 5, brightness: 2000 },
  { id: 'one-2023', name: 'Nocturne One (2023)', year: 2023, chip: 'N2', battery: 20, camera: 48, zoom: 2, brightness: 2000 },
  { id: 'one-mini-2022', name: 'Nocturne One mini (2022)', year: 2022, chip: 'N1', battery: 17, camera: 12, zoom: 2, brightness: 1200 },
  { id: 'lite-2021', name: 'Nocturne Lite (2021)', year: 2021, chip: 'L1', battery: 15, camera: 12, zoom: 1, brightness: 800 },
]

export type Model = {
  id: string
  name: string
  tagline: string
  price: string
  finishes: string[]
  isNew?: boolean
}

export const models: Model[] = [
  { id: 'pro', name: 'One Pro', tagline: 'La cámara más avanzada que hemos hecho.', price: 'Desde 1.199 €', finishes: ['#4a1320', '#2c2c2e', '#d9d4cc', '#1f2a36'], isNew: true },
  { id: 'one', name: 'One', tagline: 'Todo lo esencial, con un salto enorme.', price: 'Desde 899 €', finishes: ['#1d1d1f', '#e8e1f4', '#cfe3d6', '#f2d7d9'], isNew: true },
  { id: 'lite', name: 'Lite', tagline: 'Potencia seria. Precio amable.', price: 'Desde 599 €', finishes: ['#1d1d1f', '#f5f5f7'] },
]
