import type { Post } from '~/types';
import { fetchPosts } from './post-repository';

export async function getRelatedPosts(originalPost: Post, maxResults: number = 4): Promise<Post[]> {
  const allPosts = await fetchPosts();
  const originalTagsSet = new Set(originalPost.tags ? originalPost.tags.map((tag) => tag.slug) : []);

  const postsWithScores = allPosts.reduce((acc: { post: Post; score: number }[], iteratedPost: Post) => {
    if (iteratedPost.locale !== originalPost.locale) return acc;
    if (iteratedPost.slug === originalPost.slug) return acc;

    let score = 0;
    if (iteratedPost.category && originalPost.category && iteratedPost.category.slug === originalPost.category.slug) {
      score += 5;
    }

    iteratedPost.tags?.forEach((tag) => {
      if (originalTagsSet.has(tag.slug)) {
        score += 1;
      }
    });

    acc.push({ post: iteratedPost, score });
    return acc;
  }, []);

  postsWithScores.sort((left, right) => right.score - left.score);

  return postsWithScores.slice(0, maxResults).map((entry) => entry.post);
}
