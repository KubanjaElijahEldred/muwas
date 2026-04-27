class MtnMomoError extends Error {
  constructor(message, { statusCode = 502, details = null, code = null } = {}) {
    super(message);
    this.name = 'MtnMomoError';
    this.statusCode = statusCode;
    this.details = details;
    this.code = code;
  }
}

const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const getConfig = () => ({
  baseUrl: trimTrailingSlash(process.env.MTN_MOMO_BASE_URL || ''),
  targetEnvironment: process.env.MTN_MOMO_TARGET_ENVIRONMENT || '',
  subscriptionKey: process.env.MTN_MOMO_COLLECTION_SUBSCRIPTION_KEY || '',
  apiUser: process.env.MTN_MOMO_API_USER || '',
  apiKey: process.env.MTN_MOMO_API_KEY || '',
  currency: process.env.MTN_MOMO_CURRENCY || 'UGX',
  countryCode: process.env.MTN_MOMO_COUNTRY_CODE || '256',
  callbackBaseUrl: trimTrailingSlash(process.env.MTN_MOMO_CALLBACK_BASE_URL || ''),
  payerMessage: process.env.MTN_MOMO_PAYER_MESSAGE || 'Payment for your Muwas order',
  payeeNote: process.env.MTN_MOMO_PAYEE_NOTE || 'Muwas Distilling checkout',
  requestTimeoutMs: Number.parseInt(process.env.MTN_MOMO_REQUEST_TIMEOUT_MS || '20000', 10),
});

const getMissingConfigKeys = () => {
  const config = getConfig();
  const requiredValues = {
    MTN_MOMO_BASE_URL: config.baseUrl,
    MTN_MOMO_TARGET_ENVIRONMENT: config.targetEnvironment,
    MTN_MOMO_COLLECTION_SUBSCRIPTION_KEY: config.subscriptionKey,
    MTN_MOMO_API_USER: config.apiUser,
    MTN_MOMO_API_KEY: config.apiKey,
  };

  return Object.entries(requiredValues)
    .filter(([, value]) => !value)
    .map(([key]) => key);
};

const assertConfigured = () => {
  const missingKeys = getMissingConfigKeys();

  if (missingKeys.length > 0) {
    throw new MtnMomoError(
      `MTN Mobile Money is not fully configured. Missing: ${missingKeys.join(', ')}`,
      { statusCode: 503, code: 'mtn_momo_config_missing' }
    );
  }

  return getConfig();
};

const parseJsonSafely = async (response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return { raw: text };
  }
};

const getErrorMessage = (payload, fallback) => {
  if (!payload) {
    return fallback;
  }

  return (
    payload.message ||
    payload.error_description ||
    payload.error ||
    payload.reason ||
    payload.statusReason ||
    fallback
  );
};

const toCurrencyList = (...values) => {
  const seen = new Set();
  const currencies = [];

  values
    .flat()
    .map((value) => String(value || '').trim().toUpperCase())
    .filter(Boolean)
    .forEach((currency) => {
      if (seen.has(currency)) {
        return;
      }

      seen.add(currency);
      currencies.push(currency);
    });

  return currencies;
};

const isCurrencyUnsupportedMessage = (message = '') =>
  /currency/i.test(message) && /(unsupported|not supported|invalid)/i.test(message);

const isCallbackUrlMismatchMessage = (message = '') =>
  /callback/i.test(message) && /(match|mismatch|invalid|configured)/i.test(message);

const getAccessToken = async (config) => {
  const credentials = Buffer.from(`${config.apiUser}:${config.apiKey}`).toString('base64');
  const response = await fetch(`${config.baseUrl}/collection/token/`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Ocp-Apim-Subscription-Key': config.subscriptionKey,
    },
    signal: AbortSignal.timeout(config.requestTimeoutMs),
  });

  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    throw new MtnMomoError(
      getErrorMessage(payload, 'Failed to authenticate with MTN Mobile Money.'),
      {
        statusCode: response.status,
        details: payload,
        code: 'mtn_momo_token_failed',
      }
    );
  }

  if (!payload?.access_token) {
    throw new MtnMomoError('MTN Mobile Money token response did not include an access token.', {
      details: payload,
      code: 'mtn_momo_token_missing',
    });
  }

  return payload.access_token;
};

const buildCallbackUrl = (referenceId) => {
  const { callbackBaseUrl } = getConfig();

  if (!callbackBaseUrl) {
    return null;
  }

  return `${callbackBaseUrl}/api/orders/mobile-money/callback/mtn/${referenceId}`;
};

const normalizePhoneNumber = (value, fallbackCountryCode) => {
  const config = getConfig();
  const countryCode = String(fallbackCountryCode || config.countryCode || '').replace(/\D/g, '');
  const digits = String(value || '').replace(/\D/g, '');

  if (!digits) {
    throw new MtnMomoError('Enter the MTN Mobile Money number you want to charge.', {
      statusCode: 400,
      code: 'mtn_momo_phone_required',
    });
  }

  if (digits.startsWith(countryCode)) {
    return digits;
  }

  if (digits.startsWith('0')) {
    return `${countryCode}${digits.slice(1)}`;
  }

  if (countryCode && digits.length === 9) {
    return `${countryCode}${digits}`;
  }

  return digits;
};

const requestToPay = async ({
  amount,
  phoneNumber,
  externalId,
  referenceId,
  payerMessage,
  payeeNote,
}) => {
  const config = assertConfigured();
  const accessToken = await getAccessToken(config);
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber, config.countryCode);
  const callbackUrl = buildCallbackUrl(referenceId);
  const fallbackCurrencies = String(process.env.MTN_MOMO_FALLBACK_CURRENCIES || '')
    .split(',')
    .map((currency) => currency.trim())
    .filter(Boolean);
  const shouldUseSandboxFallback = String(config.targetEnvironment || '').toLowerCase() === 'sandbox';
  const currenciesToTry = toCurrencyList(
    config.currency,
    fallbackCurrencies,
    shouldUseSandboxFallback ? 'EUR' : ''
  );

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': config.subscriptionKey,
    'X-Reference-Id': referenceId,
    'X-Target-Environment': config.targetEnvironment,
  };

  for (let index = 0; index < currenciesToTry.length; index += 1) {
    const currency = currenciesToTry[index];
    const isLastAttempt = index === currenciesToTry.length - 1;
    let includeCallbackHeader = Boolean(callbackUrl);

    while (true) {
      const requestHeaders = { ...headers };
      if (includeCallbackHeader && callbackUrl) {
        requestHeaders['X-Callback-Url'] = callbackUrl;
      }

      const response = await fetch(`${config.baseUrl}/collection/v1_0/requesttopay`, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify({
          amount: Number(amount).toFixed(2),
          currency,
          externalId,
          payer: {
            partyIdType: 'MSISDN',
            partyId: normalizedPhoneNumber,
          },
          payerMessage: payerMessage || config.payerMessage,
          payeeNote: payeeNote || config.payeeNote,
        }),
        signal: AbortSignal.timeout(config.requestTimeoutMs),
      });

      const payload = await parseJsonSafely(response);

      if (response.status === 202) {
        return {
          referenceId,
          phoneNumber: normalizedPhoneNumber,
          callbackUrl: includeCallbackHeader ? callbackUrl : null,
        };
      }

      const errorMessage = getErrorMessage(payload, 'MTN Mobile Money rejected the payment request.');

      if (includeCallbackHeader && isCallbackUrlMismatchMessage(errorMessage)) {
        includeCallbackHeader = false;
        continue;
      }

      const canRetryWithAnotherCurrency =
        !isLastAttempt &&
        isCurrencyUnsupportedMessage(errorMessage);

      if (canRetryWithAnotherCurrency) {
        break;
      }

      throw new MtnMomoError(errorMessage, {
        statusCode: response.status,
        details: payload,
        code: 'mtn_momo_request_to_pay_failed',
      });
    }
  }

  throw new MtnMomoError('MTN Mobile Money rejected the payment request.', {
    code: 'mtn_momo_request_to_pay_failed',
  });
};

const getRequestToPayStatus = async (referenceId) => {
  const config = assertConfigured();
  const accessToken = await getAccessToken(config);

  const response = await fetch(`${config.baseUrl}/collection/v1_0/requesttopay/${referenceId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Ocp-Apim-Subscription-Key': config.subscriptionKey,
      'X-Target-Environment': config.targetEnvironment,
    },
    signal: AbortSignal.timeout(config.requestTimeoutMs),
  });

  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    throw new MtnMomoError(
      getErrorMessage(payload, 'Failed to fetch MTN Mobile Money payment status.'),
      {
        statusCode: response.status,
        details: payload,
        code: 'mtn_momo_status_failed',
      }
    );
  }

  return payload || {};
};

const normalizePaymentStatus = (payload = {}) => {
  const rawStatus = String(payload.status || 'PENDING').toUpperCase();

  if (rawStatus === 'SUCCESSFUL') {
    return {
      rawStatus,
      paymentStatus: 'paid',
      reason: null,
      financialTransactionId: payload.financialTransactionId || '',
      externalId: payload.externalId || '',
      payload,
    };
  }

  if (rawStatus === 'FAILED') {
    return {
      rawStatus,
      paymentStatus: 'failed',
      reason: payload.reason || payload.statusReason || payload.error || payload.message || '',
      financialTransactionId: payload.financialTransactionId || '',
      externalId: payload.externalId || '',
      payload,
    };
  }

  return {
    rawStatus,
    paymentStatus: 'pending',
    reason: payload.reason || payload.statusReason || '',
    financialTransactionId: payload.financialTransactionId || '',
    externalId: payload.externalId || '',
    payload,
  };
};

module.exports = {
  MtnMomoError,
  assertConfigured,
  getMissingConfigKeys,
  getRequestToPayStatus,
  normalizePaymentStatus,
  normalizePhoneNumber,
  requestToPay,
};
