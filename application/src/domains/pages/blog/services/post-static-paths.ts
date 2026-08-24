import type { PaginateFunction } from 'astro';
import { BLOG_BASE, CATEGORY_BASE, TAG_BASE } from '~/shared/url/permalinks';
import type { Post } from '~/types';
import {
  blogCategoryRobots,
  blogListRobots,
  blogPostRobots,
  blogPostsPerPage,
  blogTagRobots,
  isBlogCategoryRouteEnabled,
  isBlogEnabled,
  isBlogListRouteEnabled,
  isBlogPostRouteEnabled,
  isBlogTagRouteEnabled,
} from './blog-config';
import { fetchPosts, filterPostsByLang, getSupportedBlogLangs } from './post-repository';

export { blogCategoryRobots, blogListRobots, blogPostRobots, blogTagRobots };

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

    return Object.keys(categories).flatMap((categorySlug) =>
      paginate(
        posts.filter((post) => post.category?.slug && categorySlug === post.category.slug),
        {
          params: { lang, category: categorySlug, blog: CATEGORY_BASE || undefined },
          pageSize: blogPostsPerPage,
          props: { category: categories[categorySlug] },
        }
      )
    );
  });
};

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

    return Object.keys(tags).flatMap((tagSlug) =>
      paginate(
        posts.filter((post) => Array.isArray(post.tags) && post.tags.some((entry) => entry.slug === tagSlug)),
        {
          params: { lang, tag: tagSlug, blog: TAG_BASE || undefined },
          pageSize: blogPostsPerPage,
          props: { tag: tags[tagSlug] },
        }
      )
    );
  });
};
