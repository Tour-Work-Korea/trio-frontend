import useUserStore from '@stores/userStore';
import api from './axiosInstance';

const authConfigIfNeeded = () => {
  const token = useUserStore.getState().accessToken;
  return token ? {} : {withAuth: false};
};

const communityApi = {
  getCategories: () =>
    api.get('/user/community/categories', {withAuth: false}),
  getPosts: (params = {}) =>
    api.get('/user/community/posts', {
      ...authConfigIfNeeded(),
      params,
    }),
  getPostDetail: (postId, params = {}) =>
    api.get(`/user/community/posts/${postId}`, {
      ...authConfigIfNeeded(),
      params,
    }),
  getComments: (postId, params = {}) =>
    api.get(`/user/community/posts/${postId}/comments`, {
      ...authConfigIfNeeded(),
      params,
    }),
  getReplies: commentId =>
    api.get(`/user/community/comments/${commentId}/replies`, {
      ...authConfigIfNeeded(),
    }),
  getCommentAnchor: (commentId, params = {}) =>
    api.get(`/user/community/comments/${commentId}/anchor`, {
      ...authConfigIfNeeded(),
      params,
    }),
  getMyPosts: (params = {}) =>
    api.get('/user/my/community/posts', {params}),
  getMyComments: (params = {}) =>
    api.get('/user/my/community/comments', {params}),
  createComment: (postId, body) =>
    api.post(`/user/community/posts/${postId}/comments`, body),
  createDraft: body => api.post('/user/community/posts/drafts', body),
  getImagePresignedUrls: (postId, images) =>
    api.post(`/user/community/posts/${postId}/images/presigned-urls`, {
      images,
    }),
  publishPost: (postId, body) =>
    api.post(`/user/community/posts/${postId}/publish`, body),
  likePost: postId => api.post(`/user/community/posts/${postId}/like`),
  unlikePost: postId => api.delete(`/user/community/posts/${postId}/like`),
};

export default communityApi;
