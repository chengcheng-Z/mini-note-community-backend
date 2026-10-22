import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { FeedTab, NoteType } from "@/api/types";
import NoteFeed from "@/components/NoteFeed";
import { EmptyState } from "@/components/states";
import { useAuth } from "@/auth/useAuth";
import { saveHomeScroll } from "@/lib/scrollMemory";
import styles from "./HomePage.module.css";

const TABS: Array<{ key: FeedTab; label: string }> = [
  { key: "recommend", label: "推荐" },
  { key: "follow", label: "关注" },
];

const TYPE_CHIPS = [
  { value: "all", label: "全部" },
  { value: "video", label: "视频" },
  { value: "note", label: "笔记" },
  { value: "live", label: "直播" },
];

export default function HomePage() {
  const [tab, setTab] = useState<FeedTab>("recommend");
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const typeParam = searchParams.get("type") ?? "all";
  const noteType: NoteType | undefined =
    typeParam === "video" ? 1 : typeParam === "note" ? 0 : undefined;
  const isLive = typeParam === "live";

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

  function selectType(value: string) {
    const next = new URLSearchParams(searchParams);

    if (value === "all") {
      next.delete("type");
    } else {
      next.set("type", value);
    }

    setSearchParams(next, { replace: true });
  }

  const emptyTitle =
    typeParam === "video"
      ? "还没有视频"
      : typeParam === "note"
        ? "还没有笔记"
        : "还没有内容";

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

      <div className={styles.typeChips} role="tablist" aria-label="内容类型">
        {TYPE_CHIPS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={typeParam === item.value}
            className={
              typeParam === item.value
                ? `${styles.typeChip} ${styles.typeChipActive}`
                : styles.typeChip
            }
            onClick={() => selectType(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLive ? (
        <EmptyState
          title="直播功能准备中"
          description="后端暂未提供直播能力，先看看视频和笔记吧。"
        />
      ) : (
        <NoteFeed
          tab={tab}
          noteType={noteType}
          restoreScroll
          emptyTitle={emptyTitle}
        />
      )}
    </div>
  );
}
