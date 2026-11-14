export type MetaContentItem = {
  id: string;
  quantity: number;
  item_price?: number;
};

type TrackOptions = {
  eventId?: string;
};

declare global {
  interface Window {
    fbq?: (
      command: string,
      eventOrId?: string,
      params?: Record<string, unknown>,
      options?: { eventID?: string },
    ) => void;
    _fbq?: unknown;
    __rgMetaPixelId?: string;
  }
}

function fbqReady() {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

export function trackMeta(
  event: string,
  params?: Record<string, unknown>,
  options?: TrackOptions,
) {
  if (!fbqReady()) return;
  if (options?.eventId) {
    window.fbq!("track", event, params || {}, { eventID: options.eventId });
  } else {
    window.fbq!("track", event, params || {});
  }
}

export function trackPageView() {
  trackMeta("PageView");
}

export function trackViewContent(input: {
  contentId: string;
  contentName: string;
  value: number;
  currency?: string;
}) {
  trackMeta("ViewContent", {
    content_ids: [input.contentId],
    content_name: input.contentName,
    content_type: "product",
    value: input.value,
    currency: input.currency || "BDT",
  });
}

export function trackAddToCart(input: {
  contentId: string;
  contentName: string;
  value: number;
  quantity?: number;
  currency?: string;
}) {
  trackMeta("AddToCart", {
    content_ids: [input.contentId],
    content_name: input.contentName,
    content_type: "product",
    value: input.value,
    currency: input.currency || "BDT",
    contents: [
      {
        id: input.contentId,
        quantity: input.quantity ?? 1,
        item_price: input.value,
      },
    ],
  });
}

export function trackInitiateCheckout(input: {
  value: number;
  numItems: number;
  contents: MetaContentItem[];
  currency?: string;
}) {
  trackMeta("InitiateCheckout", {
    content_type: "product",
    value: input.value,
    currency: input.currency || "BDT",
    num_items: input.numItems,
    contents: input.contents,
    content_ids: input.contents.map((c) => c.id),
  });
}

export function trackPurchase(input: {
  value: number;
  contents: MetaContentItem[];
  orderId: string;
  eventId: string;
  currency?: string;
}) {
  trackMeta(
    "Purchase",
    {
      content_type: "product",
      value: input.value,
      currency: input.currency || "BDT",
      contents: input.contents,
      content_ids: input.contents.map((c) => c.id),
      num_items: input.contents.reduce((s, c) => s + c.quantity, 0),
      order_id: input.orderId,
    },
    { eventId: input.eventId },
  );
}
