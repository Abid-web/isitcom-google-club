import { useEffect } from "react";

export default function Modal({ isOpen, onClose, title, children, footer, maxWidth = "580px" }) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = event => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className="admin-modal"
        style={{ maxWidth }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
      >
        <div className="admin-modal-header">
          <h3 id="admin-modal-title" style={{ margin: 0, fontSize: "1.15rem", fontFamily: "var(--display)" }}>
            {title}
          </h3>
          <button
            className="admin-btn-icon"
            type="button"
            onClick={onClose}
            aria-label="Fermer la boîte de dialogue"
          >
            ×
          </button>
        </div>
        <div className="admin-modal-body">{children}</div>
        {footer && <div className="admin-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
