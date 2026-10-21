import { post, postPage } from "./client";
import type {
  FeedRequest,
  NoteDetail,
  NoteFeedItem,
  PageEnvelope,
  PublishNoteRequest,
} from "./types";

export function fetchFeed(
  request: FeedRequest,
): Promise<PageEnvelope<NoteFeedItem>> {
  return postPage<NoteFeedItem>("/note/feed", request);
}

export function fetchNoteDetail(id: number): Promise<NoteDetail> {
  return post<NoteDetail>("/note/detail", { id });
}

export function likeNote(noteId: number): Promise<null> {
  return post<null>("/note/like", { noteId });
}

export function unlikeNote(noteId: number): Promise<null> {
  return post<null>("/note/unlike", { noteId });
}

export function fetchLikedStatus(
  noteIds: number[],
): Promise<Record<string, boolean>> {
  return post<Record<string, boolean>>("/note/liked/status", { noteIds });
}

export function publishNote(payload: PublishNoteRequest): Promise<null> {
  return post<null>("/note/publish", payload);
}
