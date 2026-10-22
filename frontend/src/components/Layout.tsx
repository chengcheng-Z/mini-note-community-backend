import { Link, Outlet } from "react-router-dom";
import SideBar from "@/components/SideBar";
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
      <div className={styles.body}>
        <SideBar />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
      <TabBar />
    </div>
  );
}
