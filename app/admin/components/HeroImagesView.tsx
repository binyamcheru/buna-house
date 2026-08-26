"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { clearHeroImagesCache } from "@/lib/cache-manager";
import { compressImage } from "@/lib/image-compression";
import { useToast } from "./Toast";
import { useConfirm } from "./ConfirmDialog";

type HeroImage = {
  id: number;
  title: string | null;
  subtitle: string | null;
  label: string | null;
  image_url: string;
  display_order: number;
  is_active: boolean;
};

export function HeroImagesView() {
  const toast = useToast();
  const confirmDialog = useConfirm();
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formData, setFormData] = useState({
    label: "",
    title: "",
    subtitle: "",
    image: null as File | null,
  });

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch("/api/hero-images");
      const data = await response.json();
      if (response.ok) {
        setImages(data.images || []);
      }
    } catch (error) {
      console.error("Error fetching hero images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedFile = await compressImage(file, 1);
      setFormData({ ...formData, image: compressedFile });
    } catch (error) {
      console.error("Image compression failed:", error);
      toast.error("Failed to process image. Please try a different image.");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      toast.error("Please select an image");
      return;
    }

    setUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("image", formData.image);
      formDataToSend.append("label", formData.label);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("subtitle", formData.subtitle);

      const response = await fetch("/api/hero-images", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        clearHeroImagesCache(); // Clear cache so changes appear immediately
        toast.success("Image uploaded successfully!");
        setFormData({ label: "", title: "", subtitle: "", image: null });
        setShowUploadForm(false);
        fetchImages();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    console.log("🔵 Toggle clicked - ID:", id, "Current Status:", currentStatus, "New Status:", !currentStatus);

    try {
      const response = await fetch(`/api/hero-images/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      console.log("🔵 API Response:", response.status);
      const data = await response.json();
      console.log("🔵 API Data:", data);

      if (response.ok) {
        clearHeroImagesCache(); // Clear cache so changes appear immediately
        toast.success(`Image ${!currentStatus ? 'activated' : 'hidden'} successfully!`);
        fetchImages();
      } else {
        toast.error("Failed to update status: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("❌ Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!(await confirmDialog({ message: "Are you sure you want to delete this image?", danger: true }))) return;

    try {
      const response = await fetch(`/api/hero-images/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        clearHeroImagesCache(); // Clear cache so changes appear immediately
        toast.success("Image deleted successfully!");
        fetchImages();
      } else {
        toast.error("Failed to delete image");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  if (loading) {
    return (
      <div className="admin-view">
        <div className="view-header">
          <h1 className="view-title">Hero Images</h1>
        </div>
        <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-view">
      <div className="view-header">
        <h1 className="view-title">Hero Images</h1>
        <button
          className="btn-primary"
          onClick={() => setShowUploadForm(!showUploadForm)}
        >
          {showUploadForm ? "Cancel" : "+ Upload New Image"}
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="upload-form-card">
          <h2 className="form-card-title">Upload Hero Image</h2>
          <form onSubmit={handleUpload}>
            <div className="form-group">
              <label className="form-label">Image File *</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
                required
              />
              <p className="form-hint">Recommended: 1920x800px, JPG or PNG</p>
            </div>
            <div className="form-group">
              <label className="form-label">Label Badge (Optional)</label>
              <input
                type="text"
                className="form-input"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="FRESH BEANS"
              />
              <p className="form-hint">Small badge shown above the title (e.g., "NEW ARRIVAL", "SEASONAL")</p>
            </div>
            <div className="form-group">
              <label className="form-label">Title (Optional)</label>
              <input
                type="text"
                className="form-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Welcome to Buna House"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Subtitle (Optional)</label>
              <textarea
                className="form-textarea"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Premium coffee delivered to your doorstep"
                rows={2}
              />
            </div>
            <button type="submit" className="btn-save" disabled={uploading}>
              {uploading ? "Uploading..." : "Upload Image"}
            </button>
          </form>
        </div>
      )}

      {/* Images Grid */}
      <div className="hero-images-grid">
        {images.length === 0 ? (
          <div className="empty-state">
            <p>No hero images yet. Upload your first image!</p>
          </div>
        ) : (
          images.map((image) => (
            <div key={image.id} className="hero-image-card">
              <div className="hero-image-preview">
                <Image
                  src={image.image_url}
                  alt={image.title || "Hero image"}
                  width={400}
                  height={200}
                  style={{ objectFit: "cover", width: "100%", height: "200px" }}
                />
                {!image.is_active && (
                  <div className="inactive-overlay">
                    <span>Hidden</span>
                  </div>
                )}
              </div>
              <div className="hero-image-info">
                {image.title && <h3 className="hero-image-title">{image.title}</h3>}
                {image.subtitle && <p className="hero-image-subtitle">{image.subtitle}</p>}
                <div className="hero-image-meta">
                  <span className={`status-badge ${image.is_active ? "active" : "inactive"}`}>
                    {image.is_active ? "Active" : "Hidden"}
                  </span>
                  <span className="order-badge">Order: {image.display_order}</span>
                </div>
              </div>
              <div className="hero-image-actions">
                <button
                  className="btn-toggle"
                  onClick={() => handleToggleActive(image.id, image.is_active)}
                >
                  {image.is_active ? "Hide" : "Show"}
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(image.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
