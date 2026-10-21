import { Link, Outlet } from "react-router-dom";
import TabBar from "@/components/TabBar";
import styles from "./Layout.module.css";

export default function Layout() {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          小哈书
        </Link>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}
