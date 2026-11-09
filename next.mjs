// The house Next.js settings. A project's next.config.ts is one line:
//   export default withHouse({ /* this project's own settings */ });
// Every setting below is a finding from running the house apps on Hostinger.
// Change one here, release the kit, and every project gets it at its next update.

import createNextIntlPlugin from 'next-intl/plugin';

const KIT = '@flutgraben/house-kit';

/**
 * @param {import('next').NextConfig} config  the project's own settings; they win where they overlap
 * @param {{ intl?: string | false }} [options]  intl: path to next-intl's request config, or false for no languages
 * @returns {import('next').NextConfig}
 */
export function withHouse(config = {}, { intl = './src/i18n/request.ts' } = {}) {
  const house = {
    // Hostinger runs the self-hosted output: node .next/standalone/server.js.
    output: 'standalone',
    // The kit ships TypeScript source, so Next compiles it like the project's own code.
    transpilePackages: [KIT, ...(config.transpilePackages ?? [])],
    experimental: {
      // Off: each build tree would carry its own multi-hundred-MB build cache
      // (695 MB measured on the dashboard, 2026-09-07), and nobody chose it.
      turbopackFileSystemCacheForBuild: false,
      // Off: a cache written under another helper mode crashed `next dev` on the
      // first compile ("Port should be >= 0", 2026-09-29). Cost: a cold dev start.
      turbopackFileSystemCacheForDev: false,
      // Hostinger's build box refuses the default helper's connection to
      // 127.0.0.1 (since 2026-09-27), so every default build died at the CSS step.
      // Worker threads need no socket. Experimental: re-check on every Next upgrade.
      turbopackPluginRuntimeStrategy: 'workerThreads',
      ...config.experimental,
    },
    images: {
      // The image optimizer stays off on Next 16.2.12: its AVIF decoder carries an
      // unauthenticated remote-code-execution advisory (GHSA-2xp9-vwfh-vxw4, fixed
      // in 16.3.3), and 16.3 cannot build on Hostinger's glibc 2.28.
      // Lift it in the same release that raises the Next pin.
      unoptimized: true,
      ...config.images,
    },
  };
  const merged = { ...config, ...house };
  return intl === false ? merged : createNextIntlPlugin(intl)(merged);
}
