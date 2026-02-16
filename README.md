# Carteira B3 - Gestão de Investimentos

Sistema completo para gerenciar sua carteira de investimentos da B3 (Bolsa de Valores Brasileira).

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **MySQL** (via WAMP, XAMPP, ou instalação direta)
- **Git** (opcional, para versionamento)

## 🚀 Instalação Rápida

### 1. Extrair o Projeto

Extraia todos os arquivos para uma pasta, por exemplo:
```
C:\Users\Fernando\carteira-b3-clean\
```

### 2. Configurar o Banco de Dados

#### Opção A: Usar banco existente
Se você já tem o banco `carteira_b3` criado, apenas configure o `.env`:

1. Copie `.env.example` para `.env`
2. Edite `.env` e configure sua conexão:
```env
DATABASE_URL="mysql://root:@localhost:3306/carteira_b3"
```

#### Opção B: Criar novo banco
1. Abra o MySQL (via phpMyAdmin ou linha de comando)
2. Crie o banco:
```sql
CREATE DATABASE carteira_b3;
```
3. Configure o `.env` conforme acima

### 3. Instalar Dependências

Abra o PowerShell na pasta do projeto e execute:

```bash
npm install
```

Aguarde alguns minutos enquanto as dependências são instaladas.

### 4. Configurar Prisma

Execute estes comandos em ordem:

```bash
# Gerar o Prisma Client
npx prisma generate

# Criar as tabelas no banco (se ainda não existem)
npx prisma db push
```

Se quiser popular com dados de exemplo:
```bash
npx prisma db seed
```

### 5. Iniciar o Servidor

```bash
npm run dev
```

Aguarde a mensagem:
```
✓ Ready in XXXXms
- Local: http://localhost:3000
```

### 6. Acessar a Aplicação

Abra seu navegador em: **http://localhost:3000**

## 📁 Estrutura do Projeto

```
carteira-b3-clean/
├── prisma/
│   └── schema.prisma          # Modelo do banco de dados
├── src/
│   ├── app/
│   │   ├── ativos/
│   │   │   └── page.tsx      # Página de Ativos
│   │   ├── transacoes/
│   │   │   └── page.tsx      # Página de Transações
│   │   ├── dividendos/
│   │   │   └── page.tsx      # Página de Dividendos
│   │   ├── layout.tsx        # Layout principal
│   │   ├── page.tsx          # Dashboard (home)
│   │   └── globals.css       # Estilos globais
│   └── lib/
│       └── prisma.ts         # Cliente Prisma
├── .env                      # Configurações (você cria)
├── .env.example             # Exemplo de configurações
├── package.json             # Dependências
└── README.md               # Este arquivo
```

## 🎨 Páginas Disponíveis

| Página | URL | Descrição |
|--------|-----|-----------|
| Dashboard | `/` | Visão geral com estatísticas |
| Ativos | `/ativos` | Lista de ativos na carteira |
| Transações | `/transacoes` | Histórico de compras/vendas |
| Dividendos | `/dividendos` | Proventos recebidos |

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento

# Produção
npm run build           # Cria build de produção
npm start              # Inicia servidor de produção

# Banco de Dados
npx prisma studio      # Interface visual do banco
npx prisma db push     # Atualiza esquema do banco
npx prisma generate    # Gera Prisma Client

# Linting
npm run lint           # Verifica código
```

## 🗄️ Modelo do Banco de Dados

### Tabelas Principais:

- **users**: Usuários do sistema
- **assets**: Ativos da carteira (ações, FIIs, etc.)
- **transactions**: Histórico de compras e vendas
- **dividends**: Proventos recebidos

### Tipos (Enums):

- **AssetType**: `ACAO`, `FII`, `STOCK`, `REIT`, `ETF`
- **TransactionType**: `COMPRA`, `VENDA`
- **DividendType**: `DIVIDENDO`, `JCP`, `RENDIMENTO`

## 🐛 Solução de Problemas

### Erro: "Can't connect to MySQL"
- Verifique se o WAMP/MySQL está rodando
- Confirme a porta (padrão: 3306)
- Teste a conexão no phpMyAdmin

### Erro: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Página em branco
```bash
# Delete cache e reinicie
rm -rf .next
npm run dev
```

### Tailwind não funciona
```bash
# Reinstale Tailwind
npm install -D tailwindcss@3.4.1 postcss autoprefixer
npm run dev
```

## 📝 Próximos Passos

Agora que o básico está funcionando, você pode:

1. ✅ **Adicionar API Routes** - Para criar/editar/deletar dados
2. ✅ **Criar Formulários** - Para adicionar ativos, transações e dividendos
3. ✅ **Conectar ao Banco** - Exibir dados reais nas tabelas
4. ✅ **Adicionar Gráficos** - Visualizar evolução patrimonial
5. ✅ **Implementar Autenticação** - Login e segurança

## 🆘 Precisa de Ajuda?

Se algo não funcionar:
1. Verifique o terminal por mensagens de erro
2. Abra o console do navegador (F12) e veja erros
3. Confirme que todas as dependências foram instaladas
4. Certifique-se que o banco está acessível

## 📄 Licença

Este projeto é de código aberto para uso pessoal.

---

**Desenvolvido com:**
- Next.js 15
- React 19
- TypeScript 5
- Tailwind CSS 3
- Prisma 5
- MySQL 8
