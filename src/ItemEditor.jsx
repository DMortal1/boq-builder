import { useState } from "react";

export default function ItemEditor({ onSave }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [tags, setTags] = useState("");
  const [props, setProps] = useState({});

  function addProp() {
    setProps({ ...props, "": "" });
  }

  function updateProp(key, newKey, value) {
    const updated = { ...props };
    delete updated[key];
    updated[newKey] = value;
    setProps(updated);
  }

  function save() {
    if (!name || isNaN(Number(price))) {
      alert("Item must have a name and a valid price");
      return;
    }
    onSave({
      id: crypto.randomUUID(),
      name,
      price: Number(price),
      brand,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      props,
    });
    // reset form
    setName("");
    setPrice("");
    setBrand("");
    setTags("");
    setProps({});
  }

  return (
    <div style={{ borderTop: "1px solid #ddd", marginTop: 16, paddingTop: 12 }}>
      <h3>Add Item</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <input
          placeholder="Name*"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Price*"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <input
          placeholder="Brand"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />
        <input
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />

        <div>
          <strong>Properties:</strong>
          {Object.entries(props).map(([k, v]) => (
            <div key={k} style={{ display: "flex", gap: 4, marginTop: 4 }}>
              <input
                placeholder="Key"
                value={k}
                onChange={(e) => updateProp(k, e.target.value, v)}
              />
              <input
                placeholder="Value"
                value={v}
                onChange={(e) => updateProp(k, k, e.target.value)}
              />
            </div>
          ))}
          <button onClick={addProp} style={{ marginTop: 6 }}>
            + Add Property
          </button>
        </div>

        <button onClick={save} style={{ marginTop: 8 }}>
          Save Item
        </button>
      </div>
    </div>
  );
}
