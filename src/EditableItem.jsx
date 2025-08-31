import { useState } from "react";

export default function EditableItem({ item, onDelete, onUpdate, onAddToBoq }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(item);

  function save() {
    if (!draft.name || isNaN(Number(draft.price))) {
      alert("Item must have a name and a valid price");
      return;
    }
    onUpdate({ ...draft, price: Number(draft.price) });
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <li
        style={{
          border: "1px solid #ddd",
          padding: 8,
          borderRadius: 6,
          marginBottom: 6,
        }}
      >
        <input
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="Name"
        />
        <input
          value={draft.price}
          onChange={(e) => setDraft({ ...draft, price: e.target.value })}
          placeholder="Price"
        />
        <input
          value={draft.brand || ""}
          onChange={(e) => setDraft({ ...draft, brand: e.target.value })}
          placeholder="Brand"
        />
        <input
          value={draft.tags?.join(", ") || ""}
          onChange={(e) =>
            setDraft({
              ...draft,
              tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
            })
          }
          placeholder="Tags (comma separated)"
        />
        <div style={{ marginTop: 4 }}>
          <button onClick={save}>Save</button>
          <button onClick={() => setIsEditing(false)} style={{ marginLeft: 4 }}>
            Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <li
      style={{
        border: "1px solid #ddd",
        padding: 8,
        borderRadius: 6,
        marginBottom: 6,
      }}
    >
      <div>
        <div style={{ fontWeight: 600 }}>{item.name}</div>
        <div style={{ fontSize: 12, color: "#6b7280" }}>
          {item.brand || "—"}
          {item.tags?.length ? ` • ${item.tags.join(", ")}` : ""}
        </div>
        {item.props && (
          <div style={{ fontSize: 11, color: "#4b5563", marginTop: 4 }}>
            {Object.entries(item.props).map(([k, v]) => (
              <div key={k}>
                <strong>{k}:</strong> {v}
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
        <button onClick={() => onAddToBoq(item)}>Add</button>
        <button onClick={() => setIsEditing(true)}>Edit</button>
        <button onClick={() => onDelete(item.id)}>Delete</button>
      </div>
    </li>
  );
}
