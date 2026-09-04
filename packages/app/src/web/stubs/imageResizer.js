const loadImage = uri =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    const timeoutId = window.setTimeout(
      () => reject(new Error('IMAGE_DECODE_TIMEOUT')),
      15000,
    );

    image.onload = () => {
      window.clearTimeout(timeoutId);
      resolve(image);
    };
    image.onerror = () => {
      window.clearTimeout(timeoutId);
      reject(new Error('IMAGE_DECODE_FAILED'));
    };
    image.src = uri;
  });

const getTargetSize = (sourceWidth, sourceHeight, maxWidth, maxHeight) => {
  if (
    !Number.isFinite(sourceWidth) ||
    !Number.isFinite(sourceHeight) ||
    sourceWidth <= 0 ||
    sourceHeight <= 0
  ) {
    throw new Error('INVALID_IMAGE_DIMENSIONS');
  }

  const ratio = Math.min(
    maxWidth / sourceWidth,
    maxHeight / sourceHeight,
    1,
  );

  return {
    width: Math.max(1, Math.round(sourceWidth * ratio)),
    height: Math.max(1, Math.round(sourceHeight * ratio)),
  };
};

const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve, reject) => {
    if (typeof canvas.toBlob !== 'function') {
      try {
        const dataUrl = canvas.toDataURL(type, quality);
        const [metadata, encodedData] = dataUrl.split(',');
        const mimeType = metadata.match(/data:([^;]+)/)?.[1] || type;
        const binary = window.atob(encodedData);
        const bytes = new Uint8Array(binary.length);

        for (let index = 0; index < binary.length; index += 1) {
          bytes[index] = binary.charCodeAt(index);
        }

        resolve(new Blob([bytes], {type: mimeType}));
      } catch (error) {
        reject(error);
      }
      return;
    }

    canvas.toBlob(
      blob => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error('CANVAS_TO_BLOB_FAILED'));
      },
      type,
      quality,
    );
  });

const ImageResizer = {
  createResizedImage: async (
    uri,
    maxWidth,
    maxHeight,
    compressFormat = 'JPEG',
    quality = 90,
  ) => {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return {uri};
    }

    const image = await loadImage(uri);
    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;
    const {width, height} = getTargetSize(
      sourceWidth,
      sourceHeight,
      maxWidth || sourceWidth,
      maxHeight || sourceHeight,
    );
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('CANVAS_CONTEXT_UNAVAILABLE');
    }

    canvas.width = width;
    canvas.height = height;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, width, height);

    const type =
      String(compressFormat).toUpperCase() === 'PNG'
        ? 'image/png'
        : 'image/jpeg';
    const blob = await canvasToBlob(
      canvas,
      type,
      Math.max(0, Math.min(1, Number(quality) / 100)),
    );

    return {
      blob,
      uri: URL.createObjectURL(blob),
      name: `resized-${Date.now()}.${type === 'image/png' ? 'png' : 'jpg'}`,
      size: blob.size,
      type,
      width,
      height,
    };
  },
};

export default ImageResizer;
