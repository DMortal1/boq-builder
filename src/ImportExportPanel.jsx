import { useRef } from "react";
import Papa from "papaparse";

export default function ImportExportPanel({ catalog, setCatalog }) {
  const fileRef = useRef(null);

  // Export as JSON
  function exportJson() {
    const blob = new Blob([JSON.stringify(catalog, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "items.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Export as CSV
  function exportCsv() {
    const rows = catalog.map((i) => ({
      id: i.id,
      name: i.name,
      price: i.price,
      brand: i.brand || "",
      tags: (i.tags || []).join("|"),
      props: JSON.stringify(i.props || {}),
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "items.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import JSON
  function importJson(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!Array.isArray(parsed)) throw new Error("Not an array");
        setCatalog(parsed);
      } catch {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  }

  // Import CSV
  function importCsv(file) {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const items = results.data.map((r) => ({
          id: String(r.id || crypto.randomUUID()),
          name: r.name || "",
          price: Number(r.price || 0),
          brand: r.brand || "",
          tags: r.tags ? r.tags.split("|") : [],
          props: r.props ? JSON.parse(r.props) : {},
        }));
        setCatalog(items.filter((i) => i.name && !isNaN(i.price)));
      },
    });
  }

  function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.name.endsWith(".json")) importJson(file);
    else if (file.name.endsWith(".csv")) importCsv(file);
    else alert("Please select a .json or .csv file");
    e.target.value = "";
  }

  return (
    <div style={{ marginTop: 16, borderTop: "1px dashed #ddd", paddingTop: 12 }}>
      <h3 style={{ marginBottom: 8 }}>Catalog Import / Export</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          onClick={() => fileRef.current.click()}
          style={{ padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: 6 }}
        >
          Import JSON/CSV
        </button>
        <button
          onClick={exportJson}
          style={{ padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: 6 }}
        >
          Export JSON
        </button>
        <button
          onClick={exportCsv}
          style={{ padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: 6 }}
        >
          Export CSV
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".json,.csv"
        style={{ display: "none" }}
        onChange={onFile}
      />
    </div>
  );
}
