# OdontoCota — Backend B2B de Cotações Odontológicas

## Stack

- **Node.js** + **Express**
- **MySQL** via `mysql2/promise` (SQL puro, sem ORM)
- **JWT** para autenticação
- **bcryptjs** para hash de senhas
- **UUID** (CHAR 36) como PK

## Pré-requisitos

- Node.js >= 18
- MySQL >= 8

## Configuração

```bash
# 1. Copie o arquivo de variáveis de ambiente
cp .env.example .env

# 2. Edite o .env com suas credenciais do banco
# 3. Importe o schema no MySQL
mysql -u root -p < database/schema.sql

# 4. Instale as dependências
npm install

# 5. Inicie o servidor
npm run dev
```

## Estrutura

```
src/
├── config/
│   └── database.js          # Pool de conexão MySQL
├── middlewares/
│   ├── auth.middleware.js    # Autenticação JWT
│   └── errorHandler.middleware.js
├── modules/
│   └── catalogo/
│       ├── areas/
│       │   ├── areas.repository.js
│       │   ├── areas.service.js
│       │   ├── areas.controller.js
│       │   └── areas.routes.js
│       ├── categorias/
│       │   ├── categorias.repository.js
│       │   ├── categorias.service.js
│       │   ├── categorias.controller.js
│       │   └── categorias.routes.js
│       └── produtos/
│           ├── produtos.repository.js
│           ├── produtos.service.js
│           ├── produtos.controller.js
│           └── produtos.routes.js
├── utils/
│   └── createError.js
├── app.js
└── server.js
```

## Endpoints

### Áreas — `/api/areas`

| Método | Rota                   | Descrição           |
|--------|------------------------|---------------------|
| GET    | `/api/areas`           | Lista todas          |
| GET    | `/api/areas/:id`       | Busca por ID         |
| POST   | `/api/areas`           | Cria nova área       |
| PUT    | `/api/areas/:id`       | Atualiza área        |
| PATCH  | `/api/areas/:id/ativar`    | Ativa área       |
| PATCH  | `/api/areas/:id/desativar` | Desativa área    |

### Categorias — `/api/categorias`

| Método | Rota                      | Descrição                    |
|--------|---------------------------|------------------------------|
| GET    | `/api/categorias`         | Lista todas (filtro: `?area_id=`) |
| GET    | `/api/categorias/:id`     | Busca por ID                 |
| POST   | `/api/categorias`         | Cria nova categoria          |

### Produtos — `/api/produtos`

| Método | Rota                          | Descrição                              |
|--------|-------------------------------|----------------------------------------|
| GET    | `/api/produtos`               | Lista todos (filtro: `?categoria_id=&ativo=true`) |
| GET    | `/api/produtos/:id`           | Busca por ID                           |
| POST   | `/api/produtos`               | Cria novo produto                      |
| PATCH  | `/api/produtos/:id/ativar`    | Ativa produto                          |
| PATCH  | `/api/produtos/:id/desativar` | Desativa produto                       |

## Autenticação

Todas as rotas exigem header:

```
Authorization: Bearer <seu_jwt_token>
```

> O módulo `auth` (login/geração de token) será implementado na próxima etapa.