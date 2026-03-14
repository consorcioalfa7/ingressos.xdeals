'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QRCodeSVG } from 'qrcode.react';
import { formatCPF, validateCPF } from '@/lib/pricing';
import { Loader2, CreditCard, CheckCircle2, XCircle, Copy, Check, PartyPopper, CalendarDays } from 'lucide-react';

// ============================================
// TYPES & SCHEMA (Email focused)
// ============================================

interface TicketType {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  fee: number;
  totalPrice: number;
  features: string[];
}

const checkoutSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().refine((val) => validateCPF(val), { message: 'CPF inválido' }),
  email: z.string().email('E-mail inválido para recebimento'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  eventSlug: string;
  eventName: string;
  selectedTicket: TicketType | null;
  quantity: number;
  discountPercent: number;
  isActive: boolean;
}

// ============================================
// HELPERS
// ============================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function calculatePrice(ticket: TicketType, discountPercent: number) {
  const originalPrice = ticket.totalPrice;
  const discountAmount = originalPrice * (discountPercent / 100);
  const finalPrice = originalPrice - discountAmount;
  return { originalPrice, discountAmount, finalPrice: Math.round(finalPrice * 100) / 100 };
}

// ============================================
// COMPONENT
// ============================================

export function CheckoutForm({ eventSlug, eventName, selectedTicket, quantity, discountPercent, isActive }: CheckoutFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  // 🔄 MONITORIZAÇÃO (Polling) - Só ativa quando há uma reserva criada
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (result?.success && result.orderId && !isPaid) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/notify?orderId=${result.orderId}`);
          const data = await res.json();
          if (data.status === 'paid') {
            setIsPaid(true);
            clearInterval(interval);
          }
        } catch (err) { console.error("Polling error:", err); }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [result, isPaid]);

  const onSubmit = async (data: CheckoutFormData) => {
    if (!selectedTicket) return;
    setIsSubmitting(true);
    setResult(null);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          contactType: 'Email',
          contactValue: data.email,
          eventSlug,
          ticketId: selectedTicket.id,
          quantity,
          discountPercent,
        }),
      });
      const resData = await response.json();
      setResult(resData);
    } catch {
      setResult({ success: false, error: 'Erro ao processar reserva.' });
    } finally { setIsSubmitting(false); }
  };

  if (!selectedTicket) return null;

  const pricing = calculatePrice(selectedTicket, discountPercent);
  const total = pricing.finalPrice * quantity;

  // TELA 1: SUCESSO (PÓS-PAGAMENTO)
  if (isPaid) {
    return (
      <Card className="bg-gray-900/50 border-green-500/50">
        <CardContent className="py-12 text-center space-y-6">
          <div className="relative inline-block">
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
            <PartyPopper className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold text-white uppercase">Pagamento Realizado!</h2>
          <div className="bg-zinc-800 p-6 rounded-xl text-left border border-zinc-700">
            <div className="flex gap-4">
              <CalendarDays className="w-6 h-6 text-purple-400 shrink-0" />
              <p className="text-sm text-gray-200">
                🚀 <strong>Ingressos Garantidos!</strong> Seus QR Codes serão enviados para o seu e-mail cadastrado em até <strong>72 horas antes</strong> do evento.
              </p>
            </div>
          </div>
          <Button onClick={() => window.location.href = '/'} className="w-full bg-white text-black font-bold py-6">Voltar ao Início</Button>
        </CardContent>
      </Card>
    );
  }

  // TELA 2: QR CODE (AGUARDANDO PAGAMENTO)
  if (result?.success) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
            <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Aguardando PIX...</span>
          </div>
          <div className="inline-block p-4 bg-white rounded-xl mb-6 shadow-2xl">
            <QRCodeSVG value={result.pixCode} size={200} />
          </div>
          <div className="space-y-4 max-w-sm mx-auto">
            <Button onClick={() => { navigator.clipboard.writeText(result.pixCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }} 
                    className="w-full bg-zinc-800 border border-zinc-700">
              {copied ? 'Copiado!' : 'Copiar Código PIX'}
            </Button>
            <div className="p-3 bg-zinc-900 rounded text-left text-[10px] text-gray-500 font-mono flex justify-between">
              <span>ORDER ID: {result.orderId}</span>
              <span className="text-purple-500 font-bold">VALOR: {formatCurrency(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // TELA 3: FORMULÁRIO DE COMPRA
  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-purple-400" /> Finalizar Compra
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Resumo do Pedido Original */}
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg space-y-1 text-sm">
          <div className="flex justify-between text-gray-400"><span>{eventName}</span></div>
          <div className="flex justify-between text-white font-bold"><span>{selectedTicket.name}</span><span>x{quantity}</span></div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-700 text-purple-400"><span>Total</span><span>{formatCurrency(total)}</span></div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Nome Completo</Label>
            <Input {...register('name')} placeholder="Seu nome completo" className="bg-gray-800 border-gray-700 text-white" />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">CPF</Label>
            <Input {...register('cpf')} onChange={(e) => setValue('cpf', formatCPF(e.target.value))} placeholder="000.000.000-00" maxLength={14} className="bg-gray-800 border-gray-700 text-white" />
            {errors.cpf && <p className="text-xs text-red-400">{errors.cpf.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">E-mail para Recebimento</Label>
            <Input {...register('email')} placeholder="seu@email.com" className="bg-gray-800 border-gray-700 text-white" />
            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting || !isActive} className="w-full bg-gradient-to-r from-purple-500 to-blue-500 font-bold py-6 text-lg">
            {isSubmitting ? 'Gerando Reserva...' : `Pagar ${formatCurrency(total)} via PIX`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}