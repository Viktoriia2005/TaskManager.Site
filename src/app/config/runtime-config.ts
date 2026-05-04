declare global {
  interface Window {
    __TASK_MANAGER_CONFIG__?: {
      apiBaseUrl?: string;
    };
  }
}

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const restoreGithubPagesRedirect = (): void => {
  if (!window.location.search.startsWith('?/')) {
    return;
  }

  const query = window.location.search.slice(2).replace(/~and~/g, '&');
  const hash = window.location.hash;
  const restoredUrl = `${window.location.pathname}${query ? `#/${query}` : ''}${hash}`;

  window.history.replaceState(null, '', restoredUrl);
};

restoreGithubPagesRedirect();

export const getRuntimeApiBaseUrl = (): string => {
  const runtimeValue = window.__TASK_MANAGER_CONFIG__?.apiBaseUrl?.trim();

  if (runtimeValue) {
    return trimTrailingSlash(runtimeValue);
  }

  return '';
};

export const hasRuntimeApiBaseUrl = (): boolean => getRuntimeApiBaseUrl().length > 0;

export {};
