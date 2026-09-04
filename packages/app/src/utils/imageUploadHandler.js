import commonApi from './api/commonApi';
import {Platform} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';

/**
 *
 * 단일 이미지 업로드: uploadSingleImage -> 간접적으로 S3에 업로드 후 imageUrl 반환
 * 복수 이미지 업로드: uploadMultiImage -> 간접적으로 S3에 업로드 후 imageUrl 배열 반환
 * 민감 이미지 업로드(사업자등록증): uploadSensitiveImage -> 직점 S3에 업로드 후 imageUrl 반환
 *
 * 위의 함수 실행 시 자동으로 이미지 선택부터 url 반환까지 됨
 * 이미지 url 받아서 수정, 등록에 쓰면 됩니다
 * 예시는 UserEditProfile 참고
 */

//비민감 이미지 URL 받기
const getPresignedUrl = async (filename, contentType) => {
  const response = await commonApi.getPresignedUrl(filename, contentType);
  const presignedUrl = response.data?.presignedUrl;

  if (!presignedUrl) {
    throw new Error('IMAGE_PRESIGNED_URL_MISSING');
  }

  return presignedUrl;
};

const IMAGE_EXTENSION_BY_TYPE = {
  'image/avif': 'avif',
  'image/gif': 'gif',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const getImageContentType = asset => {
  const type = asset?.type?.split(';')[0]?.trim()?.toLowerCase();
  if (type === 'image/jpg' || type === 'image/pjpeg') {
    return 'image/jpeg';
  }
  if (type === 'image/x-png') {
    return 'image/png';
  }
  if (type?.startsWith('image/')) {
    return type;
  }

  const extension = asset?.fileName?.split('.').pop()?.toLowerCase();
  if (extension === 'jpg' || extension === 'jpeg') {
    return 'image/jpeg';
  }
  if (extension && IMAGE_EXTENSION_BY_TYPE[`image/${extension}`]) {
    return `image/${extension}`;
  }

  return 'application/octet-stream';
};

export const getImageUploadInfo = (asset, wasCompressed) => {
  const contentType = wasCompressed ? 'image/jpeg' : getImageContentType(asset);
  const extension = IMAGE_EXTENSION_BY_TYPE[contentType] || 'bin';

  return {
    contentType,
    filename: generateUniqueFilename(extension),
  };
};

// ⬇️ 압축 유틸 (JPEG로 리사이즈/재인코딩)
const compressToJPEG = async (
  uri,
  {maxWidth = 1280, maxHeight = 1280, quality = 0.8} = {},
) => {
  // image-resizer의 quality는 0..100
  const q = Math.max(1, Math.min(100, Math.round(quality * 100)));
  const resizedImage = await ImageResizer.createResizedImage(
    uri,
    maxWidth,
    maxHeight,
    'JPEG', // JPEG로 통일
    q,
  );
  return resizedImage;
};

//S3에 업로드
const uploadImageWithXHR = (presignedUrl, fileType, body) =>
  new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open('PUT', presignedUrl);
    request.setRequestHeader('Content-Type', fileType);
    request.timeout = 60000;
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve();
        return;
      }

      reject(new Error(`IMAGE_UPLOAD_FAILED_${request.status}`));
    };
    request.onerror = () => reject(new Error('IMAGE_UPLOAD_NETWORK_FAILED'));
    request.ontimeout = () => reject(new Error('IMAGE_UPLOAD_TIMEOUT'));
    request.send(body);
  });

const isRetryableUploadError = error =>
  error?.message === 'IMAGE_UPLOAD_NETWORK_FAILED' ||
  error?.message === 'IMAGE_UPLOAD_TIMEOUT' ||
  /^IMAGE_UPLOAD_FAILED_5\d\d$/.test(error?.message ?? '');

const wait = milliseconds =>
  new Promise(resolve => setTimeout(resolve, milliseconds));

export const putImageToPresignedUrl = async (
  presignedUrl,
  fileType,
  body,
) => {
  if (!presignedUrl || !body) {
    throw new Error('IMAGE_UPLOAD_DATA_MISSING');
  }

  if (Platform.OS === 'web' && typeof XMLHttpRequest !== 'undefined') {
    let lastError;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        await uploadImageWithXHR(presignedUrl, fileType, body);
        return;
      } catch (error) {
        lastError = error;
        if (!isRetryableUploadError(error) || attempt === 1) {
          throw error;
        }
        await wait(400);
      }
    }

    throw lastError;
  }

  const response = await fetch(presignedUrl, {
    method: 'PUT',
    headers: {'Content-Type': fileType},
    body,
  });

  if (!response.ok) {
    throw new Error(`IMAGE_UPLOAD_FAILED_${response.status}`);
  }
};

export const uploadImageToS3 = async (
  presignedUrl,
  fileUri,
  fileType,
  uploadBody,
) => {
  let body = uploadBody;

  if (!body) {
    const fileData = await fetch(fileUri);
    body = await fileData.blob();
  }

  await putImageToPresignedUrl(presignedUrl, fileType, body);

  const publicUrl = presignedUrl.split('?')[0];
  return publicUrl.replace(/^https?:\/\/[^/]+/, 'https://cdn.ddakji.kr');
};

//단일 이미지 업로드 (✅ 압축 추가)
export const uploadSingleImage = async () => {
  const result = await new Promise(resolve =>
    launchImageLibrary({mediaType: 'photo'}, response => resolve(response)),
  );

  if (result.didCancel || result.errorCode || !result.assets) return null;

  const asset = result.assets[0];
  const originalUri = asset.uri;

  // 1) 압축 시도 → 실패하면 원본 사용
  let fileUri = originalUri;
  let uploadBody = asset.file;
  let wasCompressed = false;
  try {
    const resizedImage = await compressToJPEG(originalUri, {
      maxWidth: 1280,
      maxHeight: 1280,
      quality: 0.8,
    });
    fileUri = resizedImage.uri;
    uploadBody = resizedImage.blob;
    wasCompressed = true;
  } catch (e) {
    console.warn(
      '[uploadSingleImage] compress failed -> fallback to original:',
      e,
    );
  }

  // 모바일 브라우저가 HEIC 등의 디코딩을 지원하지 않아 압축에 실패하면
  // 원본의 실제 MIME 타입과 확장자로 업로드한다.
  const {contentType: fileType, filename} = getImageUploadInfo(
    asset,
    wasCompressed,
  );

  const presignedUrl = await getPresignedUrl(filename, fileType);
  const uploadedUrl = await uploadImageToS3(
    presignedUrl,
    fileUri,
    fileType,
    uploadBody,
  );

  return uploadedUrl;
};

//복수 이미지 업로드 (✅ 각 이미지 압축 추가)
export const uploadMultiImage = async (limit = 10) => {
  const result = await new Promise(resolve =>
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: limit,
      },
      response => resolve(response),
    ),
  );

  if (result.didCancel || result.errorCode || !result.assets) return [];

  const uploadedUrls = [];

  for (const asset of result.assets) {
    const originalUri = asset.uri;

    // 1) 압축 시도 → 실패 시 원본
    let fileUri = originalUri;
    let uploadBody = asset.file;
    let wasCompressed = false;
    try {
      const resizedImage = await compressToJPEG(originalUri, {
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 0.8,
      });
      fileUri = resizedImage.uri;
      uploadBody = resizedImage.blob;
      wasCompressed = true;
    } catch (e) {
      console.warn(
        '[uploadMultiImage] compress failed -> fallback to original:',
        e,
      );
    }

    const {contentType: fileType, filename} = getImageUploadInfo(
      asset,
      wasCompressed,
    );

    const presignedUrl = await getPresignedUrl(filename, fileType);
    const uploadedUrl = await uploadImageToS3(
      presignedUrl,
      fileUri,
      fileType,
      uploadBody,
    );

    uploadedUrls.push(uploadedUrl);
  }

  return uploadedUrls;
};

/**
 * 민감 이미지 업로드 (사업자등록증, 신분증 등)
 * → 백엔드에 직접 multipart/form-data로 업로드
 * (요청대로 "최소 변경" 원칙: 여기엔 압축 비적용 / 필요하면 주석 해제해도 됨)
 */
export const uploadSensitiveImage = async () => {
  const result = await new Promise(resolve =>
    launchImageLibrary({mediaType: 'photo'}, response => resolve(response)),
  );
  if (result.didCancel || result.errorCode || !result.assets) return null;

  const asset = result.assets[0];
  const originalUri = asset.uri;

  // 📌 더 공격적인 적응형 압축 적용
  let fileUri = originalUri;
  let uploadBody = asset.file;
  let wasCompressed = false;
  try {
    fileUri = await adaptiveCompressToJPEG(originalUri, {
      targetBytes: 1.8 * 1024 * 1024, // 서버 한도 2MB라 가정 시 여유
      startMax: 1600,
      minMax: 800,
      startQuality: 0.8,
      minQuality: 0.55,
      stepQuality: 0.1,
    });
    wasCompressed = true;
    if (Platform.OS === 'web') {
      const fileResponse = await fetch(fileUri);
      uploadBody = await fileResponse.blob();
    }
  } catch (e) {
    console.warn('[uploadSensitiveImage] adaptive compress failed:', e);
  }

  const {filename: fileName, contentType: fileType} = getImageUploadInfo(
    asset,
    wasCompressed,
  );

  const formData = new FormData();

  if (Platform.OS === 'web') {
    if (!uploadBody) {
      const fileResponse = await fetch(fileUri);
      uploadBody = await fileResponse.blob();
    }
    formData.append('image', uploadBody, fileName);
  } else {
    formData.append('image', {uri: fileUri, name: fileName, type: fileType});
  }

  try {
    const response = await commonApi.postImage(formData);
    return response.data;
  } catch (error) {
    console.error('민감 이미지 업로드 실패:', error?.response?.data?.message);
    return null;
  }
};

export const generateUniqueFilename = (extension = 'jpg') => {
  const timestamp = Date.now(); // 현재 시간 (ms)
  const random = Math.floor(Math.random() * 1000000); // 0 ~ 999999
  return `image_${timestamp}_${random}.${extension}`;
};

// 바이트 크기 구하기 (RN fetch → blob → size)
const getFileSize = async uri => {
  const res = await fetch(uri);
  const blob = await res.blob();
  return blob.size; // bytes
};

// 목표 용량 이하가 될 때까지 maxWidth/quality를 줄여가며 재압축
export const adaptiveCompressToJPEG = async (
  uri,
  {
    targetBytes = 1.8 * 1024 * 1024, // 1.8MB
    startMax = 1600,
    minMax = 800,
    startQuality = 0.8,
    minQuality = 0.5,
    stepQuality = 0.1,
  } = {},
) => {
  let maxEdge = startMax;
  let quality = startQuality;
  let outUri = uri;

  // 1차 압축
  outUri = (
    await ImageResizer.createResizedImage(
      uri,
      maxEdge,
      maxEdge,
      'JPEG',
      Math.round(quality * 100),
    )
  ).uri;
  let size = await getFileSize(outUri);
  if (size <= targetBytes) return outUri;

  // 반복 압축
  while (quality > minQuality || maxEdge > minMax) {
    if (quality > minQuality) {
      quality = Math.max(minQuality, +(quality - stepQuality).toFixed(2));
    } else if (maxEdge > minMax) {
      maxEdge = Math.max(minMax, maxEdge - 200);
      // quality는 살짝 롤백해서 too small 방지
      quality = Math.min(startQuality, quality + stepQuality);
    }

    outUri = (
      await ImageResizer.createResizedImage(
        uri,
        maxEdge,
        maxEdge,
        'JPEG',
        Math.round(quality * 100),
      )
    ).uri;
    size = await getFileSize(outUri);
    if (size <= targetBytes) break;
  }
  return outUri;
};
