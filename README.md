# Infosistel - Aplicación Web Integral (Next.js Version)

Este es un proyecto completo (Full-Stack) para la gestión de la tienda física "Infosistel" y su servicio de reparaciones, modernizado con Next.js 16 y React 19.

## Características

- 🎨 **Frontend Futurista:** Efectos glassmorphism, sombras neon, y animaciones avanzadas (Framer Motion).
- 🔧 **Seguimiento en Tiempo Real:** Los clientes pueden rastrear sus tickets ingresando su ID de ticket o DNI.
- 🛒 **Catálogo de Productos:** Catálogo dinámico para consultar productos clasificados por categorías.
- 🔐 **Panel de Administración Seguro:** Basado en tokens JWT y HTTP-only cookies.
- 👨‍💻 **Gestión y CRUD completo:** 
   - Agregar, editar y eliminar productos.
   - Ingresar nuevos tickets de reparación y actualizar su estado junto con el porcentaje de progreso.

## Stack Tecnológico Usado

- **Frontend/Backend:** Next.js 16 (App Router)
- **Base de Datos:** SQLite con Prisma ORM
- **Estilos:** Tailwind CSS 4 & Vanilla CSS
- **Animaciones:** Framer Motion & Swiper.js
- **Seguridad:** JWT (Jose) & Cookies seguras

## Requisitos Previos

- Node.js (v20 o superior)
- NPM o similar

## Instalación y Desarrollo

1. **Instalar Dependencias:**
   ```bash
   npm install
   ```

2. **Configurar el Entorno:**
   Crea un archivo `.env` basado en `.env.example`.

3. **Preparar la Base de Datos:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Ejecutar en Desarrollo:**
   ```bash
   npm run dev
   ```

## Despliegue con Docker

Este proyecto está preparado para desplegarse fácilmente usando Docker:

```bash
docker compose up -d --build
```
