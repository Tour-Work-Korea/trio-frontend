// Small text-only subset used by admin program descriptions: headings, lists,
// paragraphs, bold and HTTP(S) links. HTML and image markup remain plain text.
export function programBlocks(text = '') {
  const blocks = [];
  let current = null;
  for (const line of text.replace(/\r\n?/g, '\n').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) {
      current = null;
      continue;
    }
    const heading = trimmed.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (heading) {
      blocks.push({
        type: 'heading',
        level: Math.min(heading[1].length + 1, 4),
        text: heading[2],
      });
      current = null;
      continue;
    }
    const item = trimmed.match(/^(?:([-+*])|([0-9]+)[.)])\s+(.+)$/);
    if (item) {
      const type = item[2] ? 'ordered' : 'unordered';
      if (current?.type !== type) {
        current = {
          type,
          start: item[2] ? Number(item[2]) : undefined,
          items: [],
        };
        blocks.push(current);
      }
      current.items.push(item[3]);
      continue;
    }
    if (current?.type === 'paragraph') current.text += `\n${line}`;
    else {
      current = {type: 'paragraph', text: line};
      blocks.push(current);
    }
  }
  return blocks;
}

function placeLink(value) {
  // No relative, protocol-relative, script, data, credential-bearing or malformed links.
  if (!/^https?:\/\//i.test(value) || /[\u0000-\u0020\u007f\\]/.test(value))
    return null;
  try {
    const url = new URL(value);
    return url.hostname && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export function programInline(text) {
  const parts = [];
  const appendText = value => {
    if (!value) return;
    const last = parts[parts.length - 1];
    if (last && !last.bold && !last.href) last.text += value;
    else parts.push({text: value, bold: false});
  };
  // Parentheses inside common map URLs are supported one level deep.
  const tokens =
    /\*\*([^*\n]+)\*\*|(?<!!)\[([^\]\n]+)\]\(((?:[^()\s]|\([^()\s]*\))*)\)/g;
  let offset = 0;
  for (const match of text.matchAll(tokens)) {
    appendText(text.slice(offset, match.index));
    if (match[1]) parts.push({text: match[1], bold: true});
    else {
      const href = placeLink(match[3]);
      if (href) parts.push({text: match[2], bold: false, href});
      else appendText(match[0]);
    }
    offset = match.index + match[0].length;
  }
  appendText(text.slice(offset));
  return parts;
}
