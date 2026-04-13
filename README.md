# Dr. Fries

Frontend en React + Vite con backend Express dentro de `server/` para integrar Fudo por API GENERAL.

## Backend actual

La API backend vive en `server/src` y reutiliza esta estructura:

- `server/src/config`
- `server/src/controllers`
- `server/src/middlewares`
- `server/src/routes`
- `server/src/services`
- `server/src/app.js`
- `server/src/server.js`

Endpoints principales disponibles:

- `GET /api/health`
- `GET /api/fudo/health`
- `GET /api/fudo/products`
- `GET /api/fudo/products?includeRaw=true`

Compatibilidad local:

- `GET /health`
- `GET /fudo/health`
- `GET /fudo/products`

## Variables de entorno

Crea un archivo `.env` en la raiz del proyecto a partir de `.env.example`.

Variables usadas por el backend:

- `PORT`
- `NODE_ENV`
- `CLIENT_ORIGIN`
- `FUDO_API_KEY`
- `FUDO_API_SECRET`
- `FUDO_API_BASE_URL`
- `FUDO_AUTH_URL`

Ejemplo base:

```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000
FUDO_API_KEY=
FUDO_API_SECRET=
FUDO_API_BASE_URL=https://api.fu.do/v1alpha1
FUDO_AUTH_URL=https://auth.fu.do/api
```

## Desarrollo local

Instalar dependencias:

```bash
npm install
```

Levantar el backend en modo desarrollo:

```bash
npm run server:dev
```

Levantar el frontend:

```bash
npm run dev
```

El backend escuchara en `http://localhost:5000` por defecto.

## Pruebas con Postman

### 1. Health general

`GET http://localhost:5000/api/health`

Respuesta esperada:

```json
{
  "status": "OK",
  "service": "drfries-server",
  "environment": "development"
}
```

### 2. Health Fudo

`GET http://localhost:5000/api/fudo/health`

Si `FUDO_API_KEY` y `FUDO_API_SECRET` estan configurados, el backend intenta autenticar contra Fudo y devuelve el estado del token cacheado.

### 3. Productos Fudo

`GET http://localhost:5000/api/fudo/products`

Consulta internamente:

- `GET /products`
- `filter[active]=true`
- `include=productCategory`
- `page[size]=100`
- `sort=name`

Para incluir el payload crudo de Fudo en la misma respuesta:

`GET http://localhost:5000/api/fudo/products?includeRaw=true`

## Produccion y cPanel

El backend esta preparado para ejecutarse como Node.js App en cPanel:

1. Sube el repositorio al servidor.
2. En cPanel abre `Setup Node.js App`.
3. Define como Application Root la carpeta del proyecto.
4. Define como Application Startup File: `server/src/server.js`
5. Configura las variables de entorno del backend:
   - `NODE_ENV=production`
   - `PORT` asignado por cPanel
   - `CLIENT_ORIGIN=https://tu-dominio.com`
   - `FUDO_API_KEY`
   - `FUDO_API_SECRET`
   - `FUDO_API_BASE_URL`
   - `FUDO_AUTH_URL`
6. Ejecuta `npm install` dentro del proyecto.
7. Reinicia la aplicacion desde cPanel.

Notas:

- El servidor Express escucha siempre `process.env.PORT`.
- En produccion, CORS solo permite el origen configurado en `CLIENT_ORIGIN`.
- La autenticacion Fudo reutiliza token en memoria y lo refresca automaticamente al expirar.
- La base queda lista para agregar despues modulos de `sales`, `items` y `payments`.
