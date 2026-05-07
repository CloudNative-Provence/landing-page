import slugify from 'limax';

import { SITE, APP_BLOG } from 'astrowind:config';

import type { AppLang } from '~/i18n/routes';
import { trim } from '~/utils/utils';

export const trimSlash = (s: string) => trim(trim(s, '/'));
const createPath = (...params: string[]) => {
  const paths = params
    .map((el) => trimSlash(el))
    .filter((el) => !!el)
    .join('/');
  return '/' + paths + (SITE.trailingSlash && paths ? '/' : '');
};

const BASE_PATHNAME = SITE.base || '/';

export const cleanSlug = (text = '') =>
  trimSlash(text)
    .split('/')
    .map((slug) => slugify(slug))
    .join('/');

export const BLOG_BASE = cleanSlug(APP_BLOG?.list?.pathname);
export const CATEGORY_BASE = cleanSlug(APP_BLOG?.category?.pathname);
export const TAG_BASE = cleanSlug(APP_BLOG?.tag?.pathname) || 'tag';

export const POST_PERMALINK_PATTERN = trimSlash(APP_BLOG?.post?.permalink || `${BLOG_BASE}/%slug%`);

/** */
export const getCanonical = (path = ''): string | URL => {
  const url = String(new URL(path, SITE.site));
  if (SITE.trailingSlash == false && path && url.endsWith('/')) {
    return url.slice(0, -1);
  } else if (SITE.trailingSlash == true && path && !url.endsWith('/')) {
    return url + '/';
  }
  return url;
};

/** */
export const getPermalink = (slug = '', type = 'page', lang?: AppLang): string => {
  let permalink: string;

  if (
    slug.startsWith('https://') ||
    slug.startsWith('http://') ||
    slug.startsWith('://') ||
    slug.startsWith('#') ||
    slug.startsWith('javascript:')
  ) {
    return slug;
  }

  switch (type) {
    case 'home':
      permalink = getHomePermalink();
      break;

    case 'blog':
      permalink = createPath(lang ?? '', BLOG_BASE);
      break;

    case 'asset':
      permalink = getAsset(slug);
      break;

    case 'category':
      permalink = createPath(lang ?? '', CATEGORY_BASE, trimSlash(slug));
      break;

    case 'tag':
      permalink = createPath(lang ?? '', TAG_BASE, trimSlash(slug));
      break;

    case 'post':
      permalink = createPath(lang ?? '', trimSlash(slug));
      break;

    case 'page':
    default:
      permalink = createPath(slug);
      break;
  }

  return definitivePermalink(permalink);
};

/** */
export const getHomePermalink = (): string => getPermalink('/');

/** */
export const getBlogPermalink = (lang?: AppLang): string => getPermalink('', 'blog', lang);

/** */
export const getAsset = (path: string): string =>
  '/' +
  [BASE_PATHNAME, path]
    .map((el) => trimSlash(el))
    .filter((el) => !!el)
    .join('/');

/** */
const definitivePermalink = (permalink: string): string => createPath(BASE_PATHNAME, permalink);

/** */
type PermalinkHrefDescriptor = {
  type?: string;
  url?: string;
};

type PermalinkMenuValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | PermalinkMenuValue[]
  | { [key: string]: PermalinkMenuValue };

const isPermalinkMenuRecord = (value: PermalinkMenuValue): value is { [key: string]: PermalinkMenuValue } =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isPermalinkHrefDescriptor = (value: PermalinkMenuValue): value is PermalinkHrefDescriptor =>
  isPermalinkMenuRecord(value) &&
  ('type' in value || 'url' in value) &&
  (typeof value.type === 'string' || value.type === undefined) &&
  (typeof value.url === 'string' || value.url === undefined);

const resolvePermalinkHref = (value: PermalinkMenuValue): string | undefined => {
  if (typeof value === 'string') {
    return getPermalink(value);
  }

  if (!isPermalinkHrefDescriptor(value)) {
    return undefined;
  }

  if (value.type === 'home') {
    return getHomePermalink();
  }

  if (value.type === 'blog') {
    return getBlogPermalink();
  }

  if (value.type === 'asset' && value.url) {
    return getAsset(value.url);
  }

  if (value.url) {
    return getPermalink(value.url, value.type);
  }

  return undefined;
};

export const applyGetPermalinks = (menu: PermalinkMenuValue = {}): PermalinkMenuValue => {
  if (Array.isArray(menu)) {
    return menu.map((item) => applyGetPermalinks(item));
  } else if (isPermalinkMenuRecord(menu)) {
    const obj: { [key: string]: PermalinkMenuValue } = {};

    for (const [key, value] of Object.entries(menu)) {
      if (key === 'href') {
        const resolvedHref = resolvePermalinkHref(value);
        if (resolvedHref !== undefined) {
          obj[key] = resolvedHref;
        }
      } else {
        obj[key] = applyGetPermalinks(value);
      }
    }

    return obj;
  }

  return menu;
};
