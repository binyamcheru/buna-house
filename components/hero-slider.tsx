"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { heroSlides } from "@/lib/data";
import { ProductArt } from "./art";
import { ArrowRightIcon } from "./icons";

const SLIDE_DURATION = 5000;

type HeroImage = {
  id: number;
  label: string | null;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  display_order: number;
  is_active: boolean;
};

export function HeroSlider() {
  const [active, setActive] = useState(0);
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeroImages();
  }, []);

  const fetchHeroImages = async () => {
    try {
      setLoading(true);

      // Try to get from cache first
      const cached = localStorage.getItem('hero_images_cache');
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          const activeImages = cachedData.filter((img: HeroImage) => img.is_active);
          if (activeImages.length > 0) {
            setImages(activeImages);
            setActive(0);
          }
        } catch (e) {
          console.error('Failed to parse cached hero images:', e);
        }
      }

      // Fetch fresh data from API
      const response = await fetch('/api/hero-images');
      const data = await response.json();
      if (response.ok && data.images) {
        // Cache the fresh data
        localStorage.setItem('hero_images_cache', JSON.stringify(data.images));

        // Filter active images only
        const activeImages = data.images.filter((img: HeroImage) => img.is_active);
        if (activeImages.length > 0) {
          setImages(activeImages);
          setActive(0); // Reset to first slide when custom images load
        }
      }
    } catch (error) {
      console.error('Failed to fetch hero images:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use uploaded images if available, otherwise fallback to default
  const slides = images.length > 0 ? images : heroSlides;
  const isCustomImages = images.length > 0;

  useEffect(() => {
    if (slides.length === 0) return;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, SLIDE_DURATION);
    return () => clearInterval(id);
  }, [slides.length]);

  // Do NOT flash default slides while custom images are still loading.
  if (loading || slides.length === 0) {
    return (
      <section className="hero" aria-label="Featured">
        <div className="hero-stage">
          <div className="hero-slide hero-slide-active">
            <div className="hero-image-bg">
              <ProductArt art="hero-espresso" />
              <div className="hero-overlay"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hero" aria-label="Featured">
      <div className="hero-stage">
        {isCustomImages ? (
          // Custom uploaded images
          images.map((image, i) => (
            <div
              key={image.id}
              className={`hero-slide hero-slide-custom ${i === active ? "hero-slide-active" : ""}`}
              aria-hidden={i !== active}
            >
              <div className="hero-image-bg">
                <Image
                  src={image.image_url}
                  alt={image.title || "Hero image"}
                  fill
                  style={{ objectFit: "cover" }}
                  priority={i === 0}
                />
                <div className="hero-overlay"></div>
              </div>

              {(image.label || image.title || image.subtitle) && (
                <div className="hero-content">
                  {image.label && <span className="hero-label">{image.label}</span>}
                  {image.title && <h1 className="hero-headline">{image.title}</h1>}
                  {image.subtitle && <p className="hero-desc">{image.subtitle}</p>}
                  <button
                    className="hero-cta"
                    onClick={() => {
                      const menuSection = document.getElementById('menu-section');
                      if (menuSection) {
                        menuSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      } else {
                        // Fallback: scroll to first category
                        const firstCategory = document.querySelector('.category-section');
                        if (firstCategory) {
                          firstCategory.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }
                    }}
                  >
                    Explore Menu <ArrowRightIcon size={18} />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          // Default slides with ProductArt
          heroSlides.map((slide, i) => (
            <div
              key={slide.id}
              className={`hero-slide ${slide.className} ${i === active ? "hero-slide-active" : ""}`}
              aria-hidden={i !== active}
            >
              <div className="hero-art" aria-hidden>
                <ProductArt art={slide.art} />
              </div>

              <div className="hero-content">
                <span className="hero-label">{slide.label}</span>
                <h1 className="hero-headline">{slide.headline}</h1>
                <p className="hero-desc">{slide.description}</p>
                <button
                  className="hero-cta"
                  onClick={() => {
                    const menuSection = document.getElementById('menu-section');
                    if (menuSection) {
                      menuSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                      // Fallback: scroll to first category
                      const firstCategory = document.querySelector('.category-section');
                      if (firstCategory) {
                        firstCategory.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }
                  }}
                >
                  Explore Menu <ArrowRightIcon size={18} />
                </button>
              </div>
            </div>
          ))
        )}

        {/* Navigation Buttons */}
        <button
          className="hero-nav hero-nav-prev"
          onClick={() => setActive((prev) => (prev - 1 + slides.length) % slides.length)}
          aria-label="Previous slide"
        >
          <ArrowRightIcon size={24} strokeWidth={2} />
        </button>
        <button
          className="hero-nav hero-nav-next"
          onClick={() => setActive((prev) => (prev + 1) % slides.length)}
          aria-label="Next slide"
        >
          <ArrowRightIcon size={24} strokeWidth={2} />
        </button>
      </div>

      <div className="hero-indicators" role="tablist" aria-label="Slides">
        {slides.map((s, i) => (
          <button
            key={isCustomImages ? (s as HeroImage).id : (s as any).id}
            role="tab"
            aria-selected={i === active}
            aria-label={`Slide ${i + 1}`}
            className={`hero-dot ${i === active ? "hero-dot-active" : ""}`}
            onClick={() => setActive(i)}
          />
        ))}
      </div>
    </section>
  );
}
