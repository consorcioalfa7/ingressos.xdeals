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
import { Loader2, CreditCard, CheckCircle2, XCircle, Copy, Check, CalendarDays, PartyPopper } from 'lucide-react';

const checkoutSchema = z.object({
  name: z.string().min(3, 'Nome muito curto'),
  cpf: z.string().refine((val) => validateCPF(val), { message: 'CPF inválido' }),
  email: z.string().email('E-mail inválido'),
});

export function CheckoutForm({ eventSlug, eventName, selectedTicket, quantity, discountPercent, isActive }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutSchema),
  });

  // Polling automático - Sem tocar no backend!
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

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setResult(null);
    try {
      // 🛡️ AQUI ESTÁ O SEGREDO: Enviamos EXATAMENTE o que a tua API original espera!
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          cpf: data.cpf,
          contactType: 'Email',      // A tua API exige isto
          contactValue: data.email,  // A tua API exige isto
          eventSlug,
          ticketId: selectedTicket.id,
          quantity,
          discountPercent,
        }),
      });
      const res = await response.json();
      setResult(res);
    } catch {
      setResult({ success: false, error: 'Erro de comunicação com servidor' });
    } finally { setIsSubmitting(false); }
  };

  if (isPaid) {
    return (
      <Card className="bg-gray-900/50 border-green-500/50 p-12 text-center space-y-6">
        <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
        <h2 className="text-white font-bold text-2xl uppercase">Pagamento Confirmado!</h2>
        <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 flex gap-4 text-left">
          <CalendarDays className="w-6 h-6 text-purple-400 shrink-0" />
          <p className="text-gray-200">Seus ingressos serão enviados por e-mail até 72h antes do evento.</p>
        </div>
        <Button onClick={() => window.location.href = '/'} className="w-full bg-white text-black font-bold py-6">Voltar para o Início</Button>
      </Card>
    );
  }

  if (result?.success && result.pixCode) {
    return (
      <Card className="bg-gray-900/50 border-gray-700 text-center py-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Aguardando Pagamento</span>
        </div>
        <div className="bg-white p-4 inline-block rounded-xl mb-6 shadow-2xl">
          <QRCodeSVG value={result.pixCode} size={200} />
        </div>
        <div className="px-6 space-y-4">
          <Button onClick={() => { navigator.clipboard.writeText(result.pixCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }} 
                  className="w-full bg-zinc-800 border-zinc-700">
            {copied ? 'Copiado!' : 'Copiar Código PIX'}
          </Button>
          <p className="text-[10px] text-gray-500 font-mono">ORDER ID: {result.orderId}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardContent className="pt-6">
        {result?.success === false && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-sm flex gap-2">
            <XCircle className="w-4 h-4" /> <span>{result.error || "Erro ao gerar PIX"}</span>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Nome Completo</Label>
            <Input {...register('name')} className="bg-gray-800 border-gray-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">CPF</Label>
            <Input {...register('cpf')} onChange={(e) => setValue('cpf', formatCPF(e.target.value))} maxLength={14} className="bg-gray-800 border-gray-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">E-mail para Recebimento</Label>
            <Input {...register('email')} placeholder="seu@email.com" className="bg-gray-800 border-gray-700 text-white" />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-purple-500 to-blue-500 font-bold py-6">
            {isSubmitting ? 'A Gerar Reserva...' : 'Pagar via PIX'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}