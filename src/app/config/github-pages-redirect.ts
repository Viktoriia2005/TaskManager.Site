export const restoreGithubPagesRedirect = (): void => {
  if (!window.location.search.startsWith('?/')) {
    return;
  }

  const query = window.location.search.slice(2).replace(/~and~/g, '&');
  const hash = window.location.hash;
  const restoredUrl = `${window.location.pathname}${query ? `#/${query}` : ''}${hash}`;

  window.history.replaceState(null, '', restoredUrl);
};
