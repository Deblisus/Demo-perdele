import {
  type NetopiaConfig,
  type NetopiaStartPaymentResponse,
  type Address,
  StartPaymentResponseSchema,
} from "./types";

/**
 * Netopia Payments API v2 client.
 *
 * Uses the **Hosted Payment Page (redirect)** flow — the merchant server
 * never handles raw card data, avoiding PCI-DSS Level 1 requirements.
 */
export class NetopiaClient {
  private config: NetopiaConfig;
  private baseUrl: string;

  constructor(config: NetopiaConfig) {
    this.config = config;
    this.baseUrl = config.isLive
      ? "https://secure.mobilpay.ro/pay"
      : "https://secure.sandbox.netopia-payments.com";
  }

  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.config.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Initiate a payment and get the Netopia hosted checkout URL.
   *
   * @returns Object with `paymentUrl` to redirect the customer to.
   * @throws Error if payment initiation fails or code !== 101.
   */
  async startPayment(params: {
    orderId: string;
    amount: number;
    currency: string;
    description: string;
    billing: Address;
    shipping: Address;
    notifyUrl: string;
    redirectUrl: string;
  }): Promise<{ paymentUrl: string; ntpID?: string }> {
    const payload = {
      config: {
        notifyUrl: params.notifyUrl,
        redirectUrl: params.redirectUrl,
        language: "ro",
      },
      payment: {
        options: { installments: 0 },
      },
      order: {
        orderID: params.orderId,
        amount: params.amount,
        currency: params.currency,
        description: params.description,
        billing: params.billing,
        shipping: params.shipping,
      },
    };

    // MOCK MODE: Bypass real API if using the default dummy key
    if (this.config.apiKey === "your-api-key") {
      console.log("[NetopiaClient] MOCK MODE ACTIVE: Returning local mock payment URL");
      // params.orderId is the orderNumber
      return {
        paymentUrl: `/api/mock/netopia-pay?orderID=${params.orderId}`,
        ntpID: "mock-ntp-pending",
      };
    }

    const response = await fetch(`${this.baseUrl}/payment/card/start`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    const parsed = StartPaymentResponseSchema.parse(data);

    // Code 101 = redirect to Netopia hosted checkout page
    if (parsed.paymentURL) {
      return {
        paymentUrl: parsed.paymentURL,
        ntpID: parsed.ntpID,
      };
    }

    // Handle error responses
    const errorMessage =
      parsed.error?.message ?? parsed.message ?? "Payment initiation failed";
    throw new Error(`Netopia payment error: ${errorMessage}`);
  }

  /**
   * Query the status of an existing payment.
   */
  async getStatus(
    ntpID: string,
    orderID: string
  ): Promise<NetopiaStartPaymentResponse> {
    const response = await fetch(`${this.baseUrl}/payment/card/status`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ ntpID, orderID }),
    });

    const data = await response.json();
    return StartPaymentResponseSchema.parse(data);
  }
}
