import { languages } from '~/i18n/config';
import type { AppLang } from '~/i18n/routes';
import { BLOG_BASE, trimSlash } from '~/shared/url/permalinks';
import type { Post } from '~/types';
import { fetchPosts, getPostTranslationGroupKey } from './post-repository';

export const translateBlogPermalinkForLocale = ({
  posts,
  sourcePermalink,
  sourceLang,
  targetLang,
}: {
  posts: Post[];
  sourcePermalink: string;
  sourceLang: AppLang;
  targetLang: AppLang;
}): string | undefined => {
  if (sourceLang === targetLang) {
    return trimSlash(sourcePermalink);
  }

  const normalizedPermalink = trimSlash(sourcePermalink);
  const sourcePost = posts.find(
    (post) => post.locale === sourceLang && trimSlash(post.permalink) === normalizedPermalink
  );

  if (!sourcePost) return undefined;

  const translationGroupKey = getPostTranslationGroupKey(sourcePost);
  const translatedPost = posts.find(
    (post) => post.locale === targetLang && getPostTranslationGroupKey(post) === translationGroupKey
  );

  return translatedPost ? trimSlash(translatedPost.permalink) : undefined;
};

export const findLocalizedBlogPath = async (path: string, targetLang: AppLang): Promise<string | undefined> => {
  const parts = path.split('/').filter(Boolean);
  if (parts.length < 2) return undefined;

  const sourceLang = parts[0] as AppLang;
  if (!(sourceLang in languages)) return undefined;

  if (parts[1] !== BLOG_BASE) return undefined;

  const sourcePermalink = parts.slice(1).join('/');
  const posts = await fetchPosts();
  const translatedPermalink = translateBlogPermalinkForLocale({
    posts,
    sourcePermalink,
    sourceLang,
    targetLang,
  });

  return translatedPermalink ? `/${targetLang}/${translatedPermalink}` : undefined;
};
