const normalizeBaseUrl = (value) => {
  const withFallback = String(value || '/api').trim() || '/api';
  return withFallback.endsWith('/') ? withFallback.slice(0, -1) : withFallback;
};

const normalizeOrigin = (value) =>
  String(value || '').trim().replace(/\/+$/, '');

const RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);

const isLocalHostname = (hostname = '') => /^(localhost|127\.0\.0\.1)$/i.test(hostname);

const resolveApiBaseUrl = () => {
  const configuredBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_URL);

  if (typeof window === 'undefined') {
    return configuredBaseUrl;
  }

  const isLocalApiUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/api/i.test(
    configuredBaseUrl
  );

  if (isLocalApiUrl && !isLocalHostname(window.location.hostname)) {
    return '/api';
  }

  return configuredBaseUrl;
};

export const API_BASE_URL = resolveApiBaseUrl();

const resolveLocalFallbackBaseUrl = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  if (/^https?:\/\//i.test(API_BASE_URL)) {
    return '';
  }

  const isLocalHost = isLocalHostname(window.location.hostname);
  if (!isLocalHost) {
    return '';
  }

  const configuredOrigin = normalizeOrigin(
    import.meta.env.VITE_BACKEND_DIRECT_ORIGIN || 'http://localhost:5000'
  );

  if (!configuredOrigin) {
    return '';
  }

  return `${configuredOrigin}/api`;
};

export const API_FALLBACK_BASE_URL = resolveLocalFallbackBaseUrl();

const normalizePath = (path = '') => (path.startsWith('/') ? path : `/${path}`);

export const apiUrl = (path = '') => `${API_BASE_URL}${normalizePath(path)}`;

export const toAbsoluteApiUrl = (path = '') => {
  const url = apiUrl(path);

  if (/^https?:\/\//i.test(url) || typeof window === 'undefined') {
    return url;
  }

  return `${window.location.origin}${url}`;
};

const buildApiCandidateUrls = (path = '') => {
  const normalizedPath = normalizePath(path);
  const candidates = [apiUrl(normalizedPath)];

  if (API_FALLBACK_BASE_URL) {
    const fallbackUrl = `${API_FALLBACK_BASE_URL}${normalizedPath}`;

    if (!candidates.includes(fallbackUrl)) {
      candidates.push(fallbackUrl);
    }
  }

  return candidates;
};

export const fetchWithApiFallback = async (path = '', init = {}, options = {}) => {
  const candidateUrls = buildApiCandidateUrls(path);
  const retryableStatuses = options.retryableStatuses || RETRYABLE_STATUS_CODES;
  let lastError = null;
  let lastResponse = null;

  for (let index = 0; index < candidateUrls.length; index += 1) {
    const url = candidateUrls[index];

    try {
      const response = await fetch(url, init);

      if (response.ok) {
        return response;
      }

      const shouldTryNextCandidate =
        index < candidateUrls.length - 1 && retryableStatuses.has(response.status);

      if (!shouldTryNextCandidate) {
        return response;
      }

      lastResponse = response;
    } catch (error) {
      lastError = error;

      if (index === candidateUrls.length - 1) {
        throw error;
      }
    }
  }

  if (lastResponse) {
    return lastResponse;
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error('Unable to complete API request');
};
