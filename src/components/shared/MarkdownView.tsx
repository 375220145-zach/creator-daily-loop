import { useMemo } from 'react';

/** Lightweight Markdown-to-HTML. Supports: headings, bold, lists, code, links, tables, hr. */
export function MarkdownView({ body }: { body: string }) {
  const html = useMemo(() => renderMarkdown(body), [body]);
  return <div className="markdown-body text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: html }} />;
}

function renderMarkdown(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let inList: 'ul' | 'ol' | null = null;
  let inTable = false;
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block fence
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        out.push('</code></pre>');
        inCodeBlock = false;
      } else {
        if (inList) { out.push(`</${inList}>`); inList = null; }
        out.push('<pre><code>');
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) {
      out.push(escapeHtml(line) + '\n');
      continue;
    }

    // Table
    const isTableRow = line.startsWith('|') && line.endsWith('|');
    const isTableSep = /^\|[\s\-:|]+\|$/.test(line);

    if (isTableRow && !isTableSep) {
      if (inList) { out.push(`</${inList}>`); inList = null; }
      if (!inTable) { out.push('<table>'); inTable = true; }
      const cells = line.split('|').filter(Boolean).map((c) => c.trim());
      const tag = out.length > 0 && out[out.length - 1]?.startsWith('<table>') ? 'th' : 'td';
      out.push('<tr>' + cells.map((c) => `<${tag}>${renderInline(c)}</${tag}>`).join('') + '</tr>');
      continue;
    } else if (inTable) {
      out.push('</table>');
      inTable = false;
    }

    // Headings
    if (line.startsWith('### ')) {
      if (inList) { out.push(`</${inList}>`); inList = null; }
      out.push(`<h3>${renderInline(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      if (inList) { out.push(`</${inList}>`); inList = null; }
      out.push(`<h2>${renderInline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      if (inList) { out.push(`</${inList}>`); inList = null; }
      out.push(`<h1>${renderInline(line.slice(2))}</h1>`);
      continue;
    }

    // HR
    if (/^-{3,}$/.test(line.trim())) {
      if (inList) { out.push(`</${inList}>`); inList = null; }
      out.push('<hr>');
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^(\s*)[-*]\s+(.*)/);
    if (ulMatch) {
      if (inList !== 'ul') { if (inList) out.push(`</${inList}>`); out.push('<ul>'); inList = 'ul'; }
      out.push(`<li>${renderInline(ulMatch[2])}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^(\s*)\d+\.\s+(.*)/);
    if (olMatch) {
      if (inList !== 'ol') { if (inList) out.push(`</${inList}>`); out.push('<ol>'); inList = 'ol'; }
      out.push(`<li>${renderInline(olMatch[2])}</li>`);
      continue;
    }

    // End list on blank line or non-list line
    if (inList && line.trim() === '') {
      out.push(`</${inList}>`);
      inList = null;
      continue;
    }
    if (inList) {
      out.push(`</${inList}>`);
      inList = null;
    }

    // Paragraph (non-empty, non-heading, non-list)
    if (line.trim()) {
      out.push(`<p>${renderInline(line)}</p>`);
    }
  }

  if (inList) out.push(`</${inList}>`);
  if (inTable) out.push('</table>');
  if (inCodeBlock) out.push('</code></pre>');

  return out.join('\n');
}

function renderInline(text: string): string {
  let out = escapeHtml(text);
  // Bold: **text** or __text__
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/__(.+?)__/g, '<strong>$1</strong>');
  // Italic: *text*
  out = out.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Inline code: `text`
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Links: [text](url)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-indigo-400 underline" target="_blank">$1</a>');
  return out;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
