# La Rústica — Informes de campo

Migración de la versión anterior (localStorage + Google Apps Script) a:
**GitHub (código) → Vercel (hosting + función serverless) → Supabase (base de datos + fotos)**

## Por qué se migró

La versión con Apps Script tenía tres problemas recurrentes al debuggear:
1. Los cambios de código no se reflejaban sin crear una nueva versión de implementación.
2. Los errores quedaban escondidos en el editor de Apps Script, sin logs accesibles fácilmente.
3. Había que esquivar CORS a mano (`text/plain` en vez de `application/json`).

Con Vercel + Supabase: cada `git push` es un deploy real con logs, los errores de la base
de datos aparecen en la consola del navegador y en el dashboard de Supabase, y no hay
que esquivar CORS. Además, ahora las **fotos se guardan de verdad** (Supabase Storage)
en vez de solo contarlas, y la **API key de Anthropic vive server-side**, no en el
localStorage del navegador.

## Identidad visual

Tomada del manual de marca de La Rústica:
- Colores: crema `#E7DBCC`, bronce `#A7926F`, negro `#000000`, gris piedra `#A19587`.
- Tipografías (el manual usa "Retro Team" y "Futurist Fixed-width", ambas de pago —
  se reemplazaron por equivalentes gratuitos de Google Fonts):
  - **Anton** en vez de Retro Team (mismo golpe visual bold/condensado, para títulos).
  - **Share Tech Mono** en vez de Futurist Fixed-width (misma sensación técnica, para datos).
  - **Inter** para el cuerpo del texto (no estaba en el manual, hace falta para párrafos largos).

## Archivos

```
la-rustica/
├── index.html              # App principal (UI + tabs)
├── app.js                  # Lógica: voz, GPS, fotos, llamada a /api, Supabase
├── config.js                # URL + anon key de Supabase (públicas, van al repo)
├── informes-publico.html    # Vista de solo lectura para el socio comercial, sin login
├── manifest.json / sw.js    # PWA
├── icon-192.png / icon-512.png
├── api/
│   └── generate-informe.js  # Función serverless de Vercel: llama a Claude con la API key
├── supabase/
│   └── schema.sql            # Tabla de visitas + políticas + bucket de fotos
├── package.json
├── .env.example
└── README.md
```

## Pasos de instalación

### 1. Supabase
1. Creá un proyecto en supabase.com (gratis).
2. Andá a **SQL Editor** → pegá todo el contenido de `supabase/schema.sql` → **Run**.
3. Andá a **Project Settings → API** y copiá:
   - **Project URL**
   - **anon public key**
4. Pegalas en `config.js` (reemplazá `TU-PROYECTO` y `TU-ANON-KEY`).

> Nota de seguridad: la anon key es pública a propósito (Supabase está diseñado así,
> el control de acceso real lo hacen las políticas RLS del schema). Ese archivo va
> al repo sin problema. Lo que **nunca** va al repo es la API key de Anthropic.

### 2. GitHub
```bash
cd la-rustica
git init
git add .
git commit -m "Migración a Vercel + Supabase"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/la-rustica-informes.git
git push -u origin main
```

### 3. Vercel
1. **New Project** → importá el repo de GitHub.
2. Framework: **Other** (no hace falta build step, son archivos estáticos + `/api`).
3. **Environment Variables** → agregá `ANTHROPIC_API_KEY` con tu key de Anthropic.
4. Deploy.

### 4. Probar
- Abrí la URL de Vercel en el teléfono → agregar a pantalla de inicio.
- Cargá una visita de prueba y confirmá que aparece en Supabase (Table Editor → `visitas`)
  y que la foto quedó en Storage (`fotos-informes`).
- Compartile al socio comercial el link a `/informes-publico.html` — ve todo en
  tiempo real, sin login.

## Flujo de uso (sin cambios respecto a la versión anterior)

1. **Nueva visita** → grabar nota de voz (transcripción en vivo del navegador, editable),
   capturar GPS, sacar fotos.
2. **Generar informe** → la función serverless llama a Claude y arma el informe.
3. Revisar/editar, **Copiar (WhatsApp)** o **Descargar PDF**, **Guardar visita**.
4. **Historial** → filtrar, reabrir, marcar como enviado.

## Límites a tener en cuenta

- Las funciones serverless de Vercel en el plan gratuito tienen un límite de tamaño de
  body (~4.5 MB). Si las fotos son muy pesadas, conviene comprimirlas en el teléfono
  antes de generar el informe (podemos agregarlo si empieza a dar problemas).
- Las políticas de RLS actuales dejan escribir a cualquiera con la anon key (mismo
  nivel de apertura que tenía el Apps Script "cualquier usuario"). Si más adelante
  se necesita restringirlo a usuarios logueados, se agrega Supabase Auth.
