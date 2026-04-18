-- ============================================================
-- Script de criação do banco de dados - OdontoCota
-- Compatível com MySQL 8.x
-- ============================================================

CREATE DATABASE IF NOT EXISTS odonto_cota
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE odonto_cota;

-- ------------------------------------------------------------
-- Tabela: users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id    CHAR(36)      NOT NULL PRIMARY KEY,
  nome  VARCHAR(120)  NOT NULL,
  email VARCHAR(150)  NOT NULL UNIQUE,
  senha VARCHAR(255)  NOT NULL,
  tipo  ENUM('admin', 'cliente', 'fornecedor') NOT NULL DEFAULT 'cliente',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabela: areas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS areas (
  id        CHAR(36)     NOT NULL PRIMARY KEY,
  nome      VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT,
  ativo     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabela: categorias
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categorias (
  id      CHAR(36)     NOT NULL PRIMARY KEY,
  nome    VARCHAR(100) NOT NULL,
  area_id CHAR(36)     NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_categorias_area FOREIGN KEY (area_id) REFERENCES areas(id),
  UNIQUE KEY uq_categoria_area (nome, area_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabela: produtos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS produtos (
  id           CHAR(36)     NOT NULL PRIMARY KEY,
  nome         VARCHAR(150) NOT NULL,
  descricao    TEXT,
  categoria_id CHAR(36)     NOT NULL,
  ativo        TINYINT(1)   NOT NULL DEFAULT 1,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_produtos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id),
  UNIQUE KEY uq_produto_categoria (nome, categoria_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
