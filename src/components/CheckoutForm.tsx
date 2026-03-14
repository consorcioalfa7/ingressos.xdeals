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
import { Loader2, CreditCard, CheckCircle2, CalendarDays, Copy, Check, PartyPopper } from 'lucide-react';

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

  // 🔄 MONITORIZAÇÃO EM TEMPO REAL
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (result?.success && result.orderId && !isPaid) {
      // Pergunta o status em /api/checkout (Onde o GET está definido)
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
        } catch (err) { console.error("Erro ao verificar pagamento:", err); }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [result, isPaid]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setResult(null);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          cpf: data.cpf,
          contactType: 'Email',
          contactValue: data.email, // Mapeado corretamente para o backend
          eventSlug,
          ticketId: selectedTicket.id,
          quantity,
          discountPercent,
        }),
      });
      const res = await response.json();
      setResult(res);
    } catch {
      setResult({ success: false, error: 'Erro ao conectar ao servidor' });
    } finally { setIsSubmitting(false); }
  };

  // TELA DE SUCESSO
  if (isPaid) {
    return (
      <Card className="bg-gray-900/50 border-green-500/50">
        <CardContent className="py-12 text-center space-y-6">
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold text-white uppercase">Pagamento Confirmado!</h2>
          <div className="bg-zinc-800 p-6 rounded-xl text-left border border-zinc-700 flex gap-4">
            <CalendarDays className="w-6 h-6 text-purple-400 shrink-0" />
            <p className="text-sm text-gray-200">Ingressos serão enviados por e-mail até 72h antes do evento.</p>
          </div>
          <Button onClick={() => window.location.href = '/'} className="w-full bg-white text-black font-bold py-6">Voltar</Button>
        </CardContent>
      </Card>
    );
  }

  // TELA DO QR CODE
  if (result?.success && result.pixCode) {
    return (
      <Card className="bg-gray-900/50 border-gray-700 text-center py-8">
        <Loader2 className="w-5 h-5 text-purple-400 animate-spin mx-auto mb-4" />
        <h3 className="text-white font-bold mb-4">Reserva Criada!</h3>
        <div className="bg-white p-4 inline-block rounded-xl mb-6 shadow-2xl">
          <QRCodeSVG value={result.pixCode} size={200} />
        </div>
        <div className="px-6 space-y-4">
          <Button onClick={() => { navigator.clipboard.writeText(result.pixCode); setCopied(true); }} className="w-full bg-zinc-800">
            {copied ? 'Copiado!' : 'Copiar Código PIX'}
          </Button>
          <p className="text-[10px] text-gray-500 font-mono">ID: {result.orderId}</p>
        </div>
      </Card>
    );
  }

  // FORMULÁRIO
  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardContent className="pt-6">
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
            {isSubmitting ? 'Gerando PIX...' : 'Pagar via PIX'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}