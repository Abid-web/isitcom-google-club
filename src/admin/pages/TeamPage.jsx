import { useEffect, useState } from "react";
import { createTeamMember, deleteTeamMember, getTeamMembers, updateTeamMember } from "../lib/adminApi";
import { useToast } from "../hooks/useToast";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import ImageUploader from "../components/ImageUploader";

const DEPARTMENTS = [
  { id: "executive", label: "Executive office (Direction)" },
  { id: "technical", label: "Technical department" },
  { id: "marketing-design", label: "Marketing & design" },
  { id: "communication", label: "Communication department" },
  { id: "events-organisation", label: "Events & organisation" },
];

const GOOGLE_COLORS = ["#4285f4", "#ea4335", "#fbbc05", "#34a853"];

const initialForm = {
  name: "",
  role: "",
  department_id: "technical",
  color: "#4285f4",
  initials: "",
  featured: false,
  linkedin_url: "",
  email: "",
  image_url: "",
};

export default function TeamPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getTeamMembers();
      setMembers(data || []);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur de chargement des membres.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingMember(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const handleOpenEdit = member => {
    setEditingMember(member);
    setFormData({
      name: member.name || "",
      role: member.role || "",
      department_id: member.department_id || "technical",
      color: member.color || "#4285f4",
      initials: member.initials || "",
      featured: Boolean(member.featured),
      linkedin_url: member.linkedin_url || "",
      email: member.email || "",
      image_url: member.image_url || "",
    });
    setModalOpen(true);
  };

  const handleNameChange = name => {
    const parts = name.trim().split(/\s+/);
    let autoInitials = "";
    if (parts.length >= 2) {
      autoInitials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts[0]) {
      autoInitials = parts[0].slice(0, 2).toUpperCase();
    }
    setFormData(prev => ({
      ...prev,
      name,
      initials: prev.initials ? prev.initials : autoInitials,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.role.trim()) {
      showToast("Le nom et le rôle sont obligatoires.", "warning");
      return;
    }

    setSaving(true);
    try {
      if (editingMember) {
        const updated = await updateTeamMember(editingMember.id, formData);
        setMembers(prev => prev.map(m => (m.id === editingMember.id ? { ...m, ...updated } : m)));
        showToast("Membre mis à jour !", "success");
      } else {
        const created = await createTeamMember({
          ...formData,
          display_order: members.length + 1,
        });
        setMembers(prev => [...prev, created]);
        showToast("Nouveau membre ajouté au bureau !", "success");
      }
      setModalOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur d'enregistrement.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteTeamMember(deleteTarget.id);
      setMembers(prev => prev.filter(m => m.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Membre retiré du bureau.", "info");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur de suppression.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= members.length) return;

    const newMembers = [...members];
    const [moved] = newMembers.splice(index, 1);
    newMembers.splice(targetIndex, 0, moved);

    // Update orders
    setMembers(newMembers);
    try {
      await Promise.all([
        updateTeamMember(moved.id, { display_order: targetIndex + 1 }),
        updateTeamMember(newMembers[index].id, { display_order: index + 1 }),
      ]);
    } catch {
      showToast("Erreur lors de la mise à jour de l'ordre.", "error");
    }
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Bureau & Équipe du Club</h1>
          <div className="admin-page-desc">
            Organisez les pôles, mettez à jour les profils et ordonnez les cartes membres visibles sur le site.
          </div>
        </div>
        <button className="admin-btn admin-btn-primary" type="button" onClick={handleOpenCreate}>
          + Ajouter un Membre
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
          Chargement des membres…
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {DEPARTMENTS.map(dept => {
            const deptMembers = members.filter(m => m.department_id === dept.id);
            return (
              <div key={dept.id} className="admin-card">
                <div className="admin-card-title">
                  <span>{dept.label} ({deptMembers.length})</span>
                </div>

                {deptMembers.length === 0 ? (
                  <div style={{ color: "var(--muted)", fontStyle: "italic", fontSize: "0.85rem" }}>
                    Aucun membre affecté à ce département.
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                    {deptMembers.map(member => {
                      const globalIndex = members.findIndex(m => m.id === member.id);
                      return (
                        <div
                          key={member.id}
                          style={{
                            border: "1px solid var(--line)",
                            borderRadius: "var(--radius-sm)",
                            padding: "16px",
                            background: "var(--paper)",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "50%",
                              background: member.color || "#4285f4",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: "1.1rem",
                              overflow: "hidden",
                              flexShrink: 0,
                            }}
                          >
                            {member.image_url ? (
                              <img src={member.image_url} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              member.initials || "IGC"
                            )}
                          </div>

                          <div style={{ flex: 1, overflow: "hidden" }}>
                            <div style={{ fontWeight: 700, fontSize: "0.95rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {member.name}
                            </div>
                            <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                              {member.role} {member.featured && <span style={{ color: "var(--blue)" }}>★ Vedette</span>}
                            </div>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div style={{ display: "flex", gap: "4px" }}>
                              <button
                                className="admin-btn-icon"
                                style={{ width: "26px", height: "26px", fontSize: "0.75rem" }}
                                type="button"
                                disabled={globalIndex === 0}
                                onClick={() => handleMove(globalIndex, -1)}
                                title="Monter"
                              >
                                ↑
                              </button>
                              <button
                                className="admin-btn-icon"
                                style={{ width: "26px", height: "26px", fontSize: "0.75rem" }}
                                type="button"
                                disabled={globalIndex === members.length - 1}
                                onClick={() => handleMove(globalIndex, 1)}
                                title="Descendre"
                              >
                                ↓
                              </button>
                            </div>
                            <div style={{ display: "flex", gap: "4px" }}>
                              <button
                                className="admin-btn-icon"
                                style={{ width: "26px", height: "26px", fontSize: "0.75rem" }}
                                type="button"
                                onClick={() => handleOpenEdit(member)}
                                title="Modifier"
                              >
                                ✏️
                              </button>
                              <button
                                className="admin-btn-icon"
                                style={{ width: "26px", height: "26px", fontSize: "0.75rem", color: "var(--red)" }}
                                type="button"
                                onClick={() => setDeleteTarget(member)}
                                title="Supprimer"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Member Form Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMember ? "Modifier le membre" : "Ajouter un membre au bureau"}
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
              {saving ? "Enregistrement…" : editingMember ? "Mettre à jour" : "Ajouter"}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="admin-field">
            <label className="admin-label">Nom et prénom *</label>
            <input
              className="admin-input"
              value={formData.name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="Ex : Mohamed Khalil Ayadhi"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="admin-field">
              <label className="admin-label">Rôle / Poste *</label>
              <input
                className="admin-input"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                placeholder="Ex : President, Tech Lead…"
                required
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">Département</label>
              <select
                className="admin-select"
                value={formData.department_id}
                onChange={e => setFormData({ ...formData, department_id: e.target.value })}
              >
                {DEPARTMENTS.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="admin-field">
              <label className="admin-label">Initiales (badge secours)</label>
              <input
                className="admin-input"
                maxLength={4}
                value={formData.initials}
                onChange={e => setFormData({ ...formData, initials: e.target.value.toUpperCase() })}
                placeholder="MK"
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">Couleur d'accentuation</label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {GOOGLE_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: c })}
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      background: c,
                      border: formData.color === c ? "3px solid var(--ink)" : "none",
                      cursor: "pointer",
                    }}
                  />
                ))}
                <input
                  type="color"
                  value={formData.color}
                  onChange={e => setFormData({ ...formData, color: e.target.value })}
                  style={{ width: "36px", height: "30px", padding: 0, border: "none", cursor: "pointer", background: "none" }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="admin-field">
              <label className="admin-label">Profil LinkedIn (URL)</label>
              <input
                className="admin-input"
                type="url"
                value={formData.linkedin_url}
                onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div className="admin-field">
              <label className="admin-label">Email de contact</label>
              <input
                className="admin-input"
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="prenom@isitcomgoogleclub.tn"
              />
            </div>
          </div>

          <div className="admin-field">
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.88rem" }}>
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={e => setFormData({ ...formData, featured: e.target.checked })}
              />
              Mettre en vedette (taille de carte supérieure pour la direction)
            </label>
          </div>

          <ImageUploader
            value={formData.image_url}
            onChange={url => setFormData({ ...formData, image_url: url })}
            folder="team"
            label="Photo de portrait"
          />
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer le membre"
        message={`Confirmez-vous le retrait de ${deleteTarget?.name} (${deleteTarget?.role}) du bureau ?`}
      />
    </div>
  );
}
