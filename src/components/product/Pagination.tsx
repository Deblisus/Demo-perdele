import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Current query params, minus `page`; each link re-applies them. */
  params: Record<string, string | undefined>;
}

export function Pagination({ page, totalPages, params }: PaginationProps) {
  if (totalPages <= 1) return null;

  const hrefFor = (target: number) => {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) qs.set(key, value);
    }
    if (target > 1) qs.set('page', String(target));
    const s = qs.toString();
    return s ? `?${s}` : '?';
  };

  const linkBase =
    'inline-flex h-10 min-w-10 items-center justify-center px-2 text-sm whitespace-nowrap underline-offset-4 hover:underline';

  return (
    <nav
      aria-label="Paginare"
      className="mt-16 flex items-center justify-between border-t border-border pt-5"
    >
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={linkBase}>
          ← Înapoi
        </Link>
      ) : (
        <span />
      )}

      <ol className="tnum flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <li key={n}>
            <Link
              href={hrefFor(n)}
              aria-current={n === page ? 'page' : undefined}
              className={cn(
                linkBase,
                n === page && 'font-semibold underline decoration-brand decoration-2'
              )}
            >
              {n}
            </Link>
          </li>
        ))}
      </ol>

      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={linkBase}>
          Înainte →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
