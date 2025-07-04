import commonApi from './api/commonApi';
import {v4 as uuidv4} from 'uuid';
import {launchImageLibrary} from 'react-native-image-picker';

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
export const uploadSingleImage = async () => {
  const result = await new Promise(resolve =>
    launchImageLibrary({mediaType: 'photo'}, response => resolve(response)),
  );

  if (result.didCancel || result.errorCode || !result.assets) return null;

  const asset = result.assets[0];
  const fileUri = asset.uri;
  const fileType = asset.type || 'image/jpeg';
  const filename = `${uuidv4()}.jpg`;

  const presignedUrl = await getPresignedUrl(filename);
  const uploadedUrl = await uploadImageToS3(presignedUrl, fileUri, fileType);

  return uploadedUrl;
};

//복수 이미지 업로드
export const uploadMultiImage = async limit => {
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
    const fileUri = asset.uri;
    const fileType = asset.type || 'image/jpeg';
    const filename = `${uuidv4()}.jpg`;

    const presignedUrl = await getPresignedUrl(filename);
    const uploadedUrl = await uploadImageToS3(presignedUrl, fileUri, fileType);

    uploadedUrls.push(uploadedUrl);
  }

  return uploadedUrls;
};

/**
 * 민감 이미지 업로드 (사업자등록증, 신분증 등)
 * → 백엔드에 직접 multipart/form-data로 업로드
 */
export const uploadSensitiveImage = async () => {
  const result = await new Promise(resolve =>
    launchImageLibrary({mediaType: 'photo'}, response => resolve(response)),
  );

  if (result.didCancel || result.errorCode || !result.assets) return null;

  const asset = result.assets[0];
  const uri = asset.uri;
  const fileName = `${uuidv4()}.jpg`;
  const fileType = asset.type || 'image/jpeg';

  // FormData 생성
  const formData = new FormData();
  formData.append('image', {
    uri,
    name: fileName,
    type: fileType,
  });

  try {
    const response = await commonApi.postImage(formData);
    return response.data; // S3 public URL
  } catch (error) {
    console.error(
      '민감 이미지 업로드 실패:',
      error?.response?.data || error.message,
    );
    return null;
  }
};
