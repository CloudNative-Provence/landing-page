import { describe, expect, it, vi } from 'vitest';
import { createAstroContentSchemaMock, createAstroLoadersMock, createAstroZodMock } from '~/test/mocks/astro-content';

vi.mock('astro:content', () => createAstroContentSchemaMock());
vi.mock('astro/zod', () => createAstroZodMock());

vi.mock('astro/loaders', () => createAstroLoadersMock());

import { collections } from '../content.config';

describe('content collections config', () => {
  it('defines the post collection', () => {
    expect(collections).toHaveProperty('post');
    expect(collections.post).toBeTruthy();
  });
});
