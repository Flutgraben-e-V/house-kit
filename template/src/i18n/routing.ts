import { defineRouting } from 'next-intl/routing';

// The active languages. English carries the structure: every other language's
// messages file must hold every key of en.json (house-kit check).
export const locales = ['en', 'de'] as const;

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
});
