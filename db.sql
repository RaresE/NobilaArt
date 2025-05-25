DROP DATABASE IF EXISTS mobilux;
CREATE DATABASE IF NOT EXISTS mobilux;
USE mobilux;

-- Ștergerea tabelelor existente (dacă există)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS OrderItems;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS Carts;
DROP TABLE IF EXISTS Products;
DROP TABLE IF EXISTS Categories;
DROP TABLE IF EXISTS Materials;
DROP TABLE IF EXISTS Users;
SET FOREIGN_KEY_CHECKS = 1;

-- Crearea tabelelor
CREATE TABLE Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'client') DEFAULT 'client',
  address VARCHAR(255),
  phone VARCHAR(20),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  imageUrl VARCHAR(255),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  stock INT NOT NULL DEFAULT 0,
  unit VARCHAR(10) NOT NULL DEFAULT 'pcs',
  lowStockThreshold INT NOT NULL DEFAULT 10,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  imageUrl VARCHAR(255),
  dimensions VARCHAR(100),
  weight FLOAT,
  featured BOOLEAN DEFAULT FALSE,
  availableColors JSON,
  specifications JSON,
  categoryId INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES Categories(id) ON DELETE SET NULL
);

CREATE TABLE Carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  productId INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  customizations JSON,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE
);

CREATE TABLE Orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  shippingAddress JSON NOT NULL,
  paymentMethod VARCHAR(50) NOT NULL,
  deliveryMethod VARCHAR(50) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE OrderItems (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orderId INT NOT NULL,
  productId INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  customizations JSON,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES Orders(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES Products(id) ON DELETE CASCADE
);

-- Popularea tabelelor cu date de exemplu

-- Utilizatori
-- Parola pentru toți utilizatorii este 'password123' (hash-ul bcrypt)
INSERT INTO Users (name, email, password, role, address, phone) VALUES
('Admin User', 'admin@mobilux.com', '$2a$10$mLK.rrdlvx9DCFb6Eck1t.TlltnGulepXnov3bBp5T2TloO1MYj52', 'admin', 'Strada Admin 1', '0700000000'),
('John Doe', 'john@example.com', '$2a$10$mLK.rrdlvx9DCFb6Eck1t.TlltnGulepXnov3bBp5T2TloO1MYj52', 'client', 'Strada Clientului 123', '0711111111'),
('Jane Smith', 'jane@example.com', '$2a$10$mLK.rrdlvx9DCFb6Eck1t.TlltnGulepXnov3bBp5T2TloO1MYj52', 'client', 'Bulevardul Principal 45', '0722222222'),
('Alice Johnson', 'alice@example.com', '$2a$10$mLK.rrdlvx9DCFb6Eck1t.TlltnGulepXnov3bBp5T2TloO1MYj52', 'client', 'Aleea Florilor 78', '0733333333');

-- Categorii
INSERT INTO Categories (name, description, imageUrl) VALUES
('Living Room', 'Furniture for your living room', 'https://via.placeholder.com/300x300?text=Living+Room'),
('Bedroom', 'Comfortable bedroom furniture', 'https://via.placeholder.com/300x300?text=Bedroom'),
('Dining Room', 'Elegant dining room sets', 'https://via.placeholder.com/300x300?text=Dining+Room'),
('Office', 'Professional office furniture', 'https://via.placeholder.com/300x300?text=Office'),
('Kitchen', 'Functional kitchen furniture', 'https://via.placeholder.com/300x300?text=Kitchen');

-- Materiale
INSERT INTO `materials` (`id`, `name`, `description`, `stock`, `unit`, `lowStockThreshold`, `createdAt`, `updatedAt`) VALUES
(1, 'Stejar', 'Lemn de stejar de calitate', 100, 'sqm', 20, '2025-05-15 17:04:39', '2025-05-25 17:26:50'),
(2, 'Pin', 'Lemn de pin accesibil', 150, 'sqm', 30, '2025-05-15 17:04:39', '2025-05-25 17:26:50'),
(3, 'Nuc', 'Lemn de nuc elegant', 80, 'sqm', 15, '2025-05-15 17:04:39', '2025-05-25 17:26:50'),
(4, 'Piele', 'Piele de calitate premium', 50, 'sqm', 10, '2025-05-15 17:04:39', '2025-05-25 17:26:50'),
(5, 'Bumbac', 'Țesătură moale din bumbac', 204, 'm', 40, '2025-05-15 17:04:39', '2025-05-25 17:26:50'),
(6, 'Catifea', 'Țesătură luxoasă din catifea', 60, 'sqm', 15, '2025-05-15 17:04:39', '2025-05-25 17:26:50'),
(7, 'Cadru metalic', 'Cadre metalice durabile', 120, 'pcs', 25, '2025-05-15 17:04:39', '2025-05-25 17:26:50'),
(8, 'Sticlă', 'Sticlă securizată', 90, 'sqm', 20, '2025-05-15 17:04:39', '2025-05-25 17:26:50'),
(9, 'Marmură', 'Blaturi elegante din marmură', 30, 'sqm', 8, '2025-05-15 17:04:39', '2025-05-25 17:26:50'),
(10, 'Spumă', 'Umplutură confortabilă din spumă', 100, 'kg', 20, '2025-05-15 17:04:39', '2025-05-25 17:26:50'),
(11, 'Stofă', 'Stofă perfectă pentru canapea', 100, 'm', 10, '2025-05-23 17:11:36', '2025-05-25 17:26:50'),
(12, 'Burete', 'Burete', 100, 'l', 10, '2025-05-23 19:23:22', '2025-05-25 17:26:50'),
(13, 'Burete Premium', 'Burete premium', 100, 'pcs', 10, '2025-05-23 20:27:27', '2025-05-25 17:26:50'),
(14, 'Textil', 'Material textil pentru tapițerie', 50, 'm', 10, '2025-05-25 17:53:30', '2025-05-25 17:53:40');

-- Produse
INSERT INTO Products (name, description, price, stock, imageUrl, dimensions, weight, featured, availableColors, specifications, categoryId) VALUES
('Modern Sofa', 'A comfortable modern sofa for your living room', 1299.99, 15, 'https://via.placeholder.com/300x300?text=Modern+Sofa', '220x85x75 cm', 45.5, TRUE, '["Black", "Gray", "Blue", "Beige"]', '{"seats": 3, "material": "Fabric", "frame": "Wood"}', 1),
('Leather Armchair', 'Elegant leather armchair', 799.99, 20, 'https://via.placeholder.com/300x300?text=Leather+Armchair', '80x85x75 cm', 25.0, TRUE, '["Black", "Brown", "White"]', '{"seats": 1, "material": "Leather", "frame": "Wood"}', 1),
('Coffee Table', 'Stylish coffee table with glass top', 349.99, 25, 'https://via.placeholder.com/300x300?text=Coffee+Table', '110x60x45 cm', 15.0, FALSE, '["Walnut", "Oak", "Black"]', '{"material": "Wood and Glass", "shape": "Rectangle"}', 1),
('TV Stand', 'Modern TV stand with storage', 499.99, 18, 'https://via.placeholder.com/300x300?text=TV+Stand', '180x40x50 cm', 30.0, FALSE, '["White", "Black", "Oak"]', '{"material": "Wood", "features": "Cable management"}', 1),
('Queen Bed', 'Comfortable queen size bed', 899.99, 10, 'https://via.placeholder.com/300x300?text=Queen+Bed', '160x200 cm', 50.0, TRUE, '["Oak", "Walnut", "White"]', '{"size": "Queen", "material": "Wood", "features": "Storage drawers"}', 2),
('Wardrobe', 'Spacious wardrobe with sliding doors', 1199.99, 8, 'https://via.placeholder.com/300x300?text=Wardrobe', '200x60x220 cm', 85.0, FALSE, '["White", "Oak", "Walnut"]', '{"doors": 2, "material": "Wood", "features": "Mirror"}', 2),
('Nightstand', 'Elegant nightstand with drawer', 249.99, 30, 'https://via.placeholder.com/300x300?text=Nightstand', '45x40x55 cm', 12.0, FALSE, '["Oak", "Walnut", "White"]', '{"drawers": 2, "material": "Wood"}', 2),
('Dresser', 'Classic dresser with multiple drawers', 699.99, 12, 'https://via.placeholder.com/300x300?text=Dresser', '120x50x80 cm', 40.0, FALSE, '["Oak", "Walnut", "White"]', '{"drawers": 6, "material": "Wood"}', 2),
('Dining Table', 'Elegant dining table for 6 people', 899.99, 10, 'https://via.placeholder.com/300x300?text=Dining+Table', '180x90x75 cm', 45.0, TRUE, '["Oak", "Walnut", "Glass"]', '{"seats": 6, "material": "Wood", "shape": "Rectangle"}', 3),
('Dining Chair', 'Comfortable dining chair', 149.99, 40, 'https://via.placeholder.com/300x300?text=Dining+Chair', '45x50x90 cm', 8.0, FALSE, '["Black", "Brown", "Beige"]', '{"material": "Wood and Fabric"}', 3),
('Buffet Cabinet', 'Stylish buffet cabinet for dining room', 799.99, 8, 'https://via.placeholder.com/300x300?text=Buffet+Cabinet', '160x45x85 cm', 55.0, FALSE, '["Oak", "Walnut", "White"]', '{"doors": 2, "drawers": 3, "material": "Wood"}', 3),
('Bar Stool', 'Modern bar stool', 199.99, 25, 'https://via.placeholder.com/300x300?text=Bar+Stool', '40x40x100 cm', 7.0, FALSE, '["Black", "White", "Brown"]', '{"material": "Metal and Leather", "adjustable": true}', 3),
('Office Desk', 'Functional office desk with drawers', 599.99, 15, 'https://via.placeholder.com/300x300?text=Office+Desk', '140x70x75 cm', 35.0, TRUE, '["Oak", "Walnut", "White"]', '{"drawers": 3, "material": "Wood"}', 4),
('Office Chair', 'Ergonomic office chair', 349.99, 20, 'https://via.placeholder.com/300x300?text=Office+Chair', '65x65x110 cm', 15.0, TRUE, '["Black", "Gray", "Blue"]', '{"material": "Mesh and Fabric", "adjustable": true, "features": "Lumbar support"}', 4),
('Bookshelf', 'Spacious bookshelf', 399.99, 18, 'https://via.placeholder.com/300x300?text=Bookshelf', '90x30x180 cm', 30.0, FALSE, '["Oak", "Walnut", "White"]', '{"shelves": 5, "material": "Wood"}', 4),
('Filing Cabinet', 'Metal filing cabinet', 299.99, 15, 'https://via.placeholder.com/300x300?text=Filing+Cabinet', '45x60x130 cm', 25.0, FALSE, '["Black", "Gray", "White"]', '{"drawers": 4, "material": "Metal", "lockable": true}', 4),
('Kitchen Island', 'Functional kitchen island with storage', 799.99, 8, 'https://via.placeholder.com/300x300?text=Kitchen+Island', '120x80x90 cm', 60.0, TRUE, '["White", "Gray", "Natural"]', '{"material": "Wood", "features": "Storage, Wheels"}', 5),
('Bar Cabinet', 'Elegant bar cabinet', 899.99, 6, 'https://via.placeholder.com/300x300?text=Bar+Cabinet', '100x50x150 cm', 45.0, FALSE, '["Walnut", "Oak", "Black"]', '{"material": "Wood and Glass", "features": "Wine rack, Glass storage"}', 5),
('Kitchen Table', 'Compact kitchen table', 399.99, 12, 'https://via.placeholder.com/300x300?text=Kitchen+Table', '120x75x75 cm', 25.0, FALSE, '["White", "Natural", "Gray"]', '{"seats": 4, "material": "Wood", "shape": "Rectangle"}', 5),
('Kitchen Chair', 'Simple kitchen chair', 99.99, 40, 'https://via.placeholder.com/300x300?text=Kitchen+Chair', '45x45x90 cm', 5.0, FALSE, '["White", "Natural", "Black"]', '{"material": "Wood"}', 5);

-- Comenzi
INSERT INTO Orders (userId, status, shippingAddress, paymentMethod, deliveryMethod, subtotal, shipping, total) VALUES
(2, 'delivered', '{"name": "John Doe", "address": "Strada Clientului 123", "city": "București", "state": "Sector 1", "zipCode": "010101", "phone": "0711111111"}', 'credit_card', 'standard', 1649.98, 10.00, 1659.98),
(2, 'shipped', '{"name": "John Doe", "address": "Strada Clientului 123", "city": "București", "state": "Sector 1", "zipCode": "010101", "phone": "0711111111"}', 'paypal', 'express', 899.99, 20.00, 919.99),
(3, 'processing', '{"name": "Jane Smith", "address": "Bulevardul Principal 45", "city": "Cluj-Napoca", "state": "Cluj", "zipCode": "400000", "phone": "0722222222"}', 'credit_card', 'next_day', 2099.97, 30.00, 2129.97),
(3, 'pending', '{"name": "Jane Smith", "address": "Bulevardul Principal 45", "city": "Cluj-Napoca", "state": "Cluj", "zipCode": "400000", "phone": "0722222222"}', 'bank_transfer', 'standard', 599.99, 10.00, 609.99),
(4, 'delivered', '{"name": "Alice Johnson", "address": "Aleea Florilor 78", "city": "Timișoara", "state": "Timiș", "zipCode": "300000", "phone": "0733333333"}', 'credit_card', 'standard', 1199.98, 10.00, 1209.98),
(4, 'cancelled', '{"name": "Alice Johnson", "address": "Aleea Florilor 78", "city": "Timișoara", "state": "Timiș", "zipCode": "300000", "phone": "0733333333"}', 'paypal', 'express', 349.99, 20.00, 369.99);

-- Elemente comenzi
INSERT INTO OrderItems (orderId, productId, quantity, price, customizations) VALUES
(1, 2, 1, 799.99, '{"color": "Brown", "material": "1"}'),
(1, 3, 1, 349.99, '{"color": "Walnut"}'),
(2, 5, 1, 899.99, '{"color": "Oak"}'),
(3, 1, 1, 1299.99, '{"color": "Gray", "material": "5"}'),
(3, 3, 1, 349.99, '{"color": "Black"}'),
(3, 7, 2, 249.99, '{"color": "Oak"}'),
(4, 13, 1, 599.99, '{"color": "Walnut"}'),
(5, 14, 1, 349.99, '{"color": "Black"}'),
(5, 15, 1, 399.99, '{"color": "Oak"}'),
(6, 3, 1, 349.99, '{"color": "Oak"}');

-- Coșuri de cumpărături
INSERT INTO Carts (userId, productId, quantity, customizations) VALUES
(2, 9, 1, '{"color": "Oak", "material": "1"}'),
(2, 10, 4, '{"color": "Black", "material": "5"}'),
(3, 13, 1, '{"color": "White"}'),
(3, 14, 1, '{"color": "Blue"}'),
(4, 17, 1, '{"color": "White", "material": "1"}');