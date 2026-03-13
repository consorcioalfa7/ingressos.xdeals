# XDeals - Plataforma de Venda de Ingressos com Desconto

<p align="center">
  <img src="public/logo.svg" alt="XDeals Logo" width="120" height="120">
</p>

<p align="center">
  <strong>Ingressos com até 60% de Desconto</strong>
  <br>
  <span>Parceiro Oficial Q2Ingressos</span>
</p>

<p align="center">
  <a href="#-sobre">Sobre</a> •
  <a href="#-funcionalidades">Funcionalidades</a> •
  <a href="#-tecnologias">Tecnologias</a> •
  <a href="#-instalação-e-deploy">Instalação</a> •
  <a href="#-gerenciamento-de-eventos">Eventos</a> •
  <a href="#-api">API</a>
</p>

---

## 📖 Sobre

O **XDeals** é uma plataforma de venda de ingressos promocionais que oferece descontos exclusivos de 40% a 60% em shows, festivais e eventos. O projeto atua como parceiro oficial da Q2Ingressos, proporcionando uma experiência de compra segura com pagamentos via PIX.

### Domínio de Produção
- **Website:** https://ingressos.xdeals.online
- **Webhook:** https://ingressos.xdeals.online/webhook

### Informações Legais
- **CNPJ:** 21.233.248/0001-72
- **Sede:** São Paulo, SP - Brasil
- **Filiais:** Brasília (BR), Lisboa (PT), Madrid (ES)

---

## ✨ Funcionalidades

### Para o Cliente
- 🎫 Compra de ingressos com descontos exclusivos (40-60% OFF)
- 🔍 Filtros por cidade, tipo de evento e categoria
- ⏰ Contagem regressiva para períodos de desconto progressivo
- 💳 Pagamento via PIX com QR Code
- 📱 Recebimento de ingressos por WhatsApp/Telegram
- 🎥 Vídeos e mapas dos eventos
- 📧 Confirmação de compra imediata
- 🎟️ Entrega de ingressos até 72h antes do evento

### Para o Administrador
- 📊 Painel de eventos com destaque na homepage
- 🎛️ Configuração de descontos fixos ou progressivos
- 📈 Controle de estoque por tipo de ingresso
- 🔔 Notificações automáticas de pagamento
- 📝 Logs de auditoria completos
- 🤖 Sistema de entrega automática de ingressos

---

## 🛠 Tecnologias

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Next.js | 16.x | Framework React fullstack |
| TypeScript | 5.x | Tipagem estática |
| Tailwind CSS | 4.x | Estilização |
| shadcn/ui | latest | Componentes UI |
| Prisma | 6.x | ORM para banco de dados |
| SQLite | - | Banco de desenvolvimento |
| PostgreSQL | - | Banco de produção (Vercel/Supabase) |
| DARKPAY NEXUS | - | Orquestrador de pagamentos PIX |

---

## 🚀 Instalação e Deploy

### Pré-requisitos
- Node.js 18+
- npm ou pnpm
- Git
- Conta no GitHub
- Conta na Vercel
- Banco PostgreSQL (Supabase ou Vercel Postgres)

---

### 1️⃣ Configuração do GitHub

```bash
# Clone o repositório
git clone https://github.com/consorcioalfa7/ingressos.xdeals.git
cd xdeals

# Instale as dependências
npm install
```

**Criar novo repositório:**
1. Acesse https://github.com/new
2. Nome: `ingressos.xdeals` (ou nome desejado)
3. Descrição: "Plataforma de ingressos com desconto"
4. Público ou Privado (recomendado: Privado)
5. Clique em "Create repository"

**Push inicial:**
```bash
git init
git add .
git commit -m "Initial commit - XDeals platform"
git branch -M main
git remote add origin https://github.com/consorcioalfa7/ingressos.xdeals.git
git push -u origin main
```

---

### 2️⃣ Configuração do Banco de Dados (Supabase)

**Criar projeto no Supabase:**
1. Acesse https://supabase.com
2. Clique em "New Project"
3. Nome: `xdeals-db`
4. Senha: xdeals-db123456789*.*
5. Região: São Paulo (sa-east-1)
6. Clique em "Create new project"

**Obter string de conexão:**
1. Vá em Project Settings → Database
2. Copie a "Connection string" (URI)
3. Substitua `[YOUR-PASSWORD]` pela senha criada

**Exemplo:**
```
postgresql://postgres.xxxx:SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

---

### 3️⃣ Configuração da Vercel

**Criar projeto:**
1. Acesse https://vercel.com/new
2. Importe o repositório `ingressos.xdeals` do GitHub
3. Configure:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`

**Variáveis de ambiente (Environment Variables):**

| Nome | Valor |
|------|-------|
| `DATABASE_URL` | `postgresql://postgres...` (do Supabase) |
| `NEXUS_API_URL` | `https://api.dark.lat` |
| `NEXUS_API_KEY` | `dk_live_xdeals_777` |
| `QR_SECRET` | (gere uma string aleatória de 32 chars) |
| `CRON_SECRET` | (gere uma string aleatória de 32 chars) |
| `TELEGRAM_BOT_TOKEN` | (seu token do bot Telegram) |
| `TELEGRAM_CHAT_ID` | `@ghost00_Root` |

**Deploy:**
```bash
# Clique em "Deploy" na Vercel
# Aguarde o build completar
```

---

### 4️⃣ Configuração do Domínio

**Adicionar domínio personalizado:**
1. Na Vercel, vá em Settings → Domains
2. Adicione: `ingressos.xdeals.online`
3. Configure os registros DNS:
   - Tipo: `A`
   - Nome: `@`
   - Valor: `76.76.21.21`
   - Tipo: `CNAME`
   - Nome: `www`
   - Valor: `cname.vercel-dns.com`

---

### 5️⃣ Inicialização do Banco de Dados

**Após o primeiro deploy, execute via Vercel CLI:**

```bash
# Instale Vercel CLI
npm i -g vercel

# Login
vercel login

# Link ao projeto
vercel link

# Execute as migrations
vercel env pull .env.production
npx prisma migrate deploy

# Popule os eventos
npx tsx prisma/seed.ts
```

**Ou via Supabase SQL Editor:**
```sql
-- Execute o conteúdo de prisma/migrations/*.sql
```

---

### 6️⃣ Configurar Cron Job (Entrega de Ingressos)

**Na Vercel:**
1. Vá em Settings → Cron Jobs
2. Adicione um novo cron:
   - Nome: `ticket-delivery`
   - Schedule: `0 */6 * * *` (a cada 6 horas)
   - Endpoint: `/api/cron/tickets`
   - Header: `Authorization: Bearer SEU_CRON_SECRET`

---

## 🎟️ Gerenciamento de Eventos

### Estrutura de um Evento

```typescript
{
  slug: "nome-do-evento-2026",        // URL amigável (único)
  name: "NOME DO EVENTO 2026",        // Nome exibido
  artist: "Nome do Artista",          // Artista principal
  tour: "Nome da Turnê",              // Turnê (opcional)
  description: "Descrição completa",  // Descrição do evento
  
  date: "2026-03-28T22:00:00Z",       // Data/hora início
  endDate: "2026-03-30T02:00:00Z",    // Data/hora fim (opcional)
  venue: "Nome do Local",             // Nome do estádio/arena
  city: "Cidade",                     // Cidade
  state: "UF",                        // Estado (PR, SP, etc.)
  
  eventType: "show",                  // show, festival, exposicao, rodeio, esporte
  category: "musica",                 // musica, agronegocio, esporte, cultura
  
  bannerUrl: "https://...",           // URL do banner (1200x630)
  mapUrl: "https://...",              // URL do mapa (opcional)
  videoUrl: "https://...",            // URL do vídeo MP4 (opcional)
  youtubeVideoId: "abc123",           // ID do YouTube (opcional)
  originalLink: "https://...",        // Link original Q2Ingressos
  
  discountType: "fixed",              // fixed ou progressive
  fixedDiscount: 50,                  // % de desconto (se fixed)
  
  badge: "Destaque",                  // Badge especial (opcional)
  featured: true,                     // Destacar na homepage
  isActive: true                      // Evento ativo
}
```

---

### 📌 Adicionar Novo Evento

**Método 1: Via Seed Script**

Edite o arquivo `prisma/seed.ts` e adicione:

```typescript
const events = [
  // ... eventos existentes ...
  
  // NOVO EVENTO
  {
    slug: 'novo-show-2026',
    name: 'NOVO SHOW 2026',
    artist: 'Artista Exemplo',
    description: 'Descrição do novo show...',
    date: new Date('2026-06-15T21:00:00'),
    venue: 'Arena Exemplo',
    city: 'São Paulo',
    state: 'SP',
    eventType: 'show',
    category: 'musica',
    bannerUrl: 'https://url-do-banner.jpg',
    originalLink: 'https://q2ingressos.com.br/events/...',
    discountType: 'fixed',
    fixedDiscount: 50,
    badge: 'Novo!',
    featured: true,
    ticketTypes: [
      {
        name: 'Pista',
        description: 'Acesso à área de pista',
        basePrice: 100.0,
        fee: 10.0,
        totalPrice: 110.0,
        quantityTotal: 1000,
        maxPerOrder: 10,
        features: ['Acesso à pista', 'Área de bar'],
        ticketCategory: 'individual',
      },
      {
        name: 'VIP',
        description: 'Área VIP com vista privilegiada',
        basePrice: 200.0,
        fee: 20.0,
        totalPrice: 220.0,
        quantityTotal: 200,
        maxPerOrder: 5,
        features: ['Área VIP', 'Open bar', 'Visão privilegiada'],
        ticketCategory: 'individual',
      },
    ],
  },
];
```

**Execute o seed:**
```bash
npx tsx prisma/seed.ts
```

---

**Método 2: Via Prisma Studio**

```bash
# Abre interface visual do banco
npx prisma studio

# Navegue até a tabela Event
# Clique em "Add record"
# Preencha os campos
# Clique em "Save"
```

---

**Método 3: Via API (produção)**

```bash
curl -X POST https://ingressos.xdeals.online/api/admin/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SUA_CHAVE_ADMIN" \
  -d '{
    "slug": "novo-show-2026",
    "name": "NOVO SHOW 2026",
    ...
  }'
```

---

### ✏️ Modificar Evento Existente

**Via Prisma Studio:**
```bash
npx prisma studio
# Encontre o evento → Edite → Salve
```

**Via Seed Script (recomendado):**

1. Edite o evento em `prisma/seed.ts`
2. Execute: `npx tsx prisma/seed.ts`
3. O script detecta eventos existentes e atualiza

---

### ❌ Eliminar Evento

**Soft Delete (recomendado):**
```typescript
// Marca evento como inativo
await db.event.update({
  where: { slug: 'evento-a-desativar' },
  data: { isActive: false }
});
```

**Via Prisma Studio:**
1. Abra `npx prisma studio`
2. Encontre o evento
3. Desmarque `isActive`
4. Salve

**Hard Delete (cuidado!):**
```typescript
// Remove permanentemente
await db.event.delete({
  where: { slug: 'evento-a-remover' }
});
```

---

### 🎛️ Tipos de Desconto

**Desconto Fixo:**
```typescript
{
  discountType: 'fixed',
  fixedDiscount: 50,  // 50% de desconto
}
```

**Desconto Progressivo:**
```typescript
{
  discountType: 'progressive',
  discountPeriods: [
    {
      discount: 60,
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-03-10'),
      label: '60% OFF - Primeira Onda'
    },
    {
      discount: 50,
      startDate: new Date('2026-03-11'),
      endDate: new Date('2026-03-20'),
      label: '50% OFF - Segunda Onda'
    },
    {
      discount: 40,
      startDate: new Date('2026-03-21'),
      endDate: new Date('2026-03-27'),
      label: '40% OFF - Última Onda'
    },
  ],
}
```

---

### 🎫 Tipos de Ingresso

```typescript
ticketTypes: [
  {
    name: 'Pista',
    basePrice: 100.0,
    fee: 10.0,
    totalPrice: 110.0,
    quantityTotal: 1000,
    maxPerOrder: 10,
    ticketCategory: 'individual',
    features: ['Acesso à pista'],
  },
  {
    name: 'Passaporte Completo',
    basePrice: 500.0,
    fee: 50.0,
    totalPrice: 550.0,
    quantityTotal: 100,
    maxPerOrder: 5,
    ticketCategory: 'passaporte',
    features: ['Acesso todos os dias', 'Área VIP'],
  },
  {
    name: 'Mesa Camarote (4 pessoas)',
    basePrice: 1200.0,
    fee: 120.0,
    totalPrice: 1320.0,
    quantityTotal: 20,
    maxPerOrder: 3,
    ticketCategory: 'combo',
    features: ['Mesa para 4', 'Open bar', 'Serviço exclusivo'],
  },
]
```

---

## 📁 Estrutura do Projeto

```
xdeals/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   ├── seed.ts                # Script de população
│   └── migrations/            # Histórico de migrations
├── public/
│   ├── logo.svg               # Logo XDeals (ticket XD)
│   ├── icon-512x512.png       # Ícone PWA
│   ├── manifest.json          # Manifest PWA
│   └── robots.txt             # SEO
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── checkout/      # API de checkout
│   │   │   ├── cron/tickets/  # Cron job de entrega
│   │   │   ├── events/        # API de eventos
│   │   │   ├── notify/        # API de notificações
│   │   │   └── webhook/       # Webhook NEXUS
│   │   ├── events/[slug]/     # Página de evento
│   │   ├── HomePageClient.tsx # Componente principal
│   │   ├── layout.tsx         # Layout + SEO
│   │   ├── page.tsx           # Homepage
│   │   ├── globals.css        # Estilos globais
│   │   └── sitemap.ts         # Sitemap dinâmico
│   ├── components/
│   │   ├── ui/                # Componentes shadcn/ui
│   │   ├── CheckoutForm.tsx   # Formulário de compra
│   │   ├── Countdown.tsx      # Contador regressivo
│   │   ├── TicketCard.tsx     # Card de ingresso
│   │   └── YouTubeEmbed.tsx   # Player YouTube
│   └── lib/
│       ├── db.ts              # Cliente Prisma
│       ├── events.ts          # Helpers de eventos
│       ├── nexus.ts           # Cliente DARKPAY NEXUS
│       ├── notifications.ts   # Sistema de notificações
│       └── pricing.ts         # Cálculos de preço
├── .env                       # Variáveis de ambiente
├── next.config.ts             # Configuração Next.js
├── tailwind.config.ts         # Configuração Tailwind
└── package.json
```

---

## 📡 API

### Endpoints Públicos

#### Listar Eventos
```http
GET /api/events

Response:
{
  "events": [
    {
      "id": "clx...",
      "slug": "fazer-falta-festival-2026",
      "name": "FAZER FALTA FESTIVAL 2026",
      "artist": "MC Livinho",
      "date": "2026-03-28T22:00:00.000Z",
      "city": "Maringá",
      "currentDiscount": 60
    }
  ]
}
```

#### Criar Checkout
```http
POST /api/checkout
Content-Type: application/json

{
  "eventSlug": "fazer-falta-festival-2026",
  "ticketId": "clx...",
  "quantity": 2,
  "name": "João Silva",
  "cpf": "123.456.789-00",
  "contactType": "WhatsApp",
  "contactValue": "+5562999999999"
}

Response:
{
  "success": true,
  "orderId": "XD-12345-USER-ABC123",
  "nexusId": "NX_A1B2C3D4E5F6",
  "pixCode": "00020126580014br.gov.bcb.pix...",
  "amount": 168.00
}
```

### Webhook NEXUS
```http
POST /api/webhook
Content-Type: application/json
x-api-key: dk_live_xdeals_777

{
  "nexus_id": "NX_A1B2C3D4E5F6",
  "order_id": "XD-12345-USER-ABC123",
  "status": "PAID",
  "amount_paid": 168.00
}
```

---

## 📅 Eventos Ativos

| Evento | Data | Local | Desconto |
|--------|------|-------|----------|
| FAZER FALTA FESTIVAL 2026 | 28/03/2026 | Paraná Expo, Maringá | 60% → 40% |
| MENOS É MAIS + NATTAN | 20/03/2026 | Pavilhão Azul, Maringá | 50% |
| PASSAPORTE EXPOINGÁ 2026 | 07-15/05/2026 | Arena Sicoob, Maringá | 50% |
| COPA DO MUNDO 2026 | 11/06-19/07/2026 | EUA/CAN/MEX | 50% |
| Shows Expoingá (6 eventos) | Maio/2026 | Arena Sicoob, Maringá | 40% |

---

## 🔒 Segurança

- **Validação de CPF:** Formato brasileiro válido
- **QR Code Hash:** SHA256 com secret único
- **API Key:** Autenticação nas rotas NEXUS
- **Cron Secret:** Proteção do endpoint de cron job
- **HTTPS:** Obrigatório em produção

---

## 📞 Suporte

- **WhatsApp:** +55 62 99288-7416
- **Telegram:** @ghost00_Root
- **Email:** contato@xdeals.online
- **Website:** https://ingressos.xdeals.online

---

## 📄 Licença

Este projeto é proprietário e de uso exclusivo da XDeals.
CNPJ: 21.233.248/0001-72

Todos os direitos reservados © 2026.

---

<p align="center">
  Feito com ❤️ pela equipe XDeals
  <br>
  <strong>Parceiro Oficial Q2Ingressos</strong>
</p>
