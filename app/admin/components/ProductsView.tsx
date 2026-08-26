"use client";

import { useState, useEffect } from "react";
import { PlusIcon, EditIcon, TrashIcon } from "./icons";
import Image from "next/image";
import { clearProductsCache } from "@/lib/cache-manager";
import { compressImage } from "@/lib/image-compression";
import { useToast } from "./Toast";
import { useConfirm } from "./ConfirmDialog";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "out-of-stock";
  image?: string;
  description?: string;
  featured?: boolean;
};

export function ProductsView() {
  const toast = useToast();
  const confirmDialog = useConfirm();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const categories = ["All", "Coffee", "Cappuccino", "Latte", "Iced Coffee", "Mocktails", "Tea", "Shakes", "Desserts", "Snacks", "Combos"];

  // Get unique categories from actual products
  const actualCategories = ["All", ...Array.from(new Set(products.map(p => p.category))).sort()];

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      const data = await response.json();

      if (response.ok && data.products) {
        // Map database products to component format
        const mappedProducts = data.products.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: parseFloat(p.price),
          stock: p.stock,
          status: p.stock > 0 ? "active" : "out-of-stock",
          image: p.image,
          description: p.description,
          featured: p.featured,
        }));
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts =
    categoryFilter === "all"
      ? products
      : products.filter((p) => p.category.toLowerCase() === categoryFilter.toLowerCase());

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setSlideOverOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setSlideOverOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (await confirmDialog({ message: "Are you sure you want to delete this product?", danger: true })) {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          clearProductsCache(); // Clear cache so changes appear immediately on homepage
          setProducts(products.filter((p) => p.id !== id));
        } else {
          const data = await response.json().catch(() => ({}));
          toast.error(data.error || 'Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Error deleting product');
      }
    }
  };

  const handleSaveProduct = async (product: Product) => {
    console.log("🔵 handleSaveProduct called with:", product);

    try {
      if (editingProduct) {
        // Update existing product
        console.log("🔵 Updating existing product:", product.id);
        const response = await fetch(`/api/products/${product.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: product.name,
            description: product.description || '',
            price: product.price,
            category: product.category,
            image: product.image || '',
            stock: product.stock,
            featured: product.featured || false,
          }),
        });

        console.log("🔵 Update response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Product updated:", data);
          clearProductsCache(); // Clear cache so changes appear immediately on homepage
          setProducts(products.map((p) => (p.id === product.id ? { ...product, status: product.stock > 0 ? "active" : "out-of-stock" } : p)));
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("❌ Update failed:", errorData);
          toast.error(errorData.error || 'Failed to update product');
          return;
        }
      } else {
        // Create new product
        console.log("🔵 Creating new product");
        const payload = {
          name: product.name,
          description: product.description || '',
          price: product.price,
          category: product.category,
          image: product.image || '',
          stock: product.stock,
          featured: product.featured || false,
        };
        console.log("🔵 POST payload:", payload);

        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        console.log("🔵 Create response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Product created:", data);
          clearProductsCache(); // Clear cache so changes appear immediately on homepage
          const newProduct = {
            ...product,
            id: data.product.id,
            status: product.stock > 0 ? "active" : "out-of-stock" as "active" | "out-of-stock",
          };
          console.log("🔵 Adding to state:", newProduct);
          setProducts([newProduct, ...products]);
          console.log("✅ State updated");
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("❌ Create failed:", errorData);
          toast.error(errorData.error || 'Failed to create product');
          return;
        }
      }
      setSlideOverOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error saving product');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid var(--cream-line)',
          borderTopColor: 'var(--caramel)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto'
        }} />
        <p style={{ marginTop: '16px', color: 'var(--muted)' }}>Loading products...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="section-card">
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <h3 className="card-title">All Products</h3>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: "8px 14px",
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--cream-line)",
                background: "var(--surface)",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--espresso)",
                cursor: "pointer",
              }}
            >
              {actualCategories.map((cat) => (
                <option key={cat} value={cat.toLowerCase()}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleAddProduct}>
            <PlusIcon size={16} strokeWidth={2.4} />
            Add Product
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "10px",
                          background: "var(--panel)",
                          display: "grid",
                          placeItems: "center",
                          fontSize: "20px",
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            style={{ objectFit: "cover" }}
                            sizes="44px"
                          />
                        ) : (
                          "☕"
                        )}
                      </div>
                      <span style={{ fontWeight: 600, fontFamily: "var(--font-display)" }}>
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td style={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>
                    Br {product.price}
                  </td>
                  <td>
                    <span
                      style={{
                        fontWeight: product.stock < 10 ? 700 : 600,
                        color: product.stock < 10 ? "var(--red)" : "var(--espresso)",
                      }}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        product.status === "active" ? "badge-green" : "badge-red"
                      }`}
                    >
                      {product.status === "active" ? "Active" : "Out of Stock"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleEditProduct(product)}
                        style={{ padding: "6px 10px" }}
                      >
                        <EditIcon size={14} strokeWidth={2.2} />
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        style={{ padding: "6px 10px" }}
                      >
                        <TrashIcon size={14} strokeWidth={2.2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderTop: '1px solid var(--cream-line)',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ fontSize: '14px', color: 'var(--espresso-dim)' }}>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary btn-sm"
                style={{
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>

              <div style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      border: 'none',
                      background: currentPage === page ? 'var(--brown)' : 'var(--panel)',
                      color: currentPage === page ? 'var(--cream)' : 'var(--espresso)',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-secondary btn-sm"
                style={{
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Form Slide-Over */}
      {slideOverOpen && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(43, 24, 16, 0.5)",
              zIndex: 100,
            }}
            onClick={() => setSlideOverOpen(false)}
          />
          <ProductFormSlideOver
            product={editingProduct}
            onSave={handleSaveProduct}
            onClose={() => setSlideOverOpen(false)}
          />
        </>
      )}
    </div>
  );
}

function ProductFormSlideOver({
  product,
  onSave,
  onClose,
}: {
  product: Product | null;
  onSave: (product: Product) => void;
  onClose: () => void;
}) {
  const toast = useToast();
  const [formData, setFormData] = useState<Product>(
    product || {
      id: "",
      name: "",
      category: "Coffee",
      price: 0,
      stock: 0,
      status: "active",
      image: "",
      description: "",
    }
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(product?.image || "");

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Show loading indicator
        console.log('🔵 Compressing image...');

        // Compress image before upload (max 2MB)
        const compressedFile = await compressImage(file, 2);

        setImageFile(compressedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(compressedFile);

        console.log('✅ Image ready for upload');
      } catch (error) {
        console.error('❌ Image compression failed:', error);
        toast.error('Failed to process image. Please try a different image.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("🔵 Form Submit - FormData:", formData);
    console.log("🔵 Form Submit - ImageFile:", imageFile);

    let imageUrl = formData.image;

    // Upload image if new file selected
    if (imageFile) {
      const uploadFormData = new FormData();
      uploadFormData.append("image", imageFile);

      try {
        console.log("🔵 Uploading image...");
        const response = await fetch("/api/products/upload-image", {
          method: "POST",
          body: uploadFormData,
        });

        console.log("🔵 Image upload response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          imageUrl = data.imageUrl;
          console.log("✅ Image uploaded successfully:", imageUrl);
        } else {
          console.error("❌ Image upload failed:", response.status);
        }
      } catch (error) {
        console.error("❌ Image upload error:", error);
      }
    }

    console.log("🔵 Calling onSave with imageUrl:", imageUrl);
    onSave({ ...formData, image: imageUrl });
  };

  return (
    <div
      style={{
        position: "fixed",
        right: 0,
        top: 0,
        bottom: 0,
        width: "min(480px, 90vw)",
        background: "var(--surface)",
        boxShadow: "var(--shadow-elevated)",
        zIndex: 110,
        display: "flex",
        flexDirection: "column",
        animation: "slideIn 0.3s ease",
      }}
    >
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>

      <div style={{ padding: "24px", borderBottom: "1px solid var(--cream-line)" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 700, fontFamily: "var(--font-display)" }}>
          {product ? "Edit Product" : "Add New Product"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Image Upload */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}>
              Product Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              id="product-image-upload"
              style={{ display: "none" }}
            />
            <label
              htmlFor="product-image-upload"
              style={{
                display: "block",
                border: "2px dashed var(--cream-line)",
                borderRadius: "var(--radius-input)",
                padding: imagePreview ? "0" : "40px",
                textAlign: "center",
                background: "var(--panel)",
                cursor: "pointer",
                minHeight: "180px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 480px) 100vw, 480px"
                />
              ) : (
                <div style={{ padding: "40px" }}>
                  <div style={{ fontSize: "40px", marginBottom: "8px" }}>📷</div>
                  <div style={{ fontSize: "13px", color: "var(--muted)" }}>Click to upload product image</div>
                </div>
              )}
            </label>
          </div>

          {/* Product Name */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}>
              Product Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "var(--radius-input)",
                border: "1px solid var(--cream-line)",
                background: "var(--surface)",
                fontSize: "14px",
              }}
              placeholder="e.g., Caramel Latte"
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "var(--radius-input)",
                border: "1px solid var(--cream-line)",
                background: "var(--surface)",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "vertical",
              }}
              placeholder="Describe the product..."
            />
          </div>

          {/* Category & Price */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}>
                Category
              </label>
              <input
                type="text"
                list="category-suggestions"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Select or type new category"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-input)",
                  border: "1px solid var(--cream-line)",
                  background: "var(--surface)",
                  fontSize: "14px",
                }}
              />
              <datalist id="category-suggestions">
                <option value="Coffee" />
                <option value="Cappuccino" />
                <option value="Latte" />
                <option value="Iced Coffee" />
                <option value="Mocktails" />
                <option value="Tea" />
                <option value="Shakes" />
                <option value="Desserts" />
                <option value="Snacks" />
                <option value="Combos" />
              </datalist>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}>
                Price (Br.)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-input)",
                  border: "1px solid var(--cream-line)",
                  background: "var(--surface)",
                  fontSize: "14px",
                }}
              />
            </div>
          </div>

          {/* Stock */}
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}>
              Stock Quantity
            </label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "var(--radius-input)",
                border: "1px solid var(--cream-line)",
                background: "var(--surface)",
                fontSize: "14px",
              }}
            />
          </div>
        </div>
      </form>

      <div
        style={{
          padding: "20px 24px",
          borderTop: "1px solid var(--cream-line)",
          display: "flex",
          gap: "12px",
        }}
      >
        <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" onClick={handleSubmit} style={{ flex: 1 }}>
          {product ? "Update" : "Save"} Product
        </button>
      </div>
    </div>
  );
}
