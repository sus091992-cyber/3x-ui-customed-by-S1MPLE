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

// S1MPLE PANEL color tokens - hovering gradient liquid red green aqua
const S1MPLE_PRIMARY = '#ff0040';
const S1MPLE_SECONDARY = '#00ff88';
const S1MPLE_TERTIARY = '#00d4ff';

const DARK_TOKENS = {
  colorBgBase: '#0a0000',
  colorBgLayout: '#0a0000',
  colorBgContainer: '#1a0505',
  colorBgElevated: '#250808',
  colorPrimary: S1MPLE_PRIMARY,
  colorPrimaryHover: '#ff3366',
  colorPrimaryActive: '#cc0033',
  colorPrimaryTextHover: '#ffffff',
  colorPrimaryTextActive: '#ffffff',
  colorSuccess: S1MPLE_SECONDARY,
  colorSuccessHover: '#33ff99',
  colorSuccessActive: '#00cc6e',
  colorInfo: S1MPLE_TERTIARY,
  colorInfoHover: '#33ddff',
  colorInfoActive: '#00aacc',
  colorBorderSecondary: 'rgba(255, 100, 100, 0.15)',
  colorText: 'rgba(255, 255, 255, 0.95)',
  colorTextSecondary: 'rgba(255, 200, 200, 0.7)',
  colorTextTertiary: 'rgba(255, 180, 180, 0.5)',
  colorTextPlaceholder: 'rgba(255, 150, 150, 0.4)',
} as const;
const ULTRA_DARK_TOKENS = {
  colorBgBase: '#050000',
  colorBgLayout: '#050000',
  colorBgContainer: '#0d0202',
  colorBgElevated: '#150303',
  colorPrimary: S1MPLE_PRIMARY,
  colorPrimaryHover: '#ff3366',
  colorPrimaryActive: '#cc0033',
  colorPrimaryTextHover: '#ffffff',
  colorPrimaryTextActive: '#ffffff',
  colorSuccess: S1MPLE_SECONDARY,
  colorSuccessHover: '#33ff99',
  colorSuccessActive: '#00cc6e',
  colorInfo: S1MPLE_TERTIARY,
  colorInfoHover: '#33ddff',
  colorInfoActive: '#00aacc',
  colorBorderSecondary: 'rgba(255, 80, 80, 0.1)',
  colorText: 'rgba(255, 255, 255, 0.98)',
  colorTextSecondary: 'rgba(255, 180, 180, 0.65)',
  colorTextTertiary: 'rgba(255, 150, 150, 0.45)',
  colorTextPlaceholder: 'rgba(255, 120, 120, 0.35)',
} as const;
const DARK_LAYOUT_TOKENS = {
  bodyBg: '#0a0000',
  headerBg: '#0d0000',
  headerColor: '#ffffff',
  footerBg: '#0a0000',
  siderBg: '#0d0000',
  triggerBg: '#1a0505',
  triggerColor: '#ffffff',
} as const;
const ULTRA_DARK_LAYOUT_TOKENS = {
  bodyBg: '#050000',
  headerBg: '#080000',
  headerColor: '#ffffff',
  footerBg: '#050000',
  siderBg: '#080000',
  triggerBg: '#0d0202',
  triggerColor: '#ffffff',
} as const;
const DARK_MENU_TOKENS = {
  darkItemBg: '#0d0000',
  darkSubMenuItemBg: '#0a0000',
  darkPopupBg: '#1a0505',
  darkItemHoverBg: 'rgba(255, 0, 64, 0.1)',
  darkItemActiveBg: 'rgba(255, 0, 64, 0.15)',
} as const;
const ULTRA_DARK_MENU_TOKENS = {
  darkItemBg: '#080000',
  darkSubMenuItemBg: '#050000',
  darkPopupBg: '#0d0202',
  darkItemHoverBg: 'rgba(255, 0, 64, 0.08)',
  darkItemActiveBg: 'rgba(255, 0, 64, 0.12)',
} as const;
const DARK_CARD_TOKENS = {
  colorBorderSecondary: 'rgba(255, 100, 100, 0.15)',
} as const;
const ULTRA_DARK_CARD_TOKENS = {
  colorBorderSecondary: 'rgba(255, 80, 80, 0.1)',
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
  colorPrimaryHover: '#ff3366',
  colorPrimaryActive: '#cc0033',
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
