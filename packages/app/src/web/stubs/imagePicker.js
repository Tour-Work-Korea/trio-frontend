const getAccept = mediaType => {
  if (mediaType === 'video') {
    return 'video/*';
  }

  if (mediaType === 'mixed') {
    return 'image/*,video/*';
  }

  return 'image/*';
};

const getImageSize = uri =>
  new Promise(resolve => {
    const image = new window.Image();

    image.onload = () => {
      resolve({
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
      });
    };
    image.onerror = () => resolve({});
    image.src = uri;
  });

const normalizeFile = async file => {
  const uri = URL.createObjectURL(file);
  const size = file.type?.startsWith('image/') ? await getImageSize(uri) : {};

  return {
    uri,
    fileName: file.name,
    fileSize: file.size,
    type: file.type || 'application/octet-stream',
    width: size.width,
    height: size.height,
  };
};

export const launchImageLibrary = async (options = {}, callback) => {
  const runPicker = () =>
    new Promise(resolve => {
      if (typeof document === 'undefined') {
        resolve({
          didCancel: true,
          assets: [],
        });
        return;
      }

      const input = document.createElement('input');
      const selectionLimit = Number(options.selectionLimit ?? 1);

      input.type = 'file';
      input.accept = getAccept(options.mediaType);
      input.multiple = selectionLimit !== 1;
      input.style.display = 'none';

      const cleanup = () => {
        input.remove();
      };

      input.addEventListener('change', async () => {
        const files = Array.from(input.files || []);

        cleanup();

        if (files.length === 0) {
          resolve({
            didCancel: true,
            assets: [],
          });
          return;
        }

        const limitedFiles =
          selectionLimit > 0 ? files.slice(0, selectionLimit) : files;
        const assets = await Promise.all(limitedFiles.map(normalizeFile));

        resolve({
          didCancel: false,
          assets,
        });
      });

      input.addEventListener('cancel', () => {
        cleanup();
        resolve({
          didCancel: true,
          assets: [],
        });
      });

      document.body.appendChild(input);
      input.click();
    });

  const result = await runPicker();

  if (typeof callback === 'function') {
    callback(result);
  }

  return result;
};

export const launchCamera = launchImageLibrary;

export default {
  launchCamera,
  launchImageLibrary,
};
