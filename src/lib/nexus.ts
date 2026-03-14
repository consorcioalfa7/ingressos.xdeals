// DARKPAY NEXUS API Client
// Orchestrator for payment processing

import { createHash, randomBytes } from 'crypto';

// Nexus API Configuration (Production HTTPS)
// 🛡️ CORREÇÃO CRÍTICA: Remove barras finais da variável de ambiente para evitar o erro 404 Not Found do FastAPI
const rawUrl = process.env.NEXUS_API_URL || 'https://api.dark.lat';
const NEXUS_API_URL = rawUrl.replace(/\/+$/, ''); 

const NEXUS_API_KEY = process.env.NEXUS_API_KEY || 'dk_live_xdeals_777';

export interface NexusPaymentResponse {
  status: 'pending' | 'PAID' | 'expired' | 'cancelled';
  nexus_id: string;
  pix_copia_e_cola: string;
  amount: number;
}

export interface NexusTransactionStatus {
  nexus_id: string;
  order_id: string;
  status: string;
  amount: number;
  created_at: string;
  paid_at?: string;
}

export async function createNexusPayment(
  amount: number,
  orderId: string
): Promise<{
  success: boolean;
  data?: NexusPaymentResponse;
  error?: string;
}> {
  try {
    if (!amount || amount <= 0) return { success: false, error: 'Invalid amount' };
    if (!orderId) return { success: false, error: 'Order ID is required' };

    // ==========================================
    // INJEÇÃO DE DIAGNÓSTICO (URL FANTASMA)
    // ==========================================
    const targetUrl = `${NEXUS_API_URL}/v1/payments/create`;
    console.log(`[Nexus ALERTA] A tentar chamar a URL: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': NEXUS_API_KEY,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100) / 100,
        order_id: orderId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Nexus] API error: ${response.status} - ${errorText}`);
      return { success: false, error: `Nexus API error: ${response.status}` };
    }

    const rawResponse = await response.json();
    const payload = rawResponse.data || rawResponse.payment || rawResponse;

    const pixCode = payload.pix_copia_e_cola || payload.pixCode || payload.payload || payload.qr_code || payload.brcode || payload.emv;
    const nexusId = payload.nexus_id || payload.id || payload.transaction_id || payload.txid;
    const status = payload.status || 'pending';

    if (!pixCode) {
      console.warn(`[Nexus] ALERTA CRÍTICO: Código PIX ausente na resposta.`);
    }

    const data: NexusPaymentResponse = {
      status: status,
      nexus_id: nexusId || `XD-FALLBACK-${Date.now()}`,
      pix_copia_e_cola: pixCode || '',
      amount: amount
    };
    
    return { success: true, data };
  } catch (error) {
    console.error('[Nexus] Failed to create payment:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function checkNexusTransactionStatus(nexusId: string): Promise<{ success: boolean; data?: NexusTransactionStatus; error?: string; }> {
  try {
    const targetUrl = `${NEXUS_API_URL}/v1/payments/${nexusId}`;
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'x-api-key': NEXUS_API_KEY },
    });

    if (!response.ok) return { success: false, error: `Nexus API error: ${response.status}` };
    const data: NexusTransactionStatus = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = randomBytes(4).toString('hex').toUpperCase();
  return `XD-${timestamp.slice(-5)}-USER-${random}`;
}

export function generateTicketCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = randomBytes(6).toString('hex').toUpperCase();
  return `TKT-${timestamp.slice(-6)}-${random}`;
}

export function generateQrCodeHash(ticketCode: string, orderId: string): string {
  const secret = process.env.QR_SECRET || 'xdeals-secret-key';
  return createHash('sha256').update(`${ticketCode}:${orderId}:${secret}`).digest('hex').substring(0, 16).toUpperCase();
}

export const NexusClient = {
  createPayment: createNexusPayment,
  checkStatus: checkNexusTransactionStatus,
  generateOrderId,
  generateTicketCode,
  generateQrCodeHash,
};

export default NexusClient;