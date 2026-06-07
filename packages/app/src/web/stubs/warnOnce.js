const warnings = new Set();

export default function warnOnce(condition, ...rest) {
  if (!__DEV__ || !condition) {
    return;
  }

  const key = rest.join(' ');

  if (warnings.has(key)) {
    return;
  }

  warnings.add(key);
  console.warn(...rest);
}
