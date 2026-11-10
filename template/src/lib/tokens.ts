/**
 * This project's tokens for what has no Tailwind namespace (type sizes, motion),
 * bridged to the values in src/app/globals.css. Use them through cn():
 *
 *   className={cn(tokens.fontSize.h1)}
 *
 * The project owns this file: rename, add or remove as its design asks.
 */
export const tokens = {
  fontSize: {
    body: 'text-[length:var(--fs-body)]',
    h1: 'text-[length:var(--fs-h1)]',
  },
  // motion-safe: skipped for people who ask for reduced motion.
  transition: {
    colors: 'motion-safe:transition-colors duration-[var(--dur-fast)]',
  },
} as const;
