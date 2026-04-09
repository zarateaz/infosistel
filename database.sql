CREATE DATABASE IF NOT EXISTS infosistel_db;
USE infosistel_db;

-- Tabla de Usuarios (Administradores)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Categorías
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Productos
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    category_id INT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Tabla de Reparaciones
CREATE TABLE IF NOT EXISTS repairs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_code VARCHAR(20) NOT NULL UNIQUE,
    client_name VARCHAR(150) NOT NULL,
    client_dni VARCHAR(20) NOT NULL,
    client_phone VARCHAR(20) NOT NULL,
    device_problem TEXT NOT NULL,
    progress_percentage INT DEFAULT 0,
    status ENUM('En espera', 'En diagnóstico', 'En reparación', 'Por entregar', 'Completado') DEFAULT 'En espera',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar administrador
INSERT INTO users (username, password_hash) 
VALUES ('zarate', '$2b$10$hGB9jAQcP2/OGFuEW.VKsO8tFipEjrSjerUzoI7enO59XzebqZLXe');

-- Categorías por defecto
INSERT INTO categories (name) VALUES 
('Cartuchos y Tintas'), 
('Impresoras'), 
('Cables y Adaptadores'), 
('Cases y Fuentes'), 
('Almacenamiento (SSD/HDD)'), 
('Accesorios'),
('Teclados'),
('Monitores'),
('Switchs');

-- Tabla de Pedidos
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_dni VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('Pendiente', 'Completado', 'Cancelado') DEFAULT 'Pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Items del Pedido
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
