function normalizeSearch(search = '') {
  return search.startsWith('?') ? search.slice(1) : search;
}

export function parse(search = '') {
  const params = {};
  const normalized = normalizeSearch(search);

  if (!normalized) {
    return params;
  }

  const urlSearchParams = new URLSearchParams(normalized);

  urlSearchParams.forEach((value, key) => {
    if (params[key] === undefined) {
      params[key] = value;
      return;
    }

    params[key] = Array.isArray(params[key])
      ? [...params[key], value]
      : [params[key], value];
  });

  return params;
}

export function stringify(value = {}, options = {}) {
  const entries = Object.entries(value).filter(([, item]) => item !== undefined);

  if (options.sort !== false) {
    entries.sort(([a], [b]) => a.localeCompare(b));
  }

  const params = new URLSearchParams();

  entries.forEach(([key, item]) => {
    if (Array.isArray(item)) {
      item.forEach(nestedItem => {
        params.append(key, String(nestedItem));
      });
      return;
    }

    if (item !== null) {
      params.append(key, String(item));
    }
  });

  return params.toString();
}
