"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuckWalletClient = exports.DuckWalletError = void 0;
class DuckWalletError extends Error {
    constructor(message, statusCode, code) {
        super(message);
        this.name = "DuckWalletError";
        this.statusCode = statusCode;
        this.code = code;
    }
}
exports.DuckWalletError = DuckWalletError;
class DuckWalletClient {
    constructor(config) {
        this.apiKey = config.apiKey;
        this.baseUrl = config.baseUrl || "https://api.duckwallet.com";
    }
    async request(endpoint, options = {}) {
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
                const error = await response.json().catch(() => ({}));
                const errObj = error;
                throw new DuckWalletError(typeof errObj.message === "string"
                    ? errObj.message
                    : "An error occurred", typeof errObj.statusCode === "number"
                    ? errObj.statusCode
                    : typeof errObj.status === "number"
                        ? errObj.status
                        : response.status, typeof errObj.code === "string" ? errObj.code : undefined);
            }
            return response.json();
        }
        catch (error) {
            if (error instanceof DuckWalletError) {
                throw error;
            }
            throw new DuckWalletError(error instanceof Error ? error.message : "Network error");
        }
    }
    async createInvoice(options) {
        return this.request("/custodial-wallet/customer/invoice", {
            method: "POST",
            body: JSON.stringify(options),
        });
    }
    async getInvoiceStatus(invoiceId) {
        return this.request(`/custodial-wallet/customer/invoice/${invoiceId}/status`);
    }
    async payInvoice(params) {
        const { id, code, userTelegramId } = params;
        return this.request(`/custodial-wallet/customer/invoice/${id}/${code}/${userTelegramId}/payment`, {
            method: "POST",
        });
    }
    async getCurrencies(page, limit) {
        return this.request(`/custodial-wallet/customer/currencies?page=${page}&limit=${limit}`);
    }
}
exports.DuckWalletClient = DuckWalletClient;
