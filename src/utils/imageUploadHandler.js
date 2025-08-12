import commonApi from './api/commonApi';
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

// 원하는 기본값: 긴 변 1280px, 품질 0.8, JPEG로 강제(HEIC → JPEG 변환)
const resizeImage = async (
  sourceUri,
  {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.8, // 0~1
    format = 'JPEG', // 'JPEG' | 'PNG' | 'WEBP'
    rotation = 0,
    keepMeta = false, // EXIF 유지 여부
    mode = 'contain', // 'contain' | 'cover' | 'stretch'
  } = {},
) => {
  const result = await ImageResizer.createResizedImage(
    sourceUri,
    maxWidth,
    maxHeight,
    format,
    Math.round(quality * 100),
    rotation,
    undefined, // outputPath
    keepMeta,
    {onlyScaleDown: true, mode},
  );
  // result: { uri, path, name, size }
  const ext =
    (format || 'JPEG').toLowerCase() === 'jpeg'
      ? 'jpg'
      : (format || 'JPEG').toLowerCase();
  const mime = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
  const name = result.name ?? `image_${Date.now()}.${ext}`;

  return {uri: result.uri, name, type: mime, ext};
};

//비민감 이미지 URL 받기
const getPresignedUrl = async filename => {
  const response = await commonApi.getPresignedUrl(filename);
  return response.data;
};

//S3에 업로드
export const uploadImageToS3 = async (presignedUrl, fileUri, fileType) => {
  const fileData = await fetch(fileUri);
  const blob = await fileData.blob();

  await fetch(presignedUrl, {
    method: 'PUT',
    headers: {'Content-Type': fileType},
    body: blob,
  });

  return presignedUrl.split('?')[0]; // 실제 접근 URL
};

//단일 이미지 업로드
export const uploadSingleImage = async options => {
  const result = await new Promise(resolve =>
    launchImageLibrary({mediaType: 'photo'}, response => resolve(response)),
  );

  if (result.didCancel || result.errorCode || !result.assets) return null;

  const asset = result.assets[0];
  const originalUri = asset.uri;

  // ① 리사이징 (옵션으로 사이즈/품질 커스터마이즈 가능)
  const resized = await resizeImage(originalUri, options); // {uri, name, type, ext}

  // ② 파일명은 리사이즈 결과 확장자와 일치하도록 생성
  const filename = resized.name; // or generateUniqueFilename(resized.ext)
  const presignedUrl = await getPresignedUrl(filename);

  // ④ S3 업로드 (정확한 MIME 전달)
  const uploadedUrl = await uploadImageToS3(
    presignedUrl,
    resized.uri,
    resized.type,
  );

  return uploadedUrl;
};

//복수 이미지 업로드
export const uploadMultiImage = async (limit, options) => {
  const result = await new Promise(resolve =>
    launchImageLibrary({mediaType: 'photo', selectionLimit: limit}, response =>
      resolve(response),
    ),
  );

  if (result.didCancel || result.errorCode || !result.assets) return [];

  const uploadedUrls = [];

  for (const asset of result.assets) {
    const originalUri = asset.uri;

    const resized = await resizeImage(originalUri, options); // {uri, name, type, ext}
    const filename = resized.name;

    const presignedUrl = await getPresignedUrl(filename);
    const uploadedUrl = await uploadImageToS3(
      presignedUrl,
      resized.uri,
      resized.type,
    );

    uploadedUrls.push(uploadedUrl);
  }

  return uploadedUrls;
};

/**
 * 민감 이미지 업로드 (사업자등록증, 신분증 등)
 * → 백엔드에 직접 multipart/form-data로 업로드
 */
export const uploadSensitiveImage = async options => {
  const result = await new Promise(resolve =>
    launchImageLibrary({mediaType: 'photo'}, response => resolve(response)),
  );

  if (result.didCancel || result.errorCode || !result.assets) return null;

  const asset = result.assets[0];
  const resized = await resizeImage(asset.uri, options); // {uri, name, type}

  const formData = new FormData();
  formData.append('image', {
    uri: resized.uri,
    name: resized.name,
    type: resized.type,
  });

  try {
    const response = await commonApi.postImage(formData);
    return response.data; // S3 public URL
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
