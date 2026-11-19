# Sitio web ACOIMPRE de R.L.

Sitio web institucional de **ACOIMPRE de R.L.**, cooperativa de ahorro y crédito. Es un sitio **estático** (HTML + Tailwind CSS + JavaScript sin framework) de 9 páginas, con un script de build sin dependencias que inyecta el `<head>`, el header y el footer compartidos, y genera `robots.txt` y `sitemap.xml`.

## Contenido

| Página | Archivo | Descripción |
|---|---|---|
| Inicio | `index.html` | Presentación de la cooperativa y accesos rápidos |
| Nosotros | `nosotros.html` | Misión, visión y valores |
| Servicios | `servicios.html` | Servicios financieros y beneficios |
| Ahorros | `ahorros.html` | Productos de ahorro |
| Simulador de Crédito | `simulador-credito.html` | Cuota mensual, interés total y tabla de amortización |
| Información de Asociados | `informacion-asociados.html` | Beneficios, canales de atención y productos |
| Galería de Eventos | `galeria.html` | Fotografías de asambleas y actividades |
| Contacto | `contacto.html` | Formulario, teléfono, WhatsApp, correo, ubicación y mapa |
| Hazte Socio | `haztesocio.html` | Descarga de formularios para asociarse |

### Simulador de crédito
- Monto: **$100 – $500,000** (paso de $100). Plazo: **1 – 40 años**.
- El campo numérico y el slider comparten el mismo rango y se mantienen sincronizados; los valores fuera de rango se ajustan al límite.
- Tipos de préstamo disponibles: Crédito Extraordinario sobre Ahorro, Préstamo sobre Aportes, Préstamos Personales, Préstamos Express, Pago de Tarjetas de Crédito y Préstamos para Gastos Médicos y Funerarios.
- La tasa mostrada es 15 % para todos los tipos, excepto Express (24 %).

### Canales de contacto
- **+503 2212-0810**: solo llamadas.
- **+503 7740-4412**: solo atención por WhatsApp (mensajes, no recibe llamadas).
- **Correo**: tarjeta destacada en Contacto con botón para enviar un correo.
- La tarjeta de atención en *Información de Asociados* enlaza al formulario de contacto del sitio (`contacto.html#formulario-contacto`), no a WhatsApp.

## Tecnologías

- HTML5 y JavaScript (vanilla)
- [Tailwind CSS](https://tailwindcss.com) 3.4.17 (compilado con la CLI, sin CDN en producción)
- [Lucide](https://lucide.dev) 0.468.0 para los íconos (cargado desde unpkg)
- Node.js (solo para el build; el sitio publicado no lo necesita)

## Estructura del proyecto

```
├── *.html                  # 9 páginas (el contenido propio de cada una se edita aquí)
├── partials/
│   ├── head.html           # <head> y SEO compartido
│   ├── header.html         # Navegación
│   └── footer.html         # Pie de página
├── src/input.css           # Entrada de Tailwind
├── css/
│   ├── tailwind.css        # CSS compilado (generado)
│   └── simulador.css       # Estilos del simulador (sliders)
├── js/
│   ├── main.js             # Menú móvil e íconos
│   └── config.js           # Datos del formulario (generado por el build)
├── images/                 # Logos, favicon, og-image, galería y fotos optimizadas (WebP)
├── documentos/             # Formularios descargables (PDF y XLSX)
├── site.config.json        # Datos del sitio: contacto, navegación, SEO por página
├── build.mjs               # Script de build de HTML
├── tailwind.config.cjs     # Configuración de Tailwind
└── package.json
```

## Puesta en marcha

Requisitos: **Node.js** (versión LTS reciente) y npm.

```bash
npm install        # solo la primera vez (instala la CLI de Tailwind)
npm run build      # compila css/tailwind.css y regenera las 9 páginas
```

Para verlo en local, abre la carpeta con **Live Server** (VS Code) o cualquier servidor estático.

### Scripts

| Comando | Qué hace |
|---|---|
| `npm run build` | Compila el CSS y regenera las páginas (usar antes de publicar) |
| `npm run build:css` | Solo compila `css/tailwind.css` (minificado) |
| `npm run build:html` | Solo regenera head/header/footer, `robots.txt`, `sitemap.xml` y `js/config.js` |
| `npm run watch:css` | Recompila el CSS automáticamente mientras desarrollas |

> Si `css/tailwind.css` no existe, el build enlaza temporalmente el CDN de Tailwind y el navegador mostrará la advertencia *"cdn.tailwindcss.com should not be used in production"*. Ejecuta `npm run build` para evitarla.

## Dónde editar qué

| Qué quieres cambiar | Dónde |
|---|---|
| Teléfono, WhatsApp, correo, redes sociales, dominio, URL del formulario, títulos y descripciones SEO, menú | `site.config.json` |
| Estructura del header, footer o `<head>` | `partials/*.html` |
| Contenido de una página | El `.html` correspondiente, **fuera** de `<head>` y de los bloques `build:header` / `build:footer` |
| Rangos o tasas del simulador | `simulador-credito.html` (constante `LIMITS` y selector de tipo de préstamo) |

Después de cambiar `site.config.json`, `partials/` o clases de Tailwind, ejecuta `npm run build`.

> **No edites a mano** el contenido entre `<!-- build:header -->` / `<!-- build:footer -->`, el `<head>` ni `js/config.js`: el build los sobrescribe.

## Formulario de contacto

- Si `formEndpoint` (en `site.config.json`) tiene una URL de [Formspree](https://formspree.io) u otro servicio, el formulario envía los datos por `fetch`.
- Si está vacío, el formulario abre el correo del usuario con el mensaje ya redactado (`mailto:`).
- Incluye un campo trampa (*honeypot*) contra spam.

## Pendiente de configurar en `site.config.json`

- `siteUrl`: dominio final, sin barra al final (activa canonical, `og:url`, `og:image`, `sitemap.xml` y la línea Sitemap de `robots.txt`).
- `formEndpoint`: URL del servicio de formularios.
- `social`: URLs reales de Facebook, Instagram y LinkedIn (las vacías no se muestran en el footer).

## Publicación

Sube al hosting estático el contenido del proyecto **sin** `node_modules/`, `src/`, `partials/`, `build.mjs`, `package*.json` ni `tailwind.config.cjs` (solo se necesitan para compilar). Antes de subir, ejecuta `npm run build`.

## Imágenes

`images/gallery/` y `images/optimized/` contienen versiones WebP ligeras. Los originales de cámara (`_originales/`, fuera del repositorio por `.gitignore`) no deben subirse al hosting.
