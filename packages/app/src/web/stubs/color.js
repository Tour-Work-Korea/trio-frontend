const NAMED_COLORS = {
  black: [0, 0, 0],
  transparent: [0, 0, 0, 0],
  white: [255, 255, 255],
};

function clamp(value, min = 0, max = 255) {
  return Math.min(max, Math.max(min, value));
}

function parseColor(input) {
  if (input instanceof WebColor) {
    return input.channels;
  }

  if (typeof input !== 'string') {
    return [0, 0, 0, 1];
  }

  const value = input.trim().toLowerCase();

  if (NAMED_COLORS[value]) {
    const [r, g, b, a = 1] = NAMED_COLORS[value];
    return [r, g, b, a];
  }

  const hex = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i);

  if (hex) {
    let raw = hex[1];

    if (raw.length === 3) {
      raw = raw.split('').map(char => char + char).join('');
    }

    const r = parseInt(raw.slice(0, 2), 16);
    const g = parseInt(raw.slice(2, 4), 16);
    const b = parseInt(raw.slice(4, 6), 16);
    const a = raw.length === 8 ? parseInt(raw.slice(6, 8), 16) / 255 : 1;

    return [r, g, b, a];
  }

  const rgb = value.match(/^rgba?\(([^)]+)\)$/);

  if (rgb) {
    const [r, g, b, a = 1] = rgb[1].split(',').map(part => Number(part.trim()));
    return [r, g, b, a];
  }

  return [0, 0, 0, 1];
}

class WebColor {
  constructor(input) {
    this.channels = parseColor(input);
  }

  alpha(value) {
    if (value === undefined) {
      return this.channels[3];
    }

    this.channels[3] = clamp(value, 0, 1);
    return this;
  }

  fade(value) {
    this.channels[3] = clamp(this.channels[3] * (1 - value), 0, 1);
    return this;
  }

  darken(value) {
    this.channels = this.channels.map((channel, index) => (
      index < 3 ? clamp(channel * (1 - value)) : channel
    ));
    return this;
  }

  mix(other, weight = 0.5) {
    const otherChannels = parseColor(other);
    this.channels = this.channels.map((channel, index) => (
      index < 3
        ? clamp(channel * (1 - weight) + otherChannels[index] * weight)
        : channel
    ));
    return this;
  }

  rgb() {
    return this;
  }

  isDark() {
    return this.luminance() < 0.5;
  }

  isLight() {
    return !this.isDark();
  }

  luminance() {
    const [r, g, b] = this.channels.map(channel => channel / 255);
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  hex() {
    const [r, g, b] = this.channels;
    return `#${[r, g, b]
      .map(channel => Math.round(channel).toString(16).padStart(2, '0'))
      .join('')}`;
  }

  string() {
    const [r, g, b, a] = this.channels;

    if (a < 1) {
      return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
    }

    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  }
}

export default function Color(input) {
  return new WebColor(input);
}
