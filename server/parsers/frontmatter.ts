/**
 * YAML frontmatter extractor — regex-based, zero dependencies.
 * Extracts frontmatter between --- delimiters and returns as a flat Record.
 */
export function parseFrontmatter(raw: string): {
  frontmatter: Record<string, unknown>;
  body: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { frontmatter: {}, body: raw };

  const fmBlock = match[1];
  const body = raw.slice(match[0].length);
  const frontmatter: Record<string, unknown> = {};

  // Parse line by line — handles simple key: value and nested indented values
  let currentKey: string | null = null;
  for (const line of fmBlock.split('\n')) {
    const keyVal = line.match(/^(\w[\w-]*):\s*(.*)/);
    if (keyVal) {
      currentKey = keyVal[1];
      const val = keyVal[2].trim();
      // Boolean / number coercion
      if (val === 'true') frontmatter[currentKey] = true;
      else if (val === 'false') frontmatter[currentKey] = false;
      else if (/^-?\d+(\.\d+)?$/.test(val)) frontmatter[currentKey] = parseFloat(val);
      else frontmatter[currentKey] = val || '';
    } else if (currentKey && line.startsWith('  ')) {
      // Continuation of previous multiline value
      const existing = frontmatter[currentKey];
      frontmatter[currentKey] = (typeof existing === 'string' ? existing + '\n' : '') + line.trim();
    }
  }

  return { frontmatter, body };
}

/** Extract first meaningful paragraph as snippet (skip headings, skip empty lines) */
export function extractSnippet(body: string, maxLen = 120): string {
  const lines = body.split('\n');
  let snippet = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('---')) continue;
    snippet = trimmed;
    break; // take first non-heading non-empty line
  }
  if (snippet.length > maxLen) snippet = snippet.slice(0, maxLen) + '…';
  return snippet;
}
