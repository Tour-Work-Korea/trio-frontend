import api from './axiosInstance';

const commonApi = {
  //비민감 이미지 presigned url 발급
  getPresignedUrl: filename =>
    api.get('/common/S3/presigned-url', {params: {filename}, withAuth: false}),
  //민감 이미지 직접 업로드
  postImage: image =>
    api.post('/common/S3/upload', image, {
      headers: {'Content-Type': 'multipart/form-data'},
      withAuth: false,
    }),
};

export default commonApi;
