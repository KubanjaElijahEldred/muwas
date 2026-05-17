export const TOAST_EVENT_NAME = 'muwas:toast';

export function showToast(message, tone = 'info') {
  if (typeof window === 'undefined' || !message) {
    return;
  }

  const normalizedTone =
    tone === 'success' || tone === 'warning' || tone === 'error' || tone === 'info'
      ? tone
      : 'info';

  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT_NAME, {
      detail: {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        message,
        tone: normalizedTone,
      },
    })
  );
}

export function showSuccessToast(message) {
  showToast(message, 'success');
}
