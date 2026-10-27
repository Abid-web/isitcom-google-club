import { useEffect, useState } from "react";
import { createEvent, deleteEvent, getEvents, updateEvent } from "../lib/adminApi";
import { useToast } from "../hooks/useToast";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import ImageUploader from "../components/ImageUploader";

const initialForm = {
  title: "",
  tag: "Workshop",
  desc_text: "",
  type: "upcoming",
  event_date: "",
  location: "ISITCom",
  art: "WORK",
  color: "#a8dab5",
  image_url: "",
  registration_link: "",
};

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getEvents();
      setEvents(data || []);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur de chargement des événements.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const handleOpenEdit = event => {
    setEditingEvent(event);
    setFormData({
      title: event.title || "",
      tag: event.tag || "Workshop",
      desc_text: event.desc_text || "",
      type: event.type || "upcoming",
      event_date: event.event_date ? event.event_date.slice(0, 16) : "",
      location: event.location || "ISITCom",
      art: event.art || "WORK",
      color: event.color || "#a8dab5",
      image_url: event.image_url || "",
      registration_link: event.registration_link || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast("Le titre de l'événement est requis.", "warning");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        event_date: formData.event_date ? new Date(formData.event_date).toISOString() : null,
      };

      if (editingEvent) {
        const updated = await updateEvent(editingEvent.id, payload);
        setEvents(prev => prev.map(item => (item.id === editingEvent.id ? { ...item, ...updated } : item)));
        showToast("Événement mis à jour avec succès !", "success");
      } else {
        const created = await createEvent(payload);
        setEvents(prev => [created, ...prev]);
        showToast("Nouvel événement créé avec succès !", "success");
      }
      setModalOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur d'enregistrement de l'événement.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteEvent(deleteTarget.id);
      setEvents(prev => prev.filter(item => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Événement supprimé.", "info");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur de suppression.", "error");
    } finally {
      setSaving(false);
    }
  };

  const filteredEvents = filterType === "all" ? events : events.filter(e => e.type === filterType);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Gestion des Événements</h1>
          <div className="admin-page-desc">
            Planifiez, mettez à jour et archivez les ateliers, conférences et hackathons du club.
          </div>
        </div>
        <button className="admin-btn admin-btn-primary" type="button" onClick={handleOpenCreate}>
          + Nouvel Événement
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {["all", "upcoming", "past"].map(t => (
          <button
            key={t}
            className={`admin-btn admin-btn-sm ${filterType === t ? "admin-btn-primary" : "admin-btn-secondary"}`}
            type="button"
            onClick={() => setFilterType(t)}
          >
            {t === "all" ? "Tous les événements" : t === "upcoming" ? "À venir" : "Passés"}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
          Chargement des événements…
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="admin-card" style={{ textAlign: "center", padding: "40px 20px" }}>
          Aucun événement dans cette catégorie.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {filteredEvents.map(event => (
            <div key={event.id} className="admin-card" style={{ margin: 0, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <span
                  style={{
                    background: event.color || "#a8c7fa",
                    color: "#0e0f12",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                  }}
                >
                  {event.tag}
                </span>
                <span className={`admin-badge admin-badge-${event.type === "upcoming" ? "new" : "auto"}`}>
                  {event.type === "upcoming" ? "À venir" : "Passé"}
                </span>
              </div>

              {event.image_url && (
                <img
                  src={event.image_url}
                  alt={event.title}
                  style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "var(--radius-sm)", marginBottom: "12px" }}
                />
              )}

              <h3 style={{ margin: "0 0 6px 0", fontFamily: "var(--display)", fontSize: "1.1rem" }}>
                {event.title}
              </h3>
              <p style={{ color: "var(--muted)", fontSize: "0.88rem", flex: 1, margin: "0 0 16px 0", lineHeight: 1.5 }}>
                {event.desc_text}
              </p>

              {event.event_date && (
                <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: "12px" }}>
                  📍 {event.location || "ISITCom"} · 🕒 {new Date(event.event_date).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", borderTop: "1px solid var(--line)", paddingTop: "12px" }}>
                <button
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  type="button"
                  onClick={() => handleOpenEdit(event)}
                >
                  Modifier
                </button>
                <button
                  className="admin-btn admin-btn-danger admin-btn-sm"
                  type="button"
                  onClick={() => setDeleteTarget(event)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEvent ? "Modifier l'événement" : "Créer un événement"}
        footer={
          <>
            <button
              className="admin-btn admin-btn-secondary"
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Annuler
            </button>
            <button
              className="admin-btn admin-btn-primary"
              type="button"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Enregistrement…" : editingEvent ? "Mettre à jour" : "Créer"}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="admin-field">
            <label className="admin-label">Titre de l'événement *</label>
            <input
              className="admin-input"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex : Ateliers IA & LLM"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="admin-field">
              <label className="admin-label">Statut</label>
              <select
                className="admin-select"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="upcoming">À venir</option>
                <option value="past">Passé</option>
              </select>
            </div>

            <div className="admin-field">
              <label className="admin-label">Tag / Catégorie</label>
              <input
                className="admin-input"
                value={formData.tag}
                onChange={e => setFormData({ ...formData, tag: e.target.value })}
                placeholder="Workshop, Community…"
              />
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-label">Description</label>
            <textarea
              className="admin-textarea"
              rows={3}
              value={formData.desc_text}
              onChange={e => setFormData({ ...formData, desc_text: e.target.value })}
              placeholder="Description courte de l'atelier ou de la rencontre…"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="admin-field">
              <label className="admin-label">Date et heure</label>
              <input
                className="admin-input"
                type="datetime-local"
                value={formData.event_date}
                onChange={e => setFormData({ ...formData, event_date: e.target.value })}
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">Lieu</label>
              <input
                className="admin-input"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex : Amphi A · ISITCom"
              />
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-label">Lien d'inscription ou détails</label>
            <input
              className="admin-input"
              type="url"
              value={formData.registration_link}
              onChange={e => setFormData({ ...formData, registration_link: e.target.value })}
              placeholder="https://forms.google.com/..."
            />
          </div>

          <ImageUploader
            value={formData.image_url}
            onChange={url => setFormData({ ...formData, image_url: url })}
            folder="events"
            label="Affiche de l'événement"
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer l'événement"
        message={`Confirmez-vous la suppression de l'événement « ${deleteTarget?.title} » ?`}
      />
    </div>
  );
}
