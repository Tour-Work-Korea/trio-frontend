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

//비민감 이미지 URL 받기
const getPresignedUrl = async filename => {
  const response = await commonApi.getPresignedUrl(filename);
  return response.data;
};

// ⬇️ 압축 유틸 (JPEG로 리사이즈/재인코딩)
const compressToJPEG = async (
  uri,
  {maxWidth = 1280, maxHeight = 1280, quality = 0.8} = {},
) => {
  // image-resizer의 quality는 0..100
  const q = Math.max(1, Math.min(100, Math.round(quality * 100)));
  const {uri: outUri} = await ImageResizer.createResizedImage(
    uri,
    maxWidth,
    maxHeight,
    'JPEG', // JPEG로 통일
    q,
  );
  return outUri;
};

//S3에 업로드
export const uploadImageToS3 = async (presignedUrl, fileUri, fileType) => {
  const fileData = await fetch(fileUri);
  const blob = await fileData.blob();

  await fetch(presignedUrl, {
    method: 'PUT',
    headers: {'Content-Type': 'image/*'}, // 기존 로직 유지
    body: blob,
  });

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
  try {
    fileUri = await compressToJPEG(originalUri, {
      maxWidth: 1280,
      maxHeight: 1280,
      quality: 0.8,
    });
  } catch (e) {
    console.warn(
      '[uploadSingleImage] compress failed -> fallback to original:',
      e,
    );
  }

  // 압축 결과는 JPEG이므로 fileType/확장자는 jpeg/jpg로 맞춤
  const fileType = 'image/jpeg';
  const filename = generateUniqueFilename('jpg');

  const presignedUrl = await getPresignedUrl(filename);
  const uploadedUrl = await uploadImageToS3(presignedUrl, fileUri, fileType);

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
    try {
      fileUri = await compressToJPEG(originalUri, {
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 0.8,
      });
    } catch (e) {
      console.warn(
        '[uploadMultiImage] compress failed -> fallback to original:',
        e,
      );
    }

    const fileType = 'image/jpeg';
    const filename = generateUniqueFilename('jpg');

    const presignedUrl = await getPresignedUrl(filename);
    const uploadedUrl = await uploadImageToS3(presignedUrl, fileUri, fileType);

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
  try {
    fileUri = await adaptiveCompressToJPEG(originalUri, {
      targetBytes: 1.8 * 1024 * 1024, // 서버 한도 2MB라 가정 시 여유
      startMax: 1600,
      minMax: 800,
      startQuality: 0.8,
      minQuality: 0.55,
      stepQuality: 0.1,
    });
  } catch (e) {
    console.warn('[uploadSensitiveImage] adaptive compress failed:', e);
  }

  const fileName = generateUniqueFilename('jpg');
  const fileType = 'image/jpeg';

  const formData = new FormData();
  formData.append('image', {uri: fileUri, name: fileName, type: fileType});

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
