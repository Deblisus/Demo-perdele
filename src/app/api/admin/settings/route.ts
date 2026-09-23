import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin/auth";
import { saveSettings, settingsSchema } from "@/lib/admin/settings";

/** Numbers arrive from text inputs, so accept the string form and coerce. */
const numeric = z
  .union([z.number(), z.string()])
  .transform((value) =>
    typeof value === "number" ? value : Number(String(value).replace(",", "."))
  )
  .refine((value) => Number.isFinite(value), { message: "Must be a number" });

const bodySchema = z.discriminatedUnion("group", [
  z.object({ group: z.literal("store"), value: settingsSchema.shape.store }),
  z.object({
    group: z.literal("shipping"),
    value: z.object({
      freeShippingThreshold: numeric.pipe(z.number().min(0).max(1_000_000)),
      shippingFee: numeric.pipe(z.number().min(0).max(10_000)),
      defaultPackageWeightKg: numeric.pipe(z.number().min(0.1).max(100)),
    }),
  }),
]);

/** Save one group of settings. */
export async function PUT(request: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Malformed request body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    // Issues are nested under `value`, so a plain flatten() pins every message
    // to the literal key "value" and the form has nothing to attach it to.
    // Drop the wrapper segment and key by the field the operator actually typed in.
    const fields: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path[0] === "value" ? issue.path.slice(1) : issue.path;
      const key = String(path[0] ?? "value");
      (fields[key] ??= []).push(issue.message);
    }
    return Response.json(
      { error: "Some fields need fixing.", fields },
      { status: 400 }
    );
  }

  try {
    await saveSettings(parsed.data.group, parsed.data.value);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("[Admin/settings]", error);
    return Response.json({ error: "Could not save settings." }, { status: 500 });
  }
}

/** Current settings, for a client form that wants to re-read after a save. */
export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const rows = await db.setting.findMany();
  return Response.json(
    { settings: rows },
    { headers: { "cache-control": "no-store" } }
  );
}
