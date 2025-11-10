// src/pages/Library.jsx
import React from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { songs as MASTER_SONGS } from "../data/songs";

/**
 * Library page
 *
 * Shows:
 *  - Saved playlists (from localStorage key: 'playlists')
 *  - Liked songs / favorites (from localStorage key: 'favorites')
 *
 * Props (optional):
 *  - onLoadPlaylist(playlistTracks) => parent can replace the queue (tracks can be array of ids or song objects)
 *  - onPlaySongById(id) => parent can play a specific song by id (useful to set global player index)
 */
export default function Library({ onLoadPlaylist, onPlaySongById }) {
  const [playlists, setPlaylists] = useLocalStorage("playlists", []);
  const [favorites, setFavorites] = useLocalStorage("favorites", []); // array of ids or song objects

  const handleLoad = (pl) => {
    if (onLoadPlaylist) {
      onLoadPlaylist(pl.tracks);
    } else {
      // fallback behavior: show a user hint
      alert(
        "Playlist loaded into Library view. To actually load it into the player, pass `onLoadPlaylist` prop from App."
      );
    }
  };

  const handleDeletePlaylist = (id) => {
    const ok = window.confirm("Delete this playlist? This cannot be undone.");
    if (!ok) return;
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  };

  const handleRemoveFavorite = (idOrObj) => {
    const id = typeof idOrObj === "object" ? idOrObj.id : idOrObj;
    setFavorites((prev) => prev.filter((f) => (typeof f === "object" ? f.id !== id : f !== id)));
  };

  const resolvedFavorites = favorites
    .map((f) => {
      if (typeof f === "string" || typeof f === "number") {
        return MASTER_SONGS.find((s) => s.id === f) || null;
      }
      // assume object with id/title...
      return MASTER_SONGS.find((s) => s.id === f.id) || f;
    })
    .filter(Boolean);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Your Library</h2>

      <section style={{ marginTop: 12 }}>
        <h3 style={{ marginBottom: 8 }}>Saved Playlists</h3>
        {playlists.length === 0 ? (
          <div style={{ color: "var(--muted)" }}>No playlists saved yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {playlists.map((pl) => (
              <div
                key={pl.id}
                className="card"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 12 }}
              >
                <div>
                  <strong>{pl.name}</strong>
                  <div style={{ color: "var(--muted)", fontSize: 13 }}>
                    {Array.isArray(pl.tracks) ? pl.tracks.length : 0} tracks —{" "}
                    {pl.createdAt ? new Date(pl.createdAt).toLocaleString() : ""}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => handleLoad(pl)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      background: "#2563eb",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Load
                  </button>

                  <button
                    onClick={() => {
                      if (onLoadPlaylist) {
                        // also start playing the first track if parent supports play-by-id
                        handleLoad(pl);
                        const first = (pl.tracks && pl.tracks[0]) || null;
                        if (first && onPlaySongById) {
                          const id = typeof first === "object" ? first.id : first;
                          onPlaySongById(id);
                        }
                      } else {
                        handleLoad(pl);
                      }
                    }}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      background: "var(--accent)",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Load & Play
                  </button>

                  <button
                    onClick={() => handleDeletePlaylist(pl.id)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: 20 }}>
        <h3 style={{ marginBottom: 8 }}>Liked Songs</h3>
        {resolvedFavorites.length === 0 ? (
          <div style={{ color: "var(--muted)" }}>No liked songs yet. ❤️</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {resolvedFavorites.map((s) => (
              <div
                key={s.id}
                className="card"
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10 }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <img src={s.cover} alt={s.title} style={{ width: 48, height: 48, borderRadius: 6, objectFit: "cover" }} />
                  <div>
                    <div style={{ fontWeight: 700 }}>{s.title}</div>
                    <div style={{ color: "var(--muted)", fontSize: 13 }}>{s.artist}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => {
                      if (onPlaySongById) onPlaySongById(s.id);
                      else alert("To play this song, pass an `onPlaySongById` prop from App.");
                    }}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      background: "var(--accent)",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Play
                  </button>

                  <button
                    onClick={() => handleRemoveFavorite(s.id)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
