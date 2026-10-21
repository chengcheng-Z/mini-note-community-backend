import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";
import type { NoteFeedItem } from "@/api/types";
import NoteCard from "./NoteCard";

const baseNote: NoteFeedItem = {
  id: 1001,
  type: 0,
  title: "周末去山里走了走",
  cover: "data:image/svg+xml,cover",
  creator: { id: 2, nickName: "山野小鹿", avatar: "data:image/svg+xml,avatar" },
  likeCount: 12000,
  liked: false,
  createTime: "2026-10-21T10:00:00",
};

function renderCard(note: NoteFeedItem) {
  return render(
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <NoteCard note={note} />
    </MemoryRouter>,
  );
}

describe("NoteCard", () => {
  test("renders an image card with title, author and like count", () => {
    renderCard(baseNote);

    expect(screen.getByText("周末去山里走了走")).toBeInTheDocument();
    expect(screen.getByText("山野小鹿")).toBeInTheDocument();
    expect(screen.getByText("1.2万")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/note/1001");

    const cover = screen.getByRole("img", { name: "周末去山里走了走" });
    expect(cover).toHaveAttribute("loading", "lazy");
  });

  test("renders a duration badge for video notes", () => {
    renderCard({
      ...baseNote,
      type: 1,
      videoUri: "https://example.com/video.mp4",
      videoDuration: 95,
    });

    expect(screen.getByTestId("note-video")).toBeInTheDocument();
    expect(screen.getByTestId("note-duration")).toHaveTextContent("01:35");
  });
});
