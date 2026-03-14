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
import { Loader2, CreditCard, CheckCircle2, XCircle, Copy, Check, CalendarDays } from 'lucide-react';

interface TicketType {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  fee: number;
  totalPrice: number;
  features: string[];
}

// 🛡️ SCHEMA SIMPLIFICADO: Apenas Email
const checkoutSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().refine((val) => validateCPF(val), { message: 'CPF inválido' }),
  email: z.string().email('E-mail inválido (Obrigatório)'),
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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function calculatePrice(ticket: TicketType, discountPercent: number) {
  const originalPrice = ticket.totalPrice;
  const discountAmount = originalPrice * (discountPercent / 100);
  const finalPrice = originalPrice - discountAmount;
  return { originalPrice, discountAmount, finalPrice: Math.round(finalPrice * 100) / 100 };
}

export function CheckoutForm({ eventSlug, eventName, selectedTicket, quantity, discountPercent, isActive }: CheckoutFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  // 🔄 Polling Automático para atualizar o ecrã
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (result?.success && result.orderId && !isPaid) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/checkout?orderId=${result.orderId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'paid') {
              setIsPaid(true);
              clearInterval(interval);
            }
          }
        } catch (err) { console.error("Erro no polling:", err); }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [result, isPaid]);

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('cpf', formatCPF(e.target.value));
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (!selectedTicket) return;
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          cpf: data.cpf,
          contactType: 'Email',      // 👈 Forçamos sempre Email para a API
          contactValue: data.email,  // 👈 Mapeamos o email para o contactValue
          eventSlug,
          ticketId: selectedTicket.id,
          quantity,
          discountPercent,
        }),
      });
      const res = await response.json();
      setResult(res);
    } catch {
      setResult({ success: false, error: 'Erro ao processar pagamento. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyPixCode = () => {
    if (result?.pixCode) {
      navigator.clipboard.writeText(result.pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!selectedTicket) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="py-8"><p className="text-center text-gray-400">Selecione um tipo de ingresso</p></CardContent>
      </Card>
    );
  }

  const pricing = calculatePrice(selectedTicket, discountPercent);
  const total = pricing.finalPrice * quantity;

  // 🏆 TELA DE SUCESSO (PAGAMENTO CONFIRMADO)
  if (isPaid) {
    return (
      <Card className="bg-gray-900/50 border-green-500/50 p-12 text-center space-y-6">
        <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
        <h2 className="text-white font-bold text-2xl uppercase">Pagamento Confirmado!</h2>
        <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 flex gap-4 text-left">
          <CalendarDays className="w-8 h-8 text-purple-400 shrink-0" />
          <p className="text-gray-200 text-sm">
            Os seus ingressos definitivos serão enviados para o seu e-mail <strong>entre 48 a 72 horas</strong> antes do evento.
          </p>
        </div>
        <Button onClick={() => window.location.href = '/'} className="w-full bg-white text-black font-bold py-6">Voltar para o Início</Button>
      </Card>
    );
  }

  // 📲 TELA DO QR CODE
  if (result) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="py-8 text-center">
          {result.success ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-4 text-purple-400 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest">Aguardando Pagamento</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Reserva Criada!</h3>
              <p className="text-gray-400 mb-6 text-sm">Escaneie o QR Code ou copie o código PIX para pagar</p>
              
              {result.pixCode && (
                <div className="mb-6"><div className="inline-block p-4 bg-white rounded-xl">
                  <QRCodeSVG value={result.pixCode} size={200} level="H" includeMargin={false} />
                </div></div>
              )}
              
              {result.pixCode && (
                <div className="mb-6">
                  <div className="relative">
                    <Button onClick={copyPixCode} className="mt-2 bg-gradient-to-r from-purple-500 to-blue-500 w-full py-6 font-bold text-lg">
                      {copied ? <><Check className="w-5 h-5 mr-2" /> Copiado!</> : <><Copy className="w-5 h-5 mr-2" /> Copiar Código PIX</>}
                    </Button>
                  </div>
                </div>
              )}
              <div className="p-4 bg-gray-800/50 rounded-lg text-left space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-400">Order ID:</span><span className="text-white font-mono">{result.orderId}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Valor:</span><span className="text-green-400 font-bold">{formatCurrency(result.amount || total)}</span></div>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Erro na Reserva</h3>
              <p className="text-gray-400 mb-4">{result.error}</p>
              <Button variant="outline" onClick={() => setResult(null)} className="border-gray-600">Tentar Novamente</Button>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // 📝 TELA DO FORMULÁRIO (Simplificada)
  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-purple-400" /> Detalhes do Comprador
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-white"><span>{selectedTicket.name}</span><span>x{quantity}</span></div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-700 mt-2">
              <span className="text-white">Total</span><span className="text-purple-400">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label className="text-gray-300">Nome Completo</Label>
            <Input {...register('name')} placeholder="Digite seu nome" className="bg-gray-800 border-gray-700 text-white" />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <Label className="text-gray-300">CPF</Label>
            <Input {...register('cpf')} onChange={handleCPFChange} placeholder="000.000.000-00" maxLength={14} className="bg-gray-800 border-gray-700 text-white" />
            {errors.cpf && <p className="text-xs text-red-400">{errors.cpf.message}</p>}
          </div>

          <div className="space-y-1">
            <Label className="text-gray-300">E-mail para Recebimento</Label>
            <Input {...register('email')} placeholder="seu@email.com" className="bg-gray-800 border-gray-700 text-white" />
            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            <p className="text-xs text-gray-500 mt-1">Os ingressos serão enviados exclusivamente para este e-mail.</p>
          </div>

          <Button type="submit" disabled={isSubmitting || !isActive} className="w-full bg-gradient-to-r from-purple-500 to-blue-500 font-bold py-6 text-lg mt-4 shadow-lg shadow-purple-500/20">
            {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processando...</> : `Pagar ${formatCurrency(total)}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}