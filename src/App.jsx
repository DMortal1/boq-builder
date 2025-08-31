import { useState, useEffect } from "react";

import sampleItems from "./data/sampleItems.json";
import ImportExportPanel from "./ImportExportPanel";
import ItemEditor from "./ItemEditor";
import EditableItem from "./EditableItem";

export default function App() {
  const [catalog, setCatalog] = useState(sampleItems);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  
  // BOQ lines
  const [lines, setLines] = useState([]);
  
  // Load saved state from localStorage on mount
  useEffect(() => {
    const savedCatalog = localStorage.getItem("catalog");
    const savedLines = localStorage.getItem("boq");
    if (savedCatalog) setCatalog(JSON.parse(savedCatalog));
    if (savedLines) setLines(JSON.parse(savedLines));
  }, []);

  // Save whenever data changes
  useEffect(() => {
    localStorage.setItem("catalog", JSON.stringify(catalog));
  }, [catalog]);
  useEffect(() => {
    localStorage.setItem("boq", JSON.stringify(lines));
  }, [lines]);

  // Add item (if already in BOQ, just bump quantity)
  function addToBoq(item) {
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.itemId === item.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [
        ...prev,
        { itemId: item.id, name: item.name, unitPrice: item.price, quantity: 1 },
      ];
    });
  }

  function updateQty(itemId, qty) {
    setLines((prev) =>
      prev.map((l) => (l.itemId === itemId ? { ...l, quantity: qty } : l))
    );
  }

  function removeLine(itemId) {
    setLines((prev) => prev.filter((l) => l.itemId !== itemId));
  }

  const total = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);

  //

  async function exportPdf() {
    const { default: jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    doc.text("Bill of Quantities", 14, 16);

    const body = lines.map((l) => [
      l.name,
      String(l.quantity),
      l.unitPrice.toLocaleString(),
      (l.unitPrice * l.quantity).toLocaleString(),
    ]);

    autoTable(doc, {
      head: [["Item", "Qty", "Unit Price", "Subtotal"]],
      body,
      foot: [
        [
          { content: "Total", colSpan: 3, styles: { halign: "right" } },
          total.toLocaleString(),
        ],
      ],
      startY: 22,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [40, 40, 40] },
    });

    doc.save("boq.pdf");
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "100vh" }}>
      {/* Left: catalog */}
      <div style={{ padding: 12, borderRight: "1px solid #eee", overflow: "auto" }}>
        <div style={{ marginBottom: 8, display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6 }}
          />
          <input
            type="text"
            placeholder="Filter tag..."
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            style={{ flex: 1, padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6 }}
          />
        </div>

        <h2 style={{ marginBottom: 8 }}>Catalog</h2>
        <ul style={{ display: "grid", gap: 8, listStyle: "none", padding: 0, margin: 0 }}>
          {catalog
            .filter((item) => {
              const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
              const matchesTag =
                !tagFilter ||
                (item.tags && item.tags.some((t) =>
                  t.toLowerCase().includes(tagFilter.toLowerCase())
                ));
              return matchesSearch && matchesTag;
            })
            .map((item) => (
              <EditableItem
                key={item.id}
                item={item}
                onAddToBoq={(item) => addToBoq(item)}
                onDelete={(id) => setCatalog(catalog.filter((i) => i.id !== id))}
                onUpdate={(updated) =>
                  setCatalog(catalog.map((i) => (i.id === updated.id ? updated : i)))
                }
              />
          ))}
        </ul>
        <ImportExportPanel catalog={catalog} setCatalog={setCatalog} />
        <ItemEditor onSave={(item) => setCatalog([...catalog, item])} />
      </div>

      {/* Right: BOQ preview */}
      <div style={{ padding: 12, overflow: "auto" }}>
        <button onClick={exportPdf}
          style={{ padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: 6, marginBottom: 12 }}>
          Export PDF
        </button>

        <h2 style={{ marginBottom: 8 }}>BOQ Preview</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Item</th>
              <th style={th}>Qty</th>
              <th style={th}>Unit Price</th>
              <th style={th}>Subtotal</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.itemId}>
                <td style={td}>{line.name}</td>
                <td style={td}>
                  <input
                    type="number"
                    min={0}
                    value={line.quantity}
                    onChange={(e) => updateQty(line.itemId, Number(e.target.value))}
                    style={{ width: 60 }}
                  />
                </td>
                <td style={td}>{line.unitPrice.toLocaleString()}</td>
                <td style={td}>
                  {(line.unitPrice * line.quantity).toLocaleString()}
                </td>
                <td style={td}>
                  <button onClick={() => removeLine(line.itemId)}>Remove</button>
                </td>
              </tr>
            ))}
            {lines.length === 0 && (
              <tr>
                <td style={td} colSpan={5}>
                  No items yet. Add from the left.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td style={td} colSpan={3} align="right">
                <strong>Total</strong>
              </td>
              <td style={td}>
                <strong>{total.toLocaleString()}</strong>
              </td>
              <td style={td}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

const th = { textAlign: "left", borderBottom: "1px solid #e5e7eb", padding: 8 };
const td = { borderBottom: "1px solid #f3f4f6", padding: 8 };
