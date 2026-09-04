const getAccept = mediaType => {
  if (mediaType === 'video') {
    return 'video/*';
  }

  if (mediaType === 'mixed') {
    return 'image/*,video/*';
  }

  // iOS Safari가 HEIC 원본을 그대로 넘기면 브라우저 canvas 및 업로드
  // 서버에서 처리하지 못할 수 있다. 지원 형식을 명시하면 사진 보관함이
  // 호환 가능한 JPEG로 내보내도록 유도할 수 있다.
  return 'image/jpeg,image/png,image/webp';
};

const getImageSize = uri =>
  new Promise(resolve => {
    const image = new window.Image();
    const timeoutId = window.setTimeout(() => resolve({}), 10000);

    image.onload = () => {
      window.clearTimeout(timeoutId);
      resolve({
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height,
      });
    };
    image.onerror = () => {
      window.clearTimeout(timeoutId);
      resolve({});
    };
    image.src = uri;
  });

const normalizeFile = async file => {
  const uri = URL.createObjectURL(file);
  const size = file.type?.startsWith('image/') ? await getImageSize(uri) : {};

  return {
    file,
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

      let settled = false;
      const finish = result => {
        if (settled) {
          return;
        }
        settled = true;
        cleanup();
        resolve(result);
      };

      const cleanup = () => {
        window.removeEventListener('focus', handleWindowFocus);
        input.remove();
      };

      // 일부 iOS Safari/WebView는 file input의 cancel 이벤트를 보내지 않는다.
      // 선택 UI에서 돌아온 뒤 파일이 없으면 취소로 마무리해 Promise가 남지 않게 한다.
      const handleWindowFocus = () => {
        window.setTimeout(() => {
          if (!settled && !(input.files?.length > 0)) {
            finish({didCancel: true, assets: []});
          }
        }, 500);
      };

      input.addEventListener('change', async () => {
        const files = Array.from(input.files || []);

        if (files.length === 0) {
          finish({
            didCancel: true,
            assets: [],
          });
          return;
        }

        const limitedFiles =
          selectionLimit > 0 ? files.slice(0, selectionLimit) : files;
        try {
          const assets = await Promise.all(limitedFiles.map(normalizeFile));
          finish({didCancel: false, assets});
        } catch (error) {
          finish({
            didCancel: false,
            errorCode: 'others',
            errorMessage: error?.message ?? 'FILE_NORMALIZE_FAILED',
            assets: [],
          });
        }
      });

      input.addEventListener('cancel', () => {
        finish({
          didCancel: true,
          assets: [],
        });
      });

      document.body.appendChild(input);
      window.addEventListener('focus', handleWindowFocus);
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
