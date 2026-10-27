import Modal from "./Modal";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmer la suppression",
  message = "Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.",
  confirmLabel = "Supprimer définitivement",
  isDestructive = true,
  isLoading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="460px"
      footer={
        <>
          <button
            className="admin-btn admin-btn-secondary"
            type="button"
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </button>
          <button
            className={`admin-btn ${isDestructive ? "admin-btn-danger" : "admin-btn-primary"}`}
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Traitement…" : confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ margin: "8px 0 16px 0", lineHeight: 1.5, color: "var(--muted)" }}>{message}</p>
    </Modal>
  );
}
