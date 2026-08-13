import type { CollectionEntry } from 'astro:content';
import { getCollection, render } from 'astro:content';
import { APP_BLOG } from 'astrowind:config';
import type { PaginateFunction } from 'astro';
import { defaultLang, languages } from '~/i18n/config';
import type { AppLang } from '~/i18n/routes';
import type { Post } from '~/types';
import { BLOG_BASE, CATEGORY_BASE, cleanSlug, POST_PERMALINK_PATTERN, TAG_BASE, trimSlash } from './permalinks';

type PostCollectionData = CollectionEntry<'post'>['data'];
type PreparedEntry = {
  id: string;
  data: PostCollectionData;
  Content: Post['Content'];
  readingTime?: number;
};

type PostGroup = {
  common?: PreparedEntry;
  legacy?: PreparedEntry;
  locales: Partial<Record<AppLang, PreparedEntry>>;
};

const generatePermalink = async ({
  id,
  slug,
  publishDate,
  category,
}: {
  id: string;
  slug: string;
  publishDate: Date;
  category: string | undefined;
}): Promise<string> => {
  const year = String(publishDate.getFullYear()).padStart(4, '0');
  const month = String(publishDate.getMonth() + 1).padStart(2, '0');
  const day = String(publishDate.getDate()).padStart(2, '0');
  const hour = String(publishDate.getHours()).padStart(2, '0');
  const minute = String(publishDate.getMinutes()).padStart(2, '0');
  const second = String(publishDate.getSeconds()).padStart(2, '0');

  const permalink = POST_PERMALINK_PATTERN.replace('%slug%', slug)
    .replace('%id%', id)
    .replace('%category%', category || '')
    .replace('%year%', year)
    .replace('%month%', month)
    .replace('%day%', day)
    .replace('%hour%', hour)
    .replace('%minute%', minute)
    .replace('%second%', second);

  return permalink
    .split('/')
    .map((el) => trimSlash(el))
    .filter((el) => !!el)
    .join('/');
};

const getPreparedEntry = async (entry: CollectionEntry<'post'>): Promise<PreparedEntry> => {
  const { Content, remarkPluginFrontmatter } = await render(entry);

  return {
    id: entry.id,
    data: entry.data,
    Content,
    readingTime: remarkPluginFrontmatter?.readingTime,
  };
};

const getEntryFileName = (id: string): string => {
  const value = id.split('/').pop() || id;
  return value.replace(/\.(md|mdx)$/i, '');
};

const getEntryFolderKey = (id: string): string => {
  const parts = id.split('/');
  if (parts.length <= 1) return id;
  return parts.slice(0, -1).join('/');
};

const normalizePostFromData = async ({
  id,
  data,
  content,
  readingTime,
  fallbackSlug,
  fallbackLocale,
}: {
  id: string;
  data: PostCollectionData;
  content: Post['Content'];
  readingTime?: number;
  fallbackSlug?: string;
  fallbackLocale?: AppLang;
}): Promise<Post | null> => {
  const {
    publishDate: rawPublishDate = new Date(),
    updateDate: rawUpdateDate,
    title,
    excerpt,
    image,
    slug: rawSlug,
    locale: rawLocale,
    tags: rawTags = [],
    category: rawCategory,
    author,
    draft = false,
    metadata = {},
  } = data;

  if (!title) return null;

  const slug = cleanSlug(rawSlug || fallbackSlug || id.split('/').pop() || id);
  const locale: AppLang =
    (rawLocale && rawLocale in languages ? (rawLocale as AppLang) : undefined) ||
    fallbackLocale ||
    (defaultLang as AppLang);
  const publishDate = new Date(rawPublishDate);
  const updateDate = rawUpdateDate ? new Date(rawUpdateDate) : undefined;

  const category = rawCategory
    ? {
        slug: cleanSlug(rawCategory),
        title: rawCategory,
      }
    : undefined;

  const tags = rawTags.map((tag: string) => ({
    slug: cleanSlug(tag),
    title: tag,
  }));

  return {
    id,
    slug,
    locale,
    permalink: await generatePermalink({ id, slug, publishDate, category: category?.slug }),
    publishDate,
    updateDate,
    title,
    excerpt,
    image,
    category,
    tags,
    author,
    draft,
    metadata,
    Content: content,
    readingTime,
  };
};

const mergePostData = (
  commonData: PostCollectionData | undefined,
  localeData: PostCollectionData
): PostCollectionData => {
  return {
    ...commonData,
    ...localeData,
    metadata: {
      ...(commonData?.metadata || {}),
      ...(localeData.metadata || {}),
    },
  };
};

const buildPostGroups = (entries: PreparedEntry[]): Record<string, PostGroup> => {
  return entries.reduce<Record<string, PostGroup>>((acc, entry) => {
    const fileName = getEntryFileName(entry.id);
    const folderKey = getEntryFolderKey(entry.id);
    const key = fileName === 'common' || fileName === 'fr' || fileName === 'en' ? folderKey : entry.id;

    if (!acc[key]) {
      acc[key] = { locales: {} };
    }

    if (fileName === 'common') {
      acc[key].common = entry;
    } else if (fileName === 'fr' || fileName === 'en') {
      acc[key].locales[fileName as AppLang] = entry;
    } else {
      acc[key].legacy = entry;
    }

    return acc;
  }, {});
};

const load = async function (): Promise<Array<Post>> {
  const entries = await getCollection('post');
  const preparedEntries = await Promise.all(entries.map((entry) => getPreparedEntry(entry)));
  const groupedEntries = buildPostGroups(preparedEntries);

  const postsByGroup = await Promise.all(
    Object.entries(groupedEntries).map(async ([groupKey, group]) => {
      if (group.legacy) {
        const legacyPost = await normalizePostFromData({
          id: group.legacy.id,
          data: group.legacy.data,
          content: group.legacy.Content,
          readingTime: group.legacy.readingTime,
          fallbackSlug: cleanSlug(groupKey),
        });

        return legacyPost ? [legacyPost] : [];
      }

      const localizedPosts = await Promise.all(
        getSupportedBlogLangs().map(async (locale) => {
          const localeEntry = group.locales[locale];
          if (!localeEntry) return null;

          const mergedData = mergePostData(group.common?.data, localeEntry.data);
          return normalizePostFromData({
            id: `${groupKey}/${locale}`,
            data: mergedData,
            content: localeEntry.Content,
            readingTime: localeEntry.readingTime,
            fallbackSlug: cleanSlug(groupKey),
            fallbackLocale: locale,
          });
        })
      );

      return localizedPosts.filter((post): post is Post => !!post);
    })
  );

  const results = postsByGroup
    .flat()
    .sort((a, b) => b.publishDate.valueOf() - a.publishDate.valueOf())
    .filter((post) => !post.draft);

  return results;
};

let _posts: Array<Post>;

/** */
export const isBlogEnabled = APP_BLOG.isEnabled;
export const isRelatedPostsEnabled = APP_BLOG.isRelatedPostsEnabled;
export const isBlogListRouteEnabled = APP_BLOG.list.isEnabled;
export const isBlogPostRouteEnabled = APP_BLOG.post.isEnabled;
export const isBlogCategoryRouteEnabled = APP_BLOG.category.isEnabled;
export const isBlogTagRouteEnabled = APP_BLOG.tag.isEnabled;

export const blogListRobots = APP_BLOG.list.robots;
export const blogPostRobots = APP_BLOG.post.robots;
export const blogCategoryRobots = APP_BLOG.category.robots;
export const blogTagRobots = APP_BLOG.tag.robots;

export const blogPostsPerPage = APP_BLOG?.postsPerPage;

const getSupportedBlogLangs = (): AppLang[] => Object.keys(languages) as AppLang[];
const filterPostsByLang = (posts: Array<Post>, lang: AppLang): Array<Post> =>
  posts.filter((post) => post.locale === lang);
const getPostTranslationGroupKey = (post: Post): string => post.id.replace(/\/(fr|en)$/, '');

/** */
export const fetchPosts = async (): Promise<Array<Post>> => {
  if (!_posts) {
    _posts = await load();
  }

  return _posts;
};

/** */
export const findPostsBySlugs = async (slugs: Array<string>, locale?: AppLang): Promise<Array<Post>> => {
  if (!Array.isArray(slugs)) return [];

  const posts = await fetchPosts();
  const slugSet = new Set(slugs);

  return posts.filter((post) => slugSet.has(post.slug) && (!locale || post.locale === locale));
};

/** */
export const findPostsByIds = async (ids: Array<string>, locale?: AppLang): Promise<Array<Post>> => {
  if (!Array.isArray(ids)) return [];

  const posts = await fetchPosts();
  const idSet = new Set(ids);

  return posts.filter((post) => idSet.has(post.id) && (!locale || post.locale === locale));
};

/** */
export const findLatestPosts = async ({
  count,
  locale,
}: {
  count?: number;
  locale?: AppLang;
}): Promise<Array<Post>> => {
  const _count = count || 4;
  const posts = await fetchPosts();
  const filteredPosts = locale ? posts.filter((post) => post.locale === locale) : posts;

  return filteredPosts ? filteredPosts.slice(0, _count) : [];
};

/** */
export const getStaticPathsBlogList = async ({ paginate }: { paginate: PaginateFunction }) => {
  if (!isBlogEnabled || !isBlogListRouteEnabled) return [];

  const posts = await fetchPosts();
  return getSupportedBlogLangs().flatMap((lang) =>
    paginate(filterPostsByLang(posts, lang), {
      params: { lang, blog: BLOG_BASE || undefined },
      pageSize: blogPostsPerPage,
    })
  );
};

/** */
export const getStaticPathsBlogPost = async () => {
  if (!isBlogEnabled || !isBlogPostRouteEnabled) return [];

  const posts = await fetchPosts();
  return getSupportedBlogLangs().flatMap((lang) =>
    filterPostsByLang(posts, lang).flatMap((post) => ({
      params: {
        lang,
        blog: post.permalink,
      },
      props: { post },
    }))
  );
};

/** */
export const getStaticPathsBlogCategory = async ({ paginate }: { paginate: PaginateFunction }) => {
  if (!isBlogEnabled || !isBlogCategoryRouteEnabled) return [];

  const allPosts = await fetchPosts();
  return getSupportedBlogLangs().flatMap((lang) => {
    const categories: Record<string, NonNullable<Post['category']>> = {};
    const posts = filterPostsByLang(allPosts, lang);
    posts.forEach((post) => {
      if (post.category?.slug) {
        categories[post.category.slug] = post.category;
      }
    });

    return Array.from(Object.keys(categories)).flatMap((categorySlug) =>
      paginate(
        posts.filter((post) => post.category?.slug && categorySlug === post.category?.slug),
        {
          params: { lang, category: categorySlug, blog: CATEGORY_BASE || undefined },
          pageSize: blogPostsPerPage,
          props: { category: categories[categorySlug] },
        }
      )
    );
  });
};

/** */
export const getStaticPathsBlogTag = async ({ paginate }: { paginate: PaginateFunction }) => {
  if (!isBlogEnabled || !isBlogTagRouteEnabled) return [];

  const allPosts = await fetchPosts();
  return getSupportedBlogLangs().flatMap((lang) => {
    const tags: Record<string, NonNullable<Post['tags']>[number]> = {};
    const posts = filterPostsByLang(allPosts, lang);
    posts.forEach((post) => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach((tag) => {
          tags[tag.slug] = tag;
        });
      }
    });

    return Array.from(Object.keys(tags)).flatMap((tagSlug) =>
      paginate(
        posts.filter((post) => Array.isArray(post.tags) && post.tags.find((elem) => elem.slug === tagSlug)),
        {
          params: { lang, tag: tagSlug, blog: TAG_BASE || undefined },
          pageSize: blogPostsPerPage,
          props: { tag: tags[tagSlug] },
        }
      )
    );
  });
};

/** */
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

    if (iteratedPost.tags) {
      iteratedPost.tags.forEach((tag) => {
        if (originalTagsSet.has(tag.slug)) {
          score += 1;
        }
      });
    }

    acc.push({ post: iteratedPost, score });
    return acc;
  }, []);

  postsWithScores.sort((a, b) => b.score - a.score);

  const selectedPosts: Post[] = [];
  let i = 0;
  while (selectedPosts.length < maxResults && i < postsWithScores.length) {
    selectedPosts.push(postsWithScores[i].post);
    i++;
  }

  return selectedPosts;
}

export const translateBlogPermalinkForLocale = ({
  posts,
  sourcePermalink,
  sourceLang,
  targetLang,
}: {
  posts: Array<Post>;
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
