import styles from "./FollowButton.module.css";

export default function FollowButton({
  following,
  pending = false,
  onToggle,
}: {
  following: boolean;
  pending?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={following}
      className={
        following ? `${styles.button} ${styles.following}` : styles.button
      }
      disabled={pending}
      onClick={onToggle}
    >
      {following ? "已关注" : "关注"}
    </button>
  );
}
