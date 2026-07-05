export interface FeedPostDTO {
  id: string;
  characterId: string;
  characterSlug: string;
  characterName: string;
  authorId?: string;
  authorName?: string;
  mediaUrl: string;
  blurDataUrl?: string;
  isReel: boolean;
  caption?: string;
  likeCount: number;
  commentCount: number;
  likedByMe?: boolean;
  createdAt: string;
}

export interface FeedCommentDTO {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface CreateFeedPostInput {
  characterSlug: string;
  mediaUrl: string;
  caption?: string;
  isReel?: boolean;
}
