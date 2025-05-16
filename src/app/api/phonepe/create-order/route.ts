// src/app/api/phonepe/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Production environment variables (set these in your .env.local file)
const PHONEPE_BASE_URL = process.env.PHONEPE_BASE_URL || 'https://api.phonepe.com/apis/hermes';
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const PHONEPE_CLIENT_ID = process.env.PHONEPE_CLIENT_ID;
const PHONEPE_CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET;
const PHONEPE_CLIENT_APP_VERSION = process.env.PHONEPE_CLIENT_APP_VERSION || '1.0';

// Helper functions
function encodeToBase64(obj: object): string {
  return Buffer.from(JSON.stringify(obj)).toString('base64');
}

function generateXVerify(base64Payload: string, apiPath: string, salt: string): string {
  const sha256 = require('crypto').createHash('sha256');
  const data = base64Payload + apiPath + salt;
  const hash = sha256.update(data).digest('hex');
  return hash + '###1'; // The '###1' indicates SHA256 version
}

export async function POST(req: NextRequest) {
  // Validate environment variables
  if (!PHONEPE_MERCHANT_ID || !PHONEPE_CLIENT_ID || !PHONEPE_CLIENT_SECRET) {
    console.error('Missing PhonePe production credentials in environment variables');
    return NextResponse.json(
      { error: 'Payment gateway configuration error' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { amount, phoneNumber, transactionId, redirectUrl } = body;

    if (!amount || !phoneNumber || !transactionId || !redirectUrl) {
      return NextResponse.json(
        { error: 'Missing required fields (amount, phoneNumber, transactionId, redirectUrl)' },
        { status: 400 }
      );
    }

    const apiPath = '/pg/v1/pay';

    // Construct production payload
    const payload = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId: transactionId,
      merchantUserId: 'MUID' + Date.now(), // Unique user ID
      amount: Number(amount) * 100, // Convert to paise
      redirectUrl: redirectUrl,
      redirectMode: 'POST',
      callbackUrl: redirectUrl,
      mobileNumber: phoneNumber,
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    const base64Payload = encodeToBase64(payload);
    const xVerify = generateXVerify(base64Payload, apiPath, PHONEPE_CLIENT_SECRET);

    console.log('🌍 Sending to production endpoint:', PHONEPE_BASE_URL + apiPath);
    console.log('📦 Payload:', payload);
    // Don't log sensitive data like xVerify in production

    const response = await fetch(PHONEPE_BASE_URL + apiPath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
        'X-CLIENT-ID': PHONEPE_CLIENT_ID,
        'X-APP-VERSION': PHONEPE_CLIENT_APP_VERSION
      },
      body: JSON.stringify({ request: base64Payload })
    });

    const data = await response.json();
    console.log('📥 PhonePe Production Response:', { 
      status: response.status,
      success: data.success,
      code: data.code 
    });

    if (data.success && data.data?.instrumentResponse?.redirectInfo?.url) {
      return NextResponse.json({ 
        success: true,
        paymentUrl: data.data.instrumentResponse.redirectInfo.url
      });
    }

    return NextResponse.json(
      { 
        error: data.message || 'PhonePe order creation failed',
        code: data.code,
        details: data.data 
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('🔥 PhonePe Production Error:', error.message);
    return NextResponse.json(
      { error: 'Payment processing error', detail: 'Unable to process payment' },
      { status: 500 }
    );
  }
}