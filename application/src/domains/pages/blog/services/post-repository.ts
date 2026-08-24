import type { CollectionEntry } from 'astro:content';
import { getCollection, render } from 'astro:content';
import { defaultLang, languages } from '~/i18n/config';
import type { AppLang } from '~/i18n/routes';
import { cleanSlug, POST_PERMALINK_PATTERN, trimSlash } from '~/shared/url/permalinks';
import type { Post } from '~/types';

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
    .map((entry) => trimSlash(entry))
    .filter(Boolean)
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
): PostCollectionData => ({
  ...commonData,
  ...localeData,
  metadata: {
    ...(commonData?.metadata || {}),
    ...(localeData.metadata || {}),
  },
});

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

const loadPosts = async (): Promise<Post[]> => {
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

  return postsByGroup
    .flat()
    .sort((left, right) => right.publishDate.valueOf() - left.publishDate.valueOf())
    .filter((post) => !post.draft);
};

let postsCache: Post[] | undefined;

export const getSupportedBlogLangs = (): AppLang[] => Object.keys(languages) as AppLang[];

export const filterPostsByLang = (posts: Post[], lang: AppLang): Post[] => posts.filter((post) => post.locale === lang);

export const getPostTranslationGroupKey = (post: Post): string => post.id.replace(/\/(fr|en)$/, '');

export const fetchPosts = async (): Promise<Post[]> => {
  if (!postsCache) {
    postsCache = await loadPosts();
  }

  return postsCache;
};

export const findPostsBySlugs = async (slugs: string[], locale?: AppLang): Promise<Post[]> => {
  if (!Array.isArray(slugs)) return [];

  const posts = await fetchPosts();
  const slugSet = new Set(slugs);

  return posts.filter((post) => slugSet.has(post.slug) && (!locale || post.locale === locale));
};

export const findPostsByIds = async (ids: string[], locale?: AppLang): Promise<Post[]> => {
  if (!Array.isArray(ids)) return [];

  const posts = await fetchPosts();
  const idSet = new Set(ids);

  return posts.filter((post) => idSet.has(post.id) && (!locale || post.locale === locale));
};

export const findLatestPosts = async ({ count, locale }: { count?: number; locale?: AppLang }): Promise<Post[]> => {
  const posts = await fetchPosts();
  const filteredPosts = locale ? posts.filter((post) => post.locale === locale) : posts;

  return filteredPosts.slice(0, count || 4);
};
