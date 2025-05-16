export interface PhonePeV3Payload {
  amount: number;
  merchantTransactionId: string;
  merchantUserId: string;
  redirectUrl: string;
  redirectMode: 'REDIRECT';
  callbackUrl: string;
}

export interface PhonePeV3Response {
  success: boolean;
  code: string;
  message: string;
  data?: {
    redirectUrl?: string;
  };
}
