import { NavLink } from "react-router-dom";
import styles from "./TabBar.module.css";

const tabs = [
  { to: "/", label: "首页" },
  { to: "/publish", label: "发布" },
  { to: "/profile", label: "我的" },
];

export default function TabBar() {
  return (
    <nav className={styles.tabbar} aria-label="主导航">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === "/"}
          className={({ isActive }) =>
            isActive ? `${styles.tab} ${styles.active}` : styles.tab
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
