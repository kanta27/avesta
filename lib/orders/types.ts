// Pure, client-safe order types & helpers — NO server-only imports, so both the
// server data layer (`lib/orders/admin.ts`) and client islands (OrderFulfilment)
// can import these. Keeping the enum here is what stops the client component from
// reaching into the service-role data layer.

/** The canonical order-status enum (A2 migration). Order matters for the UI. */
export const ORDER_STATUSES = [
  "created",
  "paid",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function isOrderStatus(v: string): v is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(v);
}

/** One line item as stored in `orders.items` (jsonb). */
export interface OrderItem {
  product_id?: string;
  name?: string;
  pack_key?: string;
  qty?: number;
  unit_price_paise?: number;
}

/** Shipping address as stored in `orders.shipping_address` (jsonb). */
export interface ShippingAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

/** A row shaped for the orders list table. */
export interface OrderListItem {
  id: string;
  orderNumber: string;
  customerName: string | null;
  customerPhone: string;
  status: OrderStatus;
  totalPaise: number;
  itemCount: number;
  createdAt: string | null;
}

/** A full order for the detail page. */
export interface OrderDetail {
  id: string;
  orderNumber: string;
  customerName: string | null;
  customerPhone: string;
  email: string | null;
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotalPaise: number;
  discountCode: string | null;
  discountPaise: number;
  shippingPaise: number;
  totalPaise: number;
  trackingUrl: string | null;
  courier: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ListOrdersFilter {
  status?: OrderStatus;
  /** Free-text — matches order_number or customer_phone. */
  search?: string;
}
