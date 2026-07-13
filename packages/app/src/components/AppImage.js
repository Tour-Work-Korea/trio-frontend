import React from 'react';
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

export const prefetchImageUrls = (urls, {limit = 8} = {}) => {
  if (!Array.isArray(urls) || limit <= 0) {
    return Promise.resolve([]);
  }

  const uniqueUrls = Array.from(
    new Set(
      urls
        .filter(isRemoteUri)
        .map(url => url.trim()),
    ),
  ).slice(0, limit);

  if (!uniqueUrls.length) {
    return Promise.resolve([]);
  }

  return Promise.allSettled(uniqueUrls.map(url => Image.prefetch(url)));
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
  const imageSource = source
    ? withCachePolicy(source, cache)
    : createImageSource(uri, cache);

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
