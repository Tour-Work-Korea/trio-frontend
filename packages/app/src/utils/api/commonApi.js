import api from './axiosInstance';
import {Platform} from 'react-native';

const commonApi = {
  //비민감 이미지 presigned url 발급
  getPresignedUrl: (filename, contentType) =>
    api.get('/common/S3/presigned-url', {
      params: {filename, contentType},
      withAuth: false,
    }),

  //민감 이미지 직접 업로드
  postImage: image =>
    api.post('/common/S3/upload', image, {
      // 웹에서는 브라우저가 multipart boundary를 포함한 Content-Type을
      // 직접 생성해야 한다. 수동 지정하면 Safari/Chrome 모두 깨질 수 있다.
      headers:
        Platform.OS === 'web'
          ? undefined
          : {'Content-Type': 'multipart/form-data'},
    }),

  //지역 조회
  getLocations: () =>
    api.get('/common/region-type', {
      withAuth: false,
    }),
};

export default commonApi;
