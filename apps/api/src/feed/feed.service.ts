import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { assertSafeAssetUrl } from '../common/safe-url';
import { MOCK_CHARACTERS, UserRole, type CreateFeedPostInput, type FeedCommentDTO, type FeedPostDTO } from '@acm/shared';
import { randomUUID } from 'node:crypto';
import { AuthService } from '../auth/auth.service';
import { StudioService } from '../studio/studio.service';

interface PostRecord extends FeedPostDTO {
  likedBy: Set<string>;
}

@Injectable()
export class FeedService {
  private readonly posts = new Map<string, PostRecord>();
  private readonly comments = new Map<string, FeedCommentDTO[]>();

  constructor(
    private readonly auth: AuthService,
    private readonly studio: StudioService,
  ) {
    this.seedFromCharacters();
  }

  private seedFromCharacters() {
    const live = MOCK_CHARACTERS.filter((c) => c.status === 'LIVE').slice(0, 24);
    for (const [i, c] of live.entries()) {
      const id = `post_seed_${i}`;
      this.posts.set(id, {
        id,
        characterId: c.id,
        characterSlug: c.slug,
        characterName: c.name,
        mediaUrl: c.previewVideo?.url ?? c.cover.url,
        blurDataUrl: c.cover.blurDataUrl,
        isReel: !!c.previewVideo,
        caption: c.tagline ?? `New drop from ${c.name}`,
        likeCount: Math.floor(Math.random() * 400) + 10,
        commentCount: 0,
        likedBy: new Set(),
        createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      });
      this.comments.set(id, []);
    }
  }

  list(page = 1, pageSize = 20, userId?: string): { items: FeedPostDTO[]; hasMore: boolean } {
    const all = [...this.posts.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = (page - 1) * pageSize;
    const slice = all.slice(start, start + pageSize);
    return {
      items: slice.map((p) => this.toDto(p, userId)),
      hasMore: start + pageSize < all.length,
    };
  }

  listByCharacter(slug: string, userId?: string): FeedPostDTO[] {
    return [...this.posts.values()]
      .filter((p) => p.characterSlug === slug)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((p) => this.toDto(p, userId));
  }

  create(authorId: string, input: CreateFeedPostInput): FeedPostDTO {
    const author = this.auth.findById(authorId);
    if (!author) throw new ForbiddenException();

    const fromStudio = this.studio.getDetailBySlug(input.characterSlug);
    const fromMock = MOCK_CHARACTERS.find((c) => c.slug === input.characterSlug);
    const character = fromStudio ?? fromMock;
    if (!character) throw new NotFoundException('Character not found');

    const ownerId = this.studio.getCreatorIdForSlug(input.characterSlug);
    if (ownerId && ownerId !== authorId && author.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You can only post for characters you created');
    }

    const id = `post_${randomUUID()}`;
    const record: PostRecord = {
      id,
      characterId: character.id,
      characterSlug: character.slug,
      characterName: character.name,
      authorId,
      authorName: author.displayName,
      mediaUrl: assertSafeAssetUrl(input.mediaUrl, 'mediaUrl'),
      isReel: input.isReel ?? false,
      caption: input.caption,
      likeCount: 0,
      commentCount: 0,
      likedBy: new Set(),
      createdAt: new Date().toISOString(),
    };
    this.posts.set(id, record);
    this.comments.set(id, []);
    return this.toDto(record, authorId);
  }

  toggleLike(userId: string, postId: string): FeedPostDTO {
    const post = this.posts.get(postId);
    if (!post) throw new NotFoundException('Post not found');
    if (post.likedBy.has(userId)) {
      post.likedBy.delete(userId);
      post.likeCount = Math.max(0, post.likeCount - 1);
    } else {
      post.likedBy.add(userId);
      post.likeCount += 1;
    }
    return this.toDto(post, userId);
  }

  addComment(userId: string, postId: string, body: string): FeedCommentDTO {
    const post = this.posts.get(postId);
    if (!post) throw new NotFoundException('Post not found');
    const user = this.auth.findById(userId);
    if (!user) throw new ForbiddenException();
    if (!body.trim()) throw new BadRequestException('Comment cannot be empty');

    const comment: FeedCommentDTO = {
      id: `cmt_${randomUUID()}`,
      postId,
      authorId: userId,
      authorName: user.displayName,
      body: body.trim(),
      createdAt: new Date().toISOString(),
    };
    const list = this.comments.get(postId)!;
    list.push(comment);
    post.commentCount = list.length;
    return comment;
  }

  getComments(postId: string): FeedCommentDTO[] {
    return [...(this.comments.get(postId) ?? [])];
  }

  private toDto(post: PostRecord, userId?: string): FeedPostDTO {
    const { likedBy, ...rest } = post;
    return { ...rest, likedByMe: userId ? likedBy.has(userId) : false };
  }
}
