import { Link, useLocation, useSearchParams } from "react-router-dom";
import styles from "./SideBar.module.css";

function Icon({ name }: { name: string }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "compass") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
      </svg>
    );
  }

  if (name === "video") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m10 9 5 3-5 3V9Z" />
      </svg>
    );
  }

  if (name === "note") {
    return (
      <svg {...common}>
        <rect x="4" y="3" width="16" height="18" rx="3" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    );
  }

  if (name === "live") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="2.5" />
        <path d="M7.5 16.5a6 6 0 0 1 0-9M16.5 7.5a6 6 0 0 1 0 9" />
        <path d="M4.5 19.5a10 10 0 0 1 0-15M19.5 4.5a10 10 0 0 1 0 15" />
      </svg>
    );
  }

  if (name === "plus") {
    return (
      <svg {...common}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

const TYPE_ITEMS = [
  { label: "发现", to: "/", type: "all", icon: "compass" },
  { label: "视频", to: "/?type=video", type: "video", icon: "video" },
  { label: "笔记", to: "/?type=note", type: "note", icon: "note" },
  { label: "直播", to: "/?type=live", type: "live", icon: "live" },
];

const ACTION_ITEMS = [
  { label: "发布", to: "/publish", icon: "plus" },
  { label: "我的", to: "/profile", icon: "user" },
];

export default function SideBar() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentType = searchParams.get("type") ?? "all";

  return (
    <aside className={styles.sidebar} aria-label="侧边导航">
      <Link to="/" className={styles.brand}>
        小哈书
      </Link>

      <nav className={styles.group}>
        {TYPE_ITEMS.map((item) => {
          const active =
            location.pathname === "/" && currentType === item.type;

          return (
            <Link
              key={item.label}
              to={item.to}
              className={active ? `${styles.item} ${styles.active}` : styles.item}
              aria-current={active ? "page" : undefined}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.spacer} />

      <nav className={styles.group}>
        {ACTION_ITEMS.map((item) => {
          const active = location.pathname === item.to;

          return (
            <Link
              key={item.label}
              to={item.to}
              className={active ? `${styles.item} ${styles.active}` : styles.item}
              aria-current={active ? "page" : undefined}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
