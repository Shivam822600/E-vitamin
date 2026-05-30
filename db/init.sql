CREATE DATABASE IF NOT EXISTS expense_tracker;

USE expense_tracker;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  user_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_categories_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT uq_category_scope UNIQUE (name, type, user_id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  type ENUM('income', 'expense') NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  transaction_date DATE NOT NULL,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_transactions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_transactions_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE RESTRICT,
  INDEX idx_transactions_user_date (user_id, transaction_date),
  INDEX idx_transactions_user_category (user_id, category_id),
  INDEX idx_transactions_user_type_date (user_id, type, transaction_date)
);

INSERT INTO categories (name, type, user_id) VALUES
  ('Salary', 'income', NULL),
  ('Freelance', 'income', NULL),
  ('Investment', 'income', NULL),
  ('Food', 'expense', NULL),
  ('Rent', 'expense', NULL),
  ('Transport', 'expense', NULL),
  ('Shopping', 'expense', NULL),
  ('Bills', 'expense', NULL),
  ('Health', 'expense', NULL)
ON DUPLICATE KEY UPDATE name = VALUES(name);
