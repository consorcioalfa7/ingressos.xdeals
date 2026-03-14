'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { QRCodeSVG } from 'qrcode.react';
import { formatCPF, validateCPF } from '@/lib/pricing';
import { Loader2, CreditCard, CheckCircle2, XCircle, Copy, Check } from 'lucide-react';

interface TicketType {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  fee: number;
  totalPrice: number;
  features: string[];
}

const contactTypes = ['WhatsApp', 'Email', 'Telegram'] as const;

const checkoutSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cpf: z.string().refine((val) => validateCPF(val), { message: 'CPF inválido' }),
  contactType: z.enum(contactTypes),
  contactValue: z.string().min(1, 'Contato é obrigatório'),
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
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { contactType: 'WhatsApp' },
  });

  const contactType = watch('contactType');

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setValue('cpf', formatted);
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
          ...data,
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

  if (result) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="py-8 text-center">
          {result.success ? (
            <>
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Reserva Criada!</h3>
              <p className="text-gray-400 mb-6">Escaneie o QR Code ou copie o código PIX para pagar</p>
              {result.pixCode && (
                <div className="mb-6"><div className="inline-block p-4 bg-white rounded-xl">
                  <QRCodeSVG value={result.pixCode} size={200} level="H" includeMargin={false} />
                </div></div>
              )}
              {result.pixCode && (
                <div className="mb-6">
                  <p className="text-sm text-gray-400 mb-2">Código PIX Copia e Cola:</p>
                  <div className="relative">
                    <div className="p-3 bg-gray-800 rounded-lg text-xs text-gray-300 break-all font-mono">
                      {result.pixCode.substring(0, 50)}...
                    </div>
                    <Button onClick={copyPixCode} className="mt-2 bg-gradient-to-r from-purple-500 to-blue-500 w-full">
                      {copied ? <><Check className="w-4 h-4 mr-2" /> Copiado!</> : <><Copy className="w-4 h-4 mr-2" /> Copiar Código</>}
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

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-purple-400" /> Finalizar Compra
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-white"><span>{selectedTicket.name}</span><span>x{quantity}</span></div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-700">
              <span className="text-white">Total</span><span className="text-purple-400">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Nome Completo</Label>
            <Input {...register('name')} className="bg-gray-800 border-gray-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">CPF</Label>
            <Input {...register('cpf')} onChange={handleCPFChange} maxLength={14} className="bg-gray-800 border-gray-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Contato Preferencial</Label>
            <RadioGroup value={contactType} onValueChange={(value) => setValue('contactType', value as typeof contactTypes[number])} className="flex gap-4">
              {contactTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <RadioGroupItem value={type} id={type} className="border-gray-600" />
                  <Label htmlFor={type} className="text-gray-300">{type}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">{contactType === 'WhatsApp' ? 'Número' : contactType === 'Email' ? 'Email' : 'Telegram'}</Label>
            <Input {...register('contactValue')} className="bg-gray-800 border-gray-700 text-white" />
          </div>
          <Button type="submit" disabled={isSubmitting || !isActive} className="w-full bg-gradient-to-r from-purple-500 to-blue-500 font-bold py-6 text-lg">
            {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processando...</> : `Pagar ${formatCurrency(total)}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}