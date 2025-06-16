export interface DuckWalletClientConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface CreateInvoiceOptions {
  id: string;
  userTelegramId: number;
  currency: {
    name: string;
  };
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
  };
}

export interface InvoiceStatus {
  id: string;
  status: string;
  expiresAt: string;
}

export interface InvoiceStatusWithCode extends InvoiceStatus {
  code: string;
}

export interface CompleteInvoicePaymentOptions {
  id: string;
  code: string;
  userTelegramId: number;
}

export interface PaymentTransaction {
  id: string;
  type: string;
  status: string;
  amount: string;
  fee: string;
  currency: {
    id: string;
    name: string;
    contractAddress: string;
    onchain: boolean;
    icon: string;
    priceUsd: string;
  };
  createdAt: string;
}

export interface PriceUsdHistorical {
  date: string;
  priceUsd: string;
}

export interface Currency {
  id: string;
  name: string;
  contractAddress: string;
  onchain: boolean;
  icon: string;
  priceUsd: string;
  priceUsdYesterday: string;
  priceUsdHistorical: PriceUsdHistorical[];
  decimals: number;
}

export interface CurrenciesPaginated {
  total: number;
  data: Currency[];
}

export class DuckWalletError extends Error {
  statusCode?: number;
  code?: string;
  constructor(message: string, statusCode?: number, code?: string) {
    super(message);
    this.name = "DuckWalletError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class DuckWalletClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(config: DuckWalletClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://wallet.duckcoin.org/api";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": this.apiKey,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}) as unknown);
        const errObj = error as Record<string, unknown>;
        throw new DuckWalletError(
          typeof errObj.message === "string"
            ? errObj.message
            : "An error occurred",
          typeof errObj.statusCode === "number"
            ? errObj.statusCode
            : typeof errObj.status === "number"
              ? errObj.status
              : response.status,
          typeof errObj.code === "string" ? errObj.code : undefined,
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof DuckWalletError) {
        throw error;
      }
      throw new DuckWalletError(
        error instanceof Error ? error.message : "Network error",
      );
    }
  }

  async createInvoice(
    options: CreateInvoiceOptions,
  ): Promise<InvoiceStatusWithCode> {
    return this.request<InvoiceStatusWithCode>(
      "/custodial-wallet/customer/invoice",
      {
        method: "POST",
        body: JSON.stringify(options),
      },
    );
  }

  async getInvoiceStatus(invoiceId: string): Promise<InvoiceStatus> {
    return this.request<InvoiceStatus>(
      `/custodial-wallet/customer/invoice/${invoiceId}/status`,
    );
  }

  async completeInvoicePayment(
    params: CompleteInvoicePaymentOptions,
  ): Promise<PaymentTransaction> {
    const { id, code, userTelegramId } = params;
    return this.request<PaymentTransaction>(
      `/custodial-wallet/customer/invoice/${id}/${code}/${userTelegramId}/payment`,
      {
        method: "POST",
      },
    );
  }

  async getCurrencies(
    page: number,
    limit: number,
  ): Promise<CurrenciesPaginated> {
    return this.request<CurrenciesPaginated>(
      `/custodial-wallet/customer/currencies?page=${page}&limit=${limit}`,
    );
  }

  async requestPayout(): Promise<void> {
    return this.request<void>(`/custodial-wallet/customer/payout`, {
      method: "POST",
    });
  }
}
