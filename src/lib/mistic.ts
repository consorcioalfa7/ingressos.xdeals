// Mistic Payment API Integration

const MISTIC_API_URL = 'https://api.misticpay.com/api';

interface MisticTransactionRequest {
  amount: number;
  payerName: string;
  payerDocument: string;
  transactionId: string;
  description: string;
  projectWebhook: string;
}

interface MisticTransactionResponse {
  success: boolean;
  id?: string;
  paymentUrl?: string;
  qrCode?: string;
  pixCode?: string;
  error?: string;
}

// Create a transaction on Mistic
export async function createMisticTransaction(
  data: MisticTransactionRequest
): Promise<MisticTransactionResponse> {
  const clientId = process.env.MISTIC_CLIENT_ID;
  const clientSecret = process.env.MISTIC_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Mistic credentials not configured');
    return {
      success: false,
      error: 'Credenciais de pagamento não configuradas',
    };
  }

  try {
    const response = await fetch(`${MISTIC_API_URL}/transactions/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ci': clientId,
        'cs': clientSecret,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Mistic API error:', result);
      return {
        success: false,
        error: result.message || 'Erro ao criar transação',
      };
    }

    return {
      success: true,
      id: result.id || result.transactionId,
      paymentUrl: result.paymentUrl || result.payment_url,
      qrCode: result.qrCode || result.qr_code,
      pixCode: result.pixCode || result.pix_code,
    };
  } catch (error) {
    console.error('Mistic API request failed:', error);
    return {
      success: false,
      error: 'Erro de conexão com o gateway de pagamento',
    };
  }
}

// Check transaction status
export async function checkMisticTransactionStatus(
  transactionId: string
): Promise<{ status: string; paid: boolean } | null> {
  const clientId = process.env.MISTIC_CLIENT_ID;
  const clientSecret = process.env.MISTIC_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  try {
    const response = await fetch(`${MISTIC_API_URL}/transactions/${transactionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ci': clientId,
        'cs': clientSecret,
      },
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return {
      status: result.status,
      paid: result.status === 'paid' || result.status === 'completed',
    };
  } catch {
    return null;
  }
}
