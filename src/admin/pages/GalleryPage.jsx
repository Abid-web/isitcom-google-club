import { useEffect, useState } from "react";
import { createGalleryImage, deleteGalleryImage, getGalleryImages } from "../lib/adminApi";
import { useToast } from "../hooks/useToast";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import ImageUploader from "../components/ImageUploader";

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ label: "", alt: "", image_url: "" });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getGalleryImages();
      setImages(data || []);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur de chargement de la galerie.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.label.trim()) {
      showToast("Veuillez indiquer un titre ou une légende.", "warning");
      return;
    }
    if (!formData.image_url.trim()) {
      showToast("Veuillez téléverser ou fournir une image.", "warning");
      return;
    }

    setSaving(true);
    try {
      const created = await createGalleryImage({
        label: formData.label.trim(),
        alt: formData.alt.trim() || formData.label.trim(),
        image_url: formData.image_url,
        display_order: images.length + 1,
      });
      setImages(prev => [created, ...prev]);
      setModalOpen(false);
      setFormData({ label: "", alt: "", image_url: "" });
      showToast("Photo ajoutée à la galerie avec succès !", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur d'ajout de la photo.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteGalleryImage(deleteTarget.id);
      setImages(prev => prev.filter(img => img.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Photo retirée de la galerie.", "info");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur de suppression.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Galerie Média</h1>
          <div className="admin-page-desc">
            Ajoutez et organisez les photos des ateliers, célébrations et moments forts affichés dans le carrousel.
          </div>
        </div>
        <button className="admin-btn admin-btn-primary" type="button" onClick={() => setModalOpen(true)}>
          + Ajouter une Photo
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
          Chargement des images de la galerie…
        </div>
      ) : images.length === 0 ? (
        <div className="admin-card" style={{ textAlign: "center", padding: "40px 20px" }}>
          Aucune image dans la galerie pour le moment.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
          {images.map(img => (
            <div
              key={img.id}
              className="admin-card"
              style={{
                margin: 0,
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <div style={{ height: "180px", borderRadius: "var(--radius-sm)", overflow: "hidden", background: "var(--paper)", position: "relative" }}>
                <img
                  src={img.image_url || "/assets/card image/workshop.webp"}
                  alt={img.alt}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: "0.92rem", display: "block" }}>{img.label}</strong>
                  <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{img.alt}</span>
                </div>
                <button
                  className="admin-btn-icon"
                  type="button"
                  style={{ color: "var(--red)" }}
                  onClick={() => setDeleteTarget(img)}
                  title="Supprimer la photo"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Image Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Ajouter une photo à la galerie"
        footer={
          <>
            <button className="admin-btn admin-btn-secondary" type="button" onClick={() => setModalOpen(false)}>
              Annuler
            </button>
            <button className="admin-btn admin-btn-primary" type="button" onClick={handleSubmit} disabled={saving}>
              {saving ? "Téléversement…" : "Ajouter à la galerie"}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="admin-field">
            <label className="admin-label">Titre / Légende *</label>
            <input
              className="admin-input"
              value={formData.label}
              onChange={e => setFormData({ ...formData, label: e.target.value })}
              placeholder="Ex : Remise des certificats d'atelier"
              required
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Description alternative (Accessibilité SEO)</label>
            <input
              className="admin-input"
              value={formData.alt}
              onChange={e => setFormData({ ...formData, alt: e.target.value })}
              placeholder="Ex : Étudiants recevant leurs attestations de participation"
            />
          </div>

          <ImageUploader
            value={formData.image_url}
            onChange={url => setFormData({ ...formData, image_url: url })}
            folder="gallery"
            label="Photo (haute qualité WebP / JPG)"
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer la photo"
        message={`Confirmez-vous le retrait de la photo « ${deleteTarget?.label} » de la galerie ?`}
      />
    </div>
  );
}
