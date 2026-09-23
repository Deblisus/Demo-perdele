"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductForm } from "./ProductForm";
import type { CategoryOption } from "./types";

export function NewProductButton({
  categories,
}: {
  categories: CategoryOption[];
}) {
  const [open, setOpen] = useState(false);

  if (categories.length === 0) {
    // Every product needs a category, so offering the form here would only
    // lead to a dead end at the category picker.
    return (
      <p className="text-[0.8125rem] text-muted-foreground">
        Create a category first.
      </p>
    );
  }

  return (
    <>
      <Button size="lg" onClick={() => setOpen(true)}>
        <Plus aria-hidden />
        New product
      </Button>
      <ProductForm
        mode="create"
        categories={categories}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
