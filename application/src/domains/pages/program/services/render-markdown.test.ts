import { describe, expect, it } from 'vitest';

import { renderProgramMarkdown } from './render-markdown';

describe('program Markdown', () => {
  it('renders paragraphs, lists, emphasis, links, and code from published descriptions', async () => {
    const html = await renderProgramMarkdown(
      [
        'A **bold** introduction with *emphasis* and `kubectl`.',
        '',
        '- First topic',
        '- [Documentation](https://kubernetes.io/docs/)',
        '',
        '```sh',
        'kubectl get pods',
        '```',
      ].join('\n')
    );
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>emphasis</em>');
    expect(html).toContain('<code>kubectl</code>');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>First topic</li>');
    expect(html).toContain('<a href="https://kubernetes.io/docs/">Documentation</a>');
    expect(html).toContain('<pre><code class="language-sh">kubectl get pods\n</code></pre>');
  });

  it('renders speaker biographies with paragraphs and escaped text', async () => {
    const html = await renderProgramMarkdown('Developer & speaker.\n\nWorks on **Kubernetes**.');
    expect(html).toBe('<p>Developer &#x26; speaker.</p>\n<p>Works on <strong>Kubernetes</strong>.</p>');
    expect(await renderProgramMarkdown('')).toBe('');
  });

  it('removes raw executable HTML and unsafe Markdown link and image URLs', async () => {
    const html = await renderProgramMarkdown(
      [
        '<script>alert("script")</script>',
        '',
        '<img src="x" onerror="alert(1)">',
        '',
        '<iframe src="https://example.org"></iframe>',
        '',
        '[Unsafe](javascript:alert%281%29)',
        '',
        '![Unsafe image](data:text/html,example)',
        '',
        '**Safe text remains**',
      ].join('\n')
    );
    expect(html).not.toMatch(/<script|<iframe|onerror|javascript:|data:text\/html/);
    expect(html).toContain('<strong>Safe text remains</strong>');
  });
});
