import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '__NAME__',
};

// Pass-through: the document frame (<html lang>) lives in [locale]/layout.tsx,
// the one layout that knows the language from the URL. Reading it here would
// make every page render per request instead of being pre-built.
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
