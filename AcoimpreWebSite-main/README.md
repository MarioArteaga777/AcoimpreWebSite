# Sitio web ACOIMPRE de R.L.

Sitio estático (9 páginas HTML). El header, footer, `<head>`/SEO y los datos de contacto se definen **una sola vez** y se inyectan en todas las páginas con `build.mjs`.

## Dónde editar qué

| Qué | Dónde |
|---|---|
| Teléfono, WhatsApp, correo, redes sociales, URL del formulario, dominio, títulos y descripciones SEO | `site.config.json` |
| Estructura del header / footer / `<head>` | `partials/*.html` |
| Contenido de cada página | el `.html` correspondiente (fuera de los bloques `build:header` / `build:footer` y de `<head>`) |

Después de cualquier cambio en `site.config.json` o `partials/`:

```bash
npm install        # solo la primera vez (instala Tailwind CLI)
npm run build      # compila css/tailwind.css y regenera las 9 páginas
```

Si aún no has compilado el CSS, las páginas usan temporalmente el CDN de Tailwind (con versión fija). Al existir `css/tailwind.css`, el build lo enlaza automáticamente y el CDN deja de usarse.

## Pendiente de configurar en `site.config.json`
- `siteUrl`: dominio final (activa canonical, og:image, `sitemap.xml` y la línea Sitemap de `robots.txt`).
- `formEndpoint`: URL de Formspree (u otro servicio). Mientras esté vacío, el formulario abre el correo del usuario con el mensaje redactado.
- `social`: URLs reales de Facebook / Instagram / LinkedIn (las vacías no se muestran).
- Confirmar que `phoneDisplay` / `phoneTel` sea el número oficial (había tres distintos).

## Imágenes
`images/gallery/` y `images/optimized/` contienen las versiones WebP (todas < 130 KB). Los originales de cámara (≈57 MB) están en `_originales/` y **no deben subirse** al hosting.
