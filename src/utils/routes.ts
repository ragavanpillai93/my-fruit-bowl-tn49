/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppRoute = 'store' | 'admin-login' | 'admin-dashboard';

/**
 * Parses the current route from window.location (pathname and hash)
 */
export const getCurrentRoute = (): AppRoute => {
  if (typeof window === 'undefined') return 'store';

  const pathname = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  // 1. Dedicated Admin Login Route (/admin/login or #admin/login or #/admin/login)
  if (
    pathname === '/admin/login' ||
    pathname.startsWith('/admin/login') ||
    hash === '#admin/login' ||
    hash === '#/admin/login' ||
    hash.startsWith('#admin/login') ||
    hash.startsWith('#/admin/login')
  ) {
    return 'admin-login';
  }

  // 2. Protected Admin Dashboard Route (/admin or #admin or #/admin)
  if (
    pathname === '/admin' ||
    pathname.startsWith('/admin') ||
    hash === '#admin' ||
    hash === '#/admin' ||
    hash.startsWith('#admin') ||
    hash.startsWith('#/admin')
  ) {
    return 'admin-dashboard';
  }

  // 3. Customer Storefront (Default)
  return 'store';
};

/**
 * Navigates safely across both HTML5 History and Hash routing
 */
export const navigateToRoute = (route: AppRoute) => {
  if (typeof window === 'undefined') return;

  switch (route) {
    case 'admin-login': {
      try {
        if (window.location.pathname !== '/admin/login') {
          window.history.pushState({}, '', '/admin/login');
        }
      } catch {
        // Fallback for sandboxed iframes
      }
      window.location.hash = 'admin/login';
      break;
    }
    case 'admin-dashboard': {
      try {
        if (window.location.pathname !== '/admin') {
          window.history.pushState({}, '', '/admin');
        }
      } catch {
        // Fallback
      }
      window.location.hash = 'admin';
      break;
    }
    case 'store':
    default: {
      try {
        if (window.location.pathname !== '/') {
          window.history.pushState({}, '', '/');
        }
      } catch {
        // Fallback
      }
      window.location.hash = '';
      break;
    }
  }

  // Dispatch a custom popstate event so listeners update immediately
  window.dispatchEvent(new Event('app-route-change'));
};
