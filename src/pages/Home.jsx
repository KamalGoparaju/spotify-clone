// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import TrackList from "../components/TrackList";
import PlaylistManager from "../components/PlaylistManager";
import { songs } from "../data/songs";

/**
 * Home page
 *
 * Props:
 * - onSelect(index) => set currently playing index in the global Player (index into `songs`)
 * - currentIndex => index of current playing track (unused here but helpful for active UI)
 */
export default function Home({ onSelect, currentIndex }) {
  // queue holds the list shown in the TrackList and what playlists save/load.
  const [queue, setQueue] = useState(songs);
  const [query, setQuery] = useState("");

  // Filter displayed tracks from the current queue using the search query
  const filtered = queue.filter((s) =>
    (s.title + " " + s.artist).toLowerCase().includes(query.toLowerCase())
  );

  // Helper: when user clicks a track in filtered list, convert that selection to an index in the master `songs` array
  const handleSelectFromFiltered = (filteredIndex) => {
    const selected = filtered[filteredIndex];
    if (!selected) return;
    const masterIndex = songs.findIndex((m) => m.id === selected.id);
    if (masterIndex !== -1) {
      onSelect(masterIndex);
    } else {
      // fallback: try to find by title/artist if id mismatch
      const fallback = songs.findIndex(
        (m) => m.title === selected.title && m.artist === selected.artist
      );
      if (fallback !== -1) onSelect(fallback);
    }
  };

  // When a playlist is loaded, PlaylistManager will call this with the saved tracks.
  // The saved `tracks` might be an array of song objects or an array of ids — handle both.
  const handleLoadPlaylist = (savedTracks) => {
    if (!Array.isArray(savedTracks) || savedTracks.length === 0) return;

    // normalize: if savedTracks items are primitives (id strings/numbers), map to full objects
    let normalized;
    if (typeof savedTracks[0] === "string" || typeof savedTracks[0] === "number") {
      normalized = savedTracks
        .map((id) => songs.find((s) => s.id === id))
        .filter(Boolean);
    } else {
      // assume array of song objects — try to map them to master song objects if possible
      normalized = savedTracks
        .map((t) => {
          const found = songs.find((s) => s.id === t.id);
          return found || t; // keep original object if not in master list
        })
        .filter(Boolean);
    }

    // set the queue to the loaded playlist
    setQueue(normalized);

    // if the first track exists in master `songs`, select it in the Player
    const first = normalized[0];
    if (first) {
      const masterIndex = songs.findIndex((m) => m.id === first.id);
      if (masterIndex !== -1) {
        onSelect(masterIndex);
      }
    }
  };

  return (
    <div>
      <SearchBar query={query} setQuery={setQuery} />

      <div style={{ marginTop: 12 }}>
        <TrackList
          tracks={filtered}
          currentIndex={
            // highlight active item in the filtered list if it's the current playing track
            // TrackList expects an index into `tracks` array, so calculate:
            (() => {
              const currentSong = songs[currentIndex];
              if (!currentSong) return -1;
              const idx = filtered.findIndex((t) => t.id === currentSong.id);
              return idx;
            })()
          }
          onSelect={handleSelectFromFiltered}
        />
      </div>

      <PlaylistManager tracks={queue} onLoadPlaylist={handleLoadPlaylist} />
    </div>
  );
}
