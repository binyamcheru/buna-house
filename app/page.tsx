"use client";

import { useEffect, useRef, useState } from "react";
import type { Product, Category } from "@/lib/data";
import { LocationGate, readSavedLocation } from "@/components/location-gate";
import type { SavedLocation } from "@/components/location-gate";
import { PromoBar } from "@/components/promo-bar";
import { Header } from "@/components/header";
import { HeroSlider } from "@/components/hero-slider";
import { CategoryNav } from "@/components/category-nav";
import { SearchBar } from "@/components/search-bar";
import { ProductCard } from "@/components/product-card";
import { ProductSheet } from "@/components/product-sheet";
import { CartDrawer } from "@/components/cart-drawer";
import { MobileOrderBar } from "@/components/mobile-order-bar";
import { InfoDrawer } from "@/components/info-drawer";
import { Overlay } from "@/components/overlay";
import { Footer } from "@/components/footer";
import { SkeletonLoader } from "@/components/skeleton-loader";
import { useScrollSpy } from "@/components/use-scroll-spy";

// Map category names to art types for visual styling
const categoryArtMap: { [key: string]: any } = {
  'coffee': 'espresso',
  'americano': 'espresso',
  'cappuccino': 'cappuccino',
  'latte': 'latte',
  'iced coffee': 'iced',
  'iced': 'iced',
  'mocktails': 'mocktail',
  'mocktail': 'mocktail',
  'tea': 'tea',
  'shakes': 'shake',
  'shake': 'shake',
  'desserts': 'dessert',
  'dessert': 'dessert',
  'snacks': 'snack',
  'snack': 'snack',
  'combos': 'combo',
  'combo': 'combo',
};

function getArtForCategory(categoryName: string): any {
  const norm = (categoryName || '').toLowerCase().trim();
  if (categoryArtMap[norm]) return categoryArtMap[norm];
  const singular = norm.replace(/s$/, '');
  if (categoryArtMap[singular]) return categoryArtMap[singular];
  return 'espresso';
}

function Shop({ categories, loading }: { categories: Category[]; loading: boolean }) {
  const [active, setActive] = useScrollSpy(categories);
  const [selected, setSelected] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [displayedCategories, setDisplayedCategories] = useState(categories.slice(0, 3));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Location gate: hydrate from localStorage on mount (client-only) so the
  // first server render is identical to the first client render.
  const [savedLocation, setSavedLocation] = useState<SavedLocation | null>(
    null
  );
  const [locationOpen, setLocationOpen] = useState(false);

  useEffect(() => {
    setSavedLocation(readSavedLocation());
  }, []);

  // Sync displayedCategories with categories - show all categories
  useEffect(() => {
    if (categories.length > 0) {
      // Show all categories (lazy loading happens at image level, not category level)
      setDisplayedCategories(categories);
    }
  }, [categories]);

  // Infinite scroll - load more categories as user scrolls
  useEffect(() => {
    if (loading || displayedCategories.length >= categories.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          setIsLoadingMore(true);
          // Simulate network delay, then load next batch
          setTimeout(() => {
            const newCount = Math.min(
              displayedCategories.length + 2,
              categories.length
            );
            setDisplayedCategories(categories.slice(0, newCount));
            setIsLoadingMore(false);
          }, 300);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [categories]);

  const anyOpen = cartOpen || infoOpen || selected !== null || locationOpen;

  // Close drawers/sheet with Escape (accessibility) and lock body scroll
  // while any overlay surface is open. The location gate is NOT dismissible
  // with Escape — the user must pick a location first.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !locationOpen) {
        setCartOpen(false);
        setInfoOpen(false);
        setSelected(null);
      }
    }
    if (!anyOpen) return;
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [anyOpen, locationOpen]);

  return (
    <>
      <PromoBar />
      <Header
        savedLocation={savedLocation}
        onOpenCart={() => setCartOpen(true)}
        onOpenInfo={() => setInfoOpen(true)}
        onOpenLocation={() => setLocationOpen(true)}
      />

      <main className="page-main">
        <HeroSlider />
        <div className="sticky-bar">
          <SearchBar
            products={categories.flatMap(c => c.products)}
            onSelect={setSelected}
          />
          <CategoryNav
            active={active}
            categories={categories}
            onSelect={(id) => {
              setActive(id);
              document
                .getElementById(id)
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </div>

        {loading ? (
          <div style={{
            padding: '80px 20px',
            textAlign: 'center',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid rgba(192, 133, 82, 0.2)',
              borderTopColor: '#c08552',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto'
            }} />
            <p style={{ marginTop: '20px', color: '#6b5548', fontSize: '16px' }}>Loading our menu...</p>
          </div>
        ) : displayedCategories.length === 0 ? (
          <div style={{
            padding: '80px 20px',
            textAlign: 'center',
            minHeight: '400px'
          }}>
            <p style={{ color: '#6b5548', fontSize: '18px' }}>No products available at the moment.</p>
          </div>
        ) : (
          <div id="menu-section">
            {displayedCategories.map((category) => (
              <section
                key={category.id}
                id={category.id}
                className="c-section"
                aria-label={category.name}
              >
              <div className="c-section-head">
                <span className="c-section-num">{category.num} — Our {category.name}</span>
                <h2 className="c-section-title">{category.name}</h2>
                <p className="c-section-desc">{category.tagline}</p>
              </div>
              <div className="c-grid">
                {category.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpen={setSelected}
                  />
                ))}
              </div>
            </section>
            ))}
            {isLoadingMore && <SkeletonLoader count={12} />}
            {displayedCategories.length < categories.length && (
              <div ref={loadMoreRef} style={{ height: '100px' }} />
            )}
          </div>
        )}
      </main>

      <Footer />

      <LocationGate
        open={!savedLocation || locationOpen}
        onConfirm={(saved) => {
          setSavedLocation(saved);
          setLocationOpen(false);
        }}
      />

      <ProductSheet product={selected} onClose={() => setSelected(null)} />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
      />
      <InfoDrawer open={infoOpen} onClose={() => setInfoOpen(false)} />
      <Overlay
        show={anyOpen}
        onClose={() => {
          setCartOpen(false);
          setInfoOpen(false);
          setSelected(null);
        }}
      />
      <MobileOrderBar onViewCart={() => setCartOpen(true)} />
    </>
  );
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from API with Stale-While-Revalidate
  useEffect(() => {
    fetchProducts();

    // Re-fetch products when cache is cleared (e.g., product or category updated in Admin)
    const handleCacheCleared = () => {
      fetchProducts(true);
    };

    window.addEventListener('roast_products_cache_cleared', handleCacheCleared);
    window.addEventListener('roast_cache_cleared', handleCacheCleared);
    window.addEventListener('storage', handleCacheCleared);

    return () => {
      window.removeEventListener('roast_products_cache_cleared', handleCacheCleared);
      window.removeEventListener('roast_cache_cleared', handleCacheCleared);
      window.removeEventListener('storage', handleCacheCleared);
    };
  }, []);

  const fetchProducts = async (forceFresh = false) => {
    try {
      // 1. If cached products exist, load them immediately for instant UI render (Stale)
      if (!forceFresh && typeof window !== 'undefined') {
        const cachedProducts = localStorage.getItem('products_cache');
        if (cachedProducts) {
          try {
            const parsed = JSON.parse(cachedProducts);
            if (Array.isArray(parsed) && parsed.length > 0) {
              await processProducts(parsed);
              setLoading(false);
            }
          } catch {
            localStorage.removeItem('products_cache');
          }
        }
      }

      // 2. Always fetch fresh products from API in background (Revalidate)
      const response = await fetch(`/api/products?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        }
      });
      const data = await response.json();

      if (response.ok && data.products) {
        // Save fresh data to cache
        if (typeof window !== 'undefined') {
          localStorage.setItem('products_cache', JSON.stringify(data.products));
          localStorage.setItem('products_cache_time', Date.now().toString());
        }

        await processProducts(data.products);
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const processProducts = async (products: any[]) => {
    let activeDbCategories: any[] = [];
    const inactiveCategoryNames = new Set<string>();

    try {
      const catResponse = await fetch(`/api/categories?t=${Date.now()}`, {
        cache: 'no-store'
      });
      const catData = await catResponse.json();
      if (catResponse.ok && Array.isArray(catData.categories)) {
        catData.categories.forEach((c: any) => {
          const normName = (c.name || '').toLowerCase().trim();
          if (c.is_active === false) {
            inactiveCategoryNames.add(normName);
            // also handle plural/singular
            inactiveCategoryNames.add(normName.replace(/s$/, ''));
            inactiveCategoryNames.add(normName + 's');
          } else {
            activeDbCategories.push(c);
          }
        });

        // Sort active categories by display_order
        activeDbCategories.sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }

    // Group products by normalized category
    const productsByCategory: { [key: string]: { originalName: string; products: any[] } } = {};

    products.forEach((p: any) => {
      // Check stock
      const inStock = p.stock === undefined || p.stock === null || p.stock > 0;
      if (!inStock) return;

      const rawCatName = (p.category || 'Other').trim();
      const normCatName = rawCatName.toLowerCase();

      // If category is explicitly marked inactive in Admin, SKIP THIS PRODUCT!
      if (inactiveCategoryNames.has(normCatName)) {
        return;
      }

      if (!productsByCategory[normCatName]) {
        productsByCategory[normCatName] = {
          originalName: rawCatName,
          products: [],
        };
      }

      productsByCategory[normCatName].products.push({
        id: p.id,
        name: p.name,
        description: p.description || `Delicious ${p.name}`,
        price: parseFloat(p.price),
        art: getArtForCategory(rawCatName),
        badge: p.featured ? 'Popular' : undefined,
        image: p.image,
      });
    });

    const categoriesArray: Category[] = [];
    const consumedKeys = new Set<string>();

    // 1. Process active database categories in order
    if (activeDbCategories.length > 0) {
      activeDbCategories.forEach((dbCat: any) => {
        const dbCatNorm = (dbCat.name || '').toLowerCase().trim();
        const dbCatSingular = dbCatNorm.replace(/s$/, '');
        const dbCatPlural = dbCatNorm + 's';

        let categoryProducts: any[] = [];

        // Collect all products matching this active category
        Object.keys(productsByCategory).forEach((key) => {
          if (key === dbCatNorm || key === dbCatSingular || key === dbCatPlural) {
            categoryProducts = [...categoryProducts, ...productsByCategory[key].products];
            consumedKeys.add(key);
          }
        });

        // Only add active category if it has products
        if (categoryProducts.length > 0) {
          categoriesArray.push({
            id: dbCat.slug || dbCatNorm.replace(/\s+/g, '-'),
            num: String(categoriesArray.length + 1).padStart(2, '0'),
            name: dbCat.name,
            tagline: dbCat.description || `Explore our ${dbCat.name.toLowerCase()} collection`,
            products: categoryProducts,
          });
        }
      });
    }

    // 2. Append any unconsumed categories that were NOT marked inactive
    Object.entries(productsByCategory).forEach(([key, group]) => {
      if (!consumedKeys.has(key) && !inactiveCategoryNames.has(key) && group.products.length > 0) {
        categoriesArray.push({
          id: key.replace(/\s+/g, '-'),
          num: String(categoriesArray.length + 1).padStart(2, '0'),
          name: group.originalName,
          tagline: `Explore our ${group.originalName.toLowerCase()} collection`,
          products: group.products,
        });
      }
    });

    setCategories(categoriesArray);
  };

  return <Shop categories={categories} loading={loading} />;
}