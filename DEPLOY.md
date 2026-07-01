# Documentación de Despliegue — Sweet Medical

## Plataformas utilizadas

| Componente | Plataforma | URL producción |
|------------|-----------|----------------|
| Backend    | Railway   | https://2026-1c-backend-mn-grupo-16-production.up.railway.app |
| Frontend   | Railway   | https://2026-1c-frontend-mn-grupo-16-production.up.railway.app |
| Base de datos | MongoDB Atlas | (gestionada externamente) |

---

## Primer despliegue

### Requisitos previos

- Cuenta en [Railway](https://railway.app)
- Cuenta en [MongoDB Atlas](https://cloud.mongodb.com) con un cluster creado y usuario configurado
- Acceso al repositorio de GitHub (org `ddsw-mn`)

---

### 1. Despliegue del Backend

1. Entrá a [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Seleccioná el repo `ddsw-mn/2026-1c-backend-mn-grupo-16`
3. Elegí la branch `main`
4. Railway detecta Node.js automáticamente y ejecuta `npm start`
5. Ir a **Variables** y configurar:

| Variable | Descripción |
|----------|-------------|
| `MONGODB_URI` | Connection string de MongoDB Atlas |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT (string largo y aleatorio) |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | URL pública del frontend (completar después de desplegar el frontend) |

6. Ir a **Settings → Networking → Generate Domain**
7. Ingresar el puerto `8080` (Railway asigna dinámicamente el puerto via `$PORT`)
8. Copiar la URL generada — es la URL del backend

---

### 2. Despliegue del Frontend

1. En Railway → **New Project** → **Deploy from GitHub repo**
2. Seleccioná el repo `ddsw-mn/2026-1c-frontend-mn-grupo-16`
3. Elegí la branch `main`
4. Ir a **Variables** y configurar:

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL pública del backend (del paso anterior, con `https://`) |

5. Ir a **Settings → Networking → Generate Domain**
6. Ingresar el puerto `8080`
7. Copiar la URL generada — es la URL del frontend

---

### 3. Actualizar FRONTEND_URL en el backend

1. Volver al servicio backend en Railway → **Variables**
2. Actualizar `FRONTEND_URL` con la URL del frontend (con `https://`)
3. Railway re-deployea automáticamente

---

## Despliegue de nuevas releases

Railway está configurado para deployar automáticamente ante cada push a `main`. El flujo es:

1. Desarrollar cambios en una branch de feature/fix
2. Crear Pull Request hacia `main`
3. Revisar y hacer merge del PR
4. Railway detecta el push a `main` y re-deployea automáticamente el servicio correspondiente

No se requiere ninguna acción manual adicional.

### Re-deploy manual (si es necesario)

En Railway → servicio → **Deployments** → click en `...` del último deployment → **Redeploy**

---

## Variables de entorno requeridas

### Backend

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `MONGODB_URI` | Sí | Connection string MongoDB Atlas |
| `JWT_SECRET` | Sí | Clave para firmar JWT |
| `NODE_ENV` | Sí | `production` |
| `FRONTEND_URL` | Sí | URL del frontend (para CORS) |

### Frontend

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `NEXT_PUBLIC_API_URL` | Sí | URL del backend |

> **Nota:** `NEXT_PUBLIC_API_URL` es una variable build-time de Next.js. Si se modifica, se debe hacer un redeploy manual para que tome efecto.
