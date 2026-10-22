import type {
  FeedTab,
  NoteDetail,
  NoteFeedItem,
  PublishNoteRequest,
  UserInfo,
} from "@/api/types";

const PALETTES: Array<[string, string]> = [
  ["#fe2c55", "#5c0f22"],
  ["#25f4ee", "#0b3d3b"],
  ["#7b61ff", "#221b4d"],
  ["#ff9f43", "#4d2a08"],
  ["#ff4d8d", "#43122a"],
  ["#4dd0e1", "#0d3137"],
];

const VIDEO_URIS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
];

const TITLES = [
  "周末去山里走了走，空气好到不想回城",
  "新手也能做的番茄牛腩，一锅到底",
  "这套通勤穿搭我穿了整整一周",
  "第一次拍 vlog，记录普通的一天",
  "城市夜景随手拍，氛围感拉满",
  "30 平小家的收纳改造",
  "跑步一个月，身体发生的变化",
  "周末咖啡馆探店清单",
  "把阳台改成了小花园",
  "最近在读的三本书",
  "秋天第一件外套怎么选",
  "一个人的晚餐也要好好吃",
];

const CONTENTS = [
  "路线不难走，来回大概三个小时。沿途有很多可以停下来休息的地方，记得带够水。",
  "关键是小火慢炖，别频繁翻动。最后收汁的时候尝一下咸淡，按自己的口味调整。",
  "上衣选短款，下装高腰，颜色控制在三种以内，通勤和周末都能穿。",
  "第一次拍没有想象中难，先把想说的话写下来，再分段拍，剪辑会轻松很多。",
  "天黑之后找有反光的地面，画面会更有层次。手机专业模式把 ISO 调低一点。",
  "先把不常用的东西收进柜子，常用的按使用频率放在伸手可及的位置。",
  "前两周最难受，第三周开始适应。重点是别追求速度，先把频率稳定下来。",
  "这三家都在地铁站附近，工作日人少，适合带电脑坐一下午。",
  "阳台朝南，光照够。选了几种好养的植物，浇水频率记在手机提醒里。",
  "一本讲方法，一本讲案例，一本适合睡前慢慢看。读完再回来补详细笔记。",
  "优先选版型，其次看面料，最后再考虑颜色。试穿时记得搭平时常穿的鞋。",
  "一个人吃饭也可以认真一点，提前把菜备好，回家十分钟就能上桌。",
];

function svgCover(seed: number): string {
  const [from, to] = PALETTES[seed % PALETTES.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="600" height="800" fill="url(#g)"/><circle cx="${120 + ((seed * 37) % 340)}" cy="${180 + ((seed * 53) % 380)}" r="${90 + ((seed * 17) % 120)}" fill="rgba(255,255,255,0.14)"/><circle cx="${460 - ((seed * 29) % 280)}" cy="${620 - ((seed * 41) % 320)}" r="${60 + ((seed * 23) % 90)}" fill="rgba(37,244,238,0.18)"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function svgAvatar(seed: number): string {
  const [from, to] = PALETTES[seed % PALETTES.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><defs><linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="200" height="200" rx="100" fill="url(#a)"/><circle cx="${70 + (seed % 3) * 30}" cy="80" r="46" fill="rgba(255,255,255,0.22)"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const ME: UserInfo = {
  id: 1,
  nickName: "小哈用户",
  avatar: svgAvatar(1),
  introduction: "这是演示账号，用来体验发布和点赞。",
};

const CREATORS: UserInfo[] = [
  {
    id: 2,
    nickName: "山野小鹿",
    avatar: svgAvatar(2),
    introduction: "周末都在外面走走。",
  },
  {
    id: 3,
    nickName: "阿柚的厨房",
    avatar: svgAvatar(3),
    introduction: "简单、好吃、不费时间。",
  },
  {
    id: 4,
    nickName: "一只桃子",
    avatar: svgAvatar(4),
    introduction: "穿搭和日常。",
  },
  {
    id: 5,
    nickName: "慢半拍",
    avatar: svgAvatar(5),
    introduction: "记录普通的一天。",
  },
];

type MockNote = NoteFeedItem & {
  content: string;
  imgUris: string[];
};

function buildNotes(): MockNote[] {
  return Array.from({ length: 24 }, (_, index) => {
    const creator = index % 7 === 6 ? ME : CREATORS[index % CREATORS.length];
    const type = index % 4 === 3 ? 1 : 0;
    const cover = svgCover(index + 3);
    const imgUris =
      type === 0
        ? [cover, svgCover(index + 11), svgCover(index + 19)]
        : [];
    const title =
      index < TITLES.length
        ? TITLES[index]
        : `${TITLES[index % TITLES.length]}（${Math.floor(index / TITLES.length) + 1}）`;

    return {
      id: 1001 + index,
      type,
      title,
      cover,
      videoUri: type === 1 ? VIDEO_URIS[index % VIDEO_URIS.length] : undefined,
      videoDuration: type === 1 ? 18 + index : undefined,
      creator: {
        id: creator.id,
        nickName: creator.nickName,
        avatar: creator.avatar,
      },
      likeCount: 120 + index * 37,
      liked: false,
      createTime: new Date(Date.now() - index * 3_600_000).toISOString(),
      content: CONTENTS[index % CONTENTS.length],
      imgUris,
    };
  });
}

let notes: MockNote[] = buildNotes();
let following = new Set<number>();

export function resetMockData(): void {
  notes = buildNotes();
  following = new Set<number>();
}

export function getMe(): UserInfo {
  return { ...ME };
}

export function getUser(userId: number): UserInfo | null {
  if (userId === ME.id) {
    return getMe();
  }

  const creator = CREATORS.find((item) => item.id === userId);
  return creator ? { ...creator } : null;
}

function toFeedItem(note: MockNote): NoteFeedItem {
  return { ...note, creator: { ...note.creator } };
}

export function listFeed(
  pageNo: number,
  pageSize: number,
  tab: FeedTab,
  noteType?: 0 | 1,
): {
  items: NoteFeedItem[];
  pageNo: number;
  pageSize: number;
  totalCount: number;
  totalPage: number;
} {
  const safePageNo = Math.max(1, pageNo);
  const safePageSize = Math.max(1, pageSize);
  const tabFiltered =
    tab === "mine"
      ? notes.filter((note) => note.creator.id === ME.id)
      : tab === "follow"
        ? notes.filter((note) => note.creator.id !== ME.id)
        : notes;
  const filtered =
    noteType === undefined
      ? tabFiltered
      : tabFiltered.filter((note) => note.type === noteType);
  const start = (safePageNo - 1) * safePageSize;
  const items = filtered.slice(start, start + safePageSize).map(toFeedItem);

  return {
    items,
    pageNo: safePageNo,
    pageSize: safePageSize,
    totalCount: filtered.length,
    totalPage: Math.ceil(filtered.length / safePageSize),
  };
}

export function getNoteDetail(noteId: number): NoteDetail | null {
  const note = notes.find((item) => item.id === noteId);

  if (!note) {
    return null;
  }

  const creator = getUser(note.creator.id);

  return {
    id: note.id,
    type: note.type,
    title: note.title,
    content: note.content,
    imgUris: [...note.imgUris],
    videoUri: note.videoUri,
    creatorId: note.creator.id,
    creatorName: creator?.nickName ?? note.creator.nickName,
    avatar: note.creator.avatar,
    updateTime: note.createTime,
    visible: 0,
    likeCount: note.likeCount,
    liked: note.liked,
    following: following.has(note.creator.id),
    topicName: undefined,
    topicId: undefined,
  };
}

export function setLiked(noteId: number, liked: boolean): boolean {
  const note = notes.find((item) => item.id === noteId);

  if (!note || note.liked === liked) {
    return false;
  }

  note.liked = liked;
  note.likeCount = Math.max(0, note.likeCount + (liked ? 1 : -1));
  return true;
}

export function getLikedStatus(noteIds: number[]): Record<string, boolean> {
  return Object.fromEntries(
    noteIds.map((noteId) => [
      String(noteId),
      notes.find((note) => note.id === noteId)?.liked ?? false,
    ]),
  );
}

export function setFollowing(userId: number, followed: boolean): boolean {
  if (userId === ME.id) {
    return false;
  }

  if (followed) {
    following.add(userId);
  } else {
    following.delete(userId);
  }

  return true;
}

export function isFollowing(userId: number): boolean {
  return following.has(userId);
}

export function publishNote(payload: PublishNoteRequest): number {
  const id = Math.max(...notes.map((note) => note.id), 1000) + 1;
  const cover =
    payload.imgUris?.[0] ?? svgCover(Number(String(id).slice(-3)));
  const note: MockNote = {
    id,
    type: payload.type,
    title: payload.title?.trim() || "未命名笔记",
    cover,
    videoUri: payload.videoUri,
    videoDuration: payload.type === 1 ? 20 : undefined,
    creator: {
      id: ME.id,
      nickName: ME.nickName,
      avatar: ME.avatar,
    },
    likeCount: 0,
    liked: false,
    createTime: new Date().toISOString(),
    content: payload.content ?? "",
    imgUris: payload.imgUris ?? [],
  };

  notes = [note, ...notes];
  return id;
}

export function listFollowing(pageNo: number, pageSize: number) {
  const users = CREATORS.filter((creator) => following.has(creator.id)).map(
    (creator) => ({
      userId: creator.id,
      avatar: creator.avatar,
      nickname: creator.nickName,
      introduction: creator.introduction,
    }),
  );
  const start = (Math.max(1, pageNo) - 1) * pageSize;

  return {
    items: users.slice(start, start + pageSize),
    pageNo,
    pageSize,
    totalCount: users.length,
    totalPage: Math.ceil(users.length / pageSize),
  };
}

export function listFans(pageNo: number, pageSize: number) {
  const users = CREATORS.slice(0, 3).map((creator) => ({
    userId: creator.id,
    avatar: creator.avatar,
    nickname: creator.nickName,
    introduction: creator.introduction,
    fansTotal: 120,
    noteTotal: 18,
  }));
  const start = (Math.max(1, pageNo) - 1) * pageSize;

  return {
    items: users.slice(start, start + pageSize),
    pageNo,
    pageSize,
    totalCount: users.length,
    totalPage: Math.ceil(users.length / pageSize),
  };
}
