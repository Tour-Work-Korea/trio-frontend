import React, {useMemo} from 'react';
import {Image, Platform} from 'react-native';

const DEFAULT_CACHE = 'force-cache';

const isRemoteUri = uri => typeof uri === 'string' && uri.trim().length > 0;

const withCachePolicy = (source, cache = DEFAULT_CACHE) => {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    return source;
  }

  if (!isRemoteUri(source.uri)) {
    return source;
  }

  return {
    ...source,
    uri: source.uri.trim(),
    cache: source.cache ?? cache,
  };
};

export const createImageSource = (uri, cache = DEFAULT_CACHE) => {
  if (!isRemoteUri(uri)) {
    return null;
  }

  return {
    uri: uri.trim(),
    cache,
  };
};

// Keep speculative downloads below the native loader's request limit so visible
// images have room to load. Share pending work across screens and carousel clones.
const pendingPrefetches = new Map();
const prefetchQueue = [];
const MAX_QUEUED_PREFETCHES = 32;
let activePrefetches = 0;

const drainPrefetchQueue = () => {
  const concurrency = Platform.OS === 'ios' ? 2 : 4;
  while (activePrefetches < concurrency && prefetchQueue.length) {
    const task = prefetchQueue.shift();
    activePrefetches += 1;
    Promise.resolve()
      .then(async () => {
        // Consult the native cache instead of retaining a JS "loaded" flag:
        // iOS may evict cached images at any time under memory pressure.
        const cached = await Image.queryCache?.([task.url]).catch(() => ({}));
        return cached?.[task.url] ? true : Image.prefetch(task.url);
      })
      .then(task.resolve, task.reject)
      .finally(() => {
        pendingPrefetches.delete(task.url);
        activePrefetches -= 1;
        drainPrefetchQueue();
      });
  }
};

export const prefetchImageUrls = (urls, {limit = 8, priority = false} = {}) => {
  if (!Array.isArray(urls) || limit <= 0) {
    return Promise.resolve([]);
  }

  const uniqueUrls = Array.from(
    new Set(
      urls
        .filter(isRemoteUri)
        .map(url => url.trim())
        .filter(url => /^https?:\/\//i.test(url)),
    ),
  ).slice(0, limit);

  const requests = uniqueUrls.map(url => {
    if (pendingPrefetches.has(url)) {
      if (priority) {
        const index = prefetchQueue.findIndex(task => task.url === url);
        if (index >= 0) {
          prefetchQueue[index].priority = true;
        }
      }
      return pendingPrefetches.get(url);
    }
    let resolve;
    let reject;
    const promise = new Promise((success, failure) => {
      resolve = success;
      reject = failure;
    });
    pendingPrefetches.set(url, promise);
    prefetchQueue.push({url, resolve, reject, priority});
    return promise;
  });
  // Stable ordering preserves the caller's nearest-neighbour order.
  prefetchQueue.sort((a, b) => Number(b.priority) - Number(a.priority));
  while (prefetchQueue.length > MAX_QUEUED_PREFETCHES) {
    const task = prefetchQueue.pop();
    pendingPrefetches.delete(task.url);
    task.resolve(false);
  }
  drainPrefetchQueue();
  return Promise.allSettled(requests);
};

const AppImage = ({
  uri,
  source,
  cache = DEFAULT_CACHE,
  resizeMode = 'cover',
  resizeMethod,
  progressiveRenderingEnabled,
  fadeDuration,
  ...props
}) => {
  const imageSource = useMemo(
    () =>
      source ? withCachePolicy(source, cache) : createImageSource(uri, cache),
    [source, uri, cache],
  );

  if (!imageSource) {
    return null;
  }

  return (
    <Image
      {...props}
      source={imageSource}
      resizeMode={resizeMode}
      resizeMethod={
        resizeMethod ?? (Platform.OS === 'android' ? 'resize' : undefined)
      }
      progressiveRenderingEnabled={
        progressiveRenderingEnabled ?? Platform.OS === 'android'
      }
      fadeDuration={fadeDuration ?? (Platform.OS === 'android' ? 0 : undefined)}
    />
  );
};

export default AppImage;
