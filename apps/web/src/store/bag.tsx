"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type CartLine = {
  slug: string;
  qty: number;
  optionId?: string;
};

const sameLine = (line: CartLine, slug: string, optionId?: string) =>
  line.slug === slug && (line.optionId || "") === (optionId || "");

type BagState = {
  cart: CartLine[];
  wishlist: string[];
};

type BagContextValue = {
  cart: CartLine[];
  wishlist: string[];
  cartCount: number;
  wishlistCount: number;
  addToCart: (slug: string, qty?: number, optionId?: string) => void;
  setCartQty: (slug: string, qty: number, optionId?: string) => void;
  removeFromCart: (slug: string, optionId?: string) => void;
  clearCart: () => void;
  toggleWishlist: (slug: string) => void;
  isWishlisted: (slug: string) => boolean;
};

const STORAGE_KEY = "rose-glow-bag-v1";
const EMPTY: BagState = { cart: [], wishlist: [] };
const BagContext = createContext<BagContextValue | null>(null);

function readStorage(): BagState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<BagState>;
    return {
      cart: Array.isArray(parsed.cart) ? parsed.cart : [],
      wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
    };
  } catch {
    return EMPTY;
  }
}

function writeStorage(next: BagState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
}

export function BagProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BagState>(EMPTY);

  useEffect(() => {
    setState(readStorage());
  }, []);

  const commit = useCallback((mutator: (prev: BagState) => BagState) => {
    setState((prev) => {
      const next = mutator(prev);
      writeStorage(next);
      return next;
    });
  }, []);

  const addToCart = useCallback(
    (slug: string, qty = 1, optionId?: string) => {
      const amount = Math.max(1, qty);
      commit((prev) => {
        const existing = prev.cart.find((line) => sameLine(line, slug, optionId));
        if (existing) {
          return {
            ...prev,
            cart: prev.cart.map((line) =>
              sameLine(line, slug, optionId) ? { ...line, qty: line.qty + amount } : line,
            ),
          };
        }
        return { ...prev, cart: [...prev.cart, { slug, qty: amount, optionId }] };
      });
    },
    [commit],
  );

  const setCartQty = useCallback(
    (slug: string, qty: number, optionId?: string) => {
      commit((prev) => ({
        ...prev,
        cart:
          qty <= 0
            ? prev.cart.filter((line) => !sameLine(line, slug, optionId))
            : prev.cart.map((line) =>
                sameLine(line, slug, optionId) ? { ...line, qty } : line,
              ),
      }));
    },
    [commit],
  );

  const removeFromCart = useCallback(
    (slug: string, optionId?: string) => {
      commit((prev) => ({
        ...prev,
        cart: prev.cart.filter((line) => !sameLine(line, slug, optionId)),
      }));
    },
    [commit],
  );

  const clearCart = useCallback(() => {
    commit((prev) => ({ ...prev, cart: [] }));
  }, [commit]);

  const toggleWishlist = useCallback(
    (slug: string) => {
      commit((prev) => ({
        ...prev,
        wishlist: prev.wishlist.includes(slug)
          ? prev.wishlist.filter((item) => item !== slug)
          : [...prev.wishlist, slug],
      }));
    },
    [commit],
  );

  const isWishlisted = useCallback(
    (slug: string) => state.wishlist.includes(slug),
    [state.wishlist],
  );

  const value = useMemo<BagContextValue>(
    () => ({
      cart: state.cart,
      wishlist: state.wishlist,
      cartCount: state.cart.reduce((sum, line) => sum + line.qty, 0),
      wishlistCount: state.wishlist.length,
      addToCart,
      setCartQty,
      removeFromCart,
      clearCart,
      toggleWishlist,
      isWishlisted,
    }),
    [
      state.cart,
      state.wishlist,
      addToCart,
      setCartQty,
      removeFromCart,
      clearCart,
      toggleWishlist,
      isWishlisted,
    ],
  );

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
}

export function useBag() {
  const ctx = useContext(BagContext);
  if (!ctx) throw new Error("useBag must be used within BagProvider");
  return ctx;
}
