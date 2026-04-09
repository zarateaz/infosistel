# Infosistel - Aplicación Web Integral

Este es un proyecto completo (Full-Stack) para la gestión la tienda física "Infosistel" y su servicio de reparaciones.

## Características

- 🎨 **Frontend Futurista:** Efectos glassmorphism, sombras neon, y animaciones en modo oscuro avanzado.
- 🔧 **Seguimiento en Tiempo Real:** Los clientes pueden rastrear sus tickets ingresando su ID de ticket o DNI.
- 🛒 **Catálogo de Productos:** Catálogo dinámico para consultar productos clasificados por categorías.
- 🔐 **Panel de Administración Seguro:** Basado en tokens JWT.
- 👨‍💻 **Gestión y CRUD completo:** 
   - Agregar, editar y eliminar productos (incluyendo bajada/subida de imágenes por Multer).
   - Ingresar nuevos tickets de reparación y actualizar su estado junto con el porcentaje de progreso (0% a 100%).

## Requisitos Previos

- Node.js (v14 o superior recomendado)
- MySQL / MariaDB activo y funcionando

## Instalación

1. **Importar la Base de Datos:**
   Importa el archivo `database.sql` en tu motor de base de datos preferido (PHPMyAdmin, DBeaver, o consola nativa de MySQL):
   ```bash
   mysql -u root -p < database.sql
   ```
   > **Nota:** Por defecto el entorno viene configurado con el usuario `root` y clave vacía `''`. Puedes modificarlo en el archivo `.env`.

2. **Instalar Dependencias:**
   Posiciónate en la carpeta del proyecto en terminal y corre:
   ```bash
   npm install
   ```

3. **Ejecutar en Entorno de Producción/Desarrollo:**
   ```bash
   node server.js
   ```

4. **Acceder:**
   - La página principal estará en: [http://localhost:3000](http://localhost:3000)
   - El acceso al panel de administración en: [http://localhost:3000/admin](http://localhost:3000/admin)
   
## Credenciales por Defecto del Administrador

- **Usuario:** admin 
- **Contraseña:** admin123

## Stack Tecnológico Usado

- **Base de Datos:** MySQL
- **Backend:** Node.js con Express, JWT, Bcrypt y Multer.
- **Frontend:** Vanilla CSS y Vanilla JS. (Estética moderna requerida integrada sin librerías externas para máxima velocidad).
