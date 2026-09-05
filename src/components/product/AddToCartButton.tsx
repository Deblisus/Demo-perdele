"use client";

import { ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      size="lg"
      className={`w-full text-lg h-14 ${className || ""}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <ShoppingBag className="mr-2 h-5 w-5" />
      )}
      {loading ? "Se adaugă..." : "Adaugă în coș"}
    </Button>
  );
}
