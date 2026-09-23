/**
 * The shape the orders table renders.
 *
 * Dates arrive pre-formatted from the server rather than as `Date` objects:
 * every stamp in this panel is meant to be Bucharest time, and formatting in
 * the browser would quietly re-render them in whatever zone the operator's
 * laptop is set to.
 */
export type OrderItemView = {
  id: string;
  productName: string;
  productSku: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  widthMeters: number | null;
  heightCm: number | null;
  tailoringType: string | null;
  tailoringCost: number | null;
};

export type TimelineEntry = {
  id: string;
  status: string;
  note: string | null;
  at: string;
};

export type AddressView = {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  county: string;
  zipCode: string | null;
};

export type OrderRowView = {
  id: string;
  orderNumber: string;
  placedAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  customerName: string;
  email: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentStatus: string;
  paymentMethod: string;
  status: string;
  awbNumber: string | null;
  awbCost: number | null;
  netopiaNtpId: string | null;
  items: OrderItemView[];
  timeline: TimelineEntry[];
  billing: AddressView;
  shipping: AddressView;
};
