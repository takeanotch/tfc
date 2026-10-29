
//components/GenericTable.tsx
"use client";

import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
  forwardRef,
} from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Download,
  Trash2,
  Archive,
  Search,
} from "lucide-react";
import { FiLoader } from "react-icons/fi";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface Column {
  key: string;
  label: string;
  type?: string;
  renderer?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
  options?: Record<string, unknown>;
  icon?: React.ElementType;
  className?: string;
  truncate?: boolean;
  maxWidth?: number;
  /**
   * Rendu mobile (cartes) :
   * - "primary" : titre de la carte (par défaut : la 1re colonne)
   * - "full"    : occupe toute la largeur de la carte
   * - "hidden"  : masquée sur mobile
   */
  mobile?: "primary" | "full" | "hidden";
}

export interface FilterConfig {
  key?: string;
  type?: string;
  placeholder: string;
  options?: string[];
}

export interface TabConfig {
  value: string;
  label: string;
  icon?: React.ElementType;
}

export interface ActionConfig {
  label?: string;
  icon?: React.ElementType;
  onClick?: (row?: Record<string, unknown>) => void;
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "icon";
  className?: string;
}

interface GenericTableProps {
  data?: Record<string, unknown>[];
  columns?: Column[];
  title?: string;
  subtitle?: string;
  filters?: FilterConfig[];
  filterValues?: Record<string, string>;
  onFilterChange?: (filters: Record<string, string>) => void;
  onRowClick?: (row: Record<string, unknown>) => void;
  showCheckbox?: boolean;
  selectedItems?: (string | number)[];
  onSelectionChange?: (items: (string | number)[]) => void;
  minWidth?: number;
  stickyFirstColumn?: boolean;
  rowClassName?: (row: Record<string, unknown>) => string;
  cellClassName?: (key: string, row: Record<string, unknown>) => string;
  sortable?: boolean;
  pagination?: boolean;
  itemsPerPage?: number;
  loading?: boolean;
  emptyMessage?: string;
  bulkActions?: ActionConfig[];
  rowActions?: ActionConfig[];
  topActions?: ActionConfig[];
  bottomActions?: ActionConfig[];
  topTabs?: TabConfig[];
  bottomTabs?: TabConfig[];
  onTopTabChange?: (value: string) => void;
  onBottomTabChange?: (value: string) => void;
  onBulkDelete?: (ids: (string | number)[]) => void;
  onBulkArchive?: (ids: (string | number)[]) => void;
  onExportCSV?: (rows: Record<string, unknown>[]) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  /**
   * Affichage sur mobile (< 768 px) :
   * - "cards"  (défaut) : une carte par ligne, sans scroll horizontal
   * - "scroll" : tableau classique avec défilement horizontal
   */
  mobileLayout?: "cards" | "scroll";
}

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

const getRowId = (row: Record<string, unknown>, index: number): string | number => {
  if (row.id !== undefined) return row.id as string | number;
  if (row.stockId !== undefined) return row.stockId as string | number;
  return `row-${index}`;
};

const isPositive = (value: unknown) => String(value).includes("+");
const isNegative = (value: unknown) => String(value).includes("-");

/* -------------------------------------------------------------------------- */
/*                              UI primitives                                 */
/* -------------------------------------------------------------------------- */

const Button = forwardRef<
  HTMLButtonElement,
  {
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent) => void;
    disabled?: boolean;
    variant?: "default" | "outline" | "ghost" | "destructive";
    size?: "sm" | "icon";
    className?: string;
    type?: "button" | "submit";
    title?: string;
  }
>(function Button(
  {
    children,
    onClick,
    disabled,
    variant = "outline",
    size = "sm",
    className = "",
    type = "button",
    title,
  },
  ref
) {
  const base =
    "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50";

  const sizes = {
    sm: "h-9 px-3",
    icon: "h-8 w-8",
  };

  const variants = {
    default:
      "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white",
    outline:
      "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700",
    ghost:
      "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
    destructive:
      "border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:bg-zinc-800 dark:text-rose-400 dark:hover:bg-rose-950/30",
  };

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
});

function Checkbox({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
        checked
          ? "border-teal-600 bg-teal-600 text-white dark:border-teal-500 dark:bg-teal-500"
          : "border-zinc-300 bg-white hover:border-teal-500 dark:border-zinc-600 dark:bg-zinc-800"
      }`}
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Cellules                                  */
/* -------------------------------------------------------------------------- */

function AvatarCell({
  value,
  row,
  options = {},
}: {
  value: unknown;
  row: Record<string, unknown>;
  options?: { size?: number; showText?: boolean; className?: string };
}) {
  const [error, setError] = useState(false);
  const size = options.size ?? 32;
  const showText = options.showText !== false;

  let imageSrc: string | null = null;
  const avatarKey = Object.keys(row).find((k) => /avatar|image|photo/i.test(k));
  if (avatarKey && typeof row[avatarKey] === "string") {
    imageSrc = row[avatarKey] as string;
  }

  const text = typeof value === "string" ? value : "";
  const initials = text
    ? text.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="flex items-center gap-2">
      {imageSrc && !error ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt={text || "avatar"}
          width={size}
          height={size}
          onError={() => setError(true)}
          loading="lazy"
          className={`shrink-0 rounded-full object-cover ${options.className ?? ""}`}
        />
      ) : (
        <div
          style={{ width: size, height: size }}
          className="flex shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
        >
          {initials}
        </div>
      )}
      {showText && text && (
        <span className="text-sm text-zinc-800 dark:text-zinc-200">{text}</span>
      )}
    </div>
  );
}

function StatusBadge({
  value,
  options = {},
}: {
  value: unknown;
  options?: { customStatuses?: Record<string, { color: string }> };
}) {
  const config: Record<string, string> = {
    "In Progress": "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20",
    Open: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
    Completed: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
    Approved: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
    Pending: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
    Rejected: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20",
    Cancelled: "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700",
    Received: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20",
    Delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
    "In Transit": "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20",
    Ready: "bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/20",
    Processing: "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/20",
    "Awaiting Parts": "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/20",
    Scheduled: "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/20",
    "Supplier Delay": "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20",
    Partial: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
    Fulfilled: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
    "Pending Approval": "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
    High: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20",
    Medium: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20",
    Low: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20",
    Critical: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20",
  };

  const merged = { ...config };
  if (options.customStatuses) {
    for (const [k, v] of Object.entries(options.customStatuses)) {
      merged[k] = v.color;
    }
  }

  const className =
    merged[String(value)] ??
    "bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      {String(value)}
    </span>
  );
}

function LinkCell({ value }: { value: unknown }) {
  return (
    <span className="cursor-pointer text-sm text-teal-700 underline decoration-teal-700/30 underline-offset-2 transition-colors hover:text-teal-800 hover:decoration-teal-800 dark:text-teal-400 dark:hover:text-teal-300">
      {String(value ?? "")}
    </span>
  );
}

function CurrencyCell({
  value,
  options = {},
}: {
  value: unknown;
  options?: { currency?: string; locale?: string; decimals?: number };
}) {
  const clean = typeof value === "string" ? value.replace(/[^0-9.-]+/g, "") : value;
  const formatted = new Intl.NumberFormat(options.locale ?? "fr-FR", {
    style: "currency",
    currency: options.currency ?? "EUR",
    minimumFractionDigits: options.decimals ?? 0,
    maximumFractionDigits: options.decimals ?? 0,
  }).format(Number(clean) || 0);

  return <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{formatted}</span>;
}

function TrendCell({ value }: { value: unknown }) {
  const pos = isPositive(value);
  const neg = isNegative(value);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        pos
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
          : neg
          ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
      }`}
    >
      {String(value)}
    </span>
  );
}

function ProgressCell({ value }: { value: unknown }) {
  const pct = Math.min(Math.max(Number(value) || 0, 0), 100);
  const barColor =
    pct < 30 ? "bg-rose-500" :
    pct < 50 ? "bg-orange-500" :
    pct < 70 ? "bg-amber-500" :
    pct < 90 ? "bg-sky-500" :
    "bg-emerald-500";

  return (
    <div className="flex min-w-[120px] items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div className={`h-full rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="min-w-[36px] text-right text-xs font-medium tabular-nums text-zinc-600 dark:text-zinc-400">
        {Math.round(pct)}%
      </span>
    </div>
  );
}

function IconCell({
  value,
  options = {},
}: {
  value: unknown;
  options?: { icon?: React.ElementType; color?: string };
}) {
  const Icon = options.icon;
  if (!Icon) return <span>{String(value ?? "")}</span>;
  return (
    <span className="inline-flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
      <Icon size={16} className="text-zinc-500 dark:text-zinc-400" />
      {String(value ?? "")}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Dropdown                                  */
/* -------------------------------------------------------------------------- */

const MENU_WIDTH = 192; // w-48
const MENU_MARGIN = 8;

function RowActionsMenu({
  actions,
  row,
}: {
  actions: ActionConfig[];
  row: Record<string, unknown>;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, openUp: false });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    // Ne ferme que si le clic est en dehors du bouton ET du menu
    // (sinon le menu se démonte au mousedown et le click n'arrive jamais)
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };

    // Ferme au scroll de la page / du tableau pour éviter que le menu ne flotte
    const handleScroll = (e: Event) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };

    const handleResize = () => setOpen(false);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();

      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = actions.length * 36 + 16;
      const shouldOpenUp = spaceBelow < menuHeight;

      // Aligné à droite du bouton, mais borné à l'écran (évite tout débordement)
      const maxLeft = window.innerWidth - MENU_WIDTH - MENU_MARGIN;
      const left = Math.max(MENU_MARGIN, Math.min(rect.right - MENU_WIDTH, maxLeft));

      setCoords({
        top: shouldOpenUp ? rect.top - 4 : rect.bottom + 4,
        left,
        openUp: shouldOpenUp,
      });
    }
    setOpen(!open);
  };

  return (
    <>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        onClick={toggleMenu}
        title="Actions"
      >
        <MoreVertical size={16} />
      </Button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: MENU_WIDTH,
              transform: coords.openUp ? "translateY(-100%)" : "none",
            }}
            className="z-[9999] overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-800"
          >
            {actions.map((action, i) => {
              const Icon = action.icon;
              return (
                <button
                  key={i}
                  type="button"
                  role="menuitem"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    action.onClick?.(row);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-700"
                >
                  {Icon && <Icon size={15} />}
                  {action.label}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Table                                    */
/* -------------------------------------------------------------------------- */

export default function GenericTable({
  data = [],
  columns = [],
  title = "",
  subtitle = "",
  filters = [],
  filterValues = {},
  onFilterChange,
  onRowClick,
  showCheckbox = false,
  selectedItems = [],
  onSelectionChange,
  minWidth = 900,
  stickyFirstColumn = false,
  rowClassName,
  cellClassName,
  sortable = true,
  pagination = true,
  itemsPerPage = 10,
  loading = false,
  emptyMessage = "Aucune donnée",
  bulkActions = [],
  rowActions = [],
  topActions = [],
  bottomActions = [],
  topTabs = [],
  bottomTabs = [],
  onTopTabChange,
  onBottomTabChange,
  onBulkDelete,
  onBulkArchive,
  onExportCSV,
  searchable = true,
  searchPlaceholder = "Rechercher…",
  onSearch,
  mobileLayout = "cards",
}: GenericTableProps) {
  const [selected, setSelected] = useState<(string | number)[]>(selectedItems);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: "asc" | "desc" }>({
    key: null,
    direction: "asc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(itemsPerPage);
  const [localFilters, setLocalFilters] = useState<Record<string, string>>(filterValues);
  const [activeTopTab, setActiveTopTab] = useState(topTabs[0]?.value ?? "");
  const [activeBottomTab, setActiveBottomTab] = useState(bottomTabs[0]?.value ?? "");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedSerialized = JSON.stringify(selectedItems);
  const filterValuesSerialized = JSON.stringify(filterValues);

  const prevSelectedRef = useRef<string>(selectedSerialized);
  const prevFiltersRef = useRef<string>(filterValuesSerialized);

  // Synchronise la sélection depuis le parent
  useEffect(() => {
    if (selectedSerialized !== prevSelectedRef.current) {
      prevSelectedRef.current = selectedSerialized;
      setSelected(JSON.parse(selectedSerialized) as (string | number)[]);
    }
  }, [selectedSerialized]);

  // Synchronise les filtres depuis le parent
  useEffect(() => {
    if (filterValuesSerialized !== prevFiltersRef.current) {
      prevFiltersRef.current = filterValuesSerialized;
      setLocalFilters(JSON.parse(filterValuesSerialized) as Record<string, string>);
    }
  }, [filterValuesSerialized]);

  const filtersSerialized = JSON.stringify(localFilters);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filtersSerialized, pageSize]);

  /* ------------------------------ Dérivés ------------------------------ */

  const filteredData = useMemo(() => {
    let result = [...data];

    if (searchQuery && searchable) {
      const q = searchQuery.toLowerCase();
      result = result.filter((row) =>
        columns.some((col) => String(row[col.key] ?? "").toLowerCase().includes(q))
      );
    }

    Object.entries(localFilters).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "") {
        result = result.filter(
          (row) => String(row[key] ?? "").toLowerCase() === value.toLowerCase()
        );
      }
    });

    return result;
  }, [data, searchQuery, localFilters, columns, searchable]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    const { key, direction } = sortConfig;
    return [...filteredData].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return direction === "asc" ? -1 : 1;
      if (av > bv) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  // « Tout sélectionner » agit sur les lignes filtrées (recherche/filtres), pas sur toutes les données
  const filteredIds = useMemo(
    () => filteredData.map((row) => getRowId(row, data.indexOf(row))),
    [filteredData, data]
  );

  const allSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selected.includes(id));

  // Colonnes pour le rendu en cartes (mobile)
  const { mobilePrimary, mobileRest } = useMemo(() => {
    const visible = columns.filter((c) => c.mobile !== "hidden");
    const primary = visible.find((c) => c.mobile === "primary") ?? visible[0];
    return {
      mobilePrimary: primary,
      mobileRest: visible.filter((c) => c !== primary),
    };
  }, [columns]);

  /* ------------------------------ Handlers ----------------------------- */

  const handleSort = useCallback(
    (key: string) => {
      if (!sortable) return;
      setSortConfig((prev) => ({
        key,
        direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
      }));
    },
    [sortable]
  );

  const toggleAll = useCallback(
    (checked: boolean) => {
      let next: (string | number)[];
      if (checked) {
        const merged = new Set<string | number>([...selected, ...filteredIds]);
        next = Array.from(merged);
      } else {
        const toRemove = new Set(filteredIds);
        next = selected.filter((id) => !toRemove.has(id));
      }
      setSelected(next);
      onSelectionChange?.(next);
    },
    [selected, filteredIds, onSelectionChange]
  );

  const toggleItem = useCallback(
    (id: string | number, checked: boolean) => {
      const next = checked
        ? selected.includes(id)
          ? selected
          : [...selected, id]
        : selected.filter((x) => x !== id);
      setSelected(next);
      onSelectionChange?.(next);
    },
    [selected, onSelectionChange]
  );

  const handleExportCSV = useCallback(() => {
    const selectedRows = data.filter((row, i) =>
      selected.includes(getRowId(row, i))
    );
    if (selectedRows.length === 0) return;

    if (onExportCSV) {
      onExportCSV(selectedRows);
      return;
    }

    const headers = columns.map((c) => `"${c.label}"`).join(",");
    const rows = selectedRows.map((row) =>
      columns
        .map((c) => {
          const v = row[c.key];
          const s = String(v ?? "");
          return s.includes(",") || s.includes('"')
            ? `"${s.replace(/"/g, '""')}"`
            : s;
        })
        .join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `export_${Date.now()}.csv`;
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [data, selected, columns, onExportCSV]);

  const handleBulkDelete = useCallback(() => {
    if (!onBulkDelete) return;
    onBulkDelete(selected);
    setSelected([]);
    onSelectionChange?.([]);
  }, [onBulkDelete, selected, onSelectionChange]);

  const handleBulkArchive = useCallback(() => {
    if (!onBulkArchive) return;
    onBulkArchive(selected);
    setSelected([]);
    onSelectionChange?.([]);
  }, [onBulkArchive, selected, onSelectionChange]);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      setLocalFilters((prev) => {
        if (prev[key] === value) return prev;
        const next = { ...prev, [key]: value };
        onFilterChange?.(next);
        return next;
      });
    },
    [onFilterChange]
  );

  const renderCell = (row: Record<string, unknown>, column: Column): React.ReactNode => {
    const value = row[column.key];

    if (column.renderer) return column.renderer(value, row);

    switch (column.type) {
      case "avatar":
        return <AvatarCell value={value} row={row} options={column.options as any} />;
      case "status":
        return <StatusBadge value={value} options={column.options as any} />;
      case "link":
        return <LinkCell value={value} />;
      case "currency":
        return <CurrencyCell value={value} options={column.options as any} />;
      case "trend":
        return <TrendCell value={value} />;
      case "progress":
        return <ProgressCell value={value} />;
      case "icon":
        return <IconCell value={value} options={column.options as any} />;
      default:
        return <span className="text-sm text-zinc-800 dark:text-zinc-200">{String(value ?? "")}</span>;
    }
  };

  /* -------------------------------- Rendu -------------------------------- */

  const cardsMode = mobileLayout === "cards";

  // En mode cartes, le tableau n'apparaît qu'à partir de md (768 px)
  const tableWrapperClass = cardsMode
    ? "relative hidden w-full max-w-full overflow-x-auto overscroll-x-contain md:block"
    : "relative w-full max-w-full overflow-x-auto overscroll-x-contain";

  return (
    // `relative` : bloc de référence des éléments `absolute` (ex. `sr-only`),
    // coupés par `overflow-hidden` au lieu de s'échapper vers <html>.
    <div className="relative w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
      {/* Header */}
      {(title || subtitle) && (
        <div className="flex flex-col gap-2 border-b border-zinc-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 dark:border-zinc-700">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
            )}
          </div>
          {topActions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {topActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={i}
                    variant={action.variant ?? "outline"}
                    size={action.size ?? "sm"}
                    onClick={() => action.onClick?.()}
                    className={action.className}
                  >
                    {Icon && <Icon size={15} />}
                    {action.label && <span>{action.label}</span>}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tabs top */}
      {topTabs.length > 0 && (
        <div className="border-b border-zinc-200 px-4 py-2 sm:px-5 dark:border-zinc-700">
          <div className="flex items-center gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {topTabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTopTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setActiveTopTab(tab.value);
                    onTopTabChange?.(tab.value);
                  }}
                  className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  }`}
                >
                  {Icon && <Icon size={15} />}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search + filters */}
      {(searchable || filters.length > 0) && (
        <div className="flex flex-col gap-3 border-b border-zinc-200 px-4 py-4 sm:px-5 dark:border-zinc-700">
          {searchable && (
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
                aria-hidden
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  onSearch?.(e.target.value);
                }}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="h-10 w-full min-w-0 rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-white/5"
              />
            </div>
          )}

          {filters.length > 0 && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filters.map((filter, i) => {
                const key = filter.key ?? `filter-${i}`;
                const value = localFilters[key] ?? "";

                if (filter.options) {
                  return (
                    <select
                      key={key}
                      value={value}
                      onChange={(e) => updateFilter(key, e.target.value)}
                      aria-label={filter.placeholder}
                      className="h-10 min-w-0 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition-colors focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-white/5"
                    >
                      <option value="all">{filter.placeholder}</option>
                      {filter.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  );
                }

                return (
                  <input
                    key={key}
                    type={filter.type ?? "text"}
                    placeholder={filter.placeholder}
                    value={value}
                    onChange={(e) => updateFilter(key, e.target.value)}
                    className="h-10 min-w-0 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-900/5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-white/5"
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Bulk actions */}
      {showCheckbox && selected.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 sm:px-5 dark:border-zinc-700 dark:bg-zinc-800/50">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {selected.length} sélectionné{selected.length > 1 ? "s" : ""}
            </span>
            <button
              type="button"
              onClick={() => {
                setSelected([]);
                onSelectionChange?.([]);
              }}
              className="text-xs text-zinc-500 underline underline-offset-2 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Effacer
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download size={14} />
              Export CSV
            </Button>
            {onBulkArchive && (
              <Button variant="outline" size="sm" onClick={handleBulkArchive}>
                <Archive size={14} />
                Archiver
              </Button>
            )}
            {onBulkDelete && (
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                <Trash2 size={14} />
                Supprimer
              </Button>
            )}
            {bulkActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <Button
                  key={i}
                  variant={action.variant ?? "outline"}
                  size="sm"
                  onClick={() => action.onClick?.()}
                  className={action.className}
                >
                  {Icon && <Icon size={14} />}
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================== Mobile : cartes (sans scroll X) ===================== */}
      {cardsMode && (
        <div className="md:hidden">
          {/* Barre : tout sélectionner + tri (les en-têtes n'existent pas en mode cartes) */}
          {((showCheckbox && paginatedData.length > 0) || (sortable && columns.length > 0)) && (
            <div className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-900/40">
              {showCheckbox ? (
                <label className="flex min-w-0 items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  <Checkbox
                    checked={allSelected}
                    onChange={toggleAll}
                    ariaLabel="Tout sélectionner"
                  />
                  <span className="truncate">Tout sélectionner</span>
                </label>
              ) : (
                <span />
              )}

              {sortable && columns.length > 0 && (
                <div className="flex shrink-0 items-center gap-1.5">
                  <select
                    value={sortConfig.key ?? ""}
                    onChange={(e) => {
                      const key = e.target.value;
                      setSortConfig(
                        key
                          ? { key, direction: "asc" }
                          : { key: null, direction: "asc" }
                      );
                    }}
                    aria-label="Trier par"
                    className="h-8 max-w-[140px] rounded-lg border border-zinc-200 bg-white px-2 text-xs outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    <option value="">Trier par…</option>
                    {columns.map((col) => (
                      <option key={col.key} value={col.key}>
                        {col.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={!sortConfig.key}
                    onClick={() =>
                      setSortConfig((prev) => ({
                        ...prev,
                        direction: prev.direction === "asc" ? "desc" : "asc",
                      }))
                    }
                    title={sortConfig.direction === "asc" ? "Ordre croissant" : "Ordre décroissant"}
                  >
                    {sortConfig.direction === "asc" ? (
                      <ArrowUp size={14} />
                    ) : (
                      <ArrowDown size={14} />
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Liste de cartes */}
          {loading && paginatedData.length === 0 ? (
            <div className="flex h-40 items-center justify-center">
              <div className="inline-flex items-center gap-2.5 text-sm text-zinc-500 dark:text-zinc-400">
                <FiLoader className="h-5 w-5 animate-spin text-teal-600 dark:text-teal-400" />
                Chargement…
              </div>
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="flex h-40 items-center justify-center px-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
              {emptyMessage}
            </div>
          ) : (
            <ul role="list" className="space-y-3 p-3">
              {paginatedData.map((row) => {
                const id = getRowId(row, data.indexOf(row));
                const isChecked = selected.includes(id);

                return (
                  <li
                    key={id}
                    onClick={() => onRowClick?.(row)}
                    className={`min-w-0 overflow-hidden rounded-xl border p-4 transition-colors ${
                      isChecked
                        ? "border-teal-300 bg-teal-50/60 dark:border-teal-500/40 dark:bg-teal-500/5"
                        : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800"
                    } ${onRowClick ? "cursor-pointer" : ""} ${rowClassName?.(row) ?? ""}`}
                  >
                    {/* En-tête de la carte : case + colonne principale + actions */}
                    <div className="flex items-start gap-3">
                      {showCheckbox && (
                        <div className="shrink-0 pt-2.5">
                          <Checkbox
                            checked={isChecked}
                            onChange={(c) => toggleItem(id, c)}
                            ariaLabel={`Sélectionner la ligne ${String(id)}`}
                          />
                        </div>
                      )}

                      <div className="min-w-0 flex-1 overflow-hidden">
                        {mobilePrimary ? renderCell(row, mobilePrimary) : null}
                      </div>

                      {rowActions.length > 0 && (
                        <div
                          className="-mr-1 -mt-0.5 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <RowActionsMenu actions={rowActions} row={row} />
                        </div>
                      )}
                    </div>

                    {/* Autres colonnes : grille libellé / valeur */}
                    {mobileRest.length > 0 && (
                      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-zinc-100 pt-3 dark:border-zinc-700/60">
                        {mobileRest.map((col) => {
                          const raw = row[col.key];

                          // Sans renderer, on masque les valeurs vides
                          if (!col.renderer && (raw === null || raw === undefined || raw === "")) {
                            return null;
                          }

                          const node = renderCell(row, col);
                          // Un renderer qui ne renvoie rien (ex. « Privilèges » absent) : on masque la ligne
                          if (node === null || node === undefined || node === false) return null;

                          return (
                            <div
                              key={col.key}
                              className={`min-w-0 ${col.mobile === "full" ? "col-span-2" : ""}`}
                            >
                              <dt className="truncate text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                {col.label}
                              </dt>
                              <dd className="mt-1 min-w-0 break-words text-sm text-zinc-800 dark:text-zinc-200">
                                {node}
                              </dd>
                            </div>
                          );
                        })}
                      </dl>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* ===================== Tableau (desktop, ou mobile en mode "scroll") ===================== */}
      <div className={tableWrapperClass}>
        <table className="w-full border-collapse" style={{ minWidth }}>
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/40">
              {showCheckbox && (
                <th
                  className={`w-11 px-3 py-3 ${
                    stickyFirstColumn
                      ? "sticky left-0 z-10 bg-zinc-50 dark:bg-zinc-900"
                      : ""
                  }`}
                >
                  <Checkbox
                    checked={allSelected}
                    onChange={toggleAll}
                    ariaLabel="Tout sélectionner"
                  />
                </th>
              )}
              {columns.map((col) => {
                const Icon = col.icon;
                const active = sortConfig.key === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    aria-sort={
                      active
                        ? sortConfig.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                    className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ${
                      sortable
                        ? "cursor-pointer select-none hover:text-zinc-900 dark:hover:text-zinc-100"
                        : ""
                    } ${col.className ?? ""}`}
                  >
                    <div className="flex items-center gap-1.5">
                      {Icon && <Icon size={13} className="text-zinc-400" />}
                      <span className="whitespace-nowrap">{col.label}</span>
                      {sortable && (
                        <span className="text-zinc-400">
                          {active ? (
                            sortConfig.direction === "asc" ? (
                              <ArrowUp size={13} />
                            ) : (
                              <ArrowDown size={13} />
                            )
                          ) : (
                            <ArrowUpDown size={13} className="opacity-40" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
              {rowActions.length > 0 && (
                <th className="w-12 px-2 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading && paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (showCheckbox ? 1 : 0) +
                    (rowActions.length > 0 ? 1 : 0)
                  }
                  className="h-40 text-center"
                >
                  <div className="inline-flex items-center gap-2.5 text-sm text-zinc-500 dark:text-zinc-400">
                    <FiLoader className="h-5 w-5 animate-spin text-teal-600 dark:text-teal-400" />
                    Chargement…
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (showCheckbox ? 1 : 0) +
                    (rowActions.length > 0 ? 1 : 0)
                  }
                  className="h-40 text-center text-sm text-zinc-500 dark:text-zinc-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => {
                const id = getRowId(row, data.indexOf(row));
                const isChecked = selected.includes(id);
                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick?.(row)}
                    className={`border-b border-zinc-100 transition-colors last:border-0 dark:border-zinc-700/60 ${
                      onRowClick ? "cursor-pointer" : ""
                    } ${
                      isChecked
                        ? "bg-teal-50/50 dark:bg-teal-500/5"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                    } ${rowClassName?.(row) ?? ""}`}
                  >
                    {showCheckbox && (
                      <td
                        className={`w-11 px-3 py-3 ${
                          stickyFirstColumn
                            ? "sticky left-0 z-10 " +
                              (isChecked
                                ? "bg-teal-50 dark:bg-zinc-800"
                                : "bg-white dark:bg-zinc-800")
                            : ""
                        }`}
                      >
                        <Checkbox
                          checked={isChecked}
                          onChange={(c) => toggleItem(id, c)}
                          ariaLabel={`Sélectionner la ligne ${String(id)}`}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-3 py-3 ${
                          col.truncate || col.maxWidth ? "max-w-[240px] truncate" : ""
                        } ${cellClassName?.(col.key, row) ?? ""}`}
                        style={col.maxWidth ? { maxWidth: col.maxWidth } : undefined}
                        title={
                          typeof row[col.key] === "string"
                            ? (row[col.key] as string)
                            : undefined
                        }
                      >
                        {renderCell(row, col)}
                      </td>
                    ))}
                    {rowActions.length > 0 && (
                      <td className="w-12 px-2 py-3 text-center">
                        <RowActionsMenu actions={rowActions} row={row} />
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-200 px-4 py-3 sm:flex-row sm:px-5 dark:border-zinc-700">
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <span>Lignes par page</span>
            <select
              value={String(pageSize)}
              onChange={(e) => setPageSize(Number(e.target.value))}
              aria-label="Lignes par page"
              className="h-8 rounded-lg border border-zinc-200 bg-white px-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {sortedData.length === 0
                ? "0 résultat"
                : `${(currentPage - 1) * pageSize + 1}–${Math.min(
                    currentPage * pageSize,
                    sortedData.length
                  )} sur ${sortedData.length}`}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              title="Page précédente"
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              title="Page suivante"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Tabs bottom */}
      {bottomTabs.length > 0 && (
        <div className="border-t border-zinc-200 px-4 py-2 sm:px-5 dark:border-zinc-700">
          <div className="flex items-center gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {bottomTabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeBottomTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setActiveBottomTab(tab.value);
                    onBottomTabChange?.(tab.value);
                  }}
                  className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  }`}
                >
                  {Icon && <Icon size={15} />}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom actions */}
      {bottomActions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-200 px-4 py-3 sm:px-5 dark:border-zinc-700">
          {bottomActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <Button
                key={i}
                variant={action.variant ?? "outline"}
                size={action.size ?? "sm"}
                onClick={() => action.onClick?.()}
                className={action.className}
              >
                {Icon && <Icon size={15} />}
                {action.label}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}