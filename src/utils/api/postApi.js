// @utils/api/hostGuesthouseIntroApi.js
import api from './axiosInstance';

const postApi = {
  // (공개) 소개글 상세 조회 - 수정 폼 진입 시 기존 값 불러올 때 사용
  getIntroDetailPublic: guesthouseId =>
    api.get(`/guesthouses/${guesthouseId}/intro`, {isAuth: false}),

  // (공개) 소개글 목록 조회
  getIntroListPublic: (page = 0, size = 20) =>
    api.get(`/guesthouses/intro?page=${page}&size=${size}`, {isAuth: false}),

  // (호스트) 소개글 작성(등록)
  createIntro: (guesthouseId, body) =>
    api.post(`/host/guesthouses/${guesthouseId}/intro`, body),

  // (호스트) 소개글 기본 정보(제목/태그) 수정
  updateIntroBasic: (guesthouseId, body) =>
    api.put(`/host/guesthouses/${guesthouseId}/intro`, body),

  // (호스트) 소개글 이미지 전체 교체
  updateIntroImages: (guesthouseId, images) =>
    api.put(`/host/guesthouses/${guesthouseId}/intro/images`, images),

  // (호스트) 소개글 섹션 전체 교체
  updateIntroSections: (guesthouseId, sections) =>
    api.put(`/host/guesthouses/${guesthouseId}/intro/sections`, sections),

  // (호스트) 소개글 삭제
  deleteIntro: guesthouseId =>
    api.delete(`/host/guesthouses/${guesthouseId}/intro`),

  // (유저) 좋아요
  likeIntro: guesthouseId =>
    api.post(`/user/guesthouses/${guesthouseId}/intro/like`),

  // (유저) 좋아요 취소
  unlikeIntro: guesthouseId =>
    api.delete(`/user/guesthouses/${guesthouseId}/intro/like`),
};

export default postApi;
