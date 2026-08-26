"use client";

import { useState, useEffect } from "react";
import { clearAllCaches } from "@/lib/cache-manager";
import { useToast } from "./Toast";
import { useConfirm } from "./ConfirmDialog";

type Category = {
  id: number;
  name: string;
  slug: string;
  display_order: number;
  icon: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export function CategoriesView() {
  const toast = useToast();
  const confirmDialog = useConfirm();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (category: Partial<Category>) => {
    try {
      if (editingCategory) {
        // Update existing
        const response = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(category),
        });

        if (response.ok) {
          clearAllCaches();
          toast.success('Category updated successfully!');
          fetchCategories();
        } else {
          const data = await response.json();
          toast.error(data.error || 'Failed to update category');
        }
      } else {
        // Create new
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(category),
        });

        if (response.ok) {
          clearAllCaches();
          toast.success('Category created successfully!');
          fetchCategories();
        } else {
          const data = await response.json();
          toast.error(data.error || 'Failed to create category');
        }
      }
      setShowForm(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Error saving category');
    }
  };

  const handleDelete = async (id: number) => {
    if (!(await confirmDialog({ message: 'Are you sure you want to delete this category?', danger: true }))) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        clearAllCaches();
        toast.success('Category deleted successfully!');
        fetchCategories();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Error deleting category');
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (response.ok) {
        clearAllCaches();
        toast.success(`Category ${!currentStatus ? 'activated' : 'hidden'} successfully!`);
        fetchCategories();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status');
    }
  };

  const moveUp = async (category: Category) => {
    if (category.display_order <= 1) return;

    try {
      await fetch(`/api/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: category.display_order - 1 }),
      });
      clearAllCaches();
      fetchCategories();
    } catch (error) {
      console.error('Error moving category:', error);
    }
  };

  const moveDown = async (category: Category) => {
    try {
      await fetch(`/api/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_order: category.display_order + 1 }),
      });
      clearAllCaches();
      fetchCategories();
    } catch (error) {
      console.error('Error moving category:', error);
    }
  };

  if (loading) {
    return (
      <div className="admin-view">
        <div className="view-header">
          <h1 className="view-title">Categories</h1>
        </div>
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-view">
      <div className="view-header">
        <h1 className="view-title">Categories</h1>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingCategory(null);
            setShowForm(true);
          }}
        >
          + Add Category
        </button>
      </div>

      <div className="section-card">
        <div className="card-header">
          <h2 className="card-title">Manage Categories</h2>
          <p className="card-subtitle">Drag to reorder how categories appear on the homepage</p>
        </div>
        <div className="card-body">
          <div className="categories-list">
            {categories.map((category) => (
              <div key={category.id} className="category-item">
                <div className="category-drag-handle">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="8" x2="20" y2="8" />
                    <line x1="4" y1="16" x2="20" y2="16" />
                  </svg>
                </div>

                <div className="category-info">
                  <div className="category-name">{category.name}</div>
                  <div className="category-meta">
                    Order: {category.display_order} • Slug: {category.slug}
                    {!category.is_active && <span className="category-inactive"> • Hidden</span>}
                  </div>
                </div>

                <div className="category-actions">
                  <button
                    className="icon-btn-small"
                    onClick={() => moveUp(category)}
                    disabled={category.display_order <= 1}
                    title="Move up"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </button>
                  <button
                    className="icon-btn-small"
                    onClick={() => moveDown(category)}
                    title="Move down"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  <button
                    className="icon-btn-small"
                    onClick={() => handleToggleActive(category.id, category.is_active)}
                    title={category.is_active ? 'Hide' : 'Show'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {category.is_active ? (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      ) : (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </>
                      )}
                    </svg>
                  </button>
                  <button
                    className="icon-btn-small"
                    onClick={() => {
                      setEditingCategory(category);
                      setShowForm(true);
                    }}
                    title="Edit"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    className="icon-btn-small"
                    onClick={() => handleDelete(category.id)}
                    title="Delete"
                    style={{ color: 'var(--red)' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showForm && (
        <CategoryFormModal
          category={editingCategory}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
        />
      )}
    </div>
  );
}

// Category Form Modal Component
function CategoryFormModal({
  category,
  onSave,
  onClose,
}: {
  category: Category | null;
  onSave: (category: Partial<Category>) => void;
  onClose: () => void;
}) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    display_order: category?.display_order || 1,
    icon: category?.icon || '',
    description: category?.description || '',
    is_active: category?.is_active !== undefined ? category.is_active : true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.slug) {
      toast.error('Name and slug are required');
      return;
    }

    onSave(formData);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{category ? 'Edit Category' : 'Add Category'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  name: e.target.value,
                  slug: generateSlug(e.target.value)
                });
              }}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Slug *</label>
            <input
              type="text"
              className="form-input"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Display Order</label>
            <input
              type="number"
              className="form-input"
              value={formData.display_order}
              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
              min="1"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Icon (optional)</label>
            <input
              type="text"
              className="form-input"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="e.g., ☕"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <textarea
              className="form-input"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <span>Active (show on homepage)</span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {category ? 'Update' : 'Create'} Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
