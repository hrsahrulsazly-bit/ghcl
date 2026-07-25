"use client";

import { useEffect, useState } from "react";

function faviconUrl(url) {
  try {
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?sz=128&domain=${hostname}`;
  } catch {
    return null;
  }
}

function initials(title) {
  return (title || "?").trim().charAt(0).toUpperCase();
}

function LogoCard({ link, editable, onDelete }) {
  const [imgFailed, setImgFailed] = useState(false);
  const logo = faviconUrl(link.url);

  return (
    <div className="logo-card">
      {editable && (
        <button
          className="logo-delete"
          onClick={() => onDelete(link.id)}
          aria-label={`Padam ${link.title}`}
          title="Padam"
        >
          ×
        </button>
      )}
      <a className="logo-link" href={link.url} target="_blank" rel="noopener noreferrer">
        <span className="logo-icon">
          {logo && !imgFailed ? (
            <img src={logo} alt="" onError={() => setImgFailed(true)} />
          ) : (
            <span className="logo-fallback">{initials(link.title)}</span>
          )}
        </span>
        <span className="logo-title">{link.title}</span>
      </a>
    </div>
  );
}

export default function LinkDashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [authed, setAuthed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [addError, setAddError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLinks();
    checkAuth();
  }, []);

  async function loadLinks() {
    setLoading(true);
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      setLinks(data);
    } catch {
      setListError("Gagal memuatkan senarai link");
    } finally {
      setLoading(false);
    }
  }

  async function checkAuth() {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setAuthed(!!data.authenticated);
    } finally {
      setAuthChecked(true);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Log masuk gagal");
        return;
      }
      setAuthed(true);
      setLoginPassword("");
    } catch {
      setLoginError("Log masuk gagal");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthed(false);
  }

  async function handleAdd(e) {
    e.preventDefault();
    setAddError("");
    setSaving(true);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error || "Gagal menambah link");
        return;
      }
      setLinks((prev) => [data, ...prev]);
      setTitle("");
      setUrl("");
    } catch {
      setAddError("Gagal menambah link");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    await fetch(`/api/links/${id}`, { method: "DELETE" });
  }

  return (
    <div className="page">
      <div className="container">
        <h1>Combine Link</h1>
        <p className="subtitle">Klik logo untuk buka page.</p>

        {loading ? (
          <p className="empty">Memuatkan...</p>
        ) : listError ? (
          <p className="empty">{listError}</p>
        ) : links.length === 0 ? (
          <p className="empty">Belum ada link.</p>
        ) : (
          <div className="logo-grid">
            {links.map((link) => (
              <LogoCard key={link.id} link={link} editable={authed} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {authed && (
          <form className="add-form" onSubmit={handleAdd}>
            <h2>Tambah Link</h2>
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
            {addError && <div className="error">{addError}</div>}
          </form>
        )}
      </div>

      <div className="admin-bar">
        {!authChecked ? null : authed ? (
          <div className="admin-status">
            <span>Log masuk sebagai Admin</span>
            <button className="ghost-btn" onClick={handleLogout}>
              Log keluar
            </button>
          </div>
        ) : (
          <form className="admin-login" onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Admin password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
            <button type="submit" disabled={loggingIn}>
              {loggingIn ? "..." : "Log masuk"}
            </button>
            {loginError && <span className="error">{loginError}</span>}
          </form>
        )}
      </div>
    </div>
  );
}
