# Midnight Gallery

Landing de producto oscura, estilo "galería de hardware a medianoche", construida a partir de un
Style Reference de Apple. Marca y producto (**Nocturne One Pro**) son ficticios: se reproduce el
lenguaje visual, no la marca.

Proyecto independiente del frontend de soporte: tiene su propio `package.json` y lockfile.

## Stack

Vite 8 · React 19 · TypeScript strict · oxlint · Inter Variable (sustituto de SF Pro).

## Puesta en marcha

```bash
cd apple-gallery
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # tsc -b && vite build
pnpm lint
```

## Estructura

```
src/
  styles/tokens.css       Tokens del Style Reference (colores, tipografía, espaciado, radios, superficies)
  styles/base.css         Reset y estilos globales
  styles/components.css   Estilos de cada componente
  data.ts                 Contenido: secciones, métricas, dispositivos, modelos
  components/
    GlobalNav             Barra global de 44px, #000, 12px/400
    AnnouncementStrip     Tira promocional en Carbon con enlace Electric Link
    ProductNav            Barra de producto sticky, radio de 20px, keyline de 1px y fondo con blur; resalta la sección visible
    HeroStage             Escenario Obsidian: render del teléfono, titular de 80px, cápsula de precio y botón azul de compra
    PhoneRender           Render SVG del dispositivo en acabado burdeos
    Highlights            Marco de medios de 28px con carrusel automático y paginador translúcido
    FeatureTiles          Tiles de métricas: chip, batería verde, cámara con acento amarillo, marcador "Nuevo"
    ComparisonPanel       Panel Carbon con selector de dispositivo y rejilla de comparación dinámica
    PaleComparison        Tarjetas blancas de modelos con enlaces Cobalt
    Footer                Pie legal sobre Porcelain
```

## Decisiones respecto al Style Reference

- El documento lista `"numr"` como feature OpenType, pero en Inter convierte los dígitos y algunas
  letras en superíndices, así que no se aplica.
- No hay sombras: la separación entre capas se consigue con cambios de superficie, keylines de 1px y radios de 28px.
- El azul `#0071e3` solo se usa en los botones de compra; los enlaces usan `#2997ff` sobre fondos oscuros y `#0066cc` sobre fondos claros.
- Las animaciones respetan `prefers-reduced-motion`.
