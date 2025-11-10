import React from "react";
import useLocalStorage from "../hooks/useLocalStorage";

/**
 * PlaylistManager Component
 * -------------------------
 * Features:
 * - Save current queue as a playlist.
 * - View existing playlists (from localStorage).
 * - Load a playlist (replace current queue).
 * - Delete a playlist.
 *
 * Props:
 *  - tracks: Array of song objects [{id, title, artist, ...}]
 *  - onLoadPlaylist: Function(playlistTracks) → replaces queue in parent
 */
export default function PlaylistManager({ tracks, onLoadPlaylist }) {
  const [playlists, setPlaylists] = useLocalStorage("playlists", []);

  const handleSave = () => {
    if (!tracks || tracks.length === 0) {
      alert("No songs in the queue to save!");
      return;
    }
    const name = prompt("Enter a playlist name:", `My Playlist ${playlists.length + 1}`);
    if (!name) return;
    const newPlaylist = {
      id: Date.now(),
      name,
      tracks,
      createdAt: new Date().toISOString(),
    };
    setPlaylists([...playlists, newPlaylist]);
  };

  const handleLoad = (pl) => {
    if (onLoadPlaylist) {
      onLoadPlaylist(pl.tracks);
    }
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this playlist?");
    if (confirmDelete) {
      setPlaylists(playlists.filter((p) => p.id !== id));
    }
  };

  return (
    <div
      className="card"
      style={{
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        background: "var(--panel)",
      }}
    >
      <h3 style={{ marginTop: 0 }}>🎵 Playlist Manager</h3>
      <button
        onClick={handleSave}
        style={{
          background: "var(--accent)",
          border: "none",
          padding: "8px 12px",
          borderRadius: 8,
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Save Current Queue
      </button>

      {playlists.length === 0 ? (
        <p style={{ color: "var(--muted)", marginTop: 10 }}>No playlists saved yet.</p>
      ) : (
        <div style={{ marginTop: 12 }}>
          {playlists.map((pl) => (
            <div
              key={pl.id}
              style={{
                padding: 10,
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong>{pl.name}</strong>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>
                  {pl.tracks.length} tracks
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => handleLoad(pl)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 6,
                    background: "#2563eb",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Load
                </button>
                <button
                  onClick={() => handleDelete(pl.id)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 6,
                    background: "#ef4444",
                    border: "none",
                    color: "#fff",
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
    </div>
  );
}
