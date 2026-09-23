"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Ban,
  FileText,
  LoaderCircle,
  MailCheck,
  MoreHorizontal,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { OrderRowView } from "./types";

type Busy = null | "ship" | "cancel" | "email";

const SHIPPED_STATES = new Set(["SHIPPED", "DELIVERED"]);
const CLOSED_STATES = new Set(["CANCELLED", "REFUNDED"]);

export function OrderActions({ order }: { order: OrderRowView }) {
  const router = useRouter();
  const [busy, setBusy] = useState<Busy>(null);
  const [shipOpen, setShipOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [manualAwb, setManualAwb] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const isShipped = SHIPPED_STATES.has(order.status);
  const isClosed = CLOSED_STATES.has(order.status);
  const canShip = !isShipped && !isClosed;

  async function post(
    path: string,
    body: unknown,
    kind: Busy
  ): Promise<Record<string, unknown> | null> {
    setBusy(kind);
    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(
          typeof payload.error === "string" ? payload.error : "Action failed."
        );
        return null;
      }
      return payload;
    } catch {
      toast.error("Could not reach the server.");
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function ship(mode: "courier" | "manual") {
    const result = await post(
      `/api/admin/orders/${order.id}/ship`,
      { mode, awbNumber: mode === "manual" ? manualAwb : undefined },
      "ship"
    );
    if (!result) return;

    setShipOpen(false);
    setManualAwb("");
    toast.success(
      result.awbNumber
        ? `${order.orderNumber} shipped · AWB ${result.awbNumber}`
        : `${order.orderNumber} marked as shipped`
    );
    router.refresh();
  }

  async function cancel() {
    const result = await post(
      `/api/admin/orders/${order.id}/cancel`,
      { reason: cancelReason },
      "cancel"
    );
    if (!result) return;

    setCancelOpen(false);
    setCancelReason("");
    toast.success(`${order.orderNumber} cancelled`);

    // Cancelling in our database does not move money or recall a parcel. Say so
    // rather than letting a green toast imply it did.
    const warnings = Array.isArray(result.warnings) ? result.warnings : [];
    for (const warning of warnings) {
      toast.warning(String(warning), { duration: 10_000 });
    }
    router.refresh();
  }

  async function resendEmail() {
    const result = await post(
      `/api/admin/orders/${order.id}/resend-email`,
      {},
      "email"
    );
    if (!result) return;
    toast.success(`Confirmation re-sent to ${result.to}`);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canShip ? (
        <Button size="sm" onClick={() => setShipOpen(true)} disabled={busy !== null}>
          <Truck aria-hidden />
          Mark as shipped
        </Button>
      ) : null}

      {order.awbNumber ? (
        <a
          href={`/api/admin/orders/${order.id}/awb-label`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-[0.8rem] font-medium transition-colors hover:bg-muted"
        >
          <FileText className="size-3.5" aria-hidden />
          AWB label
        </a>
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`More actions for ${order.orderNumber}`}
          className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-muted"
        >
          {busy === "email" || busy === "cancel" ? (
            <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <MoreHorizontal className="size-3.5" aria-hidden />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="admin-scope w-56">
          <DropdownMenuItem onClick={resendEmail} disabled={busy !== null}>
            <MailCheck aria-hidden />
            Resend confirmation
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={busy !== null || isClosed}
            onClick={() => setCancelOpen(true)}
          >
            <Ban aria-hidden />
            Cancel order
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── Ship ───────────────────────────────────────────────── */}
      <Dialog open={shipOpen} onOpenChange={setShipOpen}>
        <DialogContent className="admin-scope sm:max-w-[30rem]">
          <DialogHeader>
            <DialogTitle>Ship {order.orderNumber}</DialogTitle>
            <DialogDescription>
              Shipping to {order.shipping.name}, {order.shipping.city},{" "}
              {order.shipping.county}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="rounded-md border border-[var(--rule)] p-3">
              <p className="text-[0.8125rem] font-medium">
                Generate a Fan Courier AWB
              </p>
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
                Books the shipment, stores the AWB and emails the tracking link
                to the customer. This creates a real record in the Fan Courier
                account configured in <code className="machine">.env</code>.
              </p>
              <Button
                className="mt-3"
                size="sm"
                onClick={() => ship("courier")}
                disabled={busy !== null || Boolean(order.awbNumber)}
              >
                {busy === "ship" ? (
                  <LoaderCircle className="animate-spin" aria-hidden />
                ) : (
                  <Truck aria-hidden />
                )}
                {order.awbNumber ? "AWB already exists" : "Generate AWB & ship"}
              </Button>
            </div>

            <div className="rounded-md border border-[var(--rule)] p-3">
              <Label htmlFor={`awb-${order.id}`} className="readout">
                Or record an AWB you already have
              </Label>
              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
                Marks the order shipped without calling the courier. Leave empty
                to ship without an AWB at all.
              </p>
              <div className="mt-3 flex gap-2">
                <Input
                  id={`awb-${order.id}`}
                  value={manualAwb}
                  placeholder="AWB number"
                  onChange={(event) => setManualAwb(event.target.value)}
                  className="machine h-7 text-[0.8125rem]"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => ship("manual")}
                  disabled={busy !== null}
                >
                  Mark shipped
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose
              render={<Button variant="ghost" size="sm" disabled={busy !== null} />}
            >
              Close
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Cancel ─────────────────────────────────────────────── */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="admin-scope sm:max-w-[30rem]">
          <DialogHeader>
            <DialogTitle>Cancel {order.orderNumber}?</DialogTitle>
            <DialogDescription>
              This changes the order&apos;s status and writes a line to its
              timeline. It does not refund the payment or recall an AWB — those
              stay manual.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`reason-${order.id}`} className="readout">
              Reason (optional)
            </Label>
            <Input
              id={`reason-${order.id}`}
              value={cancelReason}
              placeholder="Out of stock, customer request…"
              onChange={(event) => setCancelReason(event.target.value)}
              className="h-8 text-[0.8125rem]"
            />
          </div>

          <DialogFooter>
            <DialogClose
              render={<Button variant="ghost" size="sm" disabled={busy !== null} />}
            >
              Keep order
            </DialogClose>
            <Button
              variant="destructive"
              size="sm"
              onClick={cancel}
              disabled={busy !== null}
            >
              {busy === "cancel" ? (
                <LoaderCircle className="animate-spin" aria-hidden />
              ) : (
                <Ban aria-hidden />
              )}
              Cancel order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
