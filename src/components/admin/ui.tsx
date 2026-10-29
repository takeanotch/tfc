'use client';

import { Loader2 } from 'lucide-react';

/* --------------------------------- Button -------------------------------- */

type ButtonVariant = 'default' | 'outline' | 'ghost' | 'destructive' | 'active';
type ButtonSize = 'sm' | 'md' | 'icon';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  default:
    'bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white',
  outline:
    'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700',
  ghost:
    'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
  destructive:
    'border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:bg-zinc-800 dark:text-rose-400 dark:hover:bg-rose-950/30',
  active:
    'bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/20',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  icon: 'h-9 w-9',
};

export function Button({
  children,
  onClick,
  disabled,
  variant = 'outline',
  size = 'sm',
  className = '',
  title,
  type = 'button',
  loading,
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  title?: string;
  type?: 'button' | 'submit';
  loading?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      aria-busy={loading}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_SIZES[size]} ${BUTTON_VARIANTS[variant]} ${className}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : children}
    </button>
  );
}

/* ---------------------------------- Badge -------------------------------- */

type BadgeTone = 'zinc' | 'teal' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet' | 'indigo' | 'orange';

const BADGE_TONES: Record<BadgeTone, string> = {
  zinc: 'bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700',
  teal: 'bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/20',
  emerald:
    'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20',
  amber:
    'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20',
  rose: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20',
  sky: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20',
  violet:
    'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20',
  indigo:
    'bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/20',
  orange:
    'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/20',
};

export function Badge({
  children,
  tone = 'zinc',
  icon: Icon,
  dot,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  icon?: React.ElementType;
  dot?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${BADGE_TONES[tone]}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
      {Icon && <Icon className="h-3 w-3" aria-hidden />}
      {children}
    </span>
  );
}

/* --------------------------------- Avatar -------------------------------- */

export function Avatar({
  src,
  name,
  size = 36,
  online,
  className = '',
}: {
  src?: string | null;
  name: string;
  size?: number;
  online?: boolean;
  className?: string;
}) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2) || '?';

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          width={size}
          height={size}
          className={`h-full w-full rounded-full object-cover ring-1 ring-zinc-200 dark:ring-zinc-700 ${className}`}
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center rounded-full bg-zinc-900 font-semibold text-white ring-1 ring-zinc-200 dark:bg-zinc-100 dark:text-zinc-900 dark:ring-zinc-700 ${className}`}
          style={{ fontSize: size * 0.36 }}
        >
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 block rounded-full border-2 border-white dark:border-zinc-800 ${
            online ? 'bg-emerald-500' : 'bg-zinc-400 dark:bg-zinc-500'
          }`}
          style={{ width: Math.max(8, size * 0.28), height: Math.max(8, size * 0.28) }}
          aria-label={online ? 'En ligne' : 'Hors ligne'}
        />
      )}
    </div>
  );
}

/* ------------------------------ Empty state ------------------------------ */

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        <Icon className="h-5 w-5 text-zinc-400 dark:text-zinc-500" aria-hidden />
      </div>
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
    </div>
  );
}

/* ------------------------------- Skeleton -------------------------------- */

export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="h-7 w-1/4 rounded-md bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="h-14 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      ))}
    </div>
  );
}

/* ------------------------------ Stat card -------------------------------- */

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'zinc',
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  tone?: BadgeTone;
}) {
  const iconTones: Record<BadgeTone, string> = {
    zinc: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
    teal: 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    sky: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {value}
          </p>
        </div>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconTones[tone]}`}>
          <Icon className="h-4 w-4" aria-hidden />
        </div>
      </div>
    </div>
  );
}