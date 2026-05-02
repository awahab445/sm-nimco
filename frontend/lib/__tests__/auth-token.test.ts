/**
 * @jest-environment jsdom
 */
import { getToken, setToken, clearToken } from '../auth-token';

describe('auth-token', () => {
  beforeEach(() => {
    clearToken();
    localStorage.clear();
    document.cookie = '';
  });

  describe('setToken and getToken', () => {
    it('should store token in localStorage and return it via getToken', () => {
      setToken('my-jwt-token');
      expect(getToken()).toBe('my-jwt-token');
      expect(localStorage.getItem('auth-token')).toBe('my-jwt-token');
    });

    it('should set cookie when setting token', () => {
      setToken('cookie-token');
      expect(document.cookie).toContain('auth-token=');
      expect(document.cookie).toContain(encodeURIComponent('cookie-token'));
    });

    it('should return null when no token has been set', () => {
      expect(getToken()).toBe(null);
    });
  });

  describe('clearToken', () => {
    it('should remove token from localStorage and cookie', () => {
      setToken('to-remove');
      expect(getToken()).toBe('to-remove');
      clearToken();
      expect(getToken()).toBe(null);
      expect(localStorage.getItem('auth-token')).toBe(null);
      expect(document.cookie).not.toContain('auth-token=');
    });
  });
});
