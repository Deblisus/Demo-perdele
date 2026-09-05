"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore, getItemCount } from "@/stores/cart.store";

export function CartIcon() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const itemCount = getItemCount(items);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link 
      href="/checkout" 
      className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Coș de cumpărături"
    >
      <ShoppingBag className="h-6 w-6" />
      {mounted && itemCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
