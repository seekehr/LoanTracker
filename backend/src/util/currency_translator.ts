import { currencies } from './currencies.js';

interface CurrencyResponse {
    date: string;
    [currency: string]: any;
}

/**
 * Translates an amount from one currency to another using real-time exchange rates
 * @param amount The amount to convert
 * @param fromCurrency The source currency code (e.g., "USD")
 * @param toCurrency The target currency code (e.g., "EUR")
 * @returns Promise<number> The converted amount in the target currency
 * @throws Error if the currencies are invalid or if the API request fails
 */
export async function translateCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
): Promise<number> {
    // Validate currencies
    if (!currencies.includes(fromCurrency)) {
        throw new Error(`Invalid source currency: ${fromCurrency}`);
    }
    if (!currencies.includes(toCurrency)) {
        throw new Error(`Invalid target currency: ${toCurrency}`);
    }

    // If same currency, return the original amount
    if (fromCurrency === toCurrency) {
        return amount;
    }

    try {
        // Try primary CDN URL first
        const primaryUrl = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fromCurrency.toLowerCase()}.json`;
        const fallbackUrl = `https://latest.currency-api.pages.dev/v1/currencies/${fromCurrency.toLowerCase()}.json`;
        
        let response = await fetch(primaryUrl);
        if (!response.ok) {
            // Try fallback URL if primary fails
            response = await fetch(fallbackUrl);
            if (!response.ok) {
                throw new Error('Both primary and fallback API requests failed');
            }
        }

        const data: CurrencyResponse = await response.json();
        const rate = data[fromCurrency.toLowerCase()][toCurrency.toLowerCase()];
        
        if (!rate) {
            throw new Error(`Could not find exchange rate for ${fromCurrency} to ${toCurrency}`);
        }

        return rate;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Currency conversion failed: ${errorMessage}`);
    }
}

// Example usage:
// const amountInEur = await translateCurrency(100, "USD", "EUR");
