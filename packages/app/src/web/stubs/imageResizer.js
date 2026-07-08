const loadImage = uri =>
  new Promise((resolve, reject) => {
    const image = new window.Image();

    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = uri;
  });

const getTargetSize = (sourceWidth, sourceHeight, maxWidth, maxHeight) => {
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

    canvas.width = width;
    canvas.height = height;
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
