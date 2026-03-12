import { vi } from 'vitest';

type RuntimePost = {
  id: string;
  data: Record<string, unknown>;
};

export const createAstroContentRuntimeMock = (options?: { posts?: RuntimePost[]; readingTime?: number }) => {
  const posts = options?.posts ?? [];
  const readingTime = options?.readingTime ?? 2;

  return {
    getCollection: vi.fn(async () => posts),
    render: vi.fn(async () => ({
      Content: () => null,
      remarkPluginFrontmatter: { readingTime },
    })),
  };
};

const createOptionalChain = () => ({ optional: () => createOptionalChain() });

export const createAstroContentSchemaMock = () => ({
  defineCollection: vi.fn((input) => input),
});

export const createAstroZodMock = () => ({
  z: {
    object: () => createOptionalChain(),
    string: () => createOptionalChain(),
    url: () => createOptionalChain(),
    boolean: () => createOptionalChain(),
    array: () => createOptionalChain(),
    number: () => createOptionalChain(),
    date: () => createOptionalChain(),
    enum: () => createOptionalChain(),
    nativeEnum: () => createOptionalChain(),
  },
});

export const createAstroLoadersMock = () => ({
  glob: vi.fn((input) => input),
});
