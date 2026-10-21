import { useState } from "react";
import styles from "./ImageCarousel.module.css";

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d={direction === "left" ? "M15 5 8 12l7 7" : "M9 5l7 7-7 7"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ImageCarousel({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return <div className={styles.placeholder}>暂无图片</div>;
  }

  const current = Math.min(index, images.length - 1);

  function go(step: number) {
    setIndex((value) => {
      const next = value + step;
      return (next + images.length) % images.length;
    });
  }

  return (
    <div className={styles.carousel}>
      <img
        className={styles.image}
        src={images[current]}
        alt={`${title} 第 ${current + 1} 张`}
      />

      {images.length > 1 && (
        <>
          <button
            type="button"
            className={`${styles.arrow} ${styles.left}`}
            aria-label="上一张"
            onClick={() => go(-1)}
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            className={`${styles.arrow} ${styles.right}`}
            aria-label="下一张"
            onClick={() => go(1)}
          >
            <Chevron direction="right" />
          </button>
          <span className={styles.counter}>
            {current + 1} / {images.length}
          </span>
          <div className={styles.dots}>
            {images.map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                className={
                  dotIndex === current
                    ? `${styles.dot} ${styles.dotActive}`
                    : styles.dot
                }
                aria-label={`第 ${dotIndex + 1} 张`}
                aria-current={dotIndex === current}
                onClick={() => setIndex(dotIndex)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
