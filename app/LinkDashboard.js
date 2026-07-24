"use client";

import { useEffect, useState } from "react";

export default function LinkDashboard() {
  const [links, setLinks] = useState([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLinks();
  }, []);

  async function loadLinks() {
    setLoading(true);
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      setLinks(data);
    } catch {
      setError("Gagal memuatkan senarai link");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menambah link");
        return;
      }
      setLinks((prev) => [data, ...prev]);
      setTitle("");
      setUrl("");
    } catch {
      setError("Gagal menambah link");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    await fetch(`/api/links/${id}`, { method: "DELETE" });
  }

  return (
    <div className="container">
      <h1>Combine Link</h1>
      <p className="subtitle">Tambah dan urus semua link anda di satu tempat.</p>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <input
            placeholder="Nama page (contoh: Coaching 4.0)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="row">
          <input
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <button type="submit" disabled={saving}>
            {saving ? "Menambah..." : "Tambah"}
          </button>
        </div>
        {error && <div className="error">{error}</div>}
      </form>

      {loading ? (
        <p className="empty">Memuatkan...</p>
      ) : links.length === 0 ? (
        <p className="empty">Belum ada link. Tambah satu di atas.</p>
      ) : (
        <ul>
          {links.map((link) => (
            <li key={link.id}>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.title}
                <div className="url">{link.url}</div>
              </a>
              <button className="delete-btn" onClick={() => handleDelete(link.id)}>
                Padam
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
