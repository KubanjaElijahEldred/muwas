export const TOAST_EVENT_NAME = 'muwas:toast';

export function showSuccessToast(message) {
  if (typeof window === 'undefined' || !message) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT_NAME, {
      detail: {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        message,
        tone: 'success',
      },
    })
  );
}
