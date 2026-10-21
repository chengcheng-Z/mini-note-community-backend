import styles from "./states.module.css";

export function FeedSkeleton({ count = 10 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          data-testid="feed-skeleton"
          className={styles.skeleton}
        >
          <div className={styles.skeletonCover} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLineShort} />
        </div>
      ))}
    </>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className={styles.state}>
      <div className={styles.stateDot} aria-hidden="true" />
      <h2 className={styles.stateTitle}>{title}</h2>
      {description && <p className={styles.stateText}>{description}</p>}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className={styles.state}>
      <h2 className={styles.stateTitle}>{message}</h2>
      <button type="button" className={styles.retryButton} onClick={onRetry}>
        重试
      </button>
    </div>
  );
}
