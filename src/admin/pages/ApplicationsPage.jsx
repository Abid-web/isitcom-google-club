import { useEffect, useState } from "react";
import { deleteApplication, getApplications, updateApplication } from "../lib/adminApi";
import { exportApplicationsToCSV } from "../lib/csvExport";
import { useTable } from "../hooks/useTable";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../hooks/useAuth";
import Pagination from "../components/Pagination";
import ConfirmDialog from "../components/ConfirmDialog";

const STATUS_LABELS = {
  new: "Nouveau",
  reviewing: "En revue",
  accepted: "Accepté",
  rejected: "Refusé",
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [internalNotes, setInternalNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const { showToast } = useToast();
  const { isAdmin } = useAuth();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getApplications();
      setApplications(data || []);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur de chargement des candidatures.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const table = useTable({
    data: applications,
    initialSortField: "created_at",
    initialSortDir: "desc",
    initialPageSize: 10,
    searchFields: ["full_name", "email", "field_of_study", "department"],
  });

  const handleOpenDetail = app => {
    setSelectedApp(app);
    setInternalNotes(app.admin_notes || "");
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    setUpdating(true);
    try {
      await updateApplication(appId, {
        status: newStatus,
        admin_notes: internalNotes,
      });

      setApplications(prev =>
        prev.map(item => (item.id === appId ? { ...item, status: newStatus, admin_notes: internalNotes } : item))
      );
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp(prev => ({ ...prev, status: newStatus, admin_notes: internalNotes }));
      }
      showToast("Statut de la candidature mis à jour avec succès !", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Échec de la mise à jour.", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    setUpdating(true);
    try {
      await updateApplication(selectedApp.id, {
        admin_notes: internalNotes,
      });
      setApplications(prev =>
        prev.map(item => (item.id === selectedApp.id ? { ...item, admin_notes: internalNotes } : item))
      );
      setSelectedApp(prev => ({ ...prev, admin_notes: internalNotes }));
      showToast("Notes internes enregistrées.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur d'enregistrement des notes.", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setUpdating(true);
    try {
      await deleteApplication(deleteTarget.id);
      setApplications(prev => prev.filter(item => item.id !== deleteTarget.id));
      if (selectedApp?.id === deleteTarget.id) setSelectedApp(null);
      setDeleteTarget(null);
      showToast("Candidature supprimée définitivement.", "info");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur de suppression.", "error");
    } finally {
      setUpdating(false);
    }
  };

  const copyFilteredEmails = () => {
    const emails = Array.from(new Set(table.items.map(a => a.email).filter(Boolean)));
    if (emails.length === 0) {
      showToast("Aucun email dans la sélection actuelle.", "warning");
      return;
    }
    navigator.clipboard.writeText(emails.join(", "));
    showToast(`${emails.length} adresse(s) email copiée(s) dans le presse-papiers !`, "success");
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Candidatures au Club</h1>
          <div className="admin-page-desc">
            Gestion, revue et sélection des candidats de l'ISITCOM.
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            className="admin-btn admin-btn-secondary"
            type="button"
            onClick={copyFilteredEmails}
            title="Copier les emails de la page ou du filtre actif"
          >
            📋 Copier les emails
          </button>
          <button
            className="admin-btn admin-btn-primary"
            type="button"
            onClick={() => exportApplicationsToCSV(applications)}
            title="Télécharger l'intégralité des candidatures au format CSV"
          >
            📥 Exporter CSV
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-search-bar">
        <div className="admin-input-group">
          <input
            className="admin-input"
            type="search"
            placeholder="Rechercher par nom, email, filière…"
            value={table.search}
            onChange={e => table.setSearch(e.target.value)}
          />
        </div>

        <select
          className="admin-select"
          style={{ width: "auto" }}
          value={table.filters.status || "all"}
          onChange={e => table.setFilter("status", e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          <option value="new">Nouveaux</option>
          <option value="reviewing">En revue</option>
          <option value="accepted">Acceptés</option>
          <option value="rejected">Refusés</option>
        </select>

        <select
          className="admin-select"
          style={{ width: "auto" }}
          value={table.filters.department || "all"}
          onChange={e => table.setFilter("department", e.target.value)}
        >
          <option value="all">Tous les départements</option>
          <option value="Technical">Technical</option>
          <option value="Marketing">Marketing</option>
          <option value="Communication">Communication</option>
        </select>

        {(table.search || Object.keys(table.filters).length > 0) && (
          <button
            className="admin-btn admin-btn-secondary admin-btn-sm"
            type="button"
            onClick={table.clearFilters}
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* Applications Table */}
      <div className="admin-table-container">
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
            Chargement des candidatures…
          </div>
        ) : table.items.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
            Aucune candidature trouvée.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => table.toggleSort("created_at")}>
                  Date {table.sortField === "created_at" && (table.sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th className="sortable" onClick={() => table.toggleSort("full_name")}>
                  Candidat {table.sortField === "full_name" && (table.sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th>Filière & Année</th>
                <th>Pôle visé</th>
                <th className="sortable" onClick={() => table.toggleSort("status")}>
                  Statut {table.sortField === "status" && (table.sortDir === "asc" ? "↑" : "↓")}
                </th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {table.items.map(app => (
                <tr key={app.id}>
                  <td data-label="Date">
                    <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                      {new Date(app.created_at).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </td>
                  <td data-label="Candidat">
                    <div>
                      <strong>{app.full_name}</strong>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{app.email}</div>
                  </td>
                  <td data-label="Filière">
                    <div>{app.field_of_study}</div>
                    <small style={{ color: "var(--muted)" }}>{app.study_year}</small>
                  </td>
                  <td data-label="Pôle visé">
                    <span
                      style={{
                        fontWeight: 600,
                        color:
                          app.department === "Technical"
                            ? "var(--blue)"
                            : app.department === "Marketing"
                            ? "var(--red)"
                            : "var(--yellow)",
                      }}
                    >
                      {app.department}
                    </span>
                  </td>
                  <td data-label="Statut">
                    <span className={`admin-badge admin-badge-${app.status || "new"}`}>
                      {STATUS_LABELS[app.status] || "Nouveau"}
                    </span>
                  </td>
                  <td data-label="Actions" style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "6px" }}>
                      <button
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                        type="button"
                        onClick={() => handleOpenDetail(app)}
                      >
                        Consulter
                      </button>
                      {isAdmin && (
                        <button
                          className="admin-btn admin-btn-danger admin-btn-sm"
                          type="button"
                          onClick={() => setDeleteTarget(app)}
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination
        page={table.page}
        totalPages={table.totalPages}
        totalItems={table.totalItems}
        pageSize={table.pageSize}
        onPageChange={table.setPage}
      />

      {/* Slide-over Detail Drawer */}
      {selectedApp && (
        <div className="admin-drawer-backdrop" onClick={() => setSelectedApp(null)}>
          <div className="admin-drawer" onClick={e => e.stopPropagation()}>
            <div className="admin-drawer-header">
              <div>
                <h2 style={{ margin: 0, fontFamily: "var(--display)", fontSize: "1.25rem" }}>
                  {selectedApp.full_name}
                </h2>
                <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                  Candidature reçue le {new Date(selectedApp.created_at).toLocaleString("fr-FR")}
                </span>
              </div>
              <button
                className="admin-btn-icon"
                type="button"
                onClick={() => setSelectedApp(null)}
              >
                ×
              </button>
            </div>

            <div className="admin-drawer-body">
              <div style={{ marginBottom: "20px" }}>
                <label className="admin-label">Changer le statut</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {["new", "reviewing", "accepted", "rejected"].map(st => (
                    <button
                      key={st}
                      type="button"
                      className={`admin-btn admin-btn-sm ${
                        selectedApp.status === st ? "admin-btn-primary" : "admin-btn-secondary"
                      }`}
                      disabled={updating}
                      onClick={() => handleUpdateStatus(selectedApp.id, st)}
                    >
                      {STATUS_LABELS[st]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="admin-card" style={{ padding: "16px", marginBottom: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "0.88rem" }}>
                  <div>
                    <span style={{ color: "var(--muted)" }}>Email :</span>
                    <div>
                      <a href={`mailto:${selectedApp.email}`} style={{ color: "var(--blue)" }}>
                        {selectedApp.email}
                      </a>
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "var(--muted)" }}>Année :</span>
                    <div>{selectedApp.study_year}</div>
                  </div>
                  <div>
                    <span style={{ color: "var(--muted)" }}>Filière :</span>
                    <div>{selectedApp.field_of_study}</div>
                  </div>
                  <div>
                    <span style={{ color: "var(--muted)" }}>Département visé :</span>
                    <div><strong>{selectedApp.department}</strong></div>
                  </div>
                </div>
              </div>

              <div className="admin-field">
                <label className="admin-label">Motivation & projets personnels</label>
                <div
                  style={{
                    background: "var(--surface)",
                    padding: "16px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--line)",
                    fontSize: "0.92rem",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selectedApp.motivation ? (
                    selectedApp.motivation
                  ) : (
                    <em style={{ color: "var(--muted)" }}>Aucune motivation rédigée par le candidat.</em>
                  )}
                </div>
              </div>

              <div className="admin-field" style={{ marginTop: "24px" }}>
                <label className="admin-label" htmlFor="internal-notes">
                  Notes internes du bureau (partagées entre membres)
                </label>
                <textarea
                  id="internal-notes"
                  className="admin-textarea"
                  rows={4}
                  placeholder="Ex : Bon profil technique, entretien planifié pour mardi prochain à 14h…"
                  value={internalNotes}
                  onChange={e => setInternalNotes(e.target.value)}
                />
                <button
                  className="admin-btn admin-btn-secondary admin-btn-sm"
                  type="button"
                  style={{ marginTop: "8px" }}
                  onClick={handleSaveNotes}
                  disabled={updating}
                >
                  {updating ? "Enregistrement…" : "Enregistrer les notes"}
                </button>
              </div>
            </div>

            <div className="admin-drawer-footer">
              <button
                className="admin-btn admin-btn-secondary"
                type="button"
                onClick={() => setSelectedApp(null)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer la candidature"
        message={`Confirmez-vous la suppression définitive du dossier de ${deleteTarget?.full_name} (${deleteTarget?.email}) ?`}
      />
    </div>
  );
}
