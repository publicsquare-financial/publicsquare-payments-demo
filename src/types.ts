export type CompleteThreeDsSessionRequest = {
  session_id?: string;
};

export type CompletePaymentIntentRequest = {
  three_d_secure?: CompleteThreeDsSessionRequest;
};

export type ConfirmThreeDsRequest = {
  session_id?: string;
  transport?: string;
  success_url?: string;
  failure_url?: string;
  challenge_preference?: string;
};

export type ConfirmPaymentIntentRequest = {
  three_d_secure?: ConfirmThreeDsRequest;
};

export type LastPaymentIntentErrorModel = {
  code: string;
  decline_code?: string;
  message: string;
};

export type ThreeDsNextActionModel = {
  session_id: string;
  acs_challenge_url?: string;
  acs_transaction_id?: string;
  transport: string;
  redirect_url?: string;
};

export type PaymentIntentNextActionModel = {
  type?: string;
  missing_fields?: string[];
  three_d_secure?: ThreeDsNextActionModel;
};

export type PaymentIntentModel = {
  id: string;
  account_id: string;
  environment: string;
  external_id?: string;
  status: string;
  amount: number;
  currency: string;
  capture_method: string;
  description?: string;
  next_action?: PaymentIntentNextActionModel;
  last_payment_error?: LastPaymentIntentErrorModel;
  payment_id?: string;
  expires_date?: string;
  cancellation_reason?: string;
  canceled_date?: string;
  confirmed_date?: string;
  succeeded_date?: string;
  created_date?: string;
  metadata?: Record<string, string>;
  modified_date?: string;
};
