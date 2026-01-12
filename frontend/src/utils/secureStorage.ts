/**
 * @deprecated This file is deprecated. Authentication now uses httpOnly cookies.
 *
 * The application has been migrated to use httpOnly cookies with SameSite=Strict
 * for authentication. This provides better security against XSS attacks because:
 *
 * 1. httpOnly cookies cannot be accessed via JavaScript (XSS protection)
 * 2. SameSite=Strict prevents CSRF attacks
 * 3. Cookies are automatically sent with requests (no manual token management)
 *
 * The auth flow now works as follows:
 * - Login: POST /api/auth/login sets an httpOnly cookie
 * - Logout: POST /api/auth/logout clears the cookie
 * - Authenticated requests: Use axios with { withCredentials: true }
 *
 * This file is kept for backwards compatibility during migration but should
 * be removed in a future cleanup.
 */

class SecureStorage {
  private static instance: SecureStorage;

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  /**
   * @deprecated No longer needed - auth uses httpOnly cookies
   */
  setToken(_token: string, _expiresInHours: number = 24): void {
    console.warn('secureStorage.setToken() is deprecated. Authentication now uses httpOnly cookies.');
  }

  /**
   * @deprecated No longer needed - auth uses httpOnly cookies
   */
  getToken(): string | null {
    console.warn('secureStorage.getToken() is deprecated. Authentication now uses httpOnly cookies.');
    return null;
  }

  /**
   * @deprecated No longer needed - auth uses httpOnly cookies
   */
  hasValidToken(): boolean {
    console.warn('secureStorage.hasValidToken() is deprecated. Use /api/auth/verify endpoint instead.');
    return false;
  }

  /**
   * @deprecated No longer needed - use POST /api/auth/logout instead
   */
  clearToken(): void {
    console.warn('secureStorage.clearToken() is deprecated. Use POST /api/auth/logout instead.');
    // Clean up any legacy tokens that might still exist
    try {
      sessionStorage.removeItem('__gt_auth');
      sessionStorage.removeItem('__gt_auth_exp');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('auth_token');
    } catch {
      // Ignore errors
    }
  }

  /**
   * @deprecated No longer needed - auth uses httpOnly cookies
   */
  getTokenExpiry(): Date | null {
    console.warn('secureStorage.getTokenExpiry() is deprecated. Token expiry is managed by cookies.');
    return null;
  }
}

export const secureStorage = SecureStorage.getInstance();
