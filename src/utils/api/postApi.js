import api from './axiosInstance';

const postApi = {
  //포스트 목록 전체 조회
  getPosts: () => api.get(`/post`, {isAuth: false}),
  //나의 포스트 목록 조회
  getMyPosts: () => api.get('/host/posts'),
  //포스트 상세 조회
  getPostById: id => api.get(`/post/${id}`, {isAuth: false}),
  //포스트 등록
  addPost: body => api.post('/post', body),
  //포스트 수정
  updatePost: (id, body) => api.post(`post/${id}`, body),
  //포스트 삭제
  deletePost: id => api.delete(`post/${id}`),
};

export default postApi;
