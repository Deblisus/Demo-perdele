import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const allItems = [{ label: 'Acasă', href: '/' }, ...items];

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-sm text-muted-foreground', className)}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-foreground transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium" aria-current="page">
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight className="w-4 h-4" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
