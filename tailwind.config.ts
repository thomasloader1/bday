import type { Config } from 'tailwindcss'

/**
 * Hallmark · owner palette (coral + lime on warm white; Fraunces / Inter). Every colour is a token declared in
 * src/app/tokens.css; Tailwind only projects them. `tone()` keeps the `/40`
 * opacity modifiers working on a var() colour via color-mix.
 */
const tone = (token: string) =>
  `color-mix(in oklab, var(${token}) calc(<alpha-value> * 100%), transparent)`

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Halftone roles
        paper: { DEFAULT: tone('--color-paper'), 2: tone('--color-paper-2'), 3: tone('--color-paper-3') },
        ink: { DEFAULT: tone('--color-ink'), 2: tone('--color-ink-2') },
        surface: tone('--color-surface'),
        lime: { DEFAULT: tone('--color-lime'), ink: tone('--color-lime-ink') },
        muted: tone('--color-muted'),
        rule: tone('--color-rule'),
        spot: { DEFAULT: tone('--color-accent'), deep: tone('--color-accent-deep'), ink: tone('--color-accent-ink') },
        focus: tone('--color-focus'),

        // Legacy names, re-pointed at the one-ink system (admin and untouched screens)
        primary: {
          50: tone('--color-paper-2'),
          100: tone('--color-paper-3'),
          200: tone('--color-paper-3'),
          300: tone('--color-rule'),
          400: tone('--color-accent'),
          500: tone('--color-accent'),
          600: tone('--color-accent'),
          700: tone('--color-accent'),
          800: tone('--color-accent-deep'),
          900: tone('--color-accent-deep'),
        },
        accent: { 500: tone('--color-focus'), 600: tone('--color-focus') },
        neutral: {
          50: tone('--color-paper'),
          100: tone('--color-paper-2'),
          200: tone('--color-rule'),
          300: tone('--color-rule'),
          400: tone('--color-muted'),
          500: tone('--color-muted'),
          600: tone('--color-ink-2'),
          700: tone('--color-ink-2'),
          800: tone('--color-ink'),
          900: tone('--color-ink'),
        },
        festive: { cream: tone('--color-paper-2'), yellow: tone('--color-paper-3') },
        card: { default: tone('--color-surface'), paper: tone('--color-surface'), elevated: tone('--color-surface') },
        success: tone('--color-success'),
        danger: tone('--color-ink-2'),
        info: tone('--color-ink-2'),
        warning: tone('--color-accent'),
      },
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-body)'],
      },
      fontSize: {
        display: ['var(--text-display)', { lineHeight: '1.08' }],
        'display-s': ['var(--text-display-s)', { lineHeight: '1.08' }],
        section: ['var(--text-section)', { lineHeight: '1.08' }],
        title: ['var(--text-title)', { lineHeight: '1.2' }],
        lead: ['var(--text-lead)', { lineHeight: '1.45' }],
      },
      borderRadius: {
        sm: 'var(--radius-input)',
        md: 'var(--radius-input)',
        lg: 'var(--radius-input)',
        xl: 'var(--radius-card)',
        input: 'var(--radius-input)',
        card: 'var(--radius-card)',
        full: 'var(--radius-pill)',
      },
      borderWidth: {
        bar: 'var(--rule-bar)',
        hair: 'var(--rule-hair)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        sm: '0 1px 2px oklch(21% 0.006 286 / 0.05)',
        md: 'var(--shadow-card)',
        lg: 'var(--shadow-card)',
      },
      maxWidth: {
        container: 'var(--container)',
      },
      transitionDuration: {
        fast: 'var(--dur-micro)',
        base: 'var(--dur-short)',
        slow: 'var(--dur-long)',
      },
      transitionTimingFunction: {
        party: 'var(--ease-out)',
      },
      keyframes: {
        drift: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '50%': { transform: 'translate(10px, -14px) rotate(3deg)' },
          '100%': { transform: 'translate(-8px, 10px) rotate(-3deg)' },
        },
      },
      animation: {
        drift: 'drift 16s ease-in-out infinite alternate',
      },
    },
  },
  // base.css owns .container (capped, centred, gutters); Tailwind's would override it
  corePlugins: { container: false },
  plugins: [],
}
export default config
