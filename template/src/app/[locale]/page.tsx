import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cn } from '@flutgraben/house-kit/utils';
import { tokens } from '@/lib/tokens';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'home' });

  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <div className="text-center">
        <h1 className={cn(tokens.fontSize.h1)}>{t('title')}</h1>
        <p className={cn(tokens.fontSize.body, 'text-muted')}>{t('lead')}</p>
      </div>
    </main>
  );
}
