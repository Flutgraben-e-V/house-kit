import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

// Sends a visitor to their language: / becomes /en or /de.
export const proxy = createIntlMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
