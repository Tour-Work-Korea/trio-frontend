import commonApi from './api/commonApi';
import {launchImageLibrary} from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';

const DEFAULT_IMAGE_OPTIONS = {
  maxWidth: 1280,
  maxHeight: 1280,
  quality: 0.8, // 0~1
  format: 'JPEG', // 'JPEG' | 'PNG' | 'WEBP'
  mode: 'contain', // 'contain' | 'cover' | 'stretch'
  keepMeta: false,
  rotation: 0,
};

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
const resizeImage = async (sourceUri, options = {}) => {
  const opts = {...DEFAULT_IMAGE_OPTIONS, ...options};
  const result = await ImageResizer.createResizedImage(
    sourceUri,
    opts.maxWidth,
    opts.maxHeight,
    opts.format,
    Math.round(opts.quality * 100),
    opts.rotation,
    undefined, // outputPath
    opts.keepMeta,
    {onlyScaleDown: true, mode: opts.mode},
  );

  const ext =
    (opts.format || 'JPEG').toLowerCase() === 'jpeg'
      ? 'jpg'
      : (opts.format || 'JPEG').toLowerCase();
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
    headers: {'Content-Type': fileType}, // <- 정확한 MIME
    body: blob,
  });

  return presignedUrl.split('?')[0];
};

//단일 이미지 업로드
export const uploadSingleImage = async options => {
  const result = await new Promise(resolve =>
    launchImageLibrary({mediaType: 'photo'}, response => resolve(response)),
  );
  if (result.didCancel || result.errorCode || !result.assets) return null;

  const asset = result.assets[0];
  const resized = await resizeImage(asset.uri, options); // 기본값 자동 적용
  const presignedUrl = await getPresignedUrl(resized.name);
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

  const urls = [];
  for (const asset of result.assets) {
    const resized = await resizeImage(asset.uri, options); // 기본값 자동 적용
    const presignedUrl = await getPresignedUrl(resized.name);
    const uploadedUrl = await uploadImageToS3(
      presignedUrl,
      resized.uri,
      resized.type,
    );
    urls.push(uploadedUrl);
  }
  return urls;
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
  const resized = await resizeImage(asset.uri, options); // 기본값 자동 적용

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
