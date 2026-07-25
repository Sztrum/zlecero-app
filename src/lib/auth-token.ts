const ACCESS_TOKEN_KEY = 'zlecero_access_token';

export const authToken = {
  get(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
  },

  set(token: string): void {
    window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  clear(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  },
};
