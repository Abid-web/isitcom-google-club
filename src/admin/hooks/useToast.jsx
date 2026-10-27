import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback(id => {
    setToasts(current => current.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    setToasts(current => [...current, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div className="admin-toast-container" aria-live="polite">
        {toasts.map(toast => (
          <div key={toast.id} className={`admin-toast admin-toast-${toast.type}`} role="status">
            <span className="admin-toast-icon">
              {toast.type === "success" && "✓"}
              {toast.type === "error" && "✕"}
              {toast.type === "warning" && "!"}
              {toast.type === "info" && "ℹ"}
            </span>
            <span className="admin-toast-message">{toast.message}</span>
            <button
              className="admin-toast-close"
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Fermer la notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
