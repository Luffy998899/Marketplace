export interface ReviewDTO {
  id: string;
  characterId: string;
  characterSlug: string;
  authorId: string;
  authorName: string;
  rating: number;
  body?: string;
  createdAt: string;
}

export interface CreateReviewInput {
  characterSlug: string;
  rating: number;
  body?: string;
}
