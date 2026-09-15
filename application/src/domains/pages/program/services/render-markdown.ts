import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import rehypeSanitize from 'rehype-sanitize';

import { lazyImagesRehypePlugin, responsiveTablesRehypePlugin } from '~/shared/content/markdown';

const processor = createMarkdownProcessor({
  syntaxHighlight: false,
  smartypants: false,
  remarkRehype: { allowDangerousHtml: false },
  rehypePlugins: [rehypeSanitize, responsiveTablesRehypePlugin, lazyImagesRehypePlugin],
});

export async function renderProgramMarkdown(content: string): Promise<string> {
  const renderer = await processor;
  return (await renderer.render(content)).code;
}
