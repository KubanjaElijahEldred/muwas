class AirtelMoneyError extends Error {
  constructor(message, { statusCode = 502, details = null, code = null } = {}) {
    super(message);
    this.name = 'AirtelMoneyError';
    this.statusCode = statusCode;
    this.details = details;
    this.code = code;
  }
}

const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const getConfig = () => ({
  baseUrl: trimTrailingSlash(process.env.AIRTEL_MONEY_BASE_URL || 'https://openapiuat.airtel.africa'),
  clientId: process.env.AIRTEL_MONEY_CLIENT_ID || '',
  clientSecret: process.env.AIRTEL_MONEY_CLIENT_SECRET || '',
  grantType: process.env.AIRTEL_MONEY_GRANT_TYPE || 'client_credentials',
  country: process.env.AIRTEL_MONEY_COUNTRY || 'UG',
  currency: process.env.AIRTEL_MONEY_CURRENCY || 'UGX',
  countryCode: process.env.AIRTEL_MONEY_COUNTRY_CODE || '256',
  requestTimeoutMs: Number.parseInt(process.env.AIRTEL_MONEY_REQUEST_TIMEOUT_MS || '20000', 10),
});

const getMissingConfigKeys = () => {
  const config = getConfig();
  const requiredValues = {
    AIRTEL_MONEY_BASE_URL: config.baseUrl,
    AIRTEL_MONEY_CLIENT_ID: config.clientId,
    AIRTEL_MONEY_CLIENT_SECRET: config.clientSecret,
    AIRTEL_MONEY_COUNTRY: config.country,
    AIRTEL_MONEY_CURRENCY: config.currency,
  };

  return Object.entries(requiredValues)
    .filter(([, value]) => !value)
    .map(([key]) => key);
};

const assertConfigured = () => {
  const missingKeys = getMissingConfigKeys();

  if (missingKeys.length > 0) {
    throw new AirtelMoneyError(
      `Airtel Money is not fully configured. Missing: ${missingKeys.join(', ')}`,
      { statusCode: 503, code: 'airtel_money_config_missing' }
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
    payload.description ||
    payload.error_description ||
    payload.error ||
    payload.status?.message ||
    payload.statusMessage ||
    fallback
  );
};

const normalizePhoneNumber = (value, fallbackCountryCode) => {
  const config = getConfig();
  const countryCode = String(fallbackCountryCode || config.countryCode || '').replace(/\D/g, '');
  let digits = String(value || '').replace(/\D/g, '');

  if (!digits) {
    throw new AirtelMoneyError('Enter the Airtel Money number you want to charge.', {
      statusCode: 400,
      code: 'airtel_money_phone_required',
    });
  }

  if (countryCode && digits.startsWith(countryCode)) {
    digits = digits.slice(countryCode.length);
  }

  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  return digits;
};

const getAccessToken = async (config) => {
  const response = await fetch(`${config.baseUrl}/auth/oauth2/token`, {
    method: 'POST',
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: config.grantType,
    }),
    signal: AbortSignal.timeout(config.requestTimeoutMs),
  });

  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    throw new AirtelMoneyError(
      getErrorMessage(payload, 'Failed to authenticate with Airtel Money.'),
      {
        statusCode: response.status,
        details: payload,
        code: 'airtel_money_token_failed',
      }
    );
  }

  const accessToken =
    payload?.access_token ||
    payload?.token ||
    payload?.data?.access_token ||
    payload?.data?.token ||
    '';

  if (!accessToken) {
    throw new AirtelMoneyError('Airtel Money token response did not include an access token.', {
      details: payload,
      code: 'airtel_money_token_missing',
    });
  }

  return accessToken;
};

const requestToPay = async ({
  amount,
  phoneNumber,
  externalId,
  referenceId,
}) => {
  const config = assertConfigured();
  const accessToken = await getAccessToken(config);
  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber, config.countryCode);

  const response = await fetch(`${config.baseUrl}/merchant/v1/payments/`, {
    method: 'POST',
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Country': config.country,
      'X-Currency': config.currency,
    },
    body: JSON.stringify({
      reference: externalId,
      subscriber: {
        country: config.country,
        currency: config.currency,
        msisdn: normalizedPhoneNumber,
      },
      transaction: {
        amount: Number(amount).toFixed(2),
        country: config.country,
        currency: config.currency,
        id: referenceId,
      },
    }),
    signal: AbortSignal.timeout(config.requestTimeoutMs),
  });

  const payload = await parseJsonSafely(response);
  const success = payload?.status?.success;

  if (!response.ok || success === false) {
    throw new AirtelMoneyError(
      getErrorMessage(payload, 'Airtel Money rejected the payment request.'),
      {
        statusCode: response.status || 502,
        details: payload,
        code: 'airtel_money_request_failed',
      }
    );
  }

  return {
    referenceId:
      payload?.data?.transaction?.id ||
      payload?.transaction?.id ||
      referenceId,
    phoneNumber: normalizedPhoneNumber,
    payload,
  };
};

const getPaymentStatus = async (referenceId) => {
  const config = assertConfigured();
  const accessToken = await getAccessToken(config);

  const response = await fetch(`${config.baseUrl}/standard/v1/payments/${referenceId}`, {
    method: 'GET',
    headers: {
      Accept: '*/*',
      Authorization: `Bearer ${accessToken}`,
      'X-Country': config.country,
      'X-Currency': config.currency,
    },
    signal: AbortSignal.timeout(config.requestTimeoutMs),
  });

  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    throw new AirtelMoneyError(
      getErrorMessage(payload, 'Failed to fetch Airtel Money payment status.'),
      {
        statusCode: response.status,
        details: payload,
        code: 'airtel_money_status_failed',
      }
    );
  }

  return payload || {};
};

const normalizePaymentStatus = (payload = {}) => {
  const rawStatus = String(
    payload?.data?.transaction?.status ||
    payload?.transaction?.status ||
    payload?.data?.status ||
    payload?.status?.code ||
    payload?.status ||
    'PENDING'
  ).toUpperCase();

  const reason =
    payload?.status?.message ||
    payload?.message ||
    payload?.data?.transaction?.message ||
    payload?.description ||
    '';

  const normalized = {
    rawStatus,
    paymentStatus: 'pending',
    reason,
    financialTransactionId:
      payload?.data?.transaction?.airtel_money_id ||
      payload?.data?.transaction?.airtelMoneyId ||
      payload?.data?.transaction?.id ||
      payload?.transaction?.id ||
      '',
    externalId:
      payload?.data?.transaction?.reference ||
      payload?.reference ||
      '',
    payload,
  };

  if (['TS', 'SUCCESS', 'SUCCESSFUL', 'COMPLETED'].includes(rawStatus)) {
    normalized.paymentStatus = 'paid';
    return normalized;
  }

  if (['TF', 'FAILED', 'FAIL', 'REJECTED', 'CANCELLED', 'DECLINED'].includes(rawStatus)) {
    normalized.paymentStatus = 'failed';
    return normalized;
  }

  return normalized;
};

module.exports = {
  AirtelMoneyError,
  assertConfigured,
  getMissingConfigKeys,
  getPaymentStatus,
  normalizePaymentStatus,
  normalizePhoneNumber,
  requestToPay,
};
