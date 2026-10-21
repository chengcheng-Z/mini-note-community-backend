import { useEffect, useRef, useState } from "react";
import styles from "./VideoPlayer.module.css";

export default function VideoPlayer({
  src,
  poster,
  title,
}: {
  src: string;
  poster?: string;
  title: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const isHls = /\.m3u8(\?|$)/i.test(src);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !isHls) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      return;
    }

    let cancelled = false;
    let destroy: (() => void) | undefined;

    void import("hls.js")
      .then(({ default: Hls }) => {
        if (cancelled || !Hls.isSupported()) {
          return;
        }

        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, () => setFailed(true));
        destroy = () => hls.destroy();
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [isHls, src]);

  if (failed) {
    return (
      <div className={styles.error} role="alert">
        视频加载失败，请稍后重试
        <button type="button" onClick={() => setFailed(false)}>
          重试
        </button>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      data-testid="detail-video"
      className={styles.video}
      src={isHls ? undefined : src}
      poster={poster}
      controls
      playsInline
      preload="metadata"
      aria-label={title}
      onError={() => setFailed(true)}
    />
  );
}
