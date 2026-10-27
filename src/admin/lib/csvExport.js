export function exportApplicationsToCSV(applications, filename = "candidatures-igc.csv") {
  if (!applications || applications.length === 0) return;

  const headers = [
    "ID",
    "Date de soumission",
    "Nom complet",
    "Email",
    "Année d'étude",
    "Filière",
    "Département souhaité",
    "Statut",
    "Motivation",
    "Notes internes",
  ];

  const escapeCSV = value => {
    if (value === null || value === undefined) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = applications.map(app => [
    escapeCSV(app.id),
    escapeCSV(new Date(app.created_at).toLocaleString("fr-FR")),
    escapeCSV(app.full_name),
    escapeCSV(app.email),
    escapeCSV(app.study_year),
    escapeCSV(app.field_of_study),
    escapeCSV(app.department),
    escapeCSV(app.status),
    escapeCSV(app.motivation || ""),
    escapeCSV(app.admin_notes || ""),
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
