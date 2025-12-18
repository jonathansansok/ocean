# 🌊 Oceans React Challenge – Full Stack (React-TS + Express-TS + Supabase)

## 🚀 Demo (Vercel)

- **Frontend:** https://ocean-kihd.vercel.app/
- **Backend (Health):** https://ocean-snowy.vercel.app/health
- **Swagger / OpenAPI (local):** http://localhost:8080/docs/


---

## ✅ Cómo abrir / correr el proyecto (primero esto)

### Opción A — Local (sin Docker)
1) Backend  
- Ir a `app/backend`  
- Instalar dependencias: `npm i`  
- Configurar .env con CREDS. del email enviado
- Levantar: `npm run dev`  
- API: `http://localhost:8080`  
- Health: `http://localhost:8080/health`  
- Swagger (local): `http://localhost:8080/docs`

2) Frontend  
- Ir a `app/frontend`  
- Instalar dependencias: `npm i`  
- Configurar .env con CREDS. del email enviado
- Agregar .env.docker con: `VITE_API_BASE=http://backend:8080`
- Levantar: `npm run dev`  
- App: `http://localhost:5173`

### Opción B — Docker (nota importante)
   Tener`.env.docker` (no usar `.env`).  
- `VITE_API_BASE=http://backend:8080`
- `VITE_SUPABASE_URL=...`
- `VITE_SUPABASE_ANON_KEY=...`
-  Ejecutar `docker compose up --build`

---

## ✅ Cobertura de requisitos del challenge

### Requeridos (cumplidos)
- ✅ Productos: crear (nombre, precio) + listar
- ✅ Órdenes: seleccionar productos + total en tiempo real + flujo de crear/cerrar
- ✅ Dashboard: listar órdenes con items, fecha y total
- ✅ Validación de formularios: Zod + manejo de errores/mensajes claros
- ✅ API REST mínima: `GET /products`, `POST /products`, `GET /orders`, `POST /orders`
- ✅ Frontend: React + TypeScript, buen manejo de estado, componentes reutilizables
- ✅ Backend: Node.js + Express
- ✅ Base de datos: Supabase (PostgreSQL)
- ✅ Deploy: Vercel (frontend + backend)
- ✅ README con instrucciones

### Extras / bonus implementados
- ⭐ Autenticación (Supabase Auth) para `admin` / `mesero`
- ⭐ RBAC por roles aplicado en backend
- ⭐ Asignación de órdenes:
  - mesero: auto-asignación al crear
  - admin: reasignación vía UI + API
- ⭐ Estados de orden: `saved` / `closed` con permisos por rol
- ⭐ Docker para ejecución local (backend)
- ⭐ Logging verbose (FE/BE) para trazabilidad y debugging

---

## 🧰 Tech Stack

- **Frontend:** React (Vite) + TypeScript + React Hook Form + Zod + TailwindCSS
- **Backend:** Node.js + Express + TypeScript + Zod
- **Docs (local):** Swagger UI
- **DB/Auth:** Supabase (PostgreSQL + Auth)
- **Deploy:** Vercel + Supabase

---

## 👤 Roles y acceso

La app soporta dos roles:
- `admin`: crea productos, ve todas las órdenes, asigna/reasigna órdenes, puede cerrar cualquier orden.
- `mesero`: crea órdenes (auto-asignadas), puede cerrar únicamente sus órdenes asignadas.

Quick test:
1) Crear usuario `admin` desde `/register`
2) Crear usuario `mesero` desde `/register`
3) Loguearse y validar permisos desde UI (y localmente desde Swagger)

---

## 📁 Estructura del repo

app/
- backend/
  - api/
  - src/
  - vercel.json
- frontend/
  - src/

---

## 🔑 Variables de entorno

Backend (`app/backend/.env`)
- `PORT=8080`
- `SUPABASE_URL=...`
- `SUPABASE_SERVICE_ROLE_KEY=...`

Frontend (`app/frontend/.env`)
- `VITE_API_BASE=http://localhost:8080`
- `VITE_SUPABASE_URL=...`
- `VITE_SUPABASE_ANON_KEY=...`

Frontend en Docker (`app/frontend/.env.docker`)
- `VITE_API_BASE=http://backend:8080`
- `VITE_SUPABASE_URL=...`
- `VITE_SUPABASE_ANON_KEY=...`

---

## 🗄️ Supabase (Database)

Tablas principales:
- `profiles` (id uuid, email text, role text, created_at timestamptz)
- `products` (id bigint, name text, price numeric, created_at timestamptz)
- `orders` (id bigint, created_by uuid, assigned_to uuid, status text, total numeric, created_at timestamptz)
- `order_items` (id bigint, order_id bigint, product_id bigint, qty int, unit_price numeric, line_total numeric)

---

## ☁️ Deploy (Vercel + Supabase)

1) Supabase  
- Crear proyecto en Supabase  
- Crear tablas / ejecutar SQL de migraciones (si aplica)  
- La app crea perfiles vía `/auth/register`

2) Backend en Vercel  
- Proyecto apuntando a `app/backend`  
- Env vars:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

3) Frontend en Vercel  
- Proyecto apuntando a `app/frontend`  
- Env vars:
  - `VITE_API_BASE` = URL del backend deployado
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

---

## 🔌 API (resumen)

Auth
- `POST /auth/register` — crea usuario (Supabase Auth) + profile (`profiles`)
- `GET /auth/me` — retorna `{ id, email, role }` del usuario autenticado

Products
- `GET /products` — admin/mesero autenticados
- `POST /products` — admin

Orders
- `GET /orders` — admin/mesero autenticados
- `POST /orders` — admin/mesero  
  - mesero: crea y queda asignado a sí mismo  
  - admin: puede crear y reasignar luego  

Endpoints extra (bonus)
- `PATCH /orders/:id/assign` (admin) — asignar/reasignar a un mesero
- `PATCH /orders/:id/status` (admin o mesero asignado) — `saved` / `closed`
- `GET /profiles?role=mesero` (admin) — listar meseros para UI de asignación

---

## 🧪 Quick test (end-to-end)

- Ir al frontend: https://ocean-kihd.vercel.app/register  
- Crear usuario admin  
- Login: https://ocean-kihd.vercel.app/login  
- Crear productos (admin)  
- Crear usuario mesero y generar órdenes desde Orders  
- Volver como admin y reasignar una orden a un mesero  

---

## 🧾 Notas de diseño

- Autenticación con Supabase en frontend; llamadas al backend con Bearer token.
- Backend verifica token con Supabase y aplica RBAC (roles) desde `profiles`.
- Validaciones con Zod en frontend y backend.
- Logs en FE/BE para facilitar debugging en local y deploy.
