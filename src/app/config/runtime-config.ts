declare global {
  interface Window {
    __TASK_MANAGER_CONFIG__?: {
      apiBaseUrl?: string;
    };
  }
}

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

export const getRuntimeApiBaseUrl = (): string => {
  const runtimeValue = window.__TASK_MANAGER_CONFIG__?.apiBaseUrl?.trim();

  if (runtimeValue) {
    return trimTrailingSlash(runtimeValue);
  }

  return '';
};

export {};
