import { DuckWalletClient, DuckWalletError } from './index';

describe('DuckWalletClient', () => {
  const client = new DuckWalletClient({
    apiKey: 'test-api-key',
    baseUrl: 'https://api.test.duckwallet.com',
  });

  beforeEach(() => {
    // Properly mock global.fetch as a Jest mock function
    global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createInvoice', () => {
    it('should create an invoice successfully', async () => {
      const mockResponse = {
        id: 'test-invoice-id',
        status: 'pending',
        expiresAt: '2024-01-01T01:00:00Z',
        code: 'invoice-code-123',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await client.createInvoice({
        id: 'test-invoice-id',
        userTelegramId: 123456789,
        currency: {
          name: 'USD',
        },
        product: {
          id: 'product-123',
          name: 'Test Product',
          description: 'Test product description',
          price: 100,
        },
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.duckwallet.com/custodial-wallet/customer/invoice',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-api-key': 'test-api-key',
          }),
          body: JSON.stringify({
            id: 'test-invoice-id',
            userTelegramId: 123456789,
            currency: {
              name: 'USD',
            },
            product: {
              id: 'product-123',
              name: 'Test Product',
              description: 'Test product description',
              price: 100,
            },
          }),
        })
      );
    });

    it('should handle API errors', async () => {
      const mockError = {
        message: 'Invalid product price',
        code: 'INVALID_PRICE',
        statusCode: 400,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve(mockError),
      });

      let thrown = false;
      try {
        await client.createInvoice({
          id: 'test-invoice-id',
          userTelegramId: 123456789,
          currency: {
            name: 'USD',
          },
          product: {
            id: 'product-123',
            name: 'Test Product',
            description: 'Test product description',
            price: -100,
          },
        });
      } catch (error) {
        thrown = true;
        const err = error as DuckWalletError;
        expect(err).toBeInstanceOf(DuckWalletError);
        expect(err.message).toBe('Invalid product price');
        expect(err.statusCode).toBe(400);
        expect(err.code).toBe('INVALID_PRICE');
      }
      expect(thrown).toBe(true);
    });
  });

  describe('getInvoiceStatus', () => {
    it('should get invoice status successfully', async () => {
      const mockResponse = {
        id: 'test-invoice-id',
        status: 'paid',
        expiresAt: '2024-01-01T01:00:00Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await client.getInvoiceStatus('test-invoice-id');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.duckwallet.com/custodial-wallet/customer/invoice/test-invoice-id/status',
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-api-key': 'test-api-key',
          }),
        })
      );
    });
  });

  describe('payInvoice', () => {
    it('should process payment successfully', async () => {
      const mockResponse = {
        id: 'test-transaction-id',
        type: 'payment',
        status: 'completed',
        amount: '100.00',
        fee: '1.50',
        currency: {
          id: 'usd-id',
          name: 'USD',
          contractAddress: '0x123...',
          onchain: false,
          icon: 'https://example.com/usd-icon.png',
          priceUsd: '1.00',
        },
        createdAt: '2024-01-01T00:00:00Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await client.payInvoice({
        id: 'test-invoice-id',
        code: 'invoice-code-123',
        userTelegramId: 123456789,
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.duckwallet.com/custodial-wallet/customer/invoice/test-invoice-id/invoice-code-123/123456789/payment',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-api-key': 'test-api-key',
          }),
        })
      );
    });
  });

  describe('getCurrencies', () => {
    it('should get currencies successfully', async () => {
      const mockResponse = {
        total: 2,
        data: [
          {
            id: 'usd-id',
            name: 'USD',
            contractAddress: '0x123...',
            onchain: false,
            icon: 'https://example.com/usd-icon.png',
            priceUsd: '1.00',
            priceUsdYesterday: '1.00',
            priceUsdHistorical: [
              {
                date: '2024-01-01',
                priceUsd: '1.00',
              },
            ],
            decimals: 6,
          },
          {
            id: 'btc-id',
            name: 'Bitcoin',
            contractAddress: '',
            onchain: true,
            icon: 'https://example.com/btc-icon.png',
            priceUsd: '50000.00',
            priceUsdYesterday: '49500.00',
            priceUsdHistorical: [
              {
                date: '2024-01-01',
                priceUsd: '50000.00',
              },
            ],
            decimals: 8,
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await client.getCurrencies(1, 10);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.test.duckwallet.com/custodial-wallet/customer/currencies?page=1&limit=10',
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-api-key': 'test-api-key',
          }),
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      let thrown = false;
      try {
        await client.getInvoiceStatus('test-id');
      } catch (error) {
        thrown = true;
        const err = error as DuckWalletError;
        expect(err).toBeInstanceOf(DuckWalletError);
        expect(err.message).toBe('Network error');
      }
      expect(thrown).toBe(true);
    });

    it('should handle malformed error responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      let thrown = false;
      try {
        await client.getInvoiceStatus('test-id');
      } catch (error) {
        thrown = true;
        const err = error as DuckWalletError;
        expect(err).toBeInstanceOf(DuckWalletError);
        expect(err.message).toBe('An error occurred');
        expect(err.statusCode).toBe(500);
      }
      expect(thrown).toBe(true);
    });
  });

  describe('constructor', () => {
    it('should use default baseUrl when not provided', () => {
      const defaultClient = new DuckWalletClient({
        apiKey: 'test-key',
      });
      expect(defaultClient).toBeInstanceOf(DuckWalletClient);
    });

    it('should use custom baseUrl when provided', () => {
      const customClient = new DuckWalletClient({
        apiKey: 'test-key',
        baseUrl: 'https://custom.api.com',
      });
      expect(customClient).toBeInstanceOf(DuckWalletClient);
    });
  });
}); 