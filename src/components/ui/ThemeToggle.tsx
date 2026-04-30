import { useCallback, useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';
type Resolved = 'light' | 'dark';

const STORAGE_KEY = 'salda-theme';
const TRANSITION_CLASS = 'theme-transitioning';
const TRANSITION_MS = 260;

const isBrowser = typeof window !== 'undefined';

const resolveTheme = (theme: Theme): Resolved => {
  if (theme === 'system') {
    return isBrowser && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return theme;
};

const applyResolved = (resolved: Resolved) => {
  document.documentElement.classList.toggle('dark', resolved === 'dark');
};

interface Props {
  variant?: 'icon' | 'full';
  className?: string;
}

const labels: Record<Theme, string> = {
  light: 'claro',
  dark: 'escuro',
  system: 'sistema',
};
const nextOf: Record<Theme, Theme> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => { ready: Promise<void>; finished: Promise<void> };
};

export default function ThemeToggle({ variant = 'icon', className }: Props) {
  const [theme, setTheme] = useState<Theme>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let stored: Theme = 'system';
    try {
      stored = (window.localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'system';
    } catch {
      // localStorage may throw in private mode / sandboxed iframes — default to system.
    }
    setTheme(stored);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyResolved(mq.matches ? 'dark' : 'light');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      const next = event.newValue as Theme;
      setTheme(next);
      applyResolved(resolveTheme(next));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const next = nextOf[theme];
      const resolved = resolveTheme(next);

      const rect = event.currentTarget.getBoundingClientRect();
      const root = document.documentElement;
      root.style.setProperty('--toggle-x', `${rect.left + rect.width / 2}px`);
      root.style.setProperty('--toggle-y', `${rect.top + rect.height / 2}px`);

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const doc = document as DocumentWithViewTransition;

      const swap = () => {
        setTheme(next);
        try {
          window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // private mode / quota — class still applied below; just no persistence.
        }
        applyResolved(resolved);
      };

      if (!reducedMotion && typeof doc.startViewTransition === 'function') {
        doc.startViewTransition(swap);
        return;
      }

      if (reducedMotion) {
        swap();
        return;
      }

      root.classList.add(TRANSITION_CLASS);
      swap();
      window.setTimeout(() => root.classList.remove(TRANSITION_CLASS), TRANSITION_MS);
    },
    [theme],
  );

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Carregando preferência de tema"
        className={`inline-flex items-center justify-center size-10 rounded-full text-on-surface-variant ${className ?? ''}`}
        disabled
      >
        <Monitor size={20} aria-hidden="true" strokeWidth={2} />
      </button>
    );
  }

  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;
  const ariaLabel = `Tema atual: ${labels[theme]}. Trocar para ${labels[nextOf[theme]]}.`;

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={ariaLabel}
        title={`Tema: ${labels[theme]}`}
        className={`inline-flex items-center justify-center gap-2 w-full rounded-xl px-4 py-2 text-on-surface-variant hover:bg-primary-container/10 transition-colors text-sm font-medium ${className ?? ''}`}
      >
        <Icon size={18} aria-hidden="true" strokeWidth={2} />
        <span>
          Tema · <span className="capitalize">{labels[theme]}</span>
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      title={`Tema: ${labels[theme]}`}
      className={`inline-flex items-center justify-center size-10 rounded-full text-on-surface-variant hover:bg-surface-container-low hover:text-primary-container transition-colors ${className ?? ''}`}
    >
      <Icon size={20} aria-hidden="true" strokeWidth={2} />
    </button>
  );
}
