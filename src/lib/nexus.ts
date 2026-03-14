// DARKPAY NEXUS API Client
// Orchestrator for payment processing

import { createHash, randomBytes } from 'crypto';

/**
 * 🛡️ BLINDAGEM DE URL
 * Remove barras finais e garante que o /v1 não seja duplicado
 */
const getBaseUrl = () => {
  const url = process.env.NEXUS_API_URL || 'https://api.dark.lat';
  return url.replace(/\/$/, ''); // Remove barra no fim
};

const NEXUS_API_KEY = process.env.NEXUS_API_KEY || 'dk_live_xdeals_777';

// ============================================
// TYPES
// ============================================

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

// ============================================
// NEXUS CLIENT
// ============================================

export async function createNexusPayment(
  amount: number,
  orderId: string
): Promise<{ success: boolean; data?: NexusPaymentResponse; error?: string }> {
  try {
    if (!amount || amount <= 0 || !orderId) {
      return { success: false, error: 'Parâmetros inválidos para pagamento' };
    }

    const baseUrl = getBaseUrl();
    // 🛡️ Se o baseUrl já termina em /v1, não adicionamos novamente
    const endpoint = baseUrl.endsWith('/v1') ? '/payments/create' : '/v1/payments/create';
    const targetUrl = `${baseUrl}${endpoint}`;

    console.log(`[Nexus] Chamando: ${targetUrl} para Ordem: ${orderId}`);

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
      return { success: false, error: `Nexus Gateway Error: ${response.status}` };
    }

    const rawResponse = await response.json();
    const payload = rawResponse.data || rawResponse.payment || rawResponse;

    // Adaptador de campos (suporte a múltiplas versões da API)
    const pixCode = payload.pix_copia_e_cola || payload.pixCode || payload.payload || payload.qr_code || payload.brcode;
    const nexusId = payload.nexus_id || payload.id || payload.transaction_id || payload.txid;

    if (!pixCode) {
      console.error('[Nexus] Resposta sem código PIX:', payload);
      return { success: false, error: 'Resposta do Gateway sem QR Code' };
    }

    return {
      success: true,
      data: {
        status: payload.status || 'pending',
        nexus_id: nexusId || `NX-${Date.now()}`,
        pix_copia_e_cola: pixCode,
        amount: amount
      },
    };
  } catch (error) {
    console.error('[Nexus] Falha de conexão:', error);
    return { success: false, error: 'Não foi possível conectar ao Nexus' };
  }
}

/**
 * Check the status of a transaction in Nexus
 */
export async function checkNexusTransactionStatus(nexusId: string): Promise<any> {
  try {
    const baseUrl = getBaseUrl();
    const endpoint = baseUrl.endsWith('/v1') ? `/payments/${nexusId}` : `/v1/payments/${nexusId}`;
    
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': NEXUS_API_KEY,
      },
    });

    if (!response.ok) return { success: false, error: `Error: ${response.status}` };
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Connection failed' };
  }
}

// ============================================
// HELPERS (ORDEM E CÓDIGOS)
// ============================================

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