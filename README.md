# 🌊 Oceans React Challenge – Full Stack (React + Express + Supabase)

Aplicación web para la gestión de órdenes en un restaurante (productos + órdenes + dashboard), con autenticación, roles y despliegue completo.

## 🚀 Demo (Vercel)

- **Frontend:** https://ocean-kihd.vercel.app/
- **Backend:** https://ocean-snowy.vercel.app/health
- **Swagger / OpenAPI:** http://localhost:8080/docs/
- **Health:** https://ocean-snowy.vercel.app/health

## ✅ Cobertura de requisitos del challenge

### Requeridos (cumplidos)
- ✅ Productos: crear (nombre, precio) + listar
- ✅ Órdenes: seleccionar productos + total en tiempo real + flujo de crear/cerrar
- ✅ Dashboard de órdenes: listar todas las órdenes + items + fecha + total
- ✅ Validación de formularios: Zod + manejo de errores/mensajes claros
- ✅ API REST mínima: `GET /products`, `POST /products`, `GET /orders`, `POST /orders`
- ✅ Frontend: React + TypeScript, buen manejo de estado, componentes reutilizables
- ✅ Backend: Node.js + Express
- ✅ Base de datos: Supabase (PostgreSQL)
- ✅ Documentación: Swagger/OpenAPI + README con instrucciones
- ✅ Deploy: Vercel (frontend + backend)

### Extras / puntos adicionales (implementados)
- ⭐ Autenticación (Supabase Auth) para `admin` / `mesero`
- ⭐ RBAC por roles aplicado en backend
- ⭐ Asignación de órdenes:
  - mesero: auto-asignación al crear
  - admin: reasignación vía UI + API
- ⭐ Estados de orden: `saved` / `closed` con permisos por rol
- ⭐ Docker para ejecución local
- ⭐ Logging verbose (FE/BE) para trazabilidad y debugging

## 🧰 Tech Stack

- **Frontend:** React (Vite) + TypeScript + React Hook Form + Zod + TailwindCSS
- **Backend:** Node.js + Express + TypeScript + Zod + Swagger/OpenAPI
- **DB/Auth:** Supabase (PostgreSQL + Auth)
- **Deploy:** Vercel (frontend y backend) + Supabase (DB/Auth)

---

## ✅ Features (requeridos)

### Productos
- Crear productos (**solo admin**): nombre + precio
- Listar productos disponibles (usuarios autenticados)

### Órdenes
- Seleccionar productos del catálogo
- Mostrar total en tiempo real
- Guardar orden
- Dashboard/listado de órdenes con items, fecha y total

### Formularios + Validación
- Validaciones con **Zod** (frontend y backend)
- Manejo de errores con mensajes claros + logs para debugging

---

## ⭐ Extras implementados (bonus)

- 🔐 Autenticación con Supabase Auth (login)
- 🧩 RBAC por roles `admin` / `mesero` aplicado en backend
- 👨‍🍳 Asignación de órdenes
  - Mesero: crea orden y queda **auto-asignada** a sí mismo
  - Admin: puede **asignar/reasignar** una orden a cualquier mesero
- 🔄 Estados de orden: `saved` (en trámite) / `closed` (entregada)
  - Mesero: puede cerrar **solo** órdenes asignadas a sí mismo
  - Admin: puede cerrar cualquiera
- 📄 Swagger/OpenAPI publicado en `/docs`
- 🐳 Docker para ejecución local (backend)
- 🔍 Logging verbose (`console.log`) en frontend/backend para trazabilidad end-to-end

---

## 👤 Roles y acceso

La app soporta dos roles:

- `admin`: crea productos, ve todas las órdenes, asigna/reasigna órdenes, puede cerrar cualquier orden.
- `mesero`: crea órdenes (auto-asignadas), puede cerrar únicamente sus órdenes asignadas.

Para probar rápido:
1) Crear una cuenta desde `/register` con rol `admin`
2) Crear otra cuenta con rol `mesero`
3) Loguearse y validar permisos desde UI + Swagger

---

## 📁 Estructura del repo

# 🌊 Oceans React Challenge – Full Stack (React + Express + Supabase)

Aplicación web para la gestión de órdenes en un restaurante (productos + órdenes + dashboard), con autenticación, roles y despliegue completo.

## 🚀 Demo (Vercel)

- **Frontend:** https://ocean-kihd.vercel.app/
- **Backend:** https://ocean-snowy.vercel.app/
- **Swagger / OpenAPI:** https://ocean-snowy.vercel.app/docs
- **Health:** https://ocean-snowy.vercel.app/health

---

## 🧰 Tech Stack

- **Frontend:** React (Vite) + TypeScript + React Hook Form + Zod + TailwindCSS
- **Backend:** Node.js + Express + TypeScript + Zod + Swagger/OpenAPI
- **DB/Auth:** Supabase (PostgreSQL + Auth)
- **Deploy:** Vercel (frontend y backend) + Supabase (DB/Auth)

---

## ✅ Features (requeridos)

### Productos
- Crear productos (**solo admin**): nombre + precio
- Listar productos disponibles (usuarios autenticados)

### Órdenes
- Seleccionar productos del catálogo
- Mostrar total en tiempo real
- Guardar orden
- Dashboard/listado de órdenes con items, fecha y total

### Formularios + Validación
- Validaciones con **Zod** (frontend y backend)
- Manejo de errores con mensajes claros + logs para debugging

---

## ⭐ Extras implementados (bonus)

- 🔐 Autenticación con Supabase Auth (login)
- 🧩 RBAC por roles `admin` / `mesero` aplicado en backend
- 👨‍🍳 Asignación de órdenes
  - Mesero: crea orden y queda **auto-asignada** a sí mismo
  - Admin: puede **asignar/reasignar** una orden a cualquier mesero
- 🔄 Estados de orden: `saved` (en trámite) / `closed` (entregada)
  - Mesero: puede cerrar **solo** órdenes asignadas a sí mismo
  - Admin: puede cerrar cualquiera
- 📄 Swagger/OpenAPI publicado en `/docs`
- 🐳 Docker para ejecución local (backend)
- 🔍 Logging verbose (`console.log`) en frontend/backend para trazabilidad end-to-end

---

## 👤 Roles y acceso

La app soporta dos roles:

- `admin`: crea productos, ve todas las órdenes, asigna/reasigna órdenes, puede cerrar cualquier orden.
- `mesero`: crea órdenes (auto-asignadas), puede cerrar únicamente sus órdenes asignadas.

Para probar rápido:
1) Crear una cuenta desde `/register` con rol `admin`
2) Crear otra cuenta con rol `mesero`
3) Loguearse y validar permisos desde UI + Swagger

---

## 📁 Estructura del repo

app/
backend/
api/
src/
frontend/
src/

## ⚠️ Notas importantes

- El frontend consume el backend vía `VITE_API_BASE`.
- El backend requiere `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` configurados (en local y en Vercel).
- El backend valida el Bearer token del usuario contra Supabase Auth y resuelve el rol desde `profiles`.

---

## 🔑 Variables de entorno

### Backend (`app/backend/.env`)
```env
PORT=8080
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...

Frontend (app/frontend/.env)
VITE_API_BASE=http://localhost:8080
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

Frontend en Docker (app/frontend/.env.docker)
VITE_API_BASE=http://backend:8080
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

🗄️ Supabase (Database)
Tablas principales

profiles (id uuid, email text, role text, created_at timestamptz)

products (id bigint, name text, price numeric, created_at timestamptz)

orders (id bigint, created_by uuid, assigned_to uuid, status text, total numeric, created_at timestamptz)

order_items (id bigint, order_id bigint, product_id bigint, qty int, unit_price numeric, line_total numeric)

Migración usada (asignación + estados)

Ejecutar en Supabase SQL editor:

begin;

alter table public.orders
  add column if not exists assigned_to uuid;

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where constraint_schema = 'public'
      and table_name = 'orders'
      and constraint_name = 'orders_assigned_to_fkey'
  ) then
    alter table public.orders
      add constraint orders_assigned_to_fkey
      foreign key (assigned_to) references public.profiles(id)
      on delete set null;
  end if;
end $$;

update public.orders
set assigned_to = coalesce(assigned_to, created_by)
where assigned_to is null and created_by is not null;

alter table public.orders drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
  check (status in ('open','saved','closed'));

alter table public.orders alter column status set default 'saved';

update public.orders set status = 'saved' where status = 'open';

commit;

▶️ Run local (sin Docker)
1) Backend

cd app/backend
npm i
npm run dev

Backend: http://localhost:8080

Swagger: http://localhost:8080/docs

Health: http://localhost:8080/health

2) Frontend

cd app/frontend
npm i
npm run dev

Frontend: http://localhost:5173

🐳 Run local (Docker)

Backend (build/run):
cd app/backend
docker build -t oceans-backend .
docker run --env-file .env -p 8080:8080 oceans-backend

☁️ Deploy (Vercel + Supabase)
1) Supabase

Crear proyecto en Supabase

Crear tablas / ejecutar SQL de migraciones

Asegurar usuarios/roles en profiles (la app los crea vía /auth/register)

2) Backend en Vercel

Crear proyecto Vercel apuntando a app/backend

Configurar env vars:

SUPABASE_URL

SUPABASE_SERVICE_ROLE_KEY

PORT (opcional)

Deploy

3) Frontend en Vercel

Crear proyecto Vercel apuntando a app/frontend

Configurar env vars:

VITE_API_BASE = URL del backend deployado

VITE_SUPABASE_URL

VITE_SUPABASE_ANON_KEY

Deploy

🔌 API (resumen)
Auth

POST /auth/register — crea usuario (Supabase Auth) + profile (tabla profiles)

GET /auth/me — retorna { id, email, role } del usuario autenticado

Products

GET /products — admin/mesero autenticados

POST /products — admin

Orders

GET /orders — admin/mesero autenticados

POST /orders — admin/mesero

mesero crea y queda asignado a sí mismo

admin puede crear y luego reasignar si quiere

Endpoints extra (bonus)

PATCH /orders/:id/assign (admin) — asignar/reasignar una orden a un mesero

PATCH /orders/:id/status (admin o mesero asignado) — cambiar estado saved/closed

GET /profiles?role=mesero (admin) — listar meseros para UI de asignación

Swagger disponible en: /docs

🧪 Quick test (end-to-end)

Ir al frontend: https://ocean-kihd.vercel.app/register

Crear usuario admin

Login como admin: https://ocean-kihd.vercel.app/login

Crear productos: https://ocean-kihd.vercel.app/products

Crear usuario mesero en /register

Login como mesero y crear orden saved / closed: https://ocean-kihd.vercel.app/orders

Volver como admin y reasignar una orden a un mesero desde Orders

Probar API desde Swagger: http://localhost:8080/docs/
 (usar Bearer token)

🧾 Notas de diseño

Autenticación con Supabase en frontend; llamadas al backend con Bearer token.

Backend verifica token con Supabase y aplica RBAC (roles) desde profiles.

Validaciones de payload con Zod.

Logs en FE/BE para facilitar debugging en entorno local y deploy.
