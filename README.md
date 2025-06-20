# Duck Wallet Payments Client Library

A minimalistic TypeScript client library for integrating Duck Wallet payment processing into your applications.

## Installation

```bash
yarn add @duckcoin/payments
```

## Usage

```typescript
import { DuckWalletClient } from "@duckcoin/payments";

// Initialize the client
const client = new DuckWalletClient({
  apiKey: "your-api-key",
  baseUrl: "https://wallet.duckcoin.org/api", // Optional, defaults to production URL
});

// Create an invoice
const invoice = await client.createInvoice({
  id: "your-invoice-uuid",
  userTelegramId: 123456,
  currency: { name: "Duck" },
  product: {
    id: "your-product-id",
    name: "your product name",
    description: "your product description",
    price: 100,
  },
});

// Get invoice status
const status = await client.getInvoiceStatus("invoice-id");

// Complete invoice payment
const payment = await client.completeInvoicePayment({
  id: "invoice-id",
  code: "payment-code",
  userTelegramId: 123456789,
});

// Get available currencies
const currencies = await client.getCurrencies();

// Request payout
await client.requestPayout(); // creates a payout request which should be processed within 1h
```

## API Reference

### DuckWalletClient

The main client class for interacting with the Duck Wallet API.

#### Constructor

```typescript
new DuckWalletClient(config: DuckWalletClientConfig)
```

Configuration options:

- `apiKey` (required): Your Duck Wallet API key
- `baseUrl` (optional): Custom API base URL

#### Methods

##### createInvoice(options: CreateInvoiceOptions): Promise<InvoiceStatusWithCode>

Creates a new invoice.

Options:

- `id`: String - Unique invoice identifier in your system
- `userTelegramId`: Number - Telegram ID of the user
- `currency`: Object - Currency information containing:
  - `name`: String - Currency name
- `product`: Object - Product details containing:
  - `id`: String - Product identifier in your system
  - `name`: String - Product name
  - `description`: String - Product description
  - `price`: Number - Product price

##### getInvoiceStatus(invoiceId: string): Promise<InvoiceStatus>

Gets the status of an existing invoice.

Parameters:

- `invoiceId`: String - The ID of the invoice to check

##### completeInvoicePayment(params: CompleteInvoicePaymentOptions): Promise<PaymentTransaction>

Processes a payment for an invoice.

Parameters:

- `id`: String - The ID of the invoice to pay
- `code`: String - The payment code for the invoice (note: this one should come from approval callback)
- `userTelegramId`: Number - The Telegram ID of the user making the payment

##### getCurrencies(): Promise<CurrenciesPaginated>

Gets a paginated list of available currencies.

Parameters:

- `page`: Number - Page number for pagination
- `limit`: Number - Number of items per page

##### requestPayout(): Promise<void>

Creates a payout request which will be processed within 1 hour.

### Error Handling

The library throws `DuckWalletError` for API errors with the following properties:

- `message`: String - Error message
- `statusCode`: Number - HTTP status code (if available)
- `code`: String - Error code (if available)

Example:

```typescript
try {
  await client.createInvoice({
    id: "invoice-123",
    userTelegramId: 123456,
    currency: { name: "Duck" },
    product: {
      id: "product-1",
      name: "Test Product",
      description: "A test product",
      price: 100,
    },
  });
} catch (error) {
  if (error instanceof DuckWalletError) {
    console.error(`Error ${error.statusCode}: ${error.message}`);
  }
}
```

## Types

### InvoiceStatus

```typescript
interface InvoiceStatus {
  id: string;
  status: string;
  expiresAt: string;
}
```

### InvoiceStatusWithCode

```typescript
interface InvoiceStatusWithCode extends InvoiceStatus {
  code: string; // note: "code" from createInvoice can only be used to request confirmation from user
}
```

### PaymentTransaction

```typescript
interface PaymentTransaction {
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
```

### Currency

```typescript
interface Currency {
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
```

### CurrenciesPaginated

```typescript
interface CurrenciesPaginated {
  total: number;
  data: Currency[];
}
```

### CreateInvoiceOptions

```typescript
interface CreateInvoiceOptions {
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
```

### CompleteInvoicePaymentOptions

```typescript
interface CompleteInvoicePaymentOptions {
  id: string;
  code: string;
  userTelegramId: number;
}
```

## Security

- Never expose your API key in client-side code
- Store API keys securely using environment variables
- Use HTTPS for all API requests
- Implement proper error handling and logging

## License

MIT
