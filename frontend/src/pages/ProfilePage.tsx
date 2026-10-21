import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/api/client";
import { fetchMe } from "@/api/users";
import NoteFeed from "@/components/NoteFeed";
import { EmptyState, ErrorState } from "@/components/states";
import { useRelationList } from "@/hooks/useRelationList";
import { useAuth } from "@/auth/useAuth";
import styles from "./ProfilePage.module.css";

type ProfileTab = "notes" | "following" | "fans";

const TABS: Array<{ key: ProfileTab; label: string }> = [
  { key: "notes", label: "笔记" },
  { key: "following", label: "关注" },
  { key: "fans", label: "粉丝" },
];

function UserList({
  kind,
  userId,
}: {
  kind: "following" | "fans";
  userId: number;
}) {
  const list = useRelationList(kind, userId);
  const users = list.data?.pages.flatMap((page) => page.data) ?? [];

  if (list.isPending) {
    return <p className={styles.loading}>加载中...</p>;
  }

  if (list.isError) {
    const message =
      list.error instanceof ApiError ? list.error.message : "加载失败";
    return <ErrorState message={message} onRetry={() => void list.refetch()} />;
  }

  if (users.length === 0) {
    return (
      <EmptyState
        title={kind === "following" ? "还没有关注的人" : "还没有粉丝"}
        description={
          kind === "following"
            ? "去首页看看，遇到喜欢的作者就关注吧。"
            : "发布优质内容，会有人来关注你的。"
        }
      />
    );
  }

  return (
    <div className={styles.userList}>
      {users.map((user) => (
        <div key={user.userId} className={styles.userRow}>
          <img
            className={styles.userAvatar}
            src={user.avatar}
            alt=""
            loading="lazy"
          />
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.nickname}</span>
            {user.introduction && (
              <span className={styles.userIntro}>{user.introduction}</span>
            )}
          </div>
          {kind === "fans" && user.fansTotal !== undefined && (
            <span className={styles.userMeta}>{user.fansTotal} 粉丝</span>
          )}
        </div>
      ))}

      {list.hasNextPage && (
        <button
          type="button"
          className={styles.loadMore}
          disabled={list.isFetchingNextPage}
          onClick={() => void list.fetchNextPage()}
        >
          {list.isFetchingNextPage ? "加载中..." : "加载更多"}
        </button>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const [tab, setTab] = useState<ProfileTab>("notes");
  const { logout } = useAuth();
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
  });

  return (
    <div className={styles.page}>
      <h1 className="sr-only">我的</h1>

      {meQuery.isPending && <div className={styles.headerSkeleton} />}

      {meQuery.isError && (
        <ErrorState
          message={
            meQuery.error instanceof ApiError
              ? meQuery.error.message
              : "用户信息加载失败"
          }
          onRetry={() => void meQuery.refetch()}
        />
      )}

      {meQuery.data && (
        <header className={styles.header}>
          <img
            className={styles.avatar}
            src={meQuery.data.avatar}
            alt=""
            loading="lazy"
          />
          <div className={styles.info}>
            <h2 className={styles.nickname}>{meQuery.data.nickName}</h2>
            {meQuery.data.introduction && (
              <p className={styles.introduction}>
                {meQuery.data.introduction}
              </p>
            )}
          </div>
          <button
            type="button"
            className={styles.logout}
            onClick={() => void logout()}
          >
            退出登录
          </button>
        </header>
      )}

      <div className={styles.tabs} role="tablist" aria-label="个人主页分类">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            className={
              tab === item.key ? `${styles.tab} ${styles.active}` : styles.tab
            }
            onClick={() => setTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "notes" && (
        <NoteFeed
          tab="mine"
          emptyTitle="还没有发布过笔记"
          emptyDescription="点击底部发布，分享你的第一篇笔记。"
        />
      )}

      {tab === "following" && meQuery.data && (
        <UserList kind="following" userId={meQuery.data.id} />
      )}

      {tab === "fans" && meQuery.data && (
        <UserList kind="fans" userId={meQuery.data.id} />
      )}
    </div>
  );
}
