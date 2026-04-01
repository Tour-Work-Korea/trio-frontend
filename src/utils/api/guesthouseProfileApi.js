import api from './axiosInstance';

const PAGE_SIZE = 10;

const guesthouseProfileApi = {
  // 유저/호스트 공용: 게스트하우스 프로필 기본 정보 조회
  getGuesthouseProfile: guesthouseId =>
    api.get(`/guesthouses/${guesthouseId}/profile`),

  // 게스트하우스 프로필 피드 조회
  // query: { tab: 'POSTS' | 'REVIEWS', postType: 'ALL' | 'RECRUIT' | 'PARTY', page, size }
  getGuesthouseProfileFeed: ({
    guesthouseId,
    tab,
    postType,
    page,
    size = PAGE_SIZE,
  }) => {
    const req = {tab, postType, page, size};

    return api.get(`/guesthouses/${guesthouseId}/profile/feed`, {
      params: {
        // 백엔드가 query object(req) 형태를 기대하는 경우 대응
        // req: JSON.stringify(req),
        // 평면 query 바인딩 서버도 같이 호환
        tab,
        postType,
        page,
        size,
      },
    });
  },

  // 호스트: 게스트하우스 프로필 수정
  // body: { guesthouseName, guesthouseShortIntro, profileImageUrl }
  updateGuesthouseProfile: ({guesthouseId, hostId, body}) =>
    api.put(`/host/guesthouses/${guesthouseId}/profile`, body, {
      params: {hostId},
    }),
};

export default guesthouseProfileApi;
