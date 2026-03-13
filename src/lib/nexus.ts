// DARKPAY NEXUS API Client
// Orchestrator for payment processing

import { createHash, randomBytes } from 'crypto';

// Nexus API Configuration (Production HTTPS)
const NEXUS_API_URL = process.env.NEXUS_API_URL || 'https://api.dark.lat';
const NEXUS_API_KEY = process.env.NEXUS_API_KEY || 'dk_live_xdeals_777';

// Headers for Nexus API
const NEXUS_HEADERS = {
  'Content-Type': 'application/json',
  'x-api-key': NEXUS_API_KEY,
};

// ============================================
// TYPES
// ============================================

export interface NexusPaymentRequest {
  amount: number;
  order_id: string;
}

export interface NexusPaymentResponse {
  status: 'pending' | 'PAID' | 'expired' | 'cancelled';
  nexus_id: string;
  pix_copia_e_cola: string;
  amount: number;
}

export interface NexusWebhookPayload {
  nexus_id: string;
  order_id: string;
  status: 'PAID' | 'expired' | 'cancelled';
  amount_paid: number;
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

/**
 * Create a new payment transaction in Nexus
 * IMPORTANT: This must be called from server-side only
 */
export async function createNexusPayment(
  amount: number,
  orderId: string
): Promise<{
  success: boolean;
  data?: NexusPaymentResponse;
  error?: string;
}> {
  try {
    // Validate inputs
    if (!amount || amount <= 0) {
      return { success: false, error: 'Invalid amount' };
    }

    if (!orderId) {
      return { success: false, error: 'Order ID is required' };
    }

    console.log(`[Nexus] Creating payment for order ${orderId}, amount: ${amount}`);

    const response = await fetch(`${NEXUS_API_URL}/v1/payments/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': NEXUS_API_KEY,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100) / 100, // Ensure 2 decimal places
        order_id: orderId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Nexus] API error: ${response.status} - ${errorText}`);
      return {
        success: false,
        error: `Nexus API error: ${response.status}`,
      };
    }

    const data: NexusPaymentResponse = await response.json();
    console.log(`[Nexus] Payment created: ${data.nexus_id}`);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('[Nexus] Failed to create payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check the status of a transaction in Nexus
 */
export async function checkNexusTransactionStatus(
  nexusId: string
): Promise<{
  success: boolean;
  data?: NexusTransactionStatus;
  error?: string;
}> {
  try {
    const response = await fetch(`${NEXUS_API_URL}/v1/payments/${nexusId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': NEXUS_API_KEY,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Nexus API error: ${response.status}`,
      };
    }

    const data: NexusTransactionStatus = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('[Nexus] Failed to check transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// ORDER ID GENERATION
// ============================================

/**
 * Generate a unique order ID in format: XD-XXXXX-USER-XXXXX
 */
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = randomBytes(4).toString('hex').toUpperCase();
  return `XD-${timestamp.slice(-5)}-USER-${random}`;
}

/**
 * Generate a unique ticket code
 */
export function generateTicketCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = randomBytes(6).toString('hex').toUpperCase();
  return `TKT-${timestamp.slice(-6)}-${random}`;
}

/**
 * Generate QR code hash for ticket validation
 */
export function generateQrCodeHash(ticketCode: string, orderId: string): string {
  const secret = process.env.QR_SECRET || 'xdeals-secret-key';
  const data = `${ticketCode}:${orderId}:${Date.now()}`;
  return createHash('sha256')
    .update(data + secret)
    .digest('hex')
    .substring(0, 16)
    .toUpperCase();
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate Nexus webhook signature (if implemented)
 */
export function validateNexusWebhook(
  payload: string,
  signature: string
): boolean {
  // TODO: Implement signature validation when Nexus provides it
  // For now, we trust requests from the Nexus server
  return true;
}

/**
 * Check if the Nexus API is available
 */
export async function checkNexusHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${NEXUS_API_URL}/health`, {
      method: 'GET',
      headers: {
        'x-api-key': NEXUS_API_KEY,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

// ============================================
// EXPORTS
// ============================================

export const NexusClient = {
  createPayment: createNexusPayment,
  checkStatus: checkNexusTransactionStatus,
  generateOrderId,
  generateTicketCode,
  generateQrCodeHash,
  validateWebhook: validateNexusWebhook,
  checkHealth: checkNexusHealth,
};

export default NexusClient;
