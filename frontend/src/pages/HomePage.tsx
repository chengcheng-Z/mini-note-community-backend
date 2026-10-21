import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { FeedTab } from "@/api/types";
import NoteFeed from "@/components/NoteFeed";
import { useAuth } from "@/auth/useAuth";
import { saveHomeScroll } from "@/lib/scrollMemory";
import styles from "./HomePage.module.css";

const TABS: Array<{ key: FeedTab; label: string }> = [
  { key: "recommend", label: "推荐" },
  { key: "follow", label: "关注" },
];

export default function HomePage() {
  const [tab, setTab] = useState<FeedTab>("recommend");
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function handleScroll() {
      saveHomeScroll(window.scrollY);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function selectTab(nextTab: FeedTab) {
    if (nextTab === "follow" && !isLoggedIn) {
      navigate("/login?redirect=%2F");
      return;
    }

    setTab(nextTab);
  }

  return (
    <div className={styles.page}>
      <h1 className="sr-only">首页</h1>

      <div className={styles.tabs} role="tablist" aria-label="内容分类">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            className={
              tab === item.key ? `${styles.tab} ${styles.active}` : styles.tab
            }
            onClick={() => selectTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <NoteFeed tab={tab} restoreScroll />
    </div>
  );
}
