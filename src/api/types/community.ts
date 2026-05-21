/** 커뮤니티(게시글·댓글) 공통 타입 및 Swagger 필드 정규화 */

export interface AuthorInfo {
  id: number;
  nickname: string;
  profileImageUrl: string;
}

export interface LikedMemberInfo extends AuthorInfo {
  following?: boolean;
  mutualFollow?: boolean;
}

export interface BookInfo {
  bookId?: number;
  title: string;
  author: string;
  imageUrl: string;
  publisher: string;
  isbn: string;
}

export interface Post {
  postId: number;
  title: string;
  content: string;
  thumbnail: string | null;
  author: AuthorInfo;
  book?: BookInfo;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  isPublic: boolean;
  isLiked?: boolean;
}

export interface Comment {
  commentId: number | null;
  content: string;
  author: AuthorInfo | null;
  createdAt: string;
  isDeleted: boolean;
  replies?: Comment[];
  parentCommentId?: number | null;
  isMine?: boolean;
}

export interface PostDetail {
  postId: number;
  title: string;
  content: string;
  images: string[];
  author: AuthorInfo;
  book?: BookInfo;
  likeCount: number;
  isLiked: boolean;
  likedMembers?: LikedMemberInfo[];
  comments: Comment[];
  commentCount: number;
  createdAt: string;
  isMine?: boolean;
  isPublic?: boolean;
}

export interface LikeResponse {
  likeCount: number;
  isLiked: boolean;
}

export interface PostFeedResponse {
  posts: Post[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface MyPostsResponse {
  posts: Post[];
  count: number;
}

export interface PostImagePresignedResult {
  presignedUrl: string;
  publicUrl: string;
}

export function normalizeBook(raw: Record<string, unknown> | undefined): BookInfo | undefined {
  if (!raw) return undefined;
  return {
    bookId: (raw.bookId as number) ?? (raw.id as number),
    title: String(raw.title ?? ''),
    author: String(raw.author ?? ''),
    imageUrl: String(raw.imageUrl ?? raw.image ?? ''),
    publisher: String(raw.publisher ?? ''),
    isbn: String(raw.isbn ?? ''),
  };
}

export function normalizeComment(raw: Record<string, unknown>): Comment {
  const repliesRaw = raw.replies;
  let replies: Comment[] | undefined;
  if (Array.isArray(repliesRaw)) {
    replies = repliesRaw.map((r) => normalizeComment(r as Record<string, unknown>));
  }

  return {
    commentId: (raw.commentId as number) ?? null,
    content: String(raw.content ?? ''),
    author: (raw.author as AuthorInfo) ?? null,
    createdAt: String(raw.createdAt ?? ''),
    isDeleted: Boolean(raw.isDeleted ?? raw.deleted ?? false),
    ...(replies !== undefined ? { replies } : {}),
    parentCommentId: (raw.parentCommentId as number | null) ?? null,
  };
}

export function normalizeLikedMember(raw: Record<string, unknown>): LikedMemberInfo {
  const following = raw.following as boolean | undefined;
  const mutualFollow = raw.mutualFollow as boolean | undefined;

  return {
    id: raw.id as number,
    nickname: String(raw.nickname ?? ''),
    profileImageUrl: String(raw.profileImageUrl ?? ''),
    ...(following !== undefined ? { following } : {}),
    ...(mutualFollow !== undefined ? { mutualFollow } : {}),
  };
}

export function normalizePost(raw: Record<string, unknown>): Post {
  const book = normalizeBook(raw.book as Record<string, unknown> | undefined);
  const isLiked = (raw.isLiked as boolean | undefined) ?? (raw.liked as boolean | undefined);

  return {
    postId: raw.postId as number,
    title: String(raw.title ?? ''),
    content: String(raw.content ?? ''),
    thumbnail: (raw.thumbnail as string | null) ?? null,
    author: raw.author as AuthorInfo,
    ...(book !== undefined ? { book } : {}),
    likeCount: Number(raw.likeCount ?? 0),
    commentCount: Number(raw.commentCount ?? 0),
    createdAt: String(raw.createdAt ?? ''),
    isPublic: Boolean(raw.isPublic ?? raw.public ?? true),
    ...(isLiked !== undefined ? { isLiked } : {}),
  };
}

export function normalizePostDetail(raw: Record<string, unknown>): PostDetail {
  const likedRaw = raw.likedMembers;
  const book = normalizeBook(raw.book as Record<string, unknown> | undefined);
  const isPublic =
    (raw.isPublic as boolean | undefined) ?? (raw.public as boolean | undefined);
  const likedMembers = Array.isArray(likedRaw)
    ? likedRaw.map((m) => normalizeLikedMember(m as Record<string, unknown>))
    : undefined;

  return {
    postId: raw.postId as number,
    title: String(raw.title ?? ''),
    content: String(raw.content ?? ''),
    images: Array.isArray(raw.images) ? (raw.images as string[]) : [],
    author: raw.author as AuthorInfo,
    ...(book !== undefined ? { book } : {}),
    likeCount: Number(raw.likeCount ?? 0),
    isLiked: Boolean(raw.isLiked ?? raw.liked ?? false),
    ...(likedMembers !== undefined ? { likedMembers } : {}),
    comments: Array.isArray(raw.comments)
      ? (raw.comments as Record<string, unknown>[]).map(normalizeComment)
      : [],
    commentCount: Number(raw.commentCount ?? 0),
    createdAt: String(raw.createdAt ?? ''),
    ...(isPublic !== undefined ? { isPublic } : {}),
  };
}

export function normalizeLikeResult(raw: Record<string, unknown>): LikeResponse {
  return {
    likeCount: Number(raw.likeCount ?? 0),
    isLiked: Boolean(raw.isLiked ?? raw.liked ?? false),
  };
}
