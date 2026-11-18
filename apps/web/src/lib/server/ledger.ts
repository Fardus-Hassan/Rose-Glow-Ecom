type LedgerItem = {
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

type LedgerOrder = {
  orderNumber: string;
  customerName: string;
  mobile: string;
  address: string;
  city: string;
  district: string;
  note?: string;
  deliveryCharge: number;
  discount: number;
  items: LedgerItem[];
};

export async function pushLedgerOrder(order: LedgerOrder) {
  const base = process.env.LEDGER_URL?.replace(/\/$/, "");
  const key = process.env.LEDGER_SHOP_KEY;
  if (!base || !key) return;
  try {
    const response = await fetch(`${base}/api/shop/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shop-Key": key,
      },
      body: JSON.stringify(order),
    });
    if (!response.ok) {
      const text = await response.text();
      console.error("Ledger did not take the order", response.status, text);
    }
  } catch (error) {
    console.error("Ledger did not take the order", error);
  }
}
