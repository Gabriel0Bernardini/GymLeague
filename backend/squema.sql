CREATE DATABASE IF NOT EXISTS gymleague
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE gymleague;

CREATE TABLE IF NOT EXISTS users (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username      VARCHAR(50)     NOT NULL UNIQUE,
  name          VARCHAR(100)    NOT NULL,
  password      VARCHAR(255)    NOT NULL, -- SEM hash (apenas para testes)
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;