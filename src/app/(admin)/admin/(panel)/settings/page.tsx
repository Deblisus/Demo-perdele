import { clientShippingEnv, getSettings } from "@/lib/admin/settings";
import { PageHead, Section } from "@/components/admin/primitives";
import {
  ShippingForm,
  StoreInfoForm,
} from "@/components/admin/settings/SettingsForms";
import {
  IntegrationStatus,
  type IntegrationCard,
} from "@/components/admin/settings/IntegrationStatus";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  const clientEnv = clientShippingEnv();

  const netopiaLive = process.env.NETOPIA_IS_LIVE === "true";
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  const cards: IntegrationCard[] = [
    {
      id: "fanCourier",
      name: "Fan Courier",
      purpose: "Books AWBs, prints labels and reports tracking events.",
      configured: Boolean(
        process.env.FAN_COURIER_CLIENT_ID && process.env.FAN_COURIER_USERNAME
      ),
      configuredDetail: process.env.FAN_COURIER_CLIENT_ID
        ? `Client ${process.env.FAN_COURIER_CLIENT_ID} configured. Run the check to confirm the credentials still authenticate.`
        : "FAN_COURIER_CLIENT_ID is not set — shipping actions will fail.",
    },
    {
      id: "netopia",
      name: "Netopia",
      purpose: "Takes card payments and confirms them over IPN.",
      configured: Boolean(
        process.env.NETOPIA_API_KEY && process.env.NETOPIA_POS_SIGNATURE
      ),
      configuredDetail: process.env.NETOPIA_API_KEY
        ? netopiaLive
          ? "Live mode — real cards will be charged."
          : "Sandbox mode — no real money moves."
        : "NETOPIA_API_KEY is not set — checkout cannot take payment.",
    },
    {
      id: "resend",
      name: "Resend",
      purpose: "Sends order confirmations and shipping notifications.",
      configured: Boolean(process.env.RESEND_API_KEY),
      configuredDetail: !process.env.RESEND_API_KEY
        ? "RESEND_API_KEY is not set — no email leaves the app."
        : fromEmail
          ? `Sending as ${fromEmail}. Run the check to confirm the domain is verified.`
          : "No RESEND_FROM_EMAIL — falls back to Resend's sandbox sender, which only reaches the account owner.",
    },
  ];

  return (
    <div className="mx-auto max-w-[64rem]">
      <PageHead
        eyebrow="System"
        title="Settings"
        lede="Store details and shipping thresholds are saved to the database. Integration credentials live in the environment."
      />

      <div className="flex flex-col gap-10">
        <Section
          label="Store info"
          description="Used on AWBs and in customer-facing email."
        >
          <div className="rounded-md border border-[var(--rule)] px-4 py-4">
            <StoreInfoForm initial={settings.store} />
          </div>
        </Section>

        <Section
          label="Shipping"
          description="What the server charges, and the parcel weight sent to the courier."
        >
          <div className="rounded-md border border-[var(--rule)] px-4 py-4">
            <ShippingForm
              initial={{
                freeShippingThreshold: String(
                  settings.shipping.freeShippingThreshold
                ),
                shippingFee: String(settings.shipping.shippingFee),
                defaultPackageWeightKg: String(
                  settings.shipping.defaultPackageWeightKg
                ),
              }}
              clientEnv={clientEnv}
            />
          </div>
        </Section>

        <Section
          label="Integrations"
          description="Configuration is read at startup; connection is verified on demand."
        >
          <IntegrationStatus cards={cards} />
        </Section>
      </div>
    </div>
  );
}
