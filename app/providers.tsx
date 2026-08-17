"use client";

import { useEffect, useState } from "react";
import { CartProvider } from "@/components/cart-context";
import type { ArtType } from "@/lib/data";

const categoryArtMap: { [key: string]: ArtType } = {
  'Coffee': 'espresso',
  'Cappuccino': 'cappuccino',
  'Latte': 'latte',
  'Iced Coffee': 'iced',
  'Shakes': 'shake',
  'Desserts': 'dessert',
  'Snacks': 'snack',
};

type CartProduct = {
  id: string;
  name: string;
  price: number;
  art: ArtType;
  image?: string;
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<CartProduct[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          const productsList = data.products.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: parseFloat(p.price),
            art: (categoryArtMap[p.category] || 'espresso') as ArtType,
            image: p.image,
          }));
          setProducts(productsList);
        }
      } catch (error) {
        console.error('Failed to fetch products for cart:', error);
      }
    }

    fetchProducts();
  }, []);

  return <CartProvider products={products}>{children}</CartProvider>;
}
