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
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    ttq?: {
      page: () => void;
      track: (event: string, params?: Record<string, unknown>) => void;
    };
    __rgGoogleAds?: {
      conversionId: string;
      conversionLabel: string;
    };
  }
}

function fbqReady() {
  return typeof window !== "undefined" && typeof window.fbq === "function";
}

function pushDataLayer(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

function trackGtagEvent(
  event: string,
  params?: Record<string, unknown>,
) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", event, params || {});
}

function trackTikTok(
  event: string,
  params?: Record<string, unknown>,
) {
  if (typeof window === "undefined" || !window.ttq?.track) return;
  window.ttq.track(event, params || {});
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
  pushDataLayer({ event: "page_view" });
  trackTikTok("Pageview");
}

export function trackViewContent(input: {
  contentId: string;
  contentName: string;
  value: number;
  currency?: string;
}) {
  const currency = input.currency || "BDT";
  const params = {
    content_ids: [input.contentId],
    content_name: input.contentName,
    content_type: "product",
    value: input.value,
    currency,
  };
  trackMeta("ViewContent", params);
  pushDataLayer({
    event: "view_item",
    ecommerce: {
      currency,
      value: input.value,
      items: [
        {
          item_id: input.contentId,
          item_name: input.contentName,
          price: input.value,
          quantity: 1,
        },
      ],
    },
  });
  trackGtagEvent("view_item", {
    currency,
    value: input.value,
    items: [
      {
        item_id: input.contentId,
        item_name: input.contentName,
        price: input.value,
        quantity: 1,
      },
    ],
  });
  trackTikTok("ViewContent", {
    contents: [{ content_id: input.contentId, content_name: input.contentName }],
    value: input.value,
    currency,
  });
}

export function trackAddToCart(input: {
  contentId: string;
  contentName: string;
  value: number;
  quantity?: number;
  currency?: string;
}) {
  const currency = input.currency || "BDT";
  const quantity = input.quantity ?? 1;
  const params = {
    content_ids: [input.contentId],
    content_name: input.contentName,
    content_type: "product",
    value: input.value,
    currency,
    contents: [
      {
        id: input.contentId,
        quantity,
        item_price: input.value,
      },
    ],
  };
  trackMeta("AddToCart", params);
  pushDataLayer({
    event: "add_to_cart",
    ecommerce: {
      currency,
      value: input.value,
      items: [
        {
          item_id: input.contentId,
          item_name: input.contentName,
          price: input.value / quantity,
          quantity,
        },
      ],
    },
  });
  trackGtagEvent("add_to_cart", {
    currency,
    value: input.value,
    items: [
      {
        item_id: input.contentId,
        item_name: input.contentName,
        price: input.value / quantity,
        quantity,
      },
    ],
  });
  trackTikTok("AddToCart", {
    contents: [
      {
        content_id: input.contentId,
        content_name: input.contentName,
        quantity,
      },
    ],
    value: input.value,
    currency,
  });
}

export function trackInitiateCheckout(input: {
  value: number;
  numItems: number;
  contents: MetaContentItem[];
  currency?: string;
}) {
  const currency = input.currency || "BDT";
  const params = {
    content_type: "product",
    value: input.value,
    currency,
    num_items: input.numItems,
    contents: input.contents,
    content_ids: input.contents.map((c) => c.id),
  };
  trackMeta("InitiateCheckout", params);
  pushDataLayer({
    event: "begin_checkout",
    ecommerce: {
      currency,
      value: input.value,
      items: input.contents.map((c) => ({
        item_id: c.id,
        quantity: c.quantity,
        price: c.item_price,
      })),
    },
  });
  trackGtagEvent("begin_checkout", {
    currency,
    value: input.value,
    items: input.contents.map((c) => ({
      item_id: c.id,
      quantity: c.quantity,
      price: c.item_price,
    })),
  });
  trackTikTok("InitiateCheckout", {
    contents: input.contents.map((c) => ({
      content_id: c.id,
      quantity: c.quantity,
    })),
    value: input.value,
    currency,
  });
}

export function trackPurchase(input: {
  value: number;
  contents: MetaContentItem[];
  orderId: string;
  eventId: string;
  currency?: string;
}) {
  const currency = input.currency || "BDT";
  const numItems = input.contents.reduce((s, c) => s + c.quantity, 0);
  const params = {
    content_type: "product",
    value: input.value,
    currency,
    contents: input.contents,
    content_ids: input.contents.map((c) => c.id),
    num_items: numItems,
    order_id: input.orderId,
  };
  trackMeta("Purchase", params, { eventId: input.eventId });
  pushDataLayer({
    event: "purchase",
    ecommerce: {
      transaction_id: input.orderId,
      currency,
      value: input.value,
      items: input.contents.map((c) => ({
        item_id: c.id,
        quantity: c.quantity,
        price: c.item_price,
      })),
    },
  });
  trackGtagEvent("purchase", {
    transaction_id: input.orderId,
    currency,
    value: input.value,
    items: input.contents.map((c) => ({
      item_id: c.id,
      quantity: c.quantity,
      price: c.item_price,
    })),
  });
  trackTikTok("CompletePayment", {
    contents: input.contents.map((c) => ({
      content_id: c.id,
      quantity: c.quantity,
    })),
    value: input.value,
    currency,
  });

  const ads = window.__rgGoogleAds;
  if (
    ads?.conversionId &&
    ads.conversionLabel &&
    typeof window.gtag === "function"
  ) {
    window.gtag("event", "conversion", {
      send_to: `${ads.conversionId}/${ads.conversionLabel}`,
      value: input.value,
      currency,
      transaction_id: input.orderId,
    });
  }
}
