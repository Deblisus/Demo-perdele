import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

const resend = new Resend(RESEND_API_KEY || "dummy");

// onboarding@resend.dev is Resend's shared sandbox sender: it only delivers to
// the Resend account owner's own address. Set RESEND_FROM_EMAIL to an address
// on a domain verified in Resend before real customers are meant to receive
// anything.
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Perdele Shop <onboarding@resend.dev>";

/**
 * Guard every send: without a key the Resend client is constructed with a
 * placeholder and every call throws an auth error that the local catch would
 * swallow, leaving no trace of *why* nothing arrived.
 */
function isConfigured(context: string): boolean {
  if (!RESEND_API_KEY) {
    console.error(
      `[Email] RESEND_API_KEY is not set — skipping ${context}. No mail will be delivered.`
    );
    return false;
  }
  return true;
}

interface OrderConfirmationParams {
  to: string;
  orderNumber: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    totalPrice: number;
  }>;
}

/**
 * Send an order confirmation email after successful payment.
 */
export async function sendOrderConfirmation(
  params: OrderConfirmationParams
): Promise<void> {
  const { to, orderNumber, total, items } = params;

  if (!isConfigured(`order confirmation for ${orderNumber}`)) return;

  const itemRows = items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.totalPrice.toFixed(2)} LEI</td>
        </tr>`
    )
    .join("");

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Confirmare comandă ${orderNumber}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a; font-size: 24px;">Mulțumim pentru comandă! 🎉</h1>
          <p>Comanda ta <strong>${orderNumber}</strong> a fost plasată cu succes.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 8px; text-align: left;">Produs</th>
                <th style="padding: 8px; text-align: center;">Cantitate</th>
                <th style="padding: 8px; text-align: right;">Preț</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px 8px; font-weight: bold;">Total</td>
                <td style="padding: 12px 8px; text-align: right; font-weight: bold; font-size: 18px;">${total.toFixed(2)} LEI</td>
              </tr>
            </tfoot>
          </table>
          
          <p style="color: #666;">Vei primi un email cu detaliile de livrare și numărul AWB imediat ce comanda va fi procesată.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">Perdele Shop</p>
        </div>
      `,
    });
  } catch (error) {
    console.error(
      `[Email] Failed to send order confirmation for ${orderNumber}:`,
      error
    );
  }
}

interface ShippingNotificationParams {
  to: string;
  orderNumber: string;
  awbNumber: string;
  trackingUrl: string;
}

/**
 * Send a shipping notification email with AWB tracking link.
 */
export async function sendShippingNotification(
  params: ShippingNotificationParams
): Promise<void> {
  const { to, orderNumber, awbNumber, trackingUrl } = params;

  if (!isConfigured(`shipping notification for ${orderNumber}`)) return;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Comanda ${orderNumber} a fost expediată`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a; font-size: 24px;">Comanda ta este pe drum! 📦</h1>
          <p>Comanda <strong>${orderNumber}</strong> a fost predată curierului Fan Courier.</p>
          
          <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 8px;">
              <strong>Număr AWB:</strong> ${awbNumber}
            </p>
            <a href="${trackingUrl}" 
               style="display: inline-block; background: #000; color: #fff; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">
              Urmărește comanda
            </a>
          </div>
          
          <p style="color: #666;">Estimare livrare: 1–3 zile lucrătoare.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">Perdele Shop</p>
        </div>
      `,
    });
    console.log(
      `[Email] Shipping notification with AWB ${awbNumber} sent to ${to} for ${orderNumber}`
    );
  } catch (error) {
    console.error(
      `[Email] Failed to send shipping notification for ${orderNumber}:`,
      error
    );
  }
}
