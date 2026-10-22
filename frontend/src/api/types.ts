export type NoteType = 0 | 1;
export type FeedTab = "recommend" | "follow" | "mine";
export type LoginType = 1 | 2;

export type ResponseEnvelope<T> = {
  success: boolean;
  message?: string;
  errorCode?: string;
  data: T;
};

export type PageEnvelope<T> = ResponseEnvelope<T[]> & {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  totalPage: number;
};

export type UserInfo = {
  id: number;
  nickName: string;
  avatar: string;
  introduction?: string;
};

export type NoteCreator = Pick<UserInfo, "id" | "nickName" | "avatar">;

export type NoteFeedItem = {
  id: number;
  type: NoteType;
  title: string;
  cover: string;
  videoUri?: string;
  videoDuration?: number;
  creator: NoteCreator;
  likeCount: number;
  liked: boolean;
  createTime: string;
};

export type NoteDetail = {
  id: number;
  type: NoteType;
  title: string;
  content: string;
  imgUris: string[];
  videoUri?: string;
  topicId?: number;
  topicName?: string;
  creatorId: number;
  creatorName: string;
  avatar: string;
  updateTime: string;
  visible: 0 | 1;
  likeCount: number;
  liked: boolean;
  following: boolean;
};

export type FeedRequest = {
  pageNo: number;
  pageSize: number;
  tab: FeedTab;
  noteType?: NoteType;
};

export type LoginRequest =
  | { phone: string; type: 1; code: string }
  | { phone: string; type: 2; password: string };

export type PublishNoteRequest = {
  type: NoteType;
  imgUris?: string[];
  videoUri?: string;
  title?: string;
  content?: string;
  topicId?: number;
};
