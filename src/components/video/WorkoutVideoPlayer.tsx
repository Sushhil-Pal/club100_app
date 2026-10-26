import { useEffect, useRef, useState } from "react";
import "./WorkoutVideoPlayer.css";

type Props = { videoUrl: string; title?: string };

/** Only known YouTube URL formats are embedded; unsupported links are not rendered. */
function youtubeId(value: string): string | null {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    let id: string | null = null;
    if (host === "youtu.be" || host === "www.youtu.be") {
      id = url.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(host)) {
      if (url.pathname === "/watch") id = url.searchParams.get("v");
      else if (/^\/(embed|shorts|live)\//.test(url.pathname)) id = url.pathname.split("/")[2] ?? null;
    }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}

/**
 * Android's embedded YouTube fullscreen transition can crop the video.
 * Use the browser Fullscreen API on our 16:9 video *container* instead.
 * Other platforms retain the native YouTube fullscreen control.
 */
export default function WorkoutVideoPlayer({ videoUrl, title = "Club100 Workout" }: Props) {
  const id = youtubeId(videoUrl);
  const isAndroid = typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAndroid) return;
    const syncFullscreenState = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, [isAndroid]);

  async function toggleFullscreen() {
    const container = containerRef.current;
    if (!container) return;
    setFullscreenError(null);
    try {
      if (document.fullscreenElement === container) {
        await document.exitFullscreen();
      } else if (document.fullscreenElement) {
        setFullscreenError("Exit the other full-screen view first.");
      } else if (container.requestFullscreen) {
        await container.requestFullscreen();
      } else {
        setFullscreenError("Full-screen mode is unavailable in this browser.");
      }
    } catch {
      setFullscreenError("Full-screen mode was blocked by the browser. Try Chrome on Android.");
    }
  }

  if (!id) return <p className="mt-3 text-sm text-amber-300">This workout does not have a supported YouTube video link.</p>;

  return (
    <div className="mt-4">
      <div ref={containerRef} className="club100-video-shell overflow-hidden rounded-xl bg-black">
        <div className="club100-video-frame aspect-video w-full">
          <iframe
            key={id}
            className="block h-full w-full border-0"
            src={`https://www.youtube-nocookie.com/embed/${id}?playsinline=1&fs=${isAndroid ? 0 : 1}&rel=0`}
            title={title}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        {isAndroid && (
          <div className="club100-video-toolbar flex justify-end px-3 py-2">
            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              aria-label={isFullscreen ? "Exit full-screen video" : "View video full screen"}
              className="rounded-lg border border-white/30 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {isFullscreen ? "Exit full screen" : "Full screen"}
            </button>
          </div>
        )}
      </div>
      {fullscreenError && <p role="alert" className="mt-2 text-sm text-amber-300">{fullscreenError}</p>}
    </div>
  );
}
