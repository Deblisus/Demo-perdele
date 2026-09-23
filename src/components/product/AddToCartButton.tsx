"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function AddToCartButton({
  onClick,
  disabled,
  loading,
  className,
}: AddToCartButtonProps) {
  return (
    <Button
      className={cn("h-13 w-full rounded-sm text-[0.95rem]", className)}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {loading ? "Se adaugă…" : "Adaugă în coș"}
    </Button>
  );
}
