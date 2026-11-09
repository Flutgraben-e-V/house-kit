/**
 * The house token contract, layer 2: the tokens object.
 *
 * Layer 1 (theme.css) gives the Tailwind utilities for colour and font. This
 * object carries what does not map onto a Tailwind namespace: the type scale
 * and motion, bridged to the project's `--house-*` values. Use it through cn():
 *
 *   className={cn(tokens.fontSize.h1, tokens.font.display)}
 *
 * Never a raw colour, size or duration in a component: a value belongs in the
 * project's :root, a name belongs here.
 */

/** Every CSS custom property a house project must define in its :root. */
export const TOKEN_CONTRACT = [
  '--house-bg',
  '--house-fg',
  '--house-muted',
  '--house-accent',
  '--house-line',
  '--house-font-body',
  '--house-font-display',
  '--house-fs-small',
  '--house-fs-body',
  '--house-fs-h3',
  '--house-fs-h2',
  '--house-fs-h1',
  '--house-dur-fast',
  '--house-dur-slow',
] as const;

export const tokens = {
  font: {
    body: 'font-body',
    display: 'font-display',
  },
  fontSize: {
    small: 'text-[length:var(--house-fs-small)]',
    body: 'text-[length:var(--house-fs-body)]',
    h3: 'text-[length:var(--house-fs-h3)]',
    h2: 'text-[length:var(--house-fs-h2)]',
    h1: 'text-[length:var(--house-fs-h1)]',
  },
  // motion-safe: skipped for people who ask for reduced motion.
  transition: {
    colors: 'motion-safe:transition-colors duration-[var(--house-dur-fast)]',
    opacity: 'motion-safe:transition-opacity duration-[var(--house-dur-fast)]',
    transform: 'motion-safe:transition-transform duration-[var(--house-dur-slow)]',
  },
} as const;
