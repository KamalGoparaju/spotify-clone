// src/components/Player.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import { formatTime } from "../utils/timeFormat";
import useLocalStorage from "../hooks/useLocalStorage";

export default function Player({ tracks, currentIndex, setCurrentIndex }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useLocalStorage("player:volume", 1);
  const [isMuted, setIsMuted] = useLocalStorage("player:muted", false);

  // shuffle + repeat persisted
  const [shuffle, setShuffle] = useLocalStorage("player:shuffle", false);
  // repeatMode: 'none' | 'one' | 'all'
  const [repeatMode, setRepeatMode] = useLocalStorage("player:repeat", "none");

  const current = tracks[currentIndex];

  // load new track when currentIndex changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    // reload src
    audio.load();
    setProgress(0);
    setDuration(0);
    if (isPlaying) {
      const p = audio.play();
      if (p && p.catch) p.catch(() => setIsPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // play / pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      const p = audio.play();
      if (p && p.catch) p.catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // volume sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : Math.max(0, Math.min(1, volume));
  }, [volume, isMuted]);

  // stable next/prev handlers that respect shuffle & repeat
  const handleNext = useCallback(() => {
    if (repeatMode === "one") {
      // replay same track
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => setIsPlaying(false));
      }
      return;
    }

    if (shuffle) {
      // pick a random index different from current
      if (tracks.length === 1) return;
      let next;
      do {
        next = Math.floor(Math.random() * tracks.length);
      } while (next === currentIndex && tracks.length > 1);
      setCurrentIndex(next);
      setIsPlaying(true);
      return;
    }

    // no shuffle
    setCurrentIndex((i) => {
      const next = i + 1;
      if (next >= tracks.length) {
        // reached end
        if (repeatMode === "all") return 0; // loop to start
        // if repeat none -> stop playing
        setIsPlaying(false);
        return i; // stay on last
      }
      return next;
    });
    setIsPlaying(true);
  }, [tracks.length, shuffle, currentIndex, repeatMode, setCurrentIndex]);

  const handlePrev = useCallback(() => {
    // if played less than 3 seconds, go to previous, else jump to start
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setProgress(0);
      return;
    }

    if (shuffle) {
      if (tracks.length === 1) return;
      let prev;
      do {
        prev = Math.floor(Math.random() * tracks.length);
      } while (prev === currentIndex && tracks.length > 1);
      setCurrentIndex(prev);
      setIsPlaying(true);
      return;
    }

    setCurrentIndex((i) => (i - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  }, [tracks.length, shuffle, currentIndex, setCurrentIndex]);

  // audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => {
      const d = audio.duration;
      if (!isNaN(d) && isFinite(d)) setDuration(d);
    };
    const onTime = () => setProgress(audio.currentTime || 0);
    const onEnd = () => handleNext();

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
    };
  }, [handleNext, currentIndex]);

  const handleSeek = (e) => {
    const v = Number(e.target.value || 0);
    const audio = audioRef.current;
    if (!audio || duration === 0) return;
    const c = Math.max(0, Math.min(duration, v));
    audio.currentTime = c;
    setProgress(c);
  };

  // keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      // don't trigger shortcuts while typing in inputs
      const targetTag = e.target && e.target.tagName;
      if (targetTag === "INPUT" || targetTag === "TEXTAREA") return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          setIsPlaying((p) => !p);
          break;
        case "ArrowRight": {
          const audio = audioRef.current;
          if (!audio) return;
          audio.currentTime = Math.min((audio.currentTime || 0) + 5, duration || Number.MAX_SAFE_INTEGER);
          break;
        }
        case "ArrowLeft": {
          const audio = audioRef.current;
          if (!audio) return;
          audio.currentTime = Math.max((audio.currentTime || 0) - 5, 0);
          break;
        }
        case "ArrowUp": {
          setVolume((v) => Math.min(1, +(v + 0.05).toFixed(2)));
          break;
        }
        case "ArrowDown": {
          setVolume((v) => Math.max(0, +(v - 0.05).toFixed(2)));
          break;
        }
        case "n":
        case "N":
          handleNext();
          break;
        case "p":
        case "P":
          handlePrev();
          break;
        default:
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [duration, handleNext, handlePrev, setVolume]);

  return (
    <div>
      <audio ref={audioRef} src={current.audioUrl} preload="metadata" />
      <div className="footer-player card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* left: now playing */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <img src={current.cover} alt="cover" style={{ width: 64, height: 64, borderRadius: 8 }} />
          <div>
            <div style={{ fontWeight: 800 }}>{current.title}</div>
            <div style={{ color: "var(--muted)" }}>{current.artist}</div>
          </div>
        </div>

        {/* center: controls */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, marginLeft: 12 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
            <button
              title="Shuffle (S)"
              onClick={() => setShuffle((s) => !s)}
              style={{ background: shuffle ? "rgba(29,185,84,0.2)" : "transparent", borderRadius: 6 }}
            >
              🔀
            </button>

            <button onClick={handlePrev} aria-label="Previous">
              ⏮
            </button>

            <button onClick={() => setIsPlaying((p) => !p)} aria-label="Play/Pause">
              {isPlaying ? "⏸" : "▶️"}
            </button>

            <button onClick={handleNext} aria-label="Next">
              ⏭
            </button>

            <button
              title={`Repeat mode: ${repeatMode} (click to toggle)`}
              onClick={() =>
                setRepeatMode((r) => (r === "none" ? "all" : r === "all" ? "one" : "none"))
              }
              style={{ background: repeatMode === "none" ? "transparent" : "rgba(29,185,84,0.15)", borderRadius: 6 }}
            >
              {repeatMode === "one" ? "🔁 1" : "🔁"}
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 48, textAlign: "center" }}>{formatTime(progress)}</div>
            <input
              className="range"
              type="range"
              min={0}
              max={duration || 0}
              value={progress}
              onChange={handleSeek}
              aria-label="Seek"
            />
            <div style={{ width: 48, textAlign: "center" }}>{formatTime(duration)}</div>
          </div>
        </div>

        {/* right: volume */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setIsMuted((m) => !m)}>{isMuted ? "🔇" : "🔊"}</button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Volume"
            style={{ width: 120 }}
          />
        </div>
      </div>
    </div>
  );
}
