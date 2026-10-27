import { useRef, useState } from "react";
import { uploadMedia } from "../lib/adminApi";
import { useToast } from "../hooks/useToast";

export default function ImageUploader({ value, onChange, folder = "uploads", label = "Image ou affiche" }) {
  const [uploading, setUploading] = useState(false);
  const [dragover, setDragover] = useState(false);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const handleFile = async file => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Veuillez sélectionner un fichier image valide.", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("L'image dépasse la limite maximale de 5 Mo.", "warning");
      return;
    }

    setUploading(true);
    try {
      const publicUrl = await uploadMedia(file, folder);
      onChange(publicUrl);
      showToast("Image téléversée avec succès sur Supabase Storage !", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Échec du téléversement de l'image.", "error");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = e => {
    e.preventDefault();
    setDragover(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="admin-field">
      <label className="admin-label">{label}</label>

      <div
        className={`admin-uploader-dropzone${dragover ? " dragover" : ""}`}
        onDragOver={e => { e.preventDefault(); setDragover(true); }}
        onDragLeave={() => setDragover(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {uploading ? (
          <div>Téléversement en cours vers Supabase Storage…</div>
        ) : (
          <div>
            <div style={{ fontSize: "1.8rem", marginBottom: "8px" }}>☁️</div>
            <strong>Glissez-déposez une image ici</strong> ou <span style={{ color: "var(--blue)" }}>parcourez vos fichiers</span>
            <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "4px" }}>
              PNG, JPG, WEBP, SVG jusqu'à 5 Mo
            </div>
          </div>
        )}
      </div>

      {value && (
        <div style={{ marginTop: "12px", position: "relative" }}>
          <img src={value} alt="Aperçu" className="admin-uploader-preview" />
          <button
            type="button"
            className="admin-btn admin-btn-danger admin-btn-sm"
            style={{ position: "absolute", top: "8px", right: "8px" }}
            onClick={e => { e.stopPropagation(); onChange(""); }}
          >
            Retirer
          </button>
        </div>
      )}
    </div>
  );
}
