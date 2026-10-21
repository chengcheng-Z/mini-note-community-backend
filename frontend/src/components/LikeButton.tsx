import { formatCount } from "@/lib/format";
import HeartIcon from "./HeartIcon";
import styles from "./LikeButton.module.css";

export default function LikeButton({
  liked,
  count,
  pending = false,
  onToggle,
}: {
  liked: boolean;
  count: number;
  pending?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={liked ? "取消点赞" : "点赞"}
      aria-pressed={liked}
      className={liked ? `${styles.button} ${styles.liked}` : styles.button}
      disabled={pending}
      onClick={onToggle}
    >
      <HeartIcon filled={liked} />
      <span data-testid="like-count">{formatCount(count)}</span>
    </button>
  );
}
