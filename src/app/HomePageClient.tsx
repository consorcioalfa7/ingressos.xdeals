'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sparkles,
  Ticket,
  Shield,
  Zap,
  ExternalLink,
  MapPin,
  Music,
  Calendar,
  Filter,
  X,
  Globe,
  Clock,
  Users,
  TrendingUp,
  Gift,
  Star,
  ChevronRight,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Building2,
  Heart,
  Award,
  Play,
  Volume2,
  VolumeX,
} from 'lucide-react';

// Event type labels
const eventTypeLabels: Record<string, string> = {
  show: 'Show',
  festival: 'Festival',
  exposicao: 'Exposição',
  rodeio: 'Rodeio',
  esporte: 'Esporte',
};

// Category labels
const categoryLabels: Record<string, string> = {
  musica: 'Música',
  agronegocio: 'Agronegócio',
  esporte: 'Esporte',
  cultura: 'Cultura',
};

// YouTube videos for multi-video banner
const heroVideos = [
  { id: 'ajNyVDEBhC8', start: 0 },
  { id: 'GmivHecABGU', start: 0 },
  { id: '7HmDmUyz3Dc', start: 0 },
  { id: 'vzEIwc0rG8Y', start: 0 },
];

interface EventData {
  id: string;
  slug: string;
  name: string;
  artist: string | null;
  tour: string | null;
  description: string | null;
  date: string;
  endDate: string | null;
  venue: string;
  city: string;
  state: string | null;
  eventType: string;
  category: string;
  bannerUrl: string;
  badge: string | null;
  featured: boolean;
  currentDiscount: number;
  minTicketPrice: number;
  minFinalPrice: number;
}

interface HomePageClientProps {
  events: EventData[];
  cities: string[];
  eventTypes: string[];
  categories: string[];
  states: string[];
  eventTypeLabels: Record<string, string>;
  categoryLabels: Record<string, string>;
}

// Helper function to format currency
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Helper function to format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Helper function to format date range
function formatDateRange(startDate: string, endDate: string | null): string {
  if (!endDate) return formatDate(startDate);
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start.toDateString() === end.toDateString()) {
    return formatDate(startDate);
  }
  
  return `${start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} a ${end.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

// Multi-video hero banner component
function MultiVideoHero({ isVisible, eventsCount }: { isVisible: boolean; eventsCount: number }) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRefs = useRef<(HTMLIFrameElement | null)[]>([]);

  // Cycle through videos every 12 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideoIndex((prev) => (prev + 1) % heroVideos.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Video Background Grid */}
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
        {heroVideos.map((video, index) => (
          <div
            key={video.id}
            className={`relative overflow-hidden transition-all duration-1000 ${
              index === currentVideoIndex ? 'opacity-100 scale-100 z-10' : 'opacity-30 scale-95'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-black/70 to-blue-900/60 z-10" />
            <iframe
              ref={(el) => { videoRefs.current[index] = el; }}
              src={`https://www.youtube.com/embed/${video.id}?autoplay=1&mute=1&loop=1&playlist=${video.id}&controls=0&showinfo=0&rel=0&modestbranding=1&start=${video.start}&enablejsapi=1`}
              className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 object-cover pointer-events-none scale-125"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        ))}
      </div>

      {/* Animated overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-20" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-transparent to-blue-900/30 z-20 animate-pulse-slow" />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-600/40 rounded-full blur-[150px] animate-pulse-slow z-20" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-600/30 rounded-full blur-[120px] animate-pulse-slow z-20" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-600/20 rounded-full blur-[200px] animate-pulse-slow z-20" style={{ animationDelay: '4s' }} />

      {/* Animated particles */}
      <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              opacity: Math.random() * 0.8 + 0.2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 text-center">
        {/* Animated Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-500/50 mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Gift className="w-4 h-4 text-green-400 animate-bounce" />
          <span className="text-green-400 font-semibold text-sm">OFERTAS IMPERDÍVEIS 2026</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>

        {/* Main Title */}
        <h1 className={`text-5xl md:text-7xl lg:text-9xl font-black mb-8 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="block text-white mb-4 drop-shadow-2xl">Ingressos com até</span>
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-drop">
              60% OFF
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 blur-3xl opacity-50 animate-pulse" />
            <span className="absolute -inset-4 bg-gradient-to-r from-green-400/50 to-cyan-400/50 blur-3xl opacity-30 animate-pulse-slow" />
          </span>
        </h1>

        <p className={`text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          Descontos exclusivos em shows, festivais, exposições e eventos esportivos.
          <span className="text-purple-400 font-semibold"> XDeals é parceiro oficial Q2Ingressos.</span>
        </p>

        {/* Stats */}
        <div className={`flex flex-wrap justify-center gap-8 md:gap-20 mb-12 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center group">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 blur-2xl opacity-30 group-hover:opacity-60 transition-opacity" />
              <p className="relative text-5xl md:text-6xl font-black text-white drop-shadow-lg">
                60<span className="text-green-400">%</span>
              </p>
            </div>
            <p className="text-sm text-gray-400 mt-2 font-medium">de desconto</p>
          </div>
          <div className="text-center group">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-2xl opacity-30 group-hover:opacity-60 transition-opacity" />
              <p className="relative text-5xl md:text-6xl font-black text-white drop-shadow-lg">
                {eventsCount}
              </p>
            </div>
            <p className="text-sm text-gray-400 mt-2 font-medium">eventos ativos</p>
          </div>
          <div className="text-center group">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 blur-2xl opacity-30 group-hover:opacity-60 transition-opacity" />
              <p className="relative text-5xl md:text-6xl font-black text-white drop-shadow-lg">
                100<span className="text-cyan-400">%</span>
              </p>
            </div>
            <p className="text-sm text-gray-400 mt-2 font-medium">seguro</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Button
            size="lg"
            className="relative group bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 text-white font-bold text-lg px-12 py-8 rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300"
            asChild
          >
            <a href="#eventos">
              <span className="relative z-10 flex items-center">
                <Ticket className="w-6 h-6 mr-2" />
                Ver Eventos
                <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform" />
              </span>
            </a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-bold text-lg px-12 py-8 rounded-2xl backdrop-blur-sm hover:scale-105 transition-all duration-300"
            asChild
          >
            <a href="https://q2ingressos.com.br" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-5 h-5 mr-2" />
              Site Oficial Q2
            </a>
          </Button>
        </div>

        {/* Video indicator dots */}
        <div className="flex justify-center gap-3 mt-12">
          {heroVideos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentVideoIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentVideoIndex
                  ? 'bg-white scale-125 shadow-lg shadow-white/50'
                  : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-white/50 rounded-full animate-scroll-indicator" />
        </div>
      </div>
    </section>
  );
}

// Copa do Mundo 2026 Banner
function CopaDoMundoBanner() {
  return (
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <a 
          href="https://365tickets.com.br/dock/competition/world-cup-2026" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block group"
        >
          <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 shadow-2xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-500 hover:scale-[1.02]">
            {/* Banner Image */}
            <img
              src="https://files.catbox.moe/5vwc60.jpg"
              alt="Copa do Mundo 2026"
              className="w-full h-64 md:h-80 object-cover"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
            
            {/* Animated glow effect */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/30 rounded-full blur-[100px] animate-pulse-slow group-hover:opacity-70 transition-opacity" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-yellow-500/20 rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: '2s' }} />

            {/* Content */}
            <div className="absolute inset-0 flex items-center p-8 md:p-12">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold animate-pulse">
                    <Star className="w-3 h-3 mr-1" />
                    EVENTO IMPERDÍVEL
                  </Badge>
                  <Badge className="bg-emerald-500/30 border-emerald-500/50 text-emerald-400 backdrop-blur-sm">
                    <Clock className="w-3 h-3 mr-1" />
                    JUNHO 2026
                  </Badge>
                </div>
                
                <h2 className="text-3xl md:text-5xl font-black text-white mb-3 drop-shadow-2xl">
                  COPA DO MUNDO 2026
                </h2>
                
                <p className="text-gray-300 mb-4 text-lg hidden md:block">
                  Estados Unidos, Canadá e México. Garanta seu ingresso para o maior evento esportivo do planeta!
                </p>
                
                <div className="flex items-center gap-4 flex-wrap">
                  <Badge className="bg-green-500 text-white font-bold text-lg px-5 py-2 animate-pulse">
                    50% OFF
                  </Badge>
                  <div className="text-white">
                    <span className="text-sm text-gray-400 line-through mr-2">A partir de R$ 2.500</span>
                    <span className="text-2xl font-bold">R$ 1.250</span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="hidden md:block ml-auto">
                <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold px-8 py-6 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/30">
                  <Ticket className="w-5 h-5 mr-2" />
                  Garantir Ingresso
                </Button>
              </div>
            </div>
          </div>
        </a>
      </div>
    </section>
  );
}

// Floating particles component
function FloatingParticles() {
  return (
    <div className="fixed inset-0 -z-5 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );
}

// Animated background gradient
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-950" />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-900/30 via-transparent to-transparent animate-gradient-shift" />
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent animate-gradient-shift" style={{ animationDelay: '5s' }} />
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-pink-900/20 via-transparent to-transparent animate-gradient-shift" style={{ animationDelay: '10s' }} />
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent animate-gradient-shift" style={{ animationDelay: '15s' }} />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
    </div>
  );
}

// Stats counter animation
function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  return (
    <span className="tabular-nums">
      {value}{suffix}
    </span>
  );
}

export function HomePageClient({
  events,
  cities,
  eventTypes,
  categories,
  states,
}: HomePageClientProps) {
  // Filter state
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedEventType, setSelectedEventType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (selectedCity !== 'all' && event.city !== selectedCity) return false;
      if (selectedEventType !== 'all' && event.eventType !== selectedEventType) return false;
      if (selectedCategory !== 'all' && event.category !== selectedCategory) return false;
      return true;
    });
  }, [events, selectedCity, selectedEventType, selectedCategory]);

  // Featured events (always show first)
  const featuredEvents = filteredEvents.filter(e => e.featured);
  const regularEvents = filteredEvents.filter(e => !e.featured);

  // Clear all filters
  const clearFilters = () => {
    setSelectedCity('all');
    setSelectedEventType('all');
    setSelectedCategory('all');
  };

  // Check if any filter is active
  const hasActiveFilters = selectedCity !== 'all' || selectedEventType !== 'all' || selectedCategory !== 'all';

  return (
    <div className="min-h-screen bg-transparent text-white overflow-x-hidden">
      <AnimatedBackground />
      <FloatingParticles />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg blur-md opacity-50 group-hover:opacity-100 transition-opacity group-hover:scale-110 transition-transform" />
              <div className="relative p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                XDeals
              </span>
              <span className="hidden md:inline text-xs text-gray-500 ml-2">by DARKPAY</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <Badge
              variant="outline"
              className="border-purple-500/30 text-purple-300 bg-purple-500/5 backdrop-blur-sm hidden sm:flex animate-pulse"
            >
              <Shield className="w-3 h-3 mr-1" />
              Parceiro Oficial Q2Ingressos
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-white/5"
              asChild
            >
              <a href="https://q2ingressos.com.br" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" />
                Q2Ingressos
              </a>
            </Button>
          </div>
        </div>
      </header>

      {/* Multi-Video Hero Section */}
      <div className="pt-0">
        <MultiVideoHero isVisible={isVisible} eventsCount={events.length} />
      </div>

      {/* Copa do Mundo Banner */}
      <CopaDoMundoBanner />

      {/* Events Section */}
      <section id="eventos" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header with Filters Toggle */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-purple-400" />
                Eventos Disponíveis
              </h2>
              <p className="text-gray-400">
                <span className="text-purple-400 font-semibold">{filteredEvents.length}</span> evento{filteredEvents.length !== 1 ? 's' : ''} encontrado{filteredEvents.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-all ${showFilters ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : ''}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {hasActiveFilters && (
                <Badge className="ml-2 bg-purple-500 text-white text-xs">
                  {[selectedCity !== 'all', selectedEventType !== 'all', selectedCategory !== 'all'].filter(Boolean).length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mb-8 p-6 rounded-2xl bg-gray-900/50 backdrop-blur-sm border border-gray-800 animate-in slide-in-from-top duration-300">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* City Filter */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block font-medium">Cidade</label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white hover:border-purple-500/50 transition-colors">
                      <SelectValue placeholder="Todas as cidades" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      <SelectItem value="all">Todas as cidades</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Event Type Filter */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block font-medium">Tipo de Evento</label>
                  <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                    <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white hover:border-purple-500/50 transition-colors">
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      {eventTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {eventTypeLabels[type] || type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block font-medium">Categoria</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white hover:border-purple-500/50 transition-colors">
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {categoryLabels[cat] || cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                    className="w-full text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpar Filtros
                  </Button>
                </div>
              </div>

              {/* Active Filters Tags */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-800">
                  <span className="text-sm text-gray-500">Filtros ativos:</span>
                  {selectedCity !== 'all' && (
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      <MapPin className="w-3 h-3 mr-1" />
                      {selectedCity}
                      <button onClick={() => setSelectedCity('all')} className="ml-1 hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedEventType !== 'all' && (
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      <Calendar className="w-3 h-3 mr-1" />
                      {eventTypeLabels[selectedEventType] || selectedEventType}
                      <button onClick={() => setSelectedEventType('all')} className="ml-1 hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedCategory !== 'all' && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                      <Music className="w-3 h-3 mr-1" />
                      {categoryLabels[selectedCategory] || selectedCategory}
                      <button onClick={() => setSelectedCategory('all')} className="ml-1 hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Featured Events */}
          {featuredEvents.length > 0 && !hasActiveFilters && (
            <div className="mb-12">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 animate-pulse" />
                <span>Destaques</span>
                <div className="h-px flex-1 bg-gradient-to-r from-purple-500/50 to-transparent ml-4" />
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredEvents.map((event, index) => (
                  <EventCard key={event.id} event={event} index={index} featured />
                ))}
              </div>
            </div>
          )}

          {/* All Events */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(hasActiveFilters ? filteredEvents : regularEvents).map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                <Filter className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 text-lg mb-2">
                Nenhum evento encontrado com esses filtros.
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Tente ajustar os filtros ou remover alguns critérios.
              </p>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10"
              >
                <X className="w-4 h-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Why XDeals Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Por que comprar pelo <span className="text-purple-400">XDeals</span>?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Somos parceiros oficiais das maiores plataformas de ingressos do Brasil
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Secure Purchase */}
            <div className="group p-8 rounded-3xl bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 hover:border-green-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Compra Segura</h3>
              <p className="text-gray-400 leading-relaxed">
                Parceiro oficial Q2Ingressos com garantia total dos ingressos. Pagamento via PIX com confirmação instantânea.
              </p>
            </div>

            {/* Exclusive Discounts */}
            <div className="group p-8 rounded-3xl bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Descontos Exclusivos</h3>
              <p className="text-gray-400 leading-relaxed">
                Economize até 60% comparado ao preço oficial. Descontos progressivos e ofertas especiais.
              </p>
            </div>

            {/* Fast Delivery */}
            <div className="group p-8 rounded-3xl bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Entrega Programada</h3>
              <p className="text-gray-400 leading-relaxed">
                Ingressos enviados até 72h antes do evento. Confirmação imediata da compra por WhatsApp e e-mail.
              </p>
            </div>

            {/* Official Partner */}
            <div className="group p-8 rounded-3xl bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-500/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Award className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Parceiro Oficial</h3>
              <p className="text-gray-400 leading-relaxed">
                Ingressos originais da Q2Ingressos com desconto especial. Suporte 24/7 via WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative mt-16 border-t border-white/5">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 to-black" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg blur-md opacity-50" />
                  <div className="relative p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    XDeals
                  </span>
                  <p className="text-xs text-gray-500">by DARKPAY</p>
                </div>
              </Link>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Plataforma oficial de ingressos promocionais. Parceiro autorizado Q2Ingressos com os melhores descontos do mercado.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 flex items-center justify-center text-gray-400 hover:text-purple-400 transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/30 flex items-center justify-center text-gray-400 hover:text-blue-400 transition-all">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/30 flex items-center justify-center text-gray-400 hover:text-cyan-400 transition-all">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#eventos" className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-purple-400" />
                    Todos os Eventos
                  </a>
                </li>
                <li>
                  <a href="https://q2ingressos.com.br" target="_blank" className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-purple-400" />
                    Q2Ingressos
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-purple-400" />
                    Como Funciona
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-purple-400" />
                    Termos de Uso
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-purple-400" />
                    Política de Privacidade
                  </a>
                </li>
              </ul>
            </div>

            {/* Locations */}
            <div>
              <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                Nossas Sedes
              </h4>
              <ul className="space-y-4">
                <li className="text-sm">
                  <p className="text-white font-medium">São Paulo, Brasil</p>
                  <p className="text-gray-400">Av. Paulista, 1000 - Bela Vista</p>
                  <p className="text-gray-500 text-xs">CEP: 01310-100</p>
                </li>
                <li className="text-sm">
                  <p className="text-white font-medium">Brasília, Brasil</p>
                  <p className="text-gray-400">Setor Comercial Sul, Quadra 4</p>
                  <p className="text-gray-500 text-xs">CEP: 70304-000</p>
                </li>
                <li className="text-sm">
                  <p className="text-white font-medium">Lisboa, Portugal</p>
                  <p className="text-gray-400">Av. da Liberdade, 110</p>
                  <p className="text-gray-500 text-xs">1250-096 Lisboa</p>
                </li>
                <li className="text-sm">
                  <p className="text-white font-medium">Madrid, Espanha</p>
                  <p className="text-gray-400">Calle Gran Vía, 28</p>
                  <p className="text-gray-500 text-xs">28013 Madrid</p>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">Contato</h4>
              <ul className="space-y-4">
                <li>
                  <a href="tel:+5562992887416" className="flex items-center gap-3 text-gray-400 hover:text-white text-sm transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">WhatsApp</p>
                      <p>+55 62 99288-7416</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a href="mailto:contato@xdeals.online" className="flex items-center gap-3 text-gray-400 hover:text-white text-sm transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">E-mail</p>
                      <p>contato@xdeals.online</p>
                    </div>
                  </a>
                </li>
                <li>
                  <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Website</p>
                      <p>ingressos.xdeals.online</p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Partners */}
          <div className="py-8 border-t border-white/5 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Compra 100% Segura</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Award className="w-4 h-4 text-purple-500" />
                <span>Parceiro Oficial Q2Ingressos</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Users className="w-4 h-4 text-blue-500" />
                <span>+50.000 Clientes Satisfeitos</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Heart className="w-4 h-4 text-pink-500" />
                <span>Suporte Humanizado</span>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="pt-8 border-t border-white/5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Badge
                  variant="outline"
                  className="border-purple-500/30 text-purple-300 bg-purple-500/5"
                >
                  Parceiro Q2Ingressos
                </Badge>
                <span className="text-gray-500 text-xs">
                  CNPJ: 21.233.248/0001-72
                </span>
              </div>
              
              <div className="text-center md:text-right">
                <p className="text-gray-500 text-sm">
                  © {new Date().getFullYear()} XDeals. Todos os direitos reservados.
                </p>
                <p className="text-gray-600 text-xs mt-1">
                  Powered by <span className="text-purple-400">DARKPAY</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Event Card Component
function EventCard({ event, index, featured = false }: { event: EventData; index: number; featured?: boolean }) {
  return (
    <Link href={`/events/${event.slug}`} className="block group">
      <div 
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/50 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-purple-500/20 ${featured ? 'ring-2 ring-purple-500/30' : ''}`}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {/* Banner */}
        <div className="relative h-48 md:h-56 overflow-hidden">
          <img
            src={event.bannerUrl}
            alt={event.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
          
          {/* Discount Badge */}
          {event.currentDiscount > 0 && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-sm px-3 py-1 shadow-lg shadow-green-500/30 animate-pulse">
                {event.currentDiscount}% OFF
              </Badge>
            </div>
          )}

          {/* Badge */}
          {event.badge && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-purple-500/90 backdrop-blur-sm text-white font-medium shadow-lg shadow-purple-500/20">
                {event.badge}
              </Badge>
            </div>
          )}

          {/* Event Type Badge */}
          <div className="absolute bottom-3 left-3">
            <Badge variant="outline" className="bg-gray-900/80 backdrop-blur-sm border-gray-700 text-gray-300 text-xs">
              {eventTypeLabels[event.eventType] || event.eventType}
            </Badge>
          </div>

          {/* Featured indicator */}
          {featured && (
            <div className="absolute bottom-3 right-3">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-pulse" />
            </div>
          )}
        </div>

        <div className="p-6">
          {/* Event Info */}
          <div className="space-y-3">
            {/* Title */}
            <div>
              <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-purple-400 transition-colors">
                {event.name}
              </h3>
              {event.artist && (
                <p className="text-purple-400 font-medium text-sm">{event.artist}</p>
              )}
            </div>

            {/* Date & Location */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>{formatDateRange(event.date, event.endDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span className="line-clamp-1">{event.venue} - {event.city}{event.state ? `, ${event.state}` : ''}</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
              <div>
                <p className="text-xs text-gray-500 mb-1">A partir de</p>
                <div className="flex items-baseline gap-2">
                  {event.currentDiscount > 0 && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatCurrency(event.minTicketPrice)}
                    </span>
                  )}
                  <span className="text-2xl font-bold text-white">
                    {formatCurrency(event.minFinalPrice)}
                  </span>
                </div>
              </div>
              <Button size="sm" className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all">
                <Ticket className="w-4 h-4 mr-1" />
                Comprar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
