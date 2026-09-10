# Clinch Fight Co — Frontend

Tienda + panel admin (React + Vite).

## Desarrollo local

```bash
cp .env.example .env
npm install
npm run dev
```

Tienda: `http://localhost:5173`  
Admin login: `http://localhost:5173/clinch/naz`

Con el API local en `:3000`, dejá `VITE_API_URL=/api` (el proxy de Vite lo reenvía).

## Variables (Vercel)

| Variable | Obligatorio | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | Sí en prod | `https://tu-api.up.railway.app/api` |
| `VITE_WHATSAPP_NUMBER` | No | `5491131604552` |

Ver `.env.production.example`.

## Deploy en Vercel

1. [vercel.com](https://vercel.com) → **Add New Project** → importá este repo (`clinch-frontend`).
2. Framework: Vite (detectado). Build: `npm run build`. Output: `dist`.
3. Environment Variables → `VITE_API_URL` = URL del backend + `/api`.
4. Deploy.
5. Copiá la URL de Vercel (ej. `https://clinch-frontend.vercel.app`) y en el backend seteá:
   - `FRONTEND_URL=https://clinch-frontend.vercel.app`
   - `CORS_ALLOW_VERCEL_PREVIEWS=true`
   - `COOKIE_SECURE=true`
6. Redeploy del backend si hace falta para aplicar CORS.

El `vercel.json` ya incluye rewrite SPA (`/*` → `index.html`).

## Orden sugerido

1. Supabase (Postgres) listo  
2. Deploy **backend** (Railway/Render) + seed  
3. Deploy **frontend** (Vercel) con `VITE_API_URL`  
4. Actualizar `FRONTEND_URL` en el backend

## Publicar a GitHub (cuando quieras)

Este directorio ya es un repo git **local** (sin remote). Después de crear el repo vacío en GitHub:

```bash
git remote add origin https://github.com/TU_USUARIO/clinch-frontend.git
git push -u origin main
```
