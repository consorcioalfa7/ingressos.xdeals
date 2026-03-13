// Database seed script for XDeals
// Run with: npx tsx prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// EVENTS DATA
// ============================================

const events = [
  // ============================================
  // FAZER FALTA FESTIVAL 2026
  // ============================================
  {
    slug: 'fazer-falta-festival-2026',
    name: 'FAZER FALTA FESTIVAL 2026',
    artist: 'MC Livinho',
    tour: 'Turnê de Despedida',
    description: 'O maior festival de piseiro do Brasil! MC Livinho se despede dos palcos com uma turnê histórica. Uma noite inesquecível com os maiores hits do piseiro brasileiro.',
    date: new Date('2026-03-28T22:00:00'),
    venue: 'Paraná Expo',
    city: 'Maringá',
    state: 'PR',
    eventType: 'festival',
    category: 'musica',
    bannerUrl: 'https://files.catbox.moe/d23obx.jpg',
    mapUrl: 'https://files.catbox.moe/zkfhkg.jpg',
    youtubeVideoId: 'bUeuvDCrqr0',
    originalLink: 'https://q2ingressos.com.br/events/fazer-falta-festival-2026',
    discountType: 'progressive',
    badge: 'Turnê de Despedida',
    featured: true,
    ticketTypes: [
      {
        name: 'Pista',
        description: 'Acesso à área de pista',
        basePrice: 50.0,
        fee: 7.5,
        totalPrice: 57.5,
        quantityTotal: 5000,
        maxPerOrder: 10,
        features: ['Acesso à área de pista', 'Experiência completa do show'],
        ticketCategory: 'individual',
      },
      {
        name: 'VIP',
        description: 'Área VIP com melhor visualização',
        basePrice: 90.0,
        fee: 13.5,
        totalPrice: 103.5,
        quantityTotal: 1000,
        maxPerOrder: 10,
        features: ['Acesso à área VIP', 'Melhor visualização', 'Banheiros exclusivos'],
        ticketCategory: 'individual',
      },
      {
        name: 'Camarote Open Bar',
        description: 'Camarote com open bar incluso',
        basePrice: 200.0,
        fee: 30.0,
        totalPrice: 230.0,
        quantityTotal: 200,
        maxPerOrder: 10,
        features: ['Acesso ao camarote', 'Open bar incluso', 'Visão privilegiada', 'Atendimento exclusivo'],
        ticketCategory: 'individual',
      },
      {
        name: 'Bistrô (6 pessoas)',
        description: 'Mesa no Bistrô para 6 pessoas',
        basePrice: 1500.0,
        fee: 225.0,
        totalPrice: 1725.0,
        quantityTotal: 20,
        maxPerOrder: 5,
        features: ['Mesa para 6 pessoas', 'Menu especial', 'Serviço exclusivo', 'Visão privilegiada'],
        ticketCategory: 'combo',
      },
    ],
    discountPeriods: [
      {
        discount: 60,
        startDate: new Date('2026-03-11T00:00:00'),
        endDate: new Date('2026-03-14T23:59:59'),
        label: '60% OFF - Primeira Onda',
      },
      {
        discount: 50,
        startDate: new Date('2026-03-15T00:00:00'),
        endDate: new Date('2026-03-21T23:59:59'),
        label: '50% OFF - Segunda Onda',
      },
      {
        discount: 40,
        startDate: new Date('2026-03-22T00:00:00'),
        endDate: new Date('2026-03-27T23:59:59'),
        label: '40% OFF - Última Onda',
      },
    ],
  },

  // ============================================
  // MENOS É MAIS + NATTAN
  // ============================================
  {
    slug: 'menosemais-nattan',
    name: 'MENOS É MAIS + NATTAN',
    description: 'Uma noite especial com Menos é Mais e Nattan! Dois dos maiores nomes do forró e piseiro se unem em um show imperdível.',
    date: new Date('2026-03-20T21:00:00'),
    venue: 'Pavilhão Azul - Parque de Exposições',
    city: 'Maringá',
    state: 'PR',
    eventType: 'show',
    category: 'musica',
    bannerUrl: 'https://files.catbox.moe/4dohw0.jpg',
    youtubeVideoId: 'LhwGHGskTK8',
    originalLink: 'https://q2ingressos.com.br/events/menosemais-nattan',
    discountType: 'fixed',
    fixedDiscount: 50,
    badge: 'Sexta-feira 21:00',
    featured: true,
    ticketTypes: [
      {
        name: 'Área VIP Meia/Solidário',
        description: 'Meia entrada área VIP',
        basePrice: 150.0,
        fee: 18.0,
        totalPrice: 168.0,
        quantityTotal: 2000,
        maxPerOrder: 10,
        features: ['Acesso à área VIP', 'Meia entrada', 'Documentação necessária'],
        ticketCategory: 'individual',
      },
      {
        name: 'Área VIP Inteira',
        description: 'Ingresso inteiro área VIP',
        basePrice: 300.0,
        fee: 36.0,
        totalPrice: 336.0,
        quantityTotal: 2000,
        maxPerOrder: 10,
        features: ['Acesso à área VIP', 'Melhor visualização', 'Banheiros exclusivos'],
        ticketCategory: 'individual',
      },
    ],
  },

  // ============================================
  // EXPOINGÁ 2026 - PASSAPORTE
  // ============================================
  {
    slug: 'expoinga-2026-passaporte',
    name: 'PASSAPORTE EXPOINGÁ 2026',
    description: 'Por que escolher apenas um show, se você pode viver todos? O Passaporte Expoingá é a opção ideal para quem quer aproveitar cada momento da festa sem perder nenhuma noite de programação. Com ele, você garante acesso a todos os dias de shows por um valor especial em comparação à compra de ingressos individuais. É a escolha perfeita para quem quer viver a experiência completa da Expoingá 2026.',
    date: new Date('2026-05-07T20:00:00'),
    endDate: new Date('2026-05-15T02:00:00'),
    venue: 'Arena Sicoob - Parque de Exposições',
    city: 'Maringá',
    state: 'PR',
    eventType: 'exposicao',
    category: 'agronegocio',
    bannerUrl: 'https://files.catbox.moe/kw79ro.jpg',
    videoUrl: 'https://files.catbox.moe/vypmws.mp4',
    originalLink: 'https://www.blueticket.com.br/evento/40471/passaporte-expoinga-2026',
    discountType: 'fixed',
    fixedDiscount: 50,
    badge: 'Acesso Todos os Dias',
    featured: true,
    ticketTypes: [
      {
        name: 'PASSAPORTE | Arquibancada - Meia-entrada',
        description: 'Acesso a todos os shows da Expoingá 2026 - Arquibancada',
        basePrice: 280.0,
        fee: 28.0,
        totalPrice: 308.0,
        quantityTotal: 3000,
        maxPerOrder: 10,
        features: ['Acesso a todos os 6 dias de shows', 'Lugar na arquibancada', 'Meia entrada com documentação'],
        ticketCategory: 'passaporte',
      },
      {
        name: 'PASSAPORTE | VIP - Meia-entrada',
        description: 'Acesso a todos os shows da Expoingá 2026 - Área VIP',
        basePrice: 376.0,
        fee: 38.4,
        totalPrice: 414.4,
        quantityTotal: 1000,
        maxPerOrder: 10,
        features: ['Acesso a todos os 6 dias de shows', 'Área VIP', 'Melhor visualização', 'Meia entrada com documentação'],
        ticketCategory: 'passaporte',
      },
      {
        name: 'PASSAPORTE | Arquibancada - Inteira',
        description: 'Acesso a todos os shows da Expoingá 2026 - Arquibancada',
        basePrice: 560.0,
        fee: 56.0,
        totalPrice: 616.0,
        quantityTotal: 3000,
        maxPerOrder: 10,
        features: ['Acesso a todos os 6 dias de shows', 'Lugar na arquibancada', 'Ingresso inteiro'],
        ticketCategory: 'passaporte',
      },
      {
        name: 'PASSAPORTE | VIP - Inteira',
        description: 'Acesso a todos os shows da Expoingá 2026 - Área VIP',
        basePrice: 752.0,
        fee: 76.8,
        totalPrice: 828.8,
        quantityTotal: 1000,
        maxPerOrder: 10,
        features: ['Acesso a todos os 6 dias de shows', 'Área VIP', 'Melhor visualização', 'Ingresso inteiro'],
        ticketCategory: 'passaporte',
      },
    ],
  },

  // ============================================
  // EXPOINGÁ 2026 - SHOWS INDIVIDUAIS
  // ============================================
  // 07/05 - Maiara e Maraisa + João Gomes
  {
    slug: 'expoinga-2026-maiara-maraisa-joao-gomes',
    name: 'EXPOINGÁ 2026 - Maiara e Maraisa + João Gomes',
    artist: 'Maiara e Maraisa + João Gomes',
    description: 'Abertura da Expoingá 2026 com a dupla sensação Maiara e Maraisa e o piseiro de João Gomes! Uma noite de muito forró e piseiro para começar a festa.',
    date: new Date('2026-05-07T22:00:00'),
    venue: 'Arena Sicoob - Parque de Exposições',
    city: 'Maringá',
    state: 'PR',
    eventType: 'show',
    category: 'agronegocio',
    bannerUrl: 'https://files.catbox.moe/kw79ro.jpg',
    videoUrl: 'https://files.catbox.moe/vypmws.mp4',
    originalLink: 'https://www.blueticket.com.br/search?q=expoinga',
    discountType: 'fixed',
    fixedDiscount: 40,
    badge: '07/05 - Quinta-feira',
    featured: false,
    ticketTypes: [
      {
        name: 'Arquibancada - Meia-entrada',
        description: 'Meia entrada arquibancada',
        basePrice: 50.0,
        fee: 5.0,
        totalPrice: 55.0,
        quantityTotal: 5000,
        maxPerOrder: 10,
        features: ['Acesso à arquibancada', 'Meia entrada com documentação'],
        ticketCategory: 'individual',
      },
      {
        name: 'VIP - Meia-entrada',
        description: 'Meia entrada área VIP',
        basePrice: 70.0,
        fee: 7.0,
        totalPrice: 77.0,
        quantityTotal: 1500,
        maxPerOrder: 10,
        features: ['Acesso à área VIP', 'Melhor visualização', 'Meia entrada com documentação'],
        ticketCategory: 'individual',
      },
      {
        name: 'Arquibancada - Inteira',
        description: 'Ingresso inteiro arquibancada',
        basePrice: 100.0,
        fee: 10.0,
        totalPrice: 110.0,
        quantityTotal: 5000,
        maxPerOrder: 10,
        features: ['Acesso à arquibancada', 'Ingresso inteiro'],
        ticketCategory: 'individual',
      },
      {
        name: 'VIP - Inteira',
        description: 'Ingresso inteiro área VIP',
        basePrice: 140.0,
        fee: 14.0,
        totalPrice: 154.0,
        quantityTotal: 1500,
        maxPerOrder: 10,
        features: ['Acesso à área VIP', 'Melhor visualização', 'Ingresso inteiro'],
        ticketCategory: 'individual',
      },
    ],
  },

  // 08/05 - Alok + Matuê
  {
    slug: 'expoinga-2026-alok-matue',
    name: 'EXPOINGÁ 2026 - Alok + Matuê',
    artist: 'Alok + Matuê',
    description: 'Sexta-feira da Expoingá 2026 com o DJ mais famoso do Brasil, Alok, e o trap de Matuê! Uma noite de música eletrônica e trap que vai abalar a Arena Sicoob.',
    date: new Date('2026-05-08T22:00:00'),
    venue: 'Arena Sicoob - Parque de Exposições',
    city: 'Maringá',
    state: 'PR',
    eventType: 'show',
    category: 'agronegocio',
    bannerUrl: 'https://files.catbox.moe/kw79ro.jpg',
    videoUrl: 'https://files.catbox.moe/vypmws.mp4',
    originalLink: 'https://www.blueticket.com.br/search?q=expoinga',
    discountType: 'fixed',
    fixedDiscount: 40,
    badge: '08/05 - Sexta-feira',
    featured: false,
    ticketTypes: [
      {
        name: 'Arquibancada - Meia-entrada',
        description: 'Meia entrada arquibancada',
        basePrice: 50.0,
        fee: 5.0,
        totalPrice: 55.0,
        quantityTotal: 5000,
        maxPerOrder: 10,
        features: ['Acesso à arquibancada', 'Meia entrada com documentação'],
        ticketCategory: 'individual',
      },
      {
        name: 'VIP - Meia-entrada',
        description: 'Meia entrada área VIP',
        basePrice: 70.0,
        fee: 7.0,
        totalPrice: 77.0,
        quantityTotal: 1500,
        maxPerOrder: 10,
        features: ['Acesso à área VIP', 'Melhor visualização', 'Meia entrada com documentação'],
        ticketCategory: 'individual',
      },
      {
        name: 'Arquibancada - Inteira',
        description: 'Ingresso inteiro arquibancada',
        basePrice: 100.0,
        fee: 10.0,
        totalPrice: 110.0,
        quantityTotal: 5000,
        maxPerOrder: 10,
        features: ['Acesso à arquibancada', 'Ingresso inteiro'],
        ticketCategory: 'individual',
      },
      {
        name: 'VIP - Inteira',
        description: 'Ingresso inteiro área VIP',
        basePrice: 140.0,
        fee: 14.0,
        totalPrice: 154.0,
        quantityTotal: 1500,
        maxPerOrder: 10,
        features: ['Acesso à área VIP', 'Melhor visualização', 'Ingresso inteiro'],
        ticketCategory: 'individual',
      },
    ],
  },

  // 09/05 - Ana Castela + Countrybeat
  {
    slug: 'expoinga-2026-ana-castela-countrybeat',
    name: 'EXPOINGÁ 2026 - Ana Castela + Countrybeat',
    artist: 'Ana Castela + Countrybeat',
    description: 'Sábado da Expoingá 2026 com a rainha do agronegócio, Ana Castela, e oCountrybeat! A boiadeira mais famosa do Brasil em uma noite inesquecível.',
    date: new Date('2026-05-09T22:00:00'),
    venue: 'Arena Sicoob - Parque de Exposições',
    city: 'Maringá',
    state: 'PR',
    eventType: 'show',
    category: 'agronegocio',
    bannerUrl: 'https://files.catbox.moe/kw79ro.jpg',
    videoUrl: 'https://files.catbox.moe/vypmws.mp4',
    originalLink: 'https://www.blueticket.com.br/search?q=expoinga',
    discountType: 'fixed',
    fixedDiscount: 40,
    badge: '09/05 - Sábado',
    featured: false,
    ticketTypes: [
      {
        name: 'Arquibancada - Meia-entrada',
        description: 'Meia entrada arquibancada',
        basePrice: 50.0,
        fee: 5.0,
        totalPrice: 55.0,
        quantityTotal: 5000,
        maxPerOrder: 10,
        features: ['Acesso à arquibancada', 'Meia entrada com documentação'],
        ticketCategory: 'individual',
      },
      {
        name: 'VIP - Meia-entrada',
        description: 'Meia entrada área VIP',
        basePrice: 70.0,
        fee: 7.0,
        totalPrice: 77.0,
        quantityTotal: 1500,
        maxPerOrder: 10,
        features: ['Acesso à área VIP', 'Melhor visualização', 'Meia entrada com documentação'],
        ticketCategory: 'individual',
      },
      {
        name: 'Arquibancada - Inteira',
        description: 'Ingresso inteiro arquibancada',
        basePrice: 100.0,
        fee: 10.0,
        totalPrice: 110.0,
        quantityTotal: 5000,
        maxPerOrder: 10,
        features: ['Acesso à arquibancada', 'Ingresso inteiro'],
        ticketCategory: 'individual',
      },
      {
        name: 'VIP - Inteira',
        description: 'Ingresso inteiro área VIP',
        basePrice: 140.0,
        fee: 14.0,
        totalPrice: 154.0,
        quantityTotal: 1500,
        maxPerOrder: 10,
        features: ['Acesso à área VIP', 'Melhor visualização', 'Ingresso inteiro'],
        ticketCategory: 'individual',
      },
    ],
  },

  // 10/05 - Matheus e Kauan + Gustavo Mioto
  {
    slug: 'expoinga-2026-matheus-kauan-gustavo-mioto',
    name: 'EXPOINGÁ 2026 - Matheus e Kauan + Gustavo Mioto',
    artist: 'Matheus e Kauan + Gustavo Mioto',
    description: 'Domingo da Expoingá 2026 com a dupla Matheus e Kauan e o sucesso de Gustavo Mioto! Uma noite de muito sertanejo para encerrar o primeiro final de semana.',
    date: new Date('2026-05-10T22:00:00'),
    venue: 'Arena Sicoob - Parque de Exposições',
    city: 'Maringá',
    state: 'PR',
    eventType: 'show',
    category: 'agronegocio',
    bannerUrl: 'https://files.catbox.moe/kw79ro.jpg',
    videoUrl: 'https://files.catbox.moe/vypmws.mp4',
    originalLink: 'https://www.blueticket.com.br/search?q=expoinga',
    discountType: 'fixed',
    fixedDiscount: 40,
    badge: '10/05 - Domingo',
    featured: false,
    ticketTypes: [
      {
        name: 'Arquibancada - Meia-entrada',
        description: 'Meia entrada arquibancada',
        basePrice: 50.0,
        fee: 5.0,
        totalPrice: 55.0,
        quantityTotal: 5000,
        maxPerOrder: 10,
        features: ['Acesso à arquibancada', 'Meia entrada com documentação'],
        ticketCategory: 'individual',
      },
      {
        name: 'VIP - Meia-entrada',
        description: 'Meia entrada área VIP',
        basePrice: 70.0,
        fee: 7.0,
        totalPrice: 77.0,
        quantityTotal: 1500,
        maxPerOrder: 10,
        features: ['Acesso à área VIP', 'Melhor visualização', 'Meia entrada com documentação'],
        ticketCategory: 'individual',
      },
      {
        name: 'Arquibancada - Inteira',
        description: 'Ingresso inteiro arquibancada',
        basePrice: 100.0,
        fee: 10.0,
        totalPrice: 110.0,
        quantityTotal: 5000,
        maxPerOrder: 10,
        features: ['Acesso à arquibancada', 'Ingresso inteiro'],
        ticketCategory: 'individual',
      },
      {
        name: 'VIP - Inteira',
        description: 'Ingresso inteiro área VIP',
        basePrice: 140.0,
        fee: 14.0,
        totalPrice: 154.0,
        quantityTotal: 1500,
        maxPerOrder: 10,
        features: ['Acesso à área VIP', 'Melhor visualização', 'Ingresso inteiro'],
        ticketCategory: 'individual',
      },
    ],
  },

  // 14/05 - Péricles + Sorriso Maroto
  {
    slug: 'expoinga-2026-pericles-sorriso-maroto',
    name: 'EXPOINGÁ 2026 - Péricles + Sorriso Maroto',
    artist: 'Péricles + Sorriso Maroto',
    description: 'Quinta-feira da Expoingá 2026 com o pagode de Péricles e Sorriso Maroto! Uma noite de muito samba e pagode para fazer o público cantar junto.',
    date: new Date('2026-05-14T22:00:00'),
    venue: 'Arena Sicoob - Parque de Exposições',
    city: 'Maringá',
    state: 'PR',
    eventType: 'show',
    category: 'agronegocio',
    bannerUrl: 'https://files.catbox.moe/kw79ro.jpg',
    videoUrl: 'https://files.catbox.moe/vypmws.mp4',
    originalLink: 'https://www.blueticket.com.br/search?q=expoinga',
    discountType: 'fixed',
    fixedDiscount: 40,
    badge: '14/05 - Quinta-feira',
    featured: false,
    ticketTypes: [
      {
        name: 'Arquibancada - Meia-entrada',
        description: 'Meia entrada arquibancada',
        basePrice: 50.0,
        fee: 5.0,
        totalPrice: 55.0,
        quantityTotal: 5000,
        maxPerOrder: 10,
        features: ['Acesso à arquibancada', 'Meia entrada com documentação'],
        ticketCategory: 'individual',
      },
      {
        name: 'VIP - Meia-entrada',
        description: 'Meia entrada área VIP',
        basePrice: 70.0,
        fee: 7.0,
        totalPrice: 77.0,
        quantityTotal: 1500,
        maxPerOrder: 10,
        features: ['Acesso à área VIP', 'Melhor visualização', 'Meia entrada com documentação'],
        ticketCategory: 'individual',
      },
      {
        name: 'Arquibancada - Inteira',
        description: 'Ingresso inteiro arquibancada',
        basePrice: 100.0,
        fee: 10.0,
        totalPrice: 110.0,
        quantityTotal: 5000,
        maxPerOrder: 10,
        features: ['Acesso à arquibancada', 'Ingresso inteiro'],
        ticketCategory: 'individual',
      },
      {
        name: 'VIP - Inteira',
        description: 'Ingresso inteiro área VIP',
        basePrice: 140.0,
        fee: 14.0,
        totalPrice: 154.0,
        quantityTotal: 1500,
        maxPerOrder: 10,
        features: ['Acesso à área VIP', 'Melhor visualização', 'Ingresso inteiro'],
        ticketCategory: 'individual',
      },
    ],
  },

  // 15/05 - Daniel
  {
    slug: 'expoinga-2026-daniel',
    name: 'EXPOINGÁ 2026 - Daniel',
    artist: 'Daniel',
    description: 'Sexta-feira de encerramento da Expoingá 2026 com o lendário Daniel! Uma noite emocionante para fechar a festa com chave de ouro.',
    date: new Date('2026-05-15T22:00:00'),
    venue: 'Arena Sicoob - Parque de Exposições',
    city: 'Maringá',
    state: 'PR',
    eventType: 'show',
    category: 'agronegocio',
    bannerUrl: 'https://files.catbox.moe/kw79ro.jpg',
    videoUrl: 'https://files.catbox.moe/vypmws.mp4',
    originalLink: 'https://www.blueticket.com.br/search?q=expoinga',
    discountType: 'fixed',
    fixedDiscount: 40,
    badge: '15/05 - Sexta-feira',
    featured: false,
    ticketTypes: [
      {
        name: 'Arquibancada - Meia-entrada',
        description: 'Meia entrada arquibancada',
        basePrice: 50.0,
        fee: 5.0,
        totalPrice: 55.0,
        quantityTotal: 5000,
        maxPerOrder: 10,
        features: ['Acesso à arquibancada', 'Meia entrada com documentação'],
        ticketCategory: 'individual',
      },
      {
        name: 'VIP - Meia-entrada',
        description: 'Meia entrada área VIP',
        basePrice: 70.0,
        fee: 7.0,
        totalPrice: 77.0,
        quantityTotal: 1500,
        maxPerOrder: 10,
        features: ['Acesso à área VIP', 'Melhor visualização', 'Meia entrada com documentação'],
        ticketCategory: 'individual',
      },
      {
        name: 'Arquibancada - Inteira',
        description: 'Ingresso inteiro arquibancada',
        basePrice: 100.0,
        fee: 10.0,
        totalPrice: 110.0,
        quantityTotal: 5000,
        maxPerOrder: 10,
        features: ['Acesso à arquibancada', 'Ingresso inteiro'],
        ticketCategory: 'individual',
      },
      {
        name: 'VIP - Inteira',
        description: 'Ingresso inteiro área VIP',
        basePrice: 140.0,
        fee: 14.0,
        totalPrice: 154.0,
        quantityTotal: 1500,
        maxPerOrder: 10,
        features: ['Acesso à área VIP', 'Melhor visualização', 'Ingresso inteiro'],
        ticketCategory: 'individual',
      },
    ],
  },

  // ============================================
  // COPA DO MUNDO 2026
  // ============================================
  {
    slug: 'copa-do-mundo-2026',
    name: 'COPA DO MUNDO 2026 🏆',
    description: 'O maior evento esportivo do planeta! A Copa do Mundo FIFA 2026 será realizada em três países: Estados Unidos, Canadá e México. Pela primeira vez na história, 48 seleções disputarão o título mundial. Garanta seu ingresso para acompanhar os jogos ao vivo e viver essa experiência única!',
    date: new Date('2026-06-11T18:00:00'),
    endDate: new Date('2026-07-19T18:00:00'),
    venue: 'Múltiplos estádios',
    city: 'Internacional',
    state: 'USA/CAN/MEX',
    eventType: 'esporte',
    category: 'esporte',
    bannerUrl: 'https://files.catbox.moe/5vwc60.jpg',
    originalLink: 'https://365tickets.com.br/dock/competition/world-cup-2026',
    discountType: 'fixed',
    fixedDiscount: 50,
    badge: '🌍 Internacional',
    featured: true,
    ticketTypes: [
      {
        name: 'Fase de Grupos - Jogo Único',
        description: 'Ingresso para um jogo da fase de grupos',
        basePrice: 1250.0,
        fee: 125.0,
        totalPrice: 1375.0,
        quantityTotal: 500,
        maxPerOrder: 4,
        features: ['Jogo da fase de grupos', 'Cadeira numerada', 'Acesso às áreas comuns'],
        ticketCategory: 'individual',
      },
      {
        name: 'Oitavas de Final',
        description: 'Ingresso para jogo das Oitavas de Final',
        basePrice: 2250.0,
        fee: 225.0,
        totalPrice: 2475.0,
        quantityTotal: 200,
        maxPerOrder: 4,
        features: ['Jogo das Oitavas', 'Cadeira numerada', 'Acesso às áreas comuns', 'Brinde exclusivo'],
        ticketCategory: 'individual',
      },
      {
        name: 'Quartas de Final',
        description: 'Ingresso para jogo das Quartas de Final',
        basePrice: 3500.0,
        fee: 350.0,
        totalPrice: 3850.0,
        quantityTotal: 150,
        maxPerOrder: 4,
        features: ['Jogo das Quartas', 'Lugar VIP', 'Acesso ao lounge', 'Brinde exclusivo'],
        ticketCategory: 'individual',
      },
      {
        name: 'Semifinal',
        description: 'Ingresso para jogo da Semifinal',
        basePrice: 6000.0,
        fee: 600.0,
        totalPrice: 6600.0,
        quantityTotal: 100,
        maxPerOrder: 2,
        features: ['Jogo da Semifinal', 'Lugar VIP Premium', 'Acesso ao lounge exclusivo', 'Open bar', 'Brinde exclusivo'],
        ticketCategory: 'individual',
      },
      {
        name: 'FINAL - Categoria 1',
        description: 'Ingresso para a Grande Final - Melhor localização',
        basePrice: 12500.0,
        fee: 1250.0,
        totalPrice: 13750.0,
        quantityTotal: 50,
        maxPerOrder: 2,
        features: ['Grande Final', 'Melhor localização', 'Lounge VIP', 'Open bar premium', 'Meet & greet', 'Kit torcedor exclusivo'],
        ticketCategory: 'individual',
      },
      {
        name: 'FINAL - Categoria 2',
        description: 'Ingresso para a Grande Final - Ótima localização',
        basePrice: 9000.0,
        fee: 900.0,
        totalPrice: 9900.0,
        quantityTotal: 75,
        maxPerOrder: 2,
        features: ['Grande Final', 'Ótima localização', 'Acesso ao lounge', 'Brinde exclusivo'],
        ticketCategory: 'individual',
      },
      {
        name: 'Pacote Completo - Seleção Brasileira',
        description: 'Todos os jogos do Brasil até a final (garantido)',
        basePrice: 25000.0,
        fee: 2500.0,
        totalPrice: 27500.0,
        quantityTotal: 30,
        maxPerOrder: 1,
        features: ['Todos os jogos do Brasil', 'Hospedagem inclusa', 'Transfer aeroporto/hotel/estádio', 'Guia exclusivo', 'Kit premium'],
        ticketCategory: 'combo',
      },
    ],
  },
];

// ============================================
// SEED FUNCTION
// ============================================

async function main() {
  console.log('🌱 Starting database seed...\n');

  for (const eventData of events) {
    const { ticketTypes, discountPeriods, ...eventFields } = eventData as any;

    console.log(`📌 Processing event: ${eventFields.name}`);

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { slug: eventFields.slug },
    });

    if (existingEvent) {
      console.log(`   ⚠️  Event already exists, updating...`);

      // Update event
      await prisma.event.update({
        where: { slug: eventFields.slug },
        data: {
          ...eventFields,
          ticketTypes: {
            deleteMany: {},
            create: ticketTypes.map((tt: any) => ({
              ...tt,
              features: tt.features ? JSON.stringify(tt.features) : null,
            })),
          },
        },
      });

      // Update discount periods if provided
      if (discountPeriods) {
        await prisma.discountPeriod.deleteMany({
          where: { eventId: existingEvent.id },
        });

        await prisma.discountPeriod.createMany({
          data: discountPeriods.map((dp: any) => ({
            ...dp,
            eventId: existingEvent.id,
          })),
        });
      }
    } else {
      console.log(`   ✨ Creating new event...`);

      // Create event with ticket types
      const newEvent = await prisma.event.create({
        data: {
          ...eventFields,
          ticketTypes: {
            create: ticketTypes.map((tt: any) => ({
              ...tt,
              features: tt.features ? JSON.stringify(tt.features) : null,
            })),
          },
        },
      });

      // Create discount periods if provided
      if (discountPeriods) {
        await prisma.discountPeriod.createMany({
          data: discountPeriods.map((dp: any) => ({
            ...dp,
            eventId: newEvent.id,
          })),
        });
      }
    }

    console.log(`   ✅ Done!\n`);
  }

  console.log('🎉 Seed completed!');
  console.log(`\n📊 Summary:`);
  console.log(`   - ${events.length} events processed`);
  console.log(`   - Events by type:`);

  const eventTypeCounts = events.reduce((acc, e) => {
    acc[e.eventType || 'show'] = (acc[e.eventType || 'show'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(eventTypeCounts).forEach(([type, count]) => {
    console.log(`     • ${type}: ${count}`);
  });

  console.log(`\n   - Events by city:`);
  const cityCounts = events.reduce((acc, e) => {
    acc[e.city] = (acc[e.city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(cityCounts).forEach(([city, count]) => {
    console.log(`     • ${city}: ${count}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
