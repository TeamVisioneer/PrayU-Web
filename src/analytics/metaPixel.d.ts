export declare global {
  interface Window {
    fbq: (
      event: string,
      action: string,
      params?: Record<string, unknown>
    ) => void;
  }
}
