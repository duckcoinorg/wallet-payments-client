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
export interface PayInvoiceOptions {
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
export declare class DuckWalletError extends Error {
    statusCode?: number;
    code?: string;
    constructor(message: string, statusCode?: number, code?: string);
}
export declare class DuckWalletClient {
    private readonly baseUrl;
    private readonly apiKey;
    constructor(config: DuckWalletClientConfig);
    private request;
    createInvoice(options: CreateInvoiceOptions): Promise<InvoiceStatusWithCode>;
    getInvoiceStatus(invoiceId: string): Promise<InvoiceStatus>;
    payInvoice(params: PayInvoiceOptions): Promise<PaymentTransaction>;
    getCurrencies(): Promise<CurrenciesPaginated>;
}
