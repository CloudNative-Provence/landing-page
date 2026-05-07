type AstrowindConfigMock = {
  I18N: {
    language: string;
  };
  SITE: {
    name: string;
    site: string;
    base: string;
    trailingSlash: boolean;
  };
  METADATA: {
    description: string;
  };
  APP_BLOG: {
    isEnabled: boolean;
    isRelatedPostsEnabled: boolean;
    postsPerPage: number;
    post: {
      permalink: string;
      isEnabled: boolean;
      robots: { index: boolean };
    };
    list: {
      pathname: string;
      isEnabled: boolean;
      robots: { index: boolean };
    };
    category: {
      pathname: string;
      isEnabled: boolean;
      robots: { index: boolean };
    };
    tag: {
      pathname: string;
      isEnabled: boolean;
      robots: { index: boolean };
    };
  };
  APP_PROGRAM: {
    isEnabled: boolean;
  };
};

type AstrowindConfigMockOverrides = Omit<Partial<AstrowindConfigMock>, 'APP_BLOG' | 'APP_PROGRAM'> & {
  APP_BLOG?: Partial<AstrowindConfigMock['APP_BLOG']> & {
    post?: Partial<AstrowindConfigMock['APP_BLOG']['post']>;
    list?: Partial<AstrowindConfigMock['APP_BLOG']['list']>;
    category?: Partial<AstrowindConfigMock['APP_BLOG']['category']>;
    tag?: Partial<AstrowindConfigMock['APP_BLOG']['tag']>;
  };
  APP_PROGRAM?: Partial<AstrowindConfigMock['APP_PROGRAM']>;
};

const defaults: AstrowindConfigMock = {
  I18N: {
    language: 'fr',
  },
  SITE: {
    name: 'Cloud Native Provence',
    site: 'https://cloudnative-provence.fr',
    base: '/',
    trailingSlash: false,
  },
  METADATA: {
    description: 'Conference site',
  },
  APP_BLOG: {
    isEnabled: false,
    isRelatedPostsEnabled: false,
    postsPerPage: 6,
    post: { permalink: '/blog/%slug%', isEnabled: false, robots: { index: true } },
    list: { pathname: 'blog', isEnabled: false, robots: { index: true } },
    category: { pathname: 'category', isEnabled: false, robots: { index: true } },
    tag: { pathname: 'tag', isEnabled: false, robots: { index: false } },
  },
  APP_PROGRAM: {
    isEnabled: true,
  },
};

export const createAstrowindConfigMock = (overrides: AstrowindConfigMockOverrides = {}): AstrowindConfigMock => ({
  I18N: {
    ...defaults.I18N,
    ...overrides.I18N,
  },
  SITE: {
    ...defaults.SITE,
    ...overrides.SITE,
  },
  METADATA: {
    ...defaults.METADATA,
    ...overrides.METADATA,
  },
  APP_BLOG: {
    ...defaults.APP_BLOG,
    ...overrides.APP_BLOG,
    post: {
      ...defaults.APP_BLOG.post,
      ...overrides.APP_BLOG?.post,
      robots: {
        ...defaults.APP_BLOG.post.robots,
        ...overrides.APP_BLOG?.post?.robots,
      },
    },
    list: {
      ...defaults.APP_BLOG.list,
      ...overrides.APP_BLOG?.list,
      robots: {
        ...defaults.APP_BLOG.list.robots,
        ...overrides.APP_BLOG?.list?.robots,
      },
    },
    category: {
      ...defaults.APP_BLOG.category,
      ...overrides.APP_BLOG?.category,
      robots: {
        ...defaults.APP_BLOG.category.robots,
        ...overrides.APP_BLOG?.category?.robots,
      },
    },
    tag: {
      ...defaults.APP_BLOG.tag,
      ...overrides.APP_BLOG?.tag,
      robots: {
        ...defaults.APP_BLOG.tag.robots,
        ...overrides.APP_BLOG?.tag?.robots,
      },
    },
  },
  APP_PROGRAM: {
    ...defaults.APP_PROGRAM,
    ...overrides.APP_PROGRAM,
  },
});
