# MVV App Gestão

Sistema administrativo WEB para gerenciar informações exibidas no aplicativo mobile MVV.

## Stack

- **Next.js 14** – Framework React
- **React 18** – UI
- **Node.js** – Runtime
- **API REST** – Rotas internas do Next.js (`/api/*`)
- **SQLite** – Banco de dados relacional (via Prisma)
- **Prisma** – ORM
- **Tailwind CSS** – Estilização

## Como rodar localmente

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar banco de dados

O projeto usa SQLite por padrão. O arquivo `.env` já contém:

```
DATABASE_URL="file:./dev.db"
```

Criar o schema do banco:

```bash
npm run db:push
```

### 3. Iniciar o servidor

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). Use o link **"Acessar Painel Administrativo"** ou vá diretamente para [http://localhost:3000/admin](http://localhost:3000/admin).

## Funcionalidades

### Eventos

- CRUD completo (listar, cadastrar, editar, excluir)
- Campos: Título, Descrição, ID Imagem, URL

### Redes

- CRUD completo
- Usadas como referência para membros

### Membros

- CRUD completo
- Validação de email e dados obrigatórios
- Filtros por rede, tipo de usuário e busca por nome/email/telefone
- Campos: Nome, Email, Telefone, Data Nascimento, Rede, Tipo Usuário, Participa MVV, Aceita Notificações, Aceita Email

### Dashboard

- Total de membros
- Membros por rede
- Distribuição por tipo de usuário
- Comparativo por faixa etária:
  - Até 17
  - 18 a 25
  - 26 a 35
  - 36 a 50
  - Acima de 50

## Estrutura do projeto

```
src/
├── app/
│   ├── api/           # API REST
│   │   ├── dashboard/
│   │   ├── eventos/
│   │   ├── membros/
│   │   └── redes/
│   ├── admin/         # Páginas administrativas
│   └── page.tsx       # Página inicial
└── lib/
    ├── prisma.ts      # Cliente Prisma
    └── utils.ts       # Utilitários (ex: geração de ID hex)

prisma/
├── schema.prisma      # Modelos do banco
└── dev.db             # Banco SQLite (gerado)
```

## Scripts disponíveis

| Comando          | Descrição                    |
|------------------|------------------------------|
| `npm run dev`    | Inicia o servidor de desenvolvimento |
| `npm run build`  | Gera Prisma Client e faz build |
| `npm run start`  | Inicia o servidor de produção |
| `npm run db:push`| Sincroniza o schema com o banco |
| `npm run db:migrate` | Cria migrações Prisma    |
