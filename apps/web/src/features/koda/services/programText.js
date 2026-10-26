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

function trimUrlPunctuation(value) {
  let url = value;
  let previous;
  do {
    previous = url;
    url = url.replace(/[.,!?;:。！，？；：]+$/, '');
    for (const [open, close] of [
      ['(', ')'],
      ['[', ']'],
      ['{', '}'],
    ]) {
      while (
        url.endsWith(close) &&
        url.split(close).length > url.split(open).length
      )
        url = url.slice(0, -1);
    }
  } while (url !== previous);
  return url;
}

export function programInline(text = '') {
  const parts = [];
  const appendText = value => {
    if (!value) return;
    const last = parts[parts.length - 1];
    if (last && !last.bold && !last.href) last.text += value;
    else parts.push({text: value, bold: false});
  };
  // Consume image/invalid Markdown and HTML as text before matching bare URLs.
  // Parentheses inside common Markdown map URLs are supported one level deep.
  const tokens =
    /\*\*([^*\n]+)\*\*|!?\[([^\]\n]+)\]\(((?:[^()\s]|\([^()\s]*\))*)\)|!?\[[^\]\n]+\]\([^\s]*|<[^>\n]*>|https?:\/\/[^\s<>"'`]+/gi;
  let offset = 0;
  for (const match of text.matchAll(tokens)) {
    appendText(text.slice(offset, match.index));
    if (match[1]) parts.push({text: match[1], bold: true});
    else if (match[2] && !match[0].startsWith('!')) {
      const href = placeLink(match[3]);
      if (href) parts.push({text: match[2], bold: false, href});
      else appendText(match[0]);
    } else if (/^https?:\/\//i.test(match[0])) {
      const label = trimUrlPunctuation(match[0]);
      const href = placeLink(label);
      if (href) {
        parts.push({text: label, bold: false, href});
        appendText(match[0].slice(label.length));
      } else appendText(match[0]);
    } else appendText(match[0]);
    offset = match.index + match[0].length;
  }
  appendText(text.slice(offset));
  return parts;
}
