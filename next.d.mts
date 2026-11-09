import type { NextConfig } from 'next';

/**
 * The house Next.js settings around a project's own.
 * @param config  the project's own settings
 * @param options intl: path to next-intl's request config, or false for a project without languages
 */
export function withHouse(config?: NextConfig, options?: { intl?: string | false }): NextConfig;
