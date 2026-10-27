export default function Pagination({ page, totalPages, totalItems, pageSize, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="admin-pagination">
      <span>
        Affichage de <strong>{(page - 1) * pageSize + 1}</strong> à{" "}
        <strong>{Math.min(page * pageSize, totalItems)}</strong> sur{" "}
        <strong>{totalItems}</strong> éléments
      </span>

      <div className="admin-pagination-controls">
        <button
          className="admin-btn admin-btn-secondary admin-btn-sm"
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          ← Précédent
        </button>

        <span style={{ display: "inline-flex", alignItems: "center", padding: "0 8px", fontWeight: 600 }}>
          {page} / {totalPages}
        </span>

        <button
          className="admin-btn admin-btn-secondary admin-btn-sm"
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
