import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { theme as antdTheme } from 'antd';
import type { ThemeConfig } from 'antd';

const STORAGE_DARK = 'dark-mode';
const STORAGE_ULTRA = 'isUltraDarkThemeEnabled';

function readBool(key: string, fallback: boolean): boolean {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  return raw === 'true';
}

function applyDom(isDark: boolean, isUltra: boolean) {
  document.body.classList.remove('dark', 'light');
  document.body.classList.add(isDark ? 'dark' : 'light');
  if (isUltra) {
    document.documentElement.setAttribute('data-theme', 'ultra-dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  const msg = document.getElementById('message');
  if (msg) {
    msg.classList.remove('dark', 'light');
    msg.classList.add(isDark ? 'dark' : 'light');
  }
}

// module load so the document is in the right theme before React mounts.
const initialDark = readBool(STORAGE_DARK, true);
const initialUltra = readBool(STORAGE_ULTRA, false);
applyDom(initialDark, initialUltra);

// S1MPLE PANEL color tokens - hovering liquid red, orange, and green
const S1MPLE_PRIMARY = '#ff3158';
const S1MPLE_SECONDARY = '#42e695';
const S1MPLE_TERTIARY = '#ff8a1f';

const DARK_TOKENS = {
  colorBgBase: '#100b0b',
  colorBgLayout: '#100b0b',
  colorBgContainer: '#1c1210',
  colorBgElevated: '#281914',
  colorPrimary: S1MPLE_PRIMARY,
  colorPrimaryHover: '#ff5b78',
  colorPrimaryActive: '#d91f45',
  colorPrimaryTextHover: '#ffffff',
  colorPrimaryTextActive: '#ffffff',
  colorSuccess: S1MPLE_SECONDARY,
  colorSuccessHover: '#70f2ad',
  colorSuccessActive: '#22bc70',
  colorInfo: S1MPLE_TERTIARY,
  colorInfoHover: '#ffad63',
  colorInfoActive: '#e46812',
  colorBorderSecondary: 'rgba(255, 138, 31, 0.18)',
  colorText: 'rgba(255, 255, 255, 0.95)',
  colorTextSecondary: 'rgba(255, 220, 200, 0.72)',
  colorTextTertiary: 'rgba(255, 205, 180, 0.52)',
  colorTextPlaceholder: 'rgba(255, 190, 150, 0.44)',
} as const;
const ULTRA_DARK_TOKENS = {
  colorBgBase: '#080606',
  colorBgLayout: '#080606',
  colorBgContainer: '#120b0a',
  colorBgElevated: '#1c100d',
  colorPrimary: S1MPLE_PRIMARY,
  colorPrimaryHover: '#ff5b78',
  colorPrimaryActive: '#d91f45',
  colorPrimaryTextHover: '#ffffff',
  colorPrimaryTextActive: '#ffffff',
  colorSuccess: S1MPLE_SECONDARY,
  colorSuccessHover: '#70f2ad',
  colorSuccessActive: '#22bc70',
  colorInfo: S1MPLE_TERTIARY,
  colorInfoHover: '#ffad63',
  colorInfoActive: '#e46812',
  colorBorderSecondary: 'rgba(255, 138, 31, 0.13)',
  colorText: 'rgba(255, 255, 255, 0.98)',
  colorTextSecondary: 'rgba(255, 220, 200, 0.68)',
  colorTextTertiary: 'rgba(255, 200, 175, 0.48)',
  colorTextPlaceholder: 'rgba(255, 175, 135, 0.38)',
} as const;
const DARK_LAYOUT_TOKENS = {
  bodyBg: '#100b0b',
  headerBg: '#140d0b',
  headerColor: '#ffffff',
  footerBg: '#100b0b',
  siderBg: '#140d0b',
  triggerBg: '#25150f',
  triggerColor: '#ffffff',
} as const;
const ULTRA_DARK_LAYOUT_TOKENS = {
  bodyBg: '#080606',
  headerBg: '#0d0807',
  headerColor: '#ffffff',
  footerBg: '#080606',
  siderBg: '#0d0807',
  triggerBg: '#1a0f0b',
  triggerColor: '#ffffff',
} as const;
const DARK_MENU_TOKENS = {
  darkItemBg: '#140d0b',
  darkSubMenuItemBg: '#100b0b',
  darkPopupBg: '#241510',
  darkItemHoverBg: 'rgba(255, 138, 31, 0.12)',
  darkItemActiveBg: 'rgba(255, 49, 88, 0.18)',
} as const;
const ULTRA_DARK_MENU_TOKENS = {
  darkItemBg: '#0d0807',
  darkSubMenuItemBg: '#080606',
  darkPopupBg: '#1a0f0b',
  darkItemHoverBg: 'rgba(255, 138, 31, 0.1)',
  darkItemActiveBg: 'rgba(255, 49, 88, 0.14)',
} as const;
const DARK_CARD_TOKENS = {
  colorBorderSecondary: 'rgba(255, 138, 31, 0.18)',
} as const;
const ULTRA_DARK_CARD_TOKENS = {
  colorBorderSecondary: 'rgba(255, 138, 31, 0.13)',
} as const;
const STATISTIC_TOKENS = {
  contentFontSize: 17,
  titleFontSize: 11,
} as const;
const LIGHT_CONTRAST_TOKENS = {
  colorTextDescription: 'rgba(0, 0, 0, 0.58)',
  colorTextTertiary: 'rgba(0, 0, 0, 0.58)',
  colorTextPlaceholder: '#767676',
  colorError: '#cf1322',
  colorErrorText: '#cf1322',
  colorSuccessText: '#237804',
} as const;
const LIGHT_BUTTON_TOKENS = {
  colorPrimary: S1MPLE_PRIMARY,
  colorPrimaryHover: '#ff5b78',
  colorPrimaryActive: '#d91f45',
} as const;

// hashed:false drops the `:where(.css-<hash>)` wrapper antd puts around every
// rule. It costs nothing in specificity — `:where()` contributes zero, so the
// panel's own `.ant-*` overrides still win — and it removes roughly 5,700
// wrappers, 16% of the generated stylesheet, from what the browser has to parse.
//
// cssVar.key pins the CSS-variable scope. Every panel page mounts its own
// ConfigProvider (there is no root one), and without a fixed key each mints a
// fresh useId-derived scope, so navigating re-serialises and re-injects the whole
// token block under a new class instead of reusing the one already in the head.
const SHARED_STYLE_CONFIG = {
  hashed: false,
  cssVar: { key: 'xui' },
} as const;

export function buildAntdThemeConfig(isDark: boolean, isUltra: boolean): ThemeConfig {
  if (!isDark) {
    return {
      ...SHARED_STYLE_CONFIG,
      algorithm: antdTheme.defaultAlgorithm,
      token: LIGHT_CONTRAST_TOKENS,
      components: {
        Statistic: STATISTIC_TOKENS,
        Button: LIGHT_BUTTON_TOKENS,
      },
    };
  }
  return {
    ...SHARED_STYLE_CONFIG,
    algorithm: antdTheme.darkAlgorithm,
    token: isUltra ? ULTRA_DARK_TOKENS : DARK_TOKENS,
    components: {
      Layout: isUltra ? ULTRA_DARK_LAYOUT_TOKENS : DARK_LAYOUT_TOKENS,
      Menu: isUltra ? ULTRA_DARK_MENU_TOKENS : DARK_MENU_TOKENS,
      Card: isUltra ? ULTRA_DARK_CARD_TOKENS : DARK_CARD_TOKENS,
      Statistic: STATISTIC_TOKENS,
    },
  };
}

export function pauseAnimationsUntilLeave(elementId: string): void {
  document.documentElement.setAttribute('data-theme-animations', 'off');
  const el = document.getElementById(elementId);
  if (!el) return;
  const restore = () => {
    document.documentElement.removeAttribute('data-theme-animations');
    el.removeEventListener('mouseleave', restore);
    el.removeEventListener('touchend', restore);
  };
  el.addEventListener('mouseleave', restore);
  el.addEventListener('touchend', restore);
}

interface ThemeContextValue {
  isDark: boolean;
  isUltra: boolean;
  toggleTheme: () => void;
  toggleUltra: () => void;
  antdThemeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(initialDark);
  const [isUltra, setIsUltra] = useState<boolean>(initialUltra);

  useLayoutEffect(() => {
    applyDom(isDark, isUltra);
    localStorage.setItem(STORAGE_DARK, String(isDark));
    localStorage.setItem(STORAGE_ULTRA, String(isUltra));
  }, [isDark, isUltra]);

  const toggleTheme = useCallback(() => setIsDark((v) => !v), []);
  const toggleUltra = useCallback(() => setIsUltra((v) => !v), []);

  const antdThemeConfig = useMemo(() => buildAntdThemeConfig(isDark, isUltra), [isDark, isUltra]);

  const value = useMemo<ThemeContextValue>(
    () => ({ isDark, isUltra, toggleTheme, toggleUltra, antdThemeConfig }),
    [isDark, isUltra, toggleTheme, toggleUltra, antdThemeConfig],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
