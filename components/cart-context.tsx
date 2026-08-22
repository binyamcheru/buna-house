"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  DEFAULT_SIZE,
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  SIZE_OPTIONS,
  CUSTOMIZATIONS,
} from "@/lib/data";
import type { ArtType } from "@/lib/data";

export type CartItem = {
  key: string;
  id: string;
  name: string;
  size: string;
  price: number;
  qty: number;
  art: ArtType;
  image?: string;
};

export type CartProduct = {
  id: string;
  name: string;
  price: number;
  art: ArtType;
  image?: string;
};

export type AddOptions = {
  size?: string;
  customizations?: string[];
  qty?: number;
};

const STORAGE_KEY = "roast-cart-v1";

/* ----------------------------- State shape ----------------------------- */

type CartActions = {
  addItem: (productId: string, opts?: AddOptions) => void;
  removeItem: (key: string) => void;
  changeQty: (key: string, delta: number) => void;
  clearCart: () => void;
};

type CartValue = CartActions & {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
};

/* --------------------------- Two contexts (perf) -----------------------------
   Splitting "actions" (stable references) from "value" (changes on every
   mutation) means ProductCard — of which there are 40 — only subscribes to
   the stable actions context and never re-renders when the cart changes.
   Only consumers that actually display cart data (Header badge, drawers,
   order bar) subscribe to the value context.                      */

const CartValueContext = createContext<Omit<CartValue, keyof CartActions> | null>(null);
const CartActionsContext = createContext<CartActions | null>(null);

function initCart(): CartItem[] {
  // Load from localStorage; guarded for SSR.
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CartItem[];
  } catch {
    /* corrupted storage — ignore */
  }
  return [];
}

export function CartProvider({
  children,
  products = [],
}: {
  children: ReactNode;
  products?: CartProduct[];
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const hydrated = useRef(false);

  const productsById = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  );

  // Hydrate from localStorage once on mount (after SSR).
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    setItems(initCart());
  }, []);

  // Persist whenever items change (after hydration).
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full/blocked — ignore */
    }
  }, [items]);

  const addItem = useCallback(
    (productId: string, opts?: AddOptions) => {
      const product = productsById.get(productId);
      if (!product) return;

      const size = opts?.size ?? DEFAULT_SIZE;
      const sizeDelta = SIZE_OPTIONS.find((s) => s.id === size)?.delta ?? 0;
      const customizations = opts?.customizations ?? [];
      const customDelta = customizations.reduce((sum, id) => {
        const opt = CUSTOMIZATIONS.find((c) => c.id === id);
        return sum + (opt?.delta ?? 0);
      }, 0);

      const extras = [
        ...(size === DEFAULT_SIZE ? [] : [size]),
        ...customizations,
      ];
      const price = product.price + sizeDelta + customDelta;
      const key = `${productId}::${extras.join("+")}`;
      const qtyToAdd = Math.max(1, opts?.qty ?? 1);

      setItems((prev) => {
        const existing = prev.find((i) => i.key === key);
        if (existing) {
          return prev.map((i) =>
            i.key === key ? { ...i, qty: i.qty + qtyToAdd } : i
          );
        }
        const label = extras.length
          ? `${product.name} · ${extras.join(" · ")}`
          : product.name;
        return [
          ...prev,
          {
            key,
            id: product.id,
            name: label,
            size,
            price,
            qty: qtyToAdd,
            art: product.art,
            image: product.image,
          },
        ];
      });
    },
    [productsById]
  );

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const changeQty = useCallback((key: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.key === key ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const { itemCount, subtotal } = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    return { itemCount: count, subtotal };
  }, [items]);

  const deliveryFee =
    subtotal === 0 ? 0 : subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  const valueContext = useMemo(
    () => ({ items, itemCount, subtotal, deliveryFee, total }),
    [items, itemCount, subtotal, deliveryFee, total]
  );

  const actionsContext = useMemo(
    () => ({ addItem, removeItem, changeQty, clearCart }),
    [addItem, removeItem, changeQty, clearCart]
  );

  return (
    <CartActionsContext.Provider value={actionsContext}>
      <CartValueContext.Provider value={valueContext}>
        {children}
      </CartValueContext.Provider>
    </CartActionsContext.Provider>
  );
}

export function useCartActions() {
  const ctx = useContext(CartActionsContext);
  if (!ctx) throw new Error("useCartActions must be used within CartProvider");
  return ctx;
}

export function useCart() {
  const v = useContext(CartValueContext);
  const a = useContext(CartActionsContext);
  if (!v || !a) throw new Error("useCart must be used within CartProvider");
  return { ...v, ...a };
}